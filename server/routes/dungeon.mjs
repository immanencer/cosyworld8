
import { Router } from 'express';
import { MongoClient, ObjectId } from 'mongodb';
import Fuse from 'fuse.js';
import { thumbnailService } from '../services/thumbnailService.mjs';

async function getLocationDetails(db, locationId) {
  const [avatars, items] = await Promise.all([
    // Get avatars at this location
    db.collection('avatars').find(
      { locationId },
      { projection: { name: 1, imageUrl: 1, thumbnailUrl: 1 } }
    ).toArray(),
    // Get items at this location
    db.collection('items').find(
      { locationId, owner: null },
      { projection: { name: 1, imageUrl: 1, description: 1 } }
    ).toArray()
  ]);

  // Generate thumbnails for avatars if needed
  const avatarsWithThumbs = await Promise.all(avatars.map(async (avatar) => {
    if (!avatar.thumbnailUrl && avatar.imageUrl) {
      avatar.thumbnailUrl = await thumbnailService.generateThumbnail(avatar.imageUrl);
    }
    return avatar;
  }));

  return {
    avatars: avatarsWithThumbs,
    items
  };
}

function escapeRegExp(string) {
  if (!string) return '';
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export default function dungeonRoutes(db) {
  const router = Router();

  router.get('/locations', async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = Math.min(parseInt(req.query.limit) || 10, 50);
      const skip = (page - 1) * limit;

      const aggregationPipeline = [
        {
          $facet: {
            metadata: [
              { $count: "total" },
              { 
                $addFields: { 
                  totalPages: { 
                    $ceil: { $divide: ["$total", limit] } 
                  }
                }
              }
            ],
            locations: [
              { $skip: skip },
              { $limit: limit },
              {
                $lookup: {
                  from: 'avatars',
                  let: { locationChannelId: '$channelId' },
                  pipeline: [
                    {
                      $match: {
                        $expr: { $eq: ['$channelId', '$$locationChannelId'] }
                      }
                    },
                    { 
                      $project: { 
                        name: 1, 
                        imageUrl: 1, 
                        thumbnailUrl: 1 
                      } 
                    },
                    { $limit: 10 }
                  ],
                  as: 'avatars'
                }
              },
              {
                $lookup: {
                  from: 'items',
                  localField: 'channelId',
                  foreignField: 'locationId',
                  pipeline: [
                    { 
                      $match: { 
                        owner: null 
                      } 
                    },
                    { 
                      $project: { 
                        name: 1, 
                        imageUrl: 1, 
                        description: 1 
                      } 
                    },
                    { $limit: 12 }
                  ],
                  as: 'items'
                }
              }
            ]
          }
        }
      ];

      const result = await db.collection('locations').aggregate(aggregationPipeline).toArray();
      const metadata = result[0].metadata[0] || { total: 0, totalPages: 0 };
      const locations = result[0].locations;

      res.json({
        locations,
        page,
        totalPages: metadata.totalPages,
        total: metadata.total,
        hasMore: page < metadata.totalPages
      });
    } catch (error) {
      console.error('Error fetching locations:', error);
      res.status(500).json({ error: error.message });
    }
  });

  router.get('/log', async (req, res) => {
    try {
      const combatLog = await db
        .collection('dungeon_log')
        .find({})
        .sort({ timestamp: -1 })
        .limit(50)
        .toArray();

      const locationNames = [
        ...new Set(
          combatLog
            .filter((log) => (log.action === 'move' || log.location) && log.target)
            .map((log) => log.target)
        ),
      ];

      const allLocations = await db
        .collection('locations')
        .find({}, { projection: { name: 1, description: 1, imageUrl: 1, updatedAt: 1 } })
        .toArray();

      const fuse = new Fuse(allLocations, {
        keys: ['name'],
        threshold: 0.4,
      });

      const locationDetails = locationNames.reduce((acc, name) => {
        const [result] = fuse.search(name);
        if (result) {
          acc[name] = {
            name: result.item.name,
            description: result.item.description,
            imageUrl: result.item.imageUrl,
            updatedAt: result.item.updatedAt,
          };
        }
        return acc;
      }, {});

      const enrichedLog = await Promise.all(
        combatLog.map(async (entry) => {
          const [actor, target] = await Promise.all([
            db.collection('avatars').findOne({
              $or: [
                { _id: entry.actorId ? new ObjectId(entry.actorId) : null },
                { name: entry.actor },
                { name: { $regex: `^${escapeRegExp(entry.actor)}$`, $options: 'i' } }
              ]
            }, { projection: { _id: 1, name: 1, imageUrl: 1, emoji: 1 } }),
            entry.target
              ? db.collection('avatars').findOne({
                $or: [
                  { _id: entry.targetId ? new ObjectId(entry.targetId) : null },
                  { name: entry.target },
                  { name: { $regex: `^${escapeRegExp(entry.target)}$`, $options: 'i' } }
                ]
              }, { projection: { _id: 1, name: 1, imageUrl: 1, emoji: 1 } })
              : null,
          ]);

          const [actorThumb, targetThumb] = await Promise.all([
            actor?.imageUrl
              ? thumbnailService.generateThumbnail(actor.imageUrl)
              : null,
            target?.imageUrl
              ? thumbnailService.generateThumbnail(target.imageUrl)
              : null,
          ]);

          const [actorStats, targetStats] = await Promise.all([
            actor
              ? db.collection('dungeon_stats').findOne({
                avatarId: actor._id.toString(),
              })
              : null,
            target
              ? db.collection('dungeon_stats').findOne({
                avatarId: target._id?.toString(),
              })
              : null,
          ]);

          const additionalData = {};
          if (entry.action === 'remember') {
            const memory = await db.collection('memories').findOne({
              avatarId: actor?._id,
              timestamp: entry.timestamp,
            });
            if (memory) additionalData.memory = memory.content;
          } else if (entry.action === 'xpost') {
            const tweet = await db.collection('tweets').findOne({
              avatarId: actor?._id,
              timestamp: entry.timestamp,
            });
            if (tweet) additionalData.tweet = tweet.content;
          }

          const locationKey = entry.target || entry.location;
          const locationData = locationDetails[locationKey];

          if (entry.action === 'move' && locationData?.imageUrl) {
            additionalData.targetImageUrl = locationData.imageUrl;
          }

          additionalData.location = locationData
            ? {
              name: locationData.name,
              imageUrl: locationData.imageUrl || null,
              description: locationData.description || '',
            }
            : null;

          return {
            ...entry,
            actorId: actor?._id || null,
            actorName: actor?.name || entry.actor,
            actorEmoji: actor?.emoji || null,
            actorImageUrl: actor?.imageUrl || null,
            actorThumbnailUrl: actorThumb,
            actorStats,
            targetId: target?._id || null,
            targetName: target?.name || entry.target,
            targetEmoji: target?.emoji || null,
            targetImageUrl: target?.imageUrl || null,
            targetThumbnailUrl: targetThumb,
            targetStats,
            ...additionalData,
          };
        })
      );

      res.json(enrichedLog);
    } catch (error) {
      console.error('Error fetching dungeon log:', error);
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}
