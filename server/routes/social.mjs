import { Router } from 'express';
import { MongoClient, ObjectId } from 'mongodb';

export default function socialRoutes(db) {
  const router = Router();

  router.get('/posts', async (req, res) => {
    try {
      const { sort = 'new', page = 1, limit = 20 } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);

      let pipeline = [
        {
          $match: {
            $or: [
              {
                action: 'xpost',
                result: { 
                  $exists: true, 
                  $ne: null,
                  $not: { $regex: '^(❌|x)', $options: 'i' }
                }
              },
              {
                action: 'remember',
                memory: { $exists: true, $ne: null }
              }
            ],
            actorId: { $exists: true }
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
                    $eq: ['$_id', { $toObjectId: '$$actorId' }]
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

      const posts = await db.collection('dungeon_log')
        .aggregate([
          ...pipeline,
          { $skip: skip },
          { $limit: parseInt(limit) },
          {
            $project: {
              _id: 1,
              content: {
                $cond: {
                  if: { $eq: ['$action', 'remember'] },
                  then: {
                    $replaceAll: {
                      input: '$memory',
                      find: '[🧠 Memory generated: "',
                      replacement: ''
                    }
                  },
                  else: {
                    $replaceAll: {
                      input: {
                        $replaceAll: {
                          input: '$result',
                          find: '✨ Posted to X and feed: ',
                          replacement: ''
                        }
                      },
                      find: '"',
                      replacement: ''
                    }
                  }
                }
              },
              timestamp: 1,
              action: 1,
              actor: 1,
              actorName: 1,
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
      const { walletAddress, avatarId } = req.body;

      if (!walletAddress || !avatarId) {
        return res.status(400).json({ error: 'Wallet address and avatar ID required' });
      }

      await db.collection('dungeon_log').updateOne(
        { _id: new ObjectId(id) },
        { 
          $inc: { likes: 1 },
          $addToSet: { 
            likedBy: walletAddress,
            likedByAvatars: avatarId
          }
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
      const { walletAddress, avatarId } = req.body;

      if (!walletAddress || !avatarId) {
        return res.status(400).json({ error: 'Wallet address and avatar ID required' });
      }

      await db.collection('dungeon_log').updateOne(
        { _id: new ObjectId(id) },
        { 
          $inc: { reposts: 1 },
          $addToSet: { 
            repostedBy: walletAddress,
            repostedByAvatars: avatarId
          }
        }
      );

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}