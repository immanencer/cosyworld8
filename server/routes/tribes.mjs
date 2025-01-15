
import express from 'express';
import NodeCache from 'node-cache';
import { thumbnailService } from '../services/thumbnailService.mjs';

const router = express.Router();
const tribesCache = new NodeCache({ stdTTL: 1800, checkperiod: 300 });

export default function(db) {
  if (!db) {
    console.error('Database connection not provided to tribes route');
    throw new Error('Database not connected');
  }

  // Get tribe counts only
  router.get('/counts', async (req, res) => {
    try {
      const cacheKey = 'tribes:counts';
      const cachedCounts = tribesCache.get(cacheKey);
      
      if (cachedCounts) {
        return res.json(cachedCounts);
      }

      const tribes = await db.collection('avatars').aggregate([
        { $match: { emoji: { $exists: true, $ne: null, $ne: '' } } },
        {
          $group: {
            _id: '$emoji',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]).toArray();

      const counts = tribes.map(t => ({ emoji: t._id, count: t.count }));
      tribesCache.set(cacheKey, counts);
      
      res.json(counts);
    } catch (error) {
      console.error('[Tribes Counts Error]:', error);
      res.status(500).json({ error: 'Failed to fetch tribe counts', details: error.message });
    }
  });

  // Get details for a specific tribe
  router.get('/:emoji', async (req, res) => {
    try {
      const { emoji } = req.params;
      const limit = Math.max(parseInt(req.query.limit, 10) || 20, 1);
      const skip = Math.max(parseInt(req.query.skip, 10) || 0, 0);
      
      const cacheKey = `tribe:${emoji}:${skip}:${limit}`;
      const cachedTribe = tribesCache.get(cacheKey);

      if (cachedTribe) {
        return res.json(cachedTribe);
      }

      const tribe = await db.collection('avatars').aggregate([
        {
          $match: { 
            emoji: emoji,
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
        { $skip: skip },
        { $limit: limit }
      ]).toArray();

      const tribeWithThumbnails = {
        emoji,
        members: await Promise.all(
          tribe.map(async (member) => ({
            ...member,
            thumbnailUrl: await thumbnailService.generateThumbnail(member.imageUrl)
          }))
        )
      };

      tribesCache.set(cacheKey, tribeWithThumbnails);
      res.json(tribeWithThumbnails);
    } catch (error) {
      console.error('[Tribe Details Error]:', error);
      res.status(500).json({ error: 'Failed to fetch tribe details', details: error.message });
    }
  });

  return router;
}
