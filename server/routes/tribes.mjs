// routes/tribes.mjs
import express from 'express';
import NodeCache from 'node-cache';
import { thumbnailService } from '../services/thumbnailService.mjs';

const router = express.Router();

/**
 * ------------------------------------------------
 * TTL-based in-memory cache with 30-minute expiry
 * and a cleanup check every 5 minutes.
 * ------------------------------------------------
 */
const tribesCache = new NodeCache({
  stdTTL: 1800, // 30 minutes
  checkperiod: 300, // Cleanup check every 5 minutes
});

export default function(db) {
  if (!db) throw new Error('Database not connected'); // Early check for database connection

  router.get('/', async (req, res) => {
    try {
      // Parse optional query parameters for pagination
      const limit = Math.max(parseInt(req.query.limit, 10) || 50, 1); // Ensure positive limit
      const skip = Math.max(parseInt(req.query.skip, 10) || 0, 0); // Ensure non-negative skip

      // Generate a unique cache key
      const cacheKey = `tribes:${skip}:${limit}`;
      const cachedTribes = tribesCache.get(cacheKey);

      if (cachedTribes) {
        console.log(`[Cache Hit] Returning cached tribes: key=${cacheKey}`);
        return res.json({
          tribes: cachedTribes,
          limit,
          skip,
          fromCache: true,
        });
      }

      // Build aggregation pipeline
      const pipeline = [
        {
          $match: { emoji: { $exists: true, $ne: null, $ne: '' } },
        },
        {
          $lookup: {
            from: 'messages',
            let: { avatarName: { $toLower: '$name' } },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: [{ $toLower: '$authorUsername' }, '$$avatarName'] },
                },
              },
              {
                $group: { _id: null, count: { $sum: 1 } },
              },
            ],
            as: 'messageStats',
          },
        },
        {
          $project: {
            name: 1,
            emoji: 1,
            imageUrl: 1,
            messageCount: { $ifNull: [{ $arrayElemAt: ['$messageStats.count', 0] }, 0] },
          },
        },
        {
          $group: {
            _id: '$emoji',
            count: { $sum: 1 },
            members: { $push: '$$ROOT' },
          },
        },
        { $match: { count: { $gt: 0 } } },
        { $sort: { count: -1 } },
        { $skip: skip },
        { $limit: limit },
      ];

      // Run aggregation
      const tribes = await db.collection('avatars').aggregate(pipeline).toArray();

      // Generate thumbnails in parallel
      const tribesWithThumbnails = await Promise.all(
        tribes.map(async (tribe) => ({
          emoji: tribe._id,
          count: tribe.count,
          members: await Promise.all(
            tribe.members.map(async (member) => ({
              ...member,
              thumbnailUrl: await thumbnailService.generateThumbnail(member.imageUrl),
            }))
          ),
        }))
      );

      // Cache the result before responding
      tribesCache.set(cacheKey, tribesWithThumbnails);
      console.log(`[Cache Store] Cached tribes: key=${cacheKey}, TTL=1800s`);

      res.json({
        tribes: tribesWithThumbnails,
        limit,
        skip,
        fromCache: false,
      });
    } catch (error) {
      console.error('[Error] Fetching tribes:', error);
      res.status(500).json({ error: 'Failed to fetch tribes. Please try again later.' });
    }
  });

  return router;
}
