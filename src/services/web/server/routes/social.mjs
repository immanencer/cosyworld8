import { Router } from 'express';
import { MongoClient, ObjectId } from 'mongodb';

export default function socialRoutes(db) {
  const router = Router();

  router.get('/posts', async (req, res) => {
    try {
      const { sort = 'new', page = 1, limit = 20 } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);



      const posts = await db.collection('social_posts').find().limit(parseInt(limit)).skip(skip).toArray();
      const totalPosts = await db.collection('social_posts').countDocuments();
      const totalPages = Math.ceil(totalPosts / parseInt(limit));
      const formattedPosts = posts.map(post => ({
        ...post
      }));

      // Get the avatar ids from the formatted posts
      const avatarIds = formattedPosts.map(post => post.avatarId);
      // Fetch avatar data from the database
      const avatars = await db.collection('avatars').find({ _id: { $in: avatarIds.map(id => new ObjectId(id)) } }).toArray();
      // attach avatar data to the posts
      formattedPosts.forEach(post => {
        const avatar = avatars.find(avatar => avatar._id.toString() === post.avatarId.toString());
        if (avatar) {
          post.avatar = {
            _id: avatar._id.toString(),
            name: avatar.name,
            thumbnailUrl: avatar.imageUrl
          };
        }
      });
      res.json({
        posts: formattedPosts,
        pagination: {
          totalPosts,
          totalPages,
          currentPage: parseInt(page),
          limit: parseInt(limit)
        }
      });
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