
import express from 'express';
import { checkAuth } from '../middleware/auth.mjs';

export function setupGuildsDetectedRoutes(app, db, discordService) {
  const router = express.Router();
  
  // Get all guilds that the bot has detected but may not be in the database
  router.get('/', checkAuth, async (req, res) => {
    try {
      const discordGuilds = await discordService.getAllGuilds();
      
      // Return the raw Discord guild data
      res.json(discordGuilds);
    } catch (error) {
      console.error('Error fetching detected guilds:', error);
      res.status(500).json({ error: 'Failed to fetch detected guilds' });
    }
  });
  
  app.use('/api/guilds-detected', router);
}
