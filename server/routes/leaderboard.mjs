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

      const matchStage = cursor ? {
        $match: {
          $or: [
            { messageCount: { $lt: parseInt(cursor.split(':')[0]) } },
            { 
              messageCount: parseInt(cursor.split(':')[0]),
              _id: { $gt: cursor.split(':')[1] }
            }
          ]
        }
      } : { $match: {} };

      const pipeline = [
        {
          $group: {
            _id: { $toLower: '$authorUsername' },
            messageCount: { $sum: 1 },
            lastMessage: { $max: '$timestamp' }
          }
        },
        { $sort: { messageCount: -1, _id: 1 } },
        matchStage,
        { $limit: limit + 1 },
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
              { $limit: 1 }
            ],
            as: 'avatar'
          }
        },
        { $match: { 'avatar.0': { $exists: true } } },
        { $unwind: '$avatar' },
        {
          $lookup: {
            from: 'dungeon_stats',
            let: { avatarId: '$avatar._id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ['$avatarId', { $toString: '$$avatarId' }]
                  }
                }
              }
            ],
            as: 'stats'
          }
        },
        {
          $addFields: {
            stats: {
              $ifNull: [{ $arrayElemAt: ['$stats', 0] }, { attack: 0, defense: 0, hp: 0 }]
            }
          }
        }
      ];

      if (tier && tier !== 'All') {
        if (tier === 'U') {
          pipeline.push({
            $match: {
              $or: [
                { 'avatar.model': { $exists: false } },
                { 'avatar.model': null },
                { 'avatar.model': { $nin: models.map(m => m.model) } }
              ]
            }
          });
        } else {
          const validModels = models
            .filter(m => rarityToTier[m.rarity] === tier)
            .map(m => m.model);
          pipeline.push({
            $match: { 'avatar.model': { $in: validModels } }
          });
        }
      }

      const results = await db
        .collection('messages')
        .aggregate(pipeline, { allowDiskUse: true })
        .toArray();

      const hasMore = results.length > limit;
      const items = results.slice(0, limit);
      const lastItem = items[items.length - 1];
      const nextCursor = hasMore ? `${lastItem.messageCount}:${lastItem._id}` : null;

      res.json({
        avatars: items.map(item => ({
          ...item.avatar,
          messageCount: item.messageCount,
          lastMessage: item.lastMessage,
          stats: item.stats
        })),
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