import express from 'express';
import { thumbnailService } from '../services/thumbnailService.mjs';

const router = express.Router();

export default function(db) {
  // Get all avatars grouped by emoji
  router.get('/', async (req, res) => {
    try {
      await thumbnailService.ensureThumbnailDir();

      const pipeline = [
        {
          $match: {
            emoji: { $exists: true, $ne: null, $ne: '' }
          }
        },
        {
          $group: {
            _id: '$emoji',
            count: { $sum: 1 },
            members: { $push: '$$ROOT' }
          }
        },
        {
          $match: {
            count: { $gt: 1 } // Only show groups with at least 2 members
          }
        },
        {
          $sort: { count: -1 }
        }
      ];

      const tribes = await db.collection('avatars').aggregate(pipeline).toArray();

      // Add thumbnails for all members
      const tribesWithThumbs = await Promise.all(
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

      res.json(tribesWithThumbs);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.get('/tribes', async (req, res) => {
    try {
      const db = req.app.get('db');
      if (!db) {
        return res.status(500).json({ error: 'Database not connected' });
      }
      const tribesColl = db.collection('tribes');
      if (!tribesColl) {
        return res.status(500).json({ error: 'Tribes collection missing' });
      }
      const tribes = await tribesColl.find({}).toArray();
      res.json({ tribes });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
}