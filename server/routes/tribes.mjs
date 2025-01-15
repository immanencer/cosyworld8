
import express from 'express';
import NodeCache from 'node-cache';
import { thumbnailService } from '../services/thumbnailService.mjs';

const router = express.Router();

const tribesCache = new NodeCache({
  stdTTL: 1800,
  checkperiod: 300,
});

export default function(db) {
  if (!db) {
    console.error('Database connection not provided to tribes route');
    throw new Error('Database not connected');
  }

  router.get('/', async (req, res) => {
    try {
      const limit = Math.max(parseInt(req.query.limit, 10) || 50, 1);
      const skip = Math.max(parseInt(req.query.skip, 10) || 0, 0);
      const cacheKey = `tribes:${skip}:${limit}`;
      
      const cachedTribes = tribesCache.get(cacheKey);
      if (cachedTribes) {
        console.log(`[Cache Hit] Returning cached tribes: key=${cacheKey}`);
        return res.json({
          tribes: cachedTribes,
          limit,
          skip,
          fromCache: true
        });
      }

      const tribes = await db.collection('avatars').aggregate([
        {
          $match: { emoji: { $exists: true, $ne: null, $ne: '' } }
        },
        {
          $lookup: {
            from: 'messages',
            let: { avatarName: { $toLower: '$name' } },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: [{ $toLower: '$authorUsername' }, '$$avatarName'] }
                }
              },
              {
                $group: { _id: null, count: { $sum: 1 } }
              }
            ],
            as: 'messageStats'
          }
        },
        {
          $project: {
            name: 1,
            emoji: 1,
            imageUrl: 1,
            messageCount: { $ifNull: [{ $arrayElemAt: ['$messageStats.count', 0] }, 0] }
          }
        },
        {
          $group: {
            _id: '$emoji',
            count: { $sum: 1 },
            members: { $push: '$$ROOT' }
          }
        },
        { $match: { count: { $gt: 0 } } },
        { $sort: { count: -1 } },
        { $skip: skip },
        { $limit: limit }
      ]).toArray();

      const tribesWithThumbnails = await Promise.all(
        tribes.map(async (tribe) => ({
          emoji: tribe._id,
          count: tribe.count,
          members: await Promise.all(
            tribe.members.map(async (member) => ({
              ...member,
              thumbnailUrl: await thumbnailService.generateThumbnail(member.imageUrl)
            }))
          )
        }))
      );

      tribesCache.set(cacheKey, tribesWithThumbnails);
      console.log(`[Cache Store] Cached tribes: key=${cacheKey}, TTL=1800s`);

      res.json({
        tribes: tribesWithThumbnails,
        limit,
        skip,
        fromCache: false
      });
    } catch (error) {
      console.error('[Tribes Error]:', error);
      res.status(500).json({ 
        error: 'Failed to fetch tribes',
        details: error.message,
        code: error.code
      });
    }
  });

  return router;
}
