
import { Router } from 'express';
import { ObjectId } from 'mongodb';

export default function socialRoutes(db) {
  const router = Router();

  router.get('/posts', async (req, res) => {
    try {
      const { sort = 'new', page = 1, limit = 20 } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);

      let pipeline = [];
      if (sort === 'top') {
        pipeline = [
          { $sort: { likes: -1, timestamp: -1 } }
        ];
      } else {
        pipeline = [
          { $sort: { timestamp: -1 } }
        ];
      }

      const posts = await db.collection('social_posts')
        .aggregate([
          ...pipeline,
          { $skip: skip },
          { $limit: parseInt(limit) },
          {
            $lookup: {
              from: 'avatars',
              localField: 'avatarId',
              foreignField: '_id',
              as: 'avatar'
            }
          },
          { $unwind: '$avatar' }
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

      await db.collection('social_posts').updateOne(
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

      await db.collection('social_posts').updateOne(
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
