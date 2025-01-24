
import { Router } from 'express';
import { ObjectId } from 'mongodb';

export default function socialRoutes(db) {
  const router = Router();

  router.get('/posts', async (req, res) => {
    try {
      const { sort = 'new', page = 1, limit = 20 } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);

      let pipeline = [
        {
          $match: {
            action: 'xpost',
            result: { $exists: true, $ne: null, $not: /^❌/ }
          }
        },
        {
          $lookup: {
            from: 'avatars',
            let: { actorName: '$actor' },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ['$name', '$$actorName'] }
                }
              }
            ],
            as: 'avatar'
          }
        },
        { $unwind: '$avatar' }
      ];

      if (sort === 'top') {
        pipeline.unshift({ $sort: { likes: -1, timestamp: -1 } });
      } else {
        pipeline.unshift({ $sort: { timestamp: -1 } });
      }

      const posts = await db.collection('dungeon_log')
        .aggregate([
          ...pipeline,
          { $skip: skip },
          { $limit: parseInt(limit) },
          {
            $project: {
              _id: 1,
              content: '$result',
              timestamp: 1,
              action: 1,
              actor: 1,
              target: 1,
              avatar: 1,
              likes: { $ifNull: ['$likes', 0] },
              reposts: { $ifNull: ['$reposts', 0] },
              likedBy: { $ifNull: ['$likedBy', []] },
              repostedBy: { $ifNull: ['$repostedBy', []] }
            }
          }
        ]).toArray();

      res.json(posts);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.post('/posts/:id/like', async (req, res) => {
    try {
      const { id } = req.params;
      const { walletAddress } = req.body;
      
      if (!walletAddress) {
        return res.status(400).json({ error: 'Wallet address required' });
      }

      await db.collection('dungeon_log').updateOne(
        { _id: new ObjectId(id) },
        { 
          $inc: { likes: 1 },
          $addToSet: { likedBy: walletAddress }
        }
      );

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.post('/posts/:id/repost', async (req, res) => {
    try {
      const { id } = req.params;
      const { walletAddress } = req.body;

      if (!walletAddress) {
        return res.status(400).json({ error: 'Wallet address required' });
      }

      await db.collection('dungeon_log').updateOne(
        { _id: new ObjectId(id) },
        { 
          $inc: { reposts: 1 },
          $addToSet: { repostedBy: walletAddress }
        }
      );

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}
