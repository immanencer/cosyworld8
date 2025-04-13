import { Router } from 'express';
import { ObjectId } from 'mongodb';
import models from '../../../ai/models.openrouter.config.mjs';
import { thumbnailService } from '../services/thumbnailService.mjs';

const rarityToTier = {
  legendary: 'S',
  rare: 'A',
  uncommon: 'B',
  common: 'C',
};

// Precompute tier mappings for better performance
const tierMap = models.reduce((acc, model) => {
  const tier = rarityToTier[model.rarity];
  if (!acc[tier]) acc[tier] = [];
  acc[tier].push(model.model);
  return acc;
}, {});

// Improved ancestry fetching with depth limit
async function getAvatarAncestry(db, avatarId) {
  const ancestry = [];
  const maxDepth = 10;
  let currentAvatar;
  let depth = 0;

  try {
    currentAvatar = await db.collection('avatars').findOne(
      { _id: new ObjectId(avatarId) },
      { projection: { parents: 1 } }
    );

    while (currentAvatar?.parents?.length && depth < maxDepth) {
      depth++;
      const parentId = currentAvatar.parents[0];
      const parent = await db.collection('avatars').findOne(
        { _id: new ObjectId(parentId) },
        { projection: { _id: 1, name: 1, imageUrl: 1, emoji: 1, parents: 1 } }
      );
      if (!parent) break;
      ancestry.push(parent);
      currentAvatar = parent;
    }
  } catch (error) {
    console.error('Error fetching ancestry:', error);
  }

  return ancestry;
}

export default function leaderboardRoutes(db) {
  const router = Router();

  router.get('/', async (req, res) => {
    console.log('Leaderboard request:', req.query);
    try {
      const { tier, lastMessageCount, lastId, limit: limitStr, includeZeroMessages } = req.query; // Added includeZeroMessages
      const limit = Math.min(parseInt(limitStr, 10) || 24, 100);
      const dayAgo = new Date(Date.now() - 1000 * 60 * 60 * 24);

      // Main aggregation pipeline
      let pipeline = [];

      if (includeZeroMessages) {
        // If we want to include all avatars, even those with 0 messages
        pipeline = [
          {
            $lookup: {
              from: 'avatars',
              pipeline: [
                { $match: { status: { $ne: 'dead' } } }
              ],
              as: 'allAvatars'
            }
          },
          { $unwind: '$allAvatars' },
          {
            $lookup: {
              from: 'messages',
              let: { avatarName: '$allAvatars.name' },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ['$authorUsername', '$$avatarName'] },
                    timestamp: { $gte: dayAgo }
                  }
                }
              ],
              as: 'messages'
            }
          },
          {
            $project: {
              _id: '$allAvatars.name',
              avatar: '$allAvatars',
              messageCount: { $size: '$messages' },
              lastMessage: { $max: '$messages.timestamp' },
              recentMessages: { $slice: ['$messages', 10] }
            }
          },
          { $sort: { messageCount: -1, lastMessage: -1 } },
          { $skip: 0 }, //Added skip and limit to handle pagination correctly
          { $limit: limit + 1 }
        ];
      } else {
        // Original pipeline for only avatars with messages
        pipeline = [
          {
            $group: {
              _id: { $toLower: '$authorUsername' },
              messageCount: { $sum: 1 },
              lastMessage: { $max: '$timestamp' },
              recentMessages: {
                $push: {
                  $cond: [
                    { $gte: ['$timestamp', dayAgo] },
                    { content: { $substr: ['$content', 0, 200] }, timestamp: '$timestamp' },
                    null
                  ]
                }
              }
            }
          },
          {
            $addFields: {
              recentMessages: {
                $slice: [
                  {
                    $sortArray: {
                      input: {
                        $filter: {
                          input: '$recentMessages',
                          cond: { $ne: ['$$this', null] }
                        }
                      },
                      sortBy: { timestamp: -1 }
                    }
                  },
                  5
                ]
              }
            }
          },
          { $sort: { messageCount: -1, _id: 1 } },
          {
            $lookup: {
              from: 'avatars',
              let: { username: '$_id' },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: [{ $toLower: '$name' }, '$$username'] }
                  }
                },
                { $sort: { createdAt: -1 } },
                {
                  $project: {
                    _id: 1,
                    name: 1,
                    imageUrl: 1,
                    emoji: 1,
                    parents: 1,
                    model: 1,
                    createdAt: 1
                  }
                }
              ],
              as: 'variants'
            }
          },
          { $match: { variants: { $ne: [] } } }
        ];

        // Tier filtering
        if (tier && tier !== 'All') {
          if (tier === 'U') {
            pipeline.push({
              $match: {
                $or: [
                  { 'variants.model': { $exists: false } },
                  { 'variants.model': null },
                  { 'variants.model': { $nin: models.map(m => m.model) } }
                ]
              }
            });
          } else if (tierMap[tier]) {
            pipeline.push({
              $match: {
                'variants.model': { $in: tierMap[tier] }
              }
            });
          }
        }

        // Pagination
        if (lastMessageCount && lastId) {
          const parsedCount = parseInt(lastMessageCount, 10);
          pipeline.push({
            $match: {
              $or: [
                { messageCount: { $lt: parsedCount } },
                { $and: [{ messageCount: parsedCount }, { _id: { $gt: lastId } }] }
              ]
            }
          });
        } else {
          // Page-based pagination
          const page = parseInt(req.query.page, 10) || 1;
          const skip = (page - 1) * limit;
          pipeline.push({ $skip: skip });
        }

        pipeline.push({ $limit: limit + 1 });
      }


      // Execute aggregation
      const results = await db.collection('messages')
        .aggregate(pipeline, { allowDiskUse: true })
        .toArray();

      // Process results
      const details = await Promise.all(
        results.map(async (result) => {
          try {
            const primaryAvatar = (includeZeroMessages) ? result.avatar : result.variants[0]; // Handle both pipeline structures
            const variants = (includeZeroMessages) ? [result.avatar] : result.variants; // Handle both pipeline structures
            const thumbs = await Promise.all(
              variants.map(v =>
                thumbnailService.generateThumbnail(v.imageUrl)
              )
            );

            const [ancestry, stats] = await Promise.all([
              getAvatarAncestry(db, primaryAvatar._id),
              db.collection('dungeon_stats').findOne({
                $or: [
                  { avatarId: primaryAvatar._id },
                  { avatarId: primaryAvatar._id.toString() }
                ]
              })
            ]);

            return {
              ...primaryAvatar,
              variants: variants.map((v, i) => ({
                ...v,
                thumbnailUrl: thumbs[i]
              })),
              ancestry,
              messageCount: result.messageCount,
              lastMessage: result.lastMessage,
              recentMessages: result.recentMessages,
              stats: stats || { attack: 0, defense: 0, hp: 0 },
              score: result.messageCount
            };
          } catch (error) {
            console.error('Error processing result:', error);
            return null;
          }
        })
      );

      const filtered = details.filter(Boolean);
      const hasMore = results.length > limit;
      const lastItem = results[limit - 1];

      res.json({
        avatars: filtered.slice(0, limit),
        hasMore,
        total: filtered.length,
        lastMessageCount: lastItem?.messageCount || null,
        lastId: lastItem?._id || null
      });
    } catch (error) {
      console.error('Leaderboard error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
}