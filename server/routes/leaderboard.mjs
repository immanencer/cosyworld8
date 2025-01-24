import { Router } from 'express';
import { ObjectId } from 'mongodb';
import models from '../../src/models.config.mjs';
import { thumbnailService } from '../services/thumbnailService.mjs';

const rarityToTier = {
  legendary: 'S',
  rare: 'A',
  uncommon: 'B',
  common: 'C',
};

export default function leaderboardRoutes(db) {
  const router = Router();

  /**
   * Helper function to fetch ancestry for an avatar
   */
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

  /**
   * GET /leaderboard
   * Fetches paginated leaderboard with most recent avatar per user
   */
  router.get('/', async (req, res) => {
    try {
      const { tier, lastMessageCount, lastId, limit: limitStr } = req.query;
      const limit = Math.min(parseInt(limitStr, 10) || 24, 100);
      const parsedCount = parseInt(lastMessageCount, 10) || 0;

      const pipeline = [
        // Group messages by lowercase authorUsername
        {
          $group: {
            _id: { $toLower: '$authorUsername' },
            messageCount: { $sum: 1 },
            lastMessage: { $max: '$timestamp' },
          },
        },
        // Sort by messageCount DESC, then _id ASC for stable ordering
        { $sort: { messageCount: -1, _id: 1 } },
        // Pagination: skip items based on lastMessageCount and lastId
        {
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
        },
        // Limit the results to (limit + 1) to check for more pages
        { $limit: limit + 1 },
        // Lookup the most recent avatar for each username
        {
          $lookup: {
            from: 'avatars',
            let: { username: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: [{ $toLower: '$name' }, '$$username'] },
                },
              },
              { $sort: { createdAt: -1 } },
              { $limit: 1 },
            ],
            as: 'avatar',
          },
        },
        // Filter out users without avatars
        { $match: { 'avatar.0': { $exists: true } } },
        // Unwind the avatar array to simplify processing
        { $unwind: '$avatar' },
      ];

      // Optional: Filter by tier
      if (tier && tier !== 'All') {
        if (tier === 'U') {
          pipeline.push({
            $match: {
              $or: [
                { 'avatar.model': { $exists: false } },
                { 'avatar.model': null },
                { 'avatar.model': { $nin: models.map((m) => m.model) } },
              ],
            },
          });
        } else {
          const validModels = models
            .filter((m) => rarityToTier[m.rarity] === tier)
            .map((m) => m.model);

          pipeline.push({
            $match: { 'avatar.model': { $in: validModels } },
          });
        }
      }

      const results = await db
        .collection('messages')
        .aggregate(pipeline, { allowDiskUse: true })
        .toArray();

      const avatars = await Promise.all(
        results.map(async (result) => {
          const avatar = result.avatar;

          // Get ancestry and stats for the avatar
          const [ancestry, stats] = await Promise.all([
            getAvatarAncestry(db, avatar._id),
            db.collection('dungeon_stats').findOne({
              $or: [
                { avatarId: avatar._id },
                { avatarId: avatar._id.toString() },
              ],
            }),
          ]);

          return {
            ...avatar,
            ancestry,
            messageCount: result.messageCount,
            lastMessage: result.lastMessage,
            stats: stats || { attack: 0, defense: 0, hp: 0 },
          };
        })
      );

      const hasMore = results.length > limit;
      const lastItem = results.slice(0, limit).pop();

      res.json({
        avatars: avatars.slice(0, limit),
        hasMore,
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
