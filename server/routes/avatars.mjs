import express from 'express';
import { thumbnailService } from '../services/thumbnailService.mjs';
import { NFTMintingService } from '../../src/services/nftMintService.mjs';

const router = express.Router();

export default function (db) {
  // Get paginated avatars with thumbnails
  router.get('/', async (req, res) => {
    try {
      const page = Math.max(1, parseInt(req.query.page) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
      const skip = ((page - 1) * limit);

      const [avatars, total] = await Promise.all([
        db.collection('avatars')
          .find({})
          .sort({ emoji: -1 })
          .skip(skip)
          .limit(limit)
          .toArray(),
        db.collection('avatars').estimatedDocumentCount()
      ]);

      // Ensure thumbnail directory exists
      await thumbnailService.ensureThumbnailDir();

      // Generate thumbnails in parallel with error handling for each
      const avatarsWithThumbs = await Promise.all(
        avatars.map(async (avatar) => {
          try {
            const thumbnailUrl = await thumbnailService.generateThumbnail(avatar.imageUrl);
            return { ...avatar, thumbnailUrl };
          } catch (error) {
            console.error(`Thumbnail generation failed for avatar ${avatar._id}:`, error);
            return { ...avatar, thumbnailUrl: avatar.imageUrl }; // Fallback to original image
          }
        })
      );

      res.json({
        avatars: avatarsWithThumbs,
        total,
        page,
        totalPages: Math.ceil(total / limit),
        limit
      });
    } catch (error) {
      console.error('Avatar listing error:', error);
      res.status(500).json({
        error: 'Failed to fetch avatars',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });

  router.get('/owned/:publicKey', async (req, res) => {
    try {
      const { publicKey } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 12;
      const skip = (page - 1) * limit;

      if (!publicKey) {
        return res.status(400).json({ error: 'Public key required' });
      }

      const nftMintService = new NFTMintingService(db);
      const ownedAvatars = await nftMintService.getAvatarsByOwner(publicKey, skip, limit);
      
      res.json({
        avatars: ownedAvatars || [],
        hasMore: (ownedAvatars || []).length === limit
      });
    } catch (error) {
      console.error('Error fetching owned avatars:', error);
      res.status(500).json({ error: error.message });
    }
  });

  router.post('/claim', async (req, res) => {
    try {
      const { walletAddress } = req.body;
      if (!walletAddress) {
        return res.status(400).json({ error: 'Wallet address required' });
      }

      const avatarService = new AvatarGenerationService(db);
      const randomAvatar = await avatarService.getRandomUnmintedAvatar();
      
      if (!randomAvatar) {
        return res.status(404).json({ error: 'No available avatars to claim' });
      }

      const nftMintService = new NFTMintingService(db);
      await nftMintService.mintAvatarToWallet(randomAvatar._id, walletAddress);

      res.json({ success: true, avatar: randomAvatar });
    } catch (error) {
      console.error('Error claiming avatar:', error);
      res.status(500).json({ error: error.message });
    }
  });

  router.get('/gallery', async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 12;
      const skip = (page - 1) * limit;

      const avatars = await db.collection('avatars')
        .find({})
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray();

      res.json({ 
        success: true,
        avatars: avatars || [],
        page,
        limit
      });
    } catch (error) {
      console.error('Error fetching gallery:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch gallery',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });

  // Get avatar location
  router.get('/:avatarId/location', async (req, res) => {
    try {
      const avatar = await db.collection('avatars').findOne(
        { _id: req.params.avatarId },
        { projection: { currentLocation: 1 } }
      );
      
      if (!avatar?.currentLocation) {
        return res.json({ location: null });
      }

      const location = await db.collection('locations').findOne(
        { _id: avatar.currentLocation }
      );

      res.json({ location });
    } catch (error) {
      console.error('Error fetching avatar location:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get avatar memories
  router.get('/:avatarId/memories', async (req, res) => {
    try {
      const memories = await db.collection('memories')
        .find({ avatarId: req.params.avatarId })
        .sort({ timestamp: -1 })
        .limit(10)
        .toArray();

      res.json({ memories });
    } catch (error) {
      console.error('Error fetching avatar memories:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get avatar narratives and messages
  router.get('/:avatarId/narratives', async (req, res) => {
    try {
      const [narratives, messages] = await Promise.all([
        db.collection('narratives')
          .find({ avatarId: req.params.avatarId })
          .sort({ timestamp: -1 })
          .limit(10)
          .toArray(),
        db.collection('messages')
          .find({ avatarId: req.params.avatarId })
          .sort({ timestamp: -1 })
          .limit(10)
          .toArray()
      ]);

      res.json({ 
        narratives,
        recentMessages: messages,
      });
    } catch (error) {
      console.error('Error fetching avatar narratives:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get avatar actions
  router.get('/:avatarId/actions', async (req, res) => {
    try {
      const actions = await db.collection('dungeon_actions')
        .find({ avatarId: req.params.avatarId })
        .sort({ timestamp: -1 })
        .limit(10)
        .toArray();

      res.json({ actions });
    } catch (error) {
      console.error('Error fetching avatar actions:', error);
      res.status(500).json({ error: error.message });
    }
  });

  router.get('/leaderboard', async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 12;
      const skip = (page - 1) * limit;

      const avatars = await db.collection('avatars')
        .find({})
        .sort({ score: -1 })
        .skip(skip)
        .limit(limit)
        .toArray();

      res.json({ avatars });
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}