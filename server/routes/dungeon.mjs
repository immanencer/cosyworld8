import { Router } from 'express';
import { ObjectId } from 'mongodb';
import Fuse from 'fuse.js';
import { thumbnailService } from '../services/thumbnailService.mjs';

export default function dungeonRoutes(db) {
  const router = Router();

  router.get('/locations', async (req, res) => {
    try {
      const page = Math.max(parseInt(req.query.page) || 1, 1);
      const limit = Math.min(parseInt(req.query.limit) || 10, 50);
      const skip = (page - 1) * limit;

      const aggregationPipeline = [
        // Enrich each location with avatars
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
              { $project: { name: 1, imageUrl: 1, thumbnailUrl: 1 } },
              { $limit: 10 }
            ],
            as: 'avatars'
          }
        },
        // Enrich each location with items
        {
          $lookup: {
            from: 'items',
            let: { locationChannelId: '$channelId' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$locationId', '$$locationChannelId'] },
                      { $eq: ['$owner', null] }
                    ]
                  }
                }
              },
              { $project: { name: 1, imageUrl: 1, description: 1 } },
              { $limit: 12 }
            ],
            as: 'items'
          }
        },
        // Compute the avatarCount from the looked-up avatars
        {
          $addFields: { avatarCount: { $size: "$avatars" } }
        },
        // Sort the enriched locations by avatarCount and name
        { $sort: { avatarCount: -1, name: 1 } },
        // Now paginate the sorted results
        {
          $facet: {
            metadata: [{ $count: "total" }],
            locations: [{ $skip: skip }, { $limit: limit }]
          }
        }
      ];

      const [result] = await db.collection('locations').aggregate(aggregationPipeline).toArray();
      const metadata = result.metadata[0] || { total: 0 };
      const totalPages = Math.ceil(metadata.total / limit);

      res.json({
        locations: result.locations,
        page,
        totalPages,
        total: metadata.total,
        hasMore: page < totalPages
      });
    } catch (error) {
      console.error('Error fetching locations:', error);
      res.status(500).json({ error: 'Failed to fetch locations' });
    }
  });


  router.get('/log', async (req, res) => {
    try {
      const combatLog = await db.collection('dungeon_log')
        .find({})
        .sort({ timestamp: -1 })
        .limit(50)
        .toArray();

      const locationNames = [...new Set(
        combatLog
          .filter((log) => log.action === 'move' || log.location)
          .map((log) => log.target)
      )];

      const allLocations = await db.collection('locations')
        .find({}, { projection: { name: 1, description: 1, imageUrl: 1, updatedAt: 1 } })
        .toArray();

      const fuse = new Fuse(allLocations, { keys: ['name'], threshold: 0.4 });

      const locationDetails = locationNames.reduce((acc, name) => {
        const [result] = fuse.search(name);
        if (result) {
          acc[name] = result.item;
        }
        return acc;
      }, {});

      const enrichedLog = await Promise.all(combatLog.map(async (entry) => {
        const [actor, target] = await Promise.all([
          db.collection('avatars').findOne(
            { $or: [{ _id: entry.actorId ? new ObjectId(entry.actorId) : null }, { name: entry.actor }] },
            { projection: { _id: 1, name: 1, imageUrl: 1, emoji: 1 } }
          ),
          entry.target ? db.collection('avatars').findOne(
            { $or: [{ _id: entry.targetId ? new ObjectId(entry.targetId) : null }, { name: entry.target }] },
            { projection: { _id: 1, name: 1, imageUrl: 1, emoji: 1 } }
          ) : null
        ]);

        const [actorThumb, targetThumb] = await Promise.all([
          actor?.imageUrl ? thumbnailService.generateThumbnail(actor.imageUrl) : null,
          target?.imageUrl ? thumbnailService.generateThumbnail(target.imageUrl) : null
        ]);

        const [actorStats, targetStats] = await Promise.all([
          actor ? db.collection('dungeon_stats').findOne({ avatarId: actor._id.toString() }) : null,
          target ? db.collection('dungeon_stats').findOne({ avatarId: target._id?.toString() }) : null
        ]);

        const additionalData = {};
        if (entry.action === 'remember') {
          const memory = await db.collection('memories').findOne({ avatarId: actor?._id, timestamp: entry.timestamp });
          if (memory) additionalData.memory = memory.content;
        } else if (entry.action === 'xpost') {
          const tweet = await db.collection('tweets').findOne({ avatarId: actor?._id, timestamp: entry.timestamp });
          if (tweet) additionalData.tweet = tweet.content;
        }

        const locationData = locationDetails[entry.target || entry.location];

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
          location: locationData ? {
            name: locationData.name,
            imageUrl: locationData.imageUrl || null,
            description: locationData.description || '',
          } : null,
          ...additionalData
        };
      }));

      res.json(enrichedLog);
    } catch (error) {
      console.error('Error fetching dungeon log:', error);
      res.status(500).json({ error: 'Failed to fetch dungeon log' });
    }
  });

  return router;
}
