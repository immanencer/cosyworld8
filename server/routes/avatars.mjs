import express from 'express';
import { getDb } from '../services/dbConnection.mjs';
import { thumbnailService } from './thumbnailService.mjs';

const router = express.Router();

// Get paginated avatars with thumbnails
router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
    const skip = ((page - 1) * limit);

    const db = await getDb();
    
    const [avatars, total] = await Promise.all([
      db.collection('avatars')
        .find({})
        .sort({ emoji: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      db.collection('avatars').countDocuments()
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

export default router;