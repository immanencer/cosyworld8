import { Router } from 'express';
import { ObjectId } from 'mongodb';
import models from '../../src/models.config.mjs';

const rarityToTier = {
  legendary: 'S',
  rare: 'A',
  uncommon: 'B',
  common: 'C',
};

export default function leaderboardRoutes(db) {
  const router = Router();

  router.get('/', async (req, res) => {
    try {
      const { tier, cursor, limit: limitStr } = req.query;
      const limit = Math.min(parseInt(limitStr, 10) || 24, 100);

      const pipeline = [
        // (Optionally filter by tier or model first)
        // e.g. if (tier !== 'All') pipeline.push({ $match: ... })

        // Sort by score descending
        { $sort: { score: -1 } },

        // Add cursor-based pagination
        ...(cursor
          ? (() => {
              const [cursorScore, cursorId] = cursor.split(':');
              return [{
                $match: {
                  $or: [
                    { score: { $lt: parseInt(cursorScore, 10) } },
                    {
                      score: parseInt(cursorScore, 10),
                      _id: { $gt: new ObjectId(cursorId) },
                    },
                  ],
                },
              }];
            })()
          : []
        ),

        { $limit: limit + 1 },

        // Lookup stats
        {
          $lookup: {
            from: 'dungeon_stats',
            let: { avatarId: '$_id' },
            pipeline: [
              { $match: { $expr: { $eq: ['$avatarId', { $toString: '$$avatarId'}] } } }
            ],
            as: 'stats'
          }
        },

        // Join with avatar_scores
        {
          $lookup: {
            from: 'avatar_scores',
            localField: '_id',
            foreignField: 'avatarId',
            as: 'scoreData'
          }
        },

        // Project final shape
        {
          $project: {
            _id: 1,
            name: 1,
            imageUrl: 1,
            thumbnailUrl: 1,
            model: 1,
            score: { $arrayElemAt: ['$scoreData.score', 0] },
            lastActive: 1,
            stats: { $arrayElemAt: ['$stats', 0] }
          }
        }
      ];

      // Add tier filtering if specified
      if (tier && tier !== 'All') {
        if (tier === 'U') {
          pipeline.unshift({
            $match: {
              $or: [
                { model: { $exists: false } },
                { model: null },
                { model: { $nin: models.map(m => m.model) } }
              ]
            }
          });
        } else {
          const validModels = models
            .filter(m => rarityToTier[m.rarity] === tier)
            .map(m => m.model);
          pipeline.unshift({
            $match: { model: { $in: validModels } }
          });
        }
      }

      const results = await db
        .collection('avatars')
        .aggregate(pipeline)
        .toArray();

      const hasMore = results.length > limit;
      const items = results.slice(0, limit);
      const lastItem = items[items.length - 1];
      const nextCursor = hasMore ? `${lastItem.score}:${lastItem._id}` : null;

      res.json({
        avatars: items,
        nextCursor,
        hasMore
      });
    } catch (error) {
      console.error('Leaderboard error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}