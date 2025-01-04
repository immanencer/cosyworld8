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
      if (!publicKey) {
        return res.status(400).json({ error: 'Public key required' });
      }

      const nftMintService = new NFTMintingService(db);
      const ownedAvatars = await nftMintService.getAvatarsByOwner(publicKey);

      res.json(ownedAvatars);
    } catch (error) {
      console.error('Error fetching owned avatars:', error);
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}