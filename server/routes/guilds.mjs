
import express from 'express';
import { checkAuth } from '../middleware/auth.mjs';

export function setupGuildsRoutes(app, db, discordService) {
  const router = express.Router();
  
  // Get all guilds the bot is in
  router.get('/', checkAuth, async (req, res) => {
    try {
      const guilds = await discordService.getAllGuilds();
      
      // Fetch guild configs from database
      const guildConfigs = await db.collection('guildConfigs').find({}).toArray();
      
      // Merge Discord guild info with database info
      const mergedGuilds = guilds.map(guild => {
        const config = guildConfigs.find(g => g.guildId === guild.id) || {};
        return {
          ...guild,
          isWhitelisted: config.isWhitelisted || false,
          settings: config.settings || {}
        };
      });
      
      res.json(mergedGuilds);
    } catch (error) {
      console.error('Error fetching guilds:', error);
      res.status(500).json({ error: 'Failed to fetch guilds' });
    }
  });
  
  // Update guild whitelist status
  router.put('/:guildId/whitelist', checkAuth, async (req, res) => {
    try {
      const { guildId } = req.params;
      const { isWhitelisted } = req.body;
      
      if (typeof isWhitelisted !== 'boolean') {
        return res.status(400).json({ error: 'isWhitelisted must be a boolean' });
      }
      
      await db.collection('guildConfigs').updateOne(
        { guildId },
        { 
          $set: { isWhitelisted },
          $setOnInsert: { guildId, updatedAt: new Date() }
        },
        { upsert: true }
      );
      
      res.json({ success: true, guildId, isWhitelisted });
    } catch (error) {
      console.error('Error updating guild whitelist:', error);
      res.status(500).json({ error: 'Failed to update guild whitelist' });
    }
  });
  
  // Update guild settings
  router.put('/:guildId/settings', checkAuth, async (req, res) => {
    try {
      const { guildId } = req.params;
      const { settings } = req.body;
      
      if (!settings || typeof settings !== 'object') {
        return res.status(400).json({ error: 'Settings must be an object' });
      }
      
      await db.collection('guildConfigs').updateOne(
        { guildId },
        { 
          $set: { 
            'settings': settings,
            'updatedAt': new Date()
          },
          $setOnInsert: { guildId }
        },
        { upsert: true }
      );
      
      res.json({ success: true, guildId, settings });
    } catch (error) {
      console.error('Error updating guild settings:', error);
      res.status(500).json({ error: 'Failed to update guild settings' });
    }
  });
  
  app.use('/api/guilds', router);
}
