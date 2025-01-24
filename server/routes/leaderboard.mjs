
import { Router } from 'express';
import { ObjectId } from 'mongodb';
import models from '../../src/models.config.mjs';
import { thumbnailService } from '../services/thumbnailService.mjs';

// Helper function for avatar ancestry
async function getAvatarAncestry(db, avatarId) {
  const ancestry = [];
  let currentAvatar = await db.collection('avatars').findOne(
    { _id: new ObjectId(avatarId) },
    { projection: { parents: 1 } }
  );

  while (currentAvatar?.parents?.length) {
    const parentId = currentAvatar.parents[0];
    const parent = await db.collection('avatars').findOne(
      { _id: new ObjectId(parentId) },
      { projection: { _id: 1, name: 1, imageUrl: 1, emoji: 1, parents: 1 } }
    );
    if (!parent) break;
    ancestry.push(parent);
    currentAvatar = parent;
  }

  return ancestry;
}

const rarityToTier = {
  legendary: 'S',
  rare: 'A',
  uncommon: 'B',
  common: 'C',
};

export default function leaderboardRoutes(db) {
  const router = Router();

  router.get('/minted', async (req, res) => {
    try {
      const mintedAvatars = await db
        .collection('minted_nfts')
        .aggregate([
          {
            $lookup: {
              from: 'avatars',
              localField: 'avatarId',
              foreignField: '_id',
              as: 'avatar',
            },
          },
          { $unwind: '$avatar' },
          {
            $lookup: {
              from: 'dungeon_stats',
              localField: 'avatarId',
              foreignField: 'avatarId',
              as: 'stats',
            },
          },
          { $unwind: { path: '$stats', preserveNullAndEmptyArrays: true } },
          {
            $project: {
              _id: '$avatar._id',
              name: '$avatar.name',
              imageUrl: '$avatar.imageUrl',
              thumbnailUrl: '$avatar.thumbnailUrl',
              score: {
                $add: [
                  { $ifNull: ['$stats.wins', 0] },
                  { $multiply: [{ $ifNull: ['$stats.hp', 0] }, 10] },
                ],
              },
            },
          },
          { $sort: { score: -1 } },
          { $limit: 100 },
        ])
        .toArray();

      res.json(mintedAvatars);
    } catch (error) {
      console.error('Minted leaderboard error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  router.get('/', async (req, res) => {
    try {
      const { tier, lastMessageCount, lastId, limit: limitStr } = req.query;
      const limit = Math.min(parseInt(limitStr, 10) || 24, 100);

      const pipeline = [
        // Initial grouping to get message counts and recent activity
        {
          $group: {
            _id: { $toLower: '$authorUsername' },
            messageCount: { $sum: 1 },
            lastMessage: { $max: '$timestamp' },
            recentMessages: {
              $push: {
                $cond: {
                  if: {
                    $gte: [
                      '$timestamp',
                      { $subtract: [new Date(), 1000 * 60 * 60 * 24] },
                    ],
                  },
                  then: {
                    content: { $substr: ['$content', 0, 200] },
                    timestamp: '$timestamp',
                  },
                  else: null,
                },
              },
            },
          },
        },
        // Sort by message count for leaderboard
        { $sort: { messageCount: -1 } },
        // Lookup most recent avatar for each username
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
        // Filter out users without avatars
        { $match: { 'avatar.0': { $exists: true } } },
        // Unwind the single avatar
        { $unwind: '$avatar' },
        {
          $lookup: {
            from: 'avatars',
            let: { username: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: [{ $toLower: '$name' }, '$$username'],
                  },
                },
              },
              { $sort: { createdAt: -1 } },
            ],
            as: 'variants',
          },
        },
        { $match: { 'variants.0': { $exists: true } } },
      ];

      if (tier && tier !== 'All') {
        if (tier === 'U') {
          pipeline.push({
            $match: {
              $or: [
                { 'variants.0.model': { $exists: false } },
                { 'variants.0.model': null },
                {
                  'variants.0.model': {
                    $nin: models.map((m) => m.model),
                  },
                },
              ],
            },
          });
        } else {
          pipeline.push({
            $match: {
              'variants.0.model': {
                $in: models
                  .filter((m) => rarityToTier[m.rarity] === tier)
                  .map((m) => m.model),
              },
            },
          });
        }
      }

      if (lastMessageCount && lastId) {
        const parsedCount = parseInt(lastMessageCount, 10) || 0;
        pipeline.push({
          $match: {
            $or: [
              { messageCount: { $lt: parsedCount } },
              {
                $and: [
                  { messageCount: parsedCount },
                  { _id: { $gt: lastId } },
                ],
              },
            ],
          },
        });
      }

      pipeline.push({ $limit: limit + 1 });

      const results = await db
        .collection('messages')
        .aggregate(pipeline, { allowDiskUse: true })
        .toArray();

      const details = await Promise.all(
        results.map(async (result) => {
          const variants = result.variants || [];
          const primaryAvatar = variants[0];
          if (!primaryAvatar) return null;

          const thumbs = await Promise.all(
            variants.map((v) =>
              thumbnailService.generateThumbnail(v.imageUrl)
            )
          );

          const [ancestry, stats] = await Promise.all([
            getAvatarAncestry(db, primaryAvatar._id),
            db.collection('dungeon_stats').findOne({
              $or: [
                { avatarId: primaryAvatar._id },
                { avatarId: primaryAvatar._id.toString() },
              ],
            }),
          ]);

          return {
            ...primaryAvatar,
            variants: variants.map((v, i) => ({
              ...v,
              thumbnailUrl: thumbs[i],
            })),
            ancestry,
            messageCount: result.messageCount,
            lastMessage: result.lastMessage,
            recentMessages: (result.recentMessages || [])
              .filter((m) => m !== null)
              .slice(0, 5),
            stats: stats || { attack: 0, defense: 0, hp: 0 },
            score: result.messageCount,
          };
        })
      );

      const filtered = details.filter(Boolean);
      const hasMore = results.length > limit;
      const lastItem = results.slice(0, limit).pop();

      return res.json({
        avatars: filtered.slice(0, limit),
        hasMore,
        total: filtered.length,
        lastMessageCount: lastItem?.messageCount || null,
        lastId: lastItem?._id || null,
      });
    } catch (error) {
      console.error('Leaderboard error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}
