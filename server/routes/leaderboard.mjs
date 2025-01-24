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
        // First group by username to get the latest avatar and total score
        {
          $group: {
            _id: { $toLower: '$name' },
            avatar: { $first: '$$ROOT' },
            score: { $sum: '$score' },
            lastActive: { $max: '$lastActive' }
          }
        },
        // Sort by score descending
        { $sort: { score: -1 } },
        // Add cursor-based pagination
        ...(cursor ? [{
          $match: {
            $or: [
              { score: { $lt: parseInt(cursor.split(':')[0]) } },
              { 
                score: parseInt(cursor.split(':')[0]),
                _id: { $gt: cursor.split(':')[1] }
              }
            ]
          }
        }] : []),
        { $limit: limit + 1 },
        // Look up stats
        {
          $lookup: {
            from: 'dungeon_stats',
            let: { avatarId: '$avatar._id' },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ['$avatarId', { $toString: '$$avatarId' }] }
                }
              }
            ],
            as: 'stats'
          }
        },
        // Project final shape
        {
          $project: {
            _id: '$avatar._id',
            name: '$avatar.name',
            imageUrl: '$avatar.imageUrl',
            thumbnailUrl: '$avatar.thumbnailUrl',
            model: '$avatar.model',
            score: 1,
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