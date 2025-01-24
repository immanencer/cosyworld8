
import { Router } from 'express';
import { ObjectId } from 'mongodb';

export default function socialRoutes(db) {
  const router = Router();

  router.get('/posts', async (req, res) => {
    try {
      const { sort = 'new', page = 1, limit = 20 } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);

      // Query both collections and merge results
      const [dungeonPosts, socialPosts] = await Promise.all([
        // Get posts from dungeon_log
        db.collection('dungeon_log').aggregate([
          {
            $match: {
              action: 'xpost',
              result: { 
                $exists: true, 
                $ne: null,
                $not: { $regex: '^(❌|x)', $options: 'i' }
              }
            }
          },
          {
            $project: {
              content: {
                $replaceAll: {
                  input: {
                    $replaceAll: {
                      input: '$result',
                      find: '✅ Posted to X: "',
                      replacement: ''
                    }
                  },
                  find: '"',
                  replacement: ''
                }
              },
              timestamp: 1,
              actorId: 1,
              likes: { $ifNull: ['$likes', 0] },
              reposts: { $ifNull: ['$reposts', 0] },
              likedBy: { $ifNull: ['$likedBy', []] },
              repostedBy: { $ifNull: ['$repostedBy', []] }
            }
          }
        ]).toArray(),
        
        // Get posts from social_posts
        db.collection('social_posts').aggregate([
          {
            $project: {
              content: 1,
              timestamp: 1,
              actorId: '$avatarId',
              likes: { $ifNull: ['$likes', 0] },
              reposts: { $ifNull: ['$reposts', 0] },
              likedBy: { $ifNull: ['$likedBy', []] },
              repostedBy: { $ifNull: ['$repostedBy', []] }
            }
          }
        ]).toArray()
      ]);

      // Combine and sort all posts
      let allPosts = [...dungeonPosts, ...socialPosts];
      
      // Sort posts based on query parameter
      if (sort === 'top') {
        allPosts.sort((a, b) => (b.likes - a.likes) || (b.timestamp - a.timestamp));
      } else {
        allPosts.sort((a, b) => b.timestamp - a.timestamp);
      }

      // Apply pagination
      allPosts = allPosts.slice(skip, skip + parseInt(limit));

      // Lookup avatars for the filtered posts
      let pipeline = [
        {
          $match: {
            _id: { $in: allPosts.map(p => new ObjectId(p.actorId)) }
          }
        },
        {
          $lookup: {
            from: 'avatars',
            let: { actorId: '$actorId' },
            pipeline: [
              {
                $match: {
                  $expr: { 
                    $eq: [{ $toString: '$_id' }, '$$actorId']
                  }
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

      const avatars = await db.collection('avatars')
        .aggregate([
          {
            $match: {
              _id: { $in: allPosts.map(p => new ObjectId(p.actorId)) }
            }
          }
        ]).toArray();

      // Combine posts with avatar data
      const posts = allPosts.map(post => ({
        ...post,
        avatar: avatars.find(a => a._id.toString() === post.actorId.toString())
      }));

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
