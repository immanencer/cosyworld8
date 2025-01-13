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
  stdTTL: 1800,       // 1800 seconds = 30 minutes
  checkperiod: 300,   // Check for expired keys every 5 minutes
});

export default function(db) {
  router.get('/', async (req, res) => {
    try {
      if (!db) throw new Error('Database not connected');

      // Optional pagination
      const limit = parseInt(req.query.limit, 10) || 50;
      const skip = parseInt(req.query.skip, 10) || 0;

      // 1) Generate a cache key based on skip & limit
      const cacheKey = `tribes:${skip}:${limit}`;
      const cachedTribes = tribesCache.get(cacheKey);

      // 2) If already in cache, return the cached data
      if (cachedTribes) {
        console.log(`Returning tribes from cache: key=${cacheKey}`);
        return res.json({
          tribes: cachedTribes,
          limit,
          skip,
          fromCache: true,
        });
      }

      // 3) Build aggregation pipeline
      const pipeline = [
        {
          $match: {
            emoji: { $exists: true, $ne: null, $ne: '' }
          }
        },
        {
          $lookup: {
            from: 'messages',
            let: { avatarName: { $toLower: '$name' } },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: [
                      { $toLower: '$authorUsername' },
                      '$$avatarName'
                    ],
                  },
                },
              },
              {
                $group: {
                  _id: null,
                  count: { $sum: 1 },
                },
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
            messageCount: {
              $ifNull: [
                { $arrayElemAt: ['$messageStats.count', 0] },
                0,
              ],
            },
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

      // 4) Run the aggregation
      const tribes = await db.collection('avatars').aggregate(pipeline).toArray();

      // 5) Generate thumbnails in parallel
      for (const tribe of tribes) {
        tribe.members = await Promise.all(
          tribe.members.map(async (member) => {
            const thumbnailUrl = await thumbnailService.generateThumbnail(member.imageUrl);
            return {
              ...member,
              thumbnailUrl,
            };
          })
        );
      }

      // 6) Transform the data into a friendlier format
      const tribesWithData = tribes.map((tribe) => ({
        emoji: tribe._id,
        count: tribe.count,
        members: tribe.members,
      }));

      // 7) Store in the cache before responding
      tribesCache.set(cacheKey, tribesWithData);
      console.log(`Caching tribes: key=${cacheKey}, TTL=1800s (30min)`);

      res.json({
        tribes: tribesWithData,
        limit,
        skip,
        fromCache: false, // indicates a fresh DB query
      });
    } catch (error) {
      console.error('Tribes error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}
