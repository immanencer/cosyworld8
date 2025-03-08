import express from 'express';
import configService from '../../src/services/configService.mjs';

const router = express.Router();

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export default function(db) {
  // Get all guild configurations
  router.get('/', asyncHandler(async (req, res) => {
    const guildConfigs = await configService.getAllGuildConfigs(db);
    res.json(guildConfigs);
  }));

  // Create a new guild configuration
  router.post('/', asyncHandler(async (req, res) => {
    const guildData = req.body;

    if (!guildData || !guildData.guildId) {
      return res.status(400).json({ error: 'Guild ID is required' });
    }

    try {
      // Check if guild config already exists
      const existingConfig = await configService.getGuildConfig(db, guildData.guildId);

      // If it exists, update it
      if (existingConfig) {
        const result = await configService.updateGuildConfig(db, guildData.guildId, guildData);
        const updatedConfig = await configService.getGuildConfig(db, guildData.guildId);
        return res.json(updatedConfig);
      }

      // Otherwise create a new config based on a template

      // First, check if we have any existing guild configs to use as a template
      const templateGuild = await db.collection('guild_configs').findOne(
        {},
        { sort: { createdAt: 1 } } // Sort by creation date to get the first one
      );

      let newGuildConfig = {
        ...guildData,
        updatedAt: new Date(),
        createdAt: new Date()
      };

      // If we found a template guild, copy its settings
      if (templateGuild) {
        console.log(`Using guild ${templateGuild.guildId} as a template for new guild ${guildData.guildId}`);

        // Copy template settings but keep the new guild's ID and name
        newGuildConfig = {
          ...templateGuild,
          guildId: guildData.guildId,
          guildName: guildData.guildName || `New Guild ${guildData.guildId}`,
          _id: undefined, // Remove MongoDB ID so it creates a new one
          updatedAt: new Date(),
          createdAt: new Date()
        };
        
        // Ensure all prompts and settings are properly copied
        if (templateGuild.prompts) {
          newGuildConfig.prompts = { ...templateGuild.prompts };
        }
        
        if (templateGuild.features) {
          newGuildConfig.features = { ...templateGuild.features };
        }
        
        if (templateGuild.rateLimit) {
          newGuildConfig.rateLimit = { ...templateGuild.rateLimit };
        }
        
        if (templateGuild.toolEmojis) {
          newGuildConfig.toolEmojis = { ...templateGuild.toolEmojis };
        }
        
        // Also copy admin roles and other settings
        if (templateGuild.adminRoles) {
          newGuildConfig.adminRoles = [...templateGuild.adminRoles];
        }
        
        // Copy summon emoji
        newGuildConfig.summonEmoji = templateGuild.summonEmoji;
        
        // New guilds start as not whitelisted by default for safety
        newGuildConfig.whitelisted = false;
      }

      const result = await db.collection('guild_configs').insertOne(newGuildConfig);

      const createdConfig = await configService.getGuildConfig(db, guildData.guildId);
      res.status(201).json(createdConfig);
    } catch (error) {
      console.error('Error creating guild configuration:', error);
      res.status(500).json({ error: error.message });
    }
  }));

  // Get a specific guild configuration
  router.get('/:guildId', asyncHandler(async (req, res) => {
    const { guildId } = req.params;
    const guildConfig = await configService.getGuildConfig(db, guildId);

    if (!guildConfig) {
      return res.status(404).json({ error: 'Guild configuration not found' });
    }

    res.json(guildConfig);
  }));

  // Create or update a guild configuration
  router.post('/:guildId', asyncHandler(async (req, res) => {
    const { guildId } = req.params;
    const updates = req.body;

    try {
      const result = await configService.updateGuildConfig(db, guildId, updates);
      const updatedConfig = await configService.getGuildConfig(db, guildId);
      res.json(updatedConfig);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }));

  // Update specific guild settings
  router.patch('/:guildId', asyncHandler(async (req, res) => {
    const { guildId } = req.params;
    const updates = req.body;

    try {
      const result = await configService.updateGuildConfig(db, guildId, updates);
      const updatedConfig = await configService.getGuildConfig(db, guildId);
      res.json(updatedConfig);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }));

  // Delete a guild configuration
  router.delete('/:guildId', asyncHandler(async (req, res) => {
    const { guildId } = req.params;

    try {
      const result = await db.collection('guild_configs').deleteOne({ guildId });

      if (result.deletedCount === 0) {
        return res.status(404).json({ error: 'Guild configuration not found' });
      }

      res.json({ message: 'Guild configuration deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }));

  // Get connected Discord servers (guilds)
  router.get('/connected/list', asyncHandler(async (req, res) => {
    try {
      // We'll need to query the Discord API or get this from our database
      const connectedGuilds = await db.collection('connected_guilds').find({}).toArray();

      res.json(connectedGuilds);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }));

  // Added route to handle guild config retrieval with database check
  router.get('/config/:guildId', asyncHandler(async (req, res) => {
    try {
      // Check if database is initialized
      if (!db) {
        console.error('Database connection not available');
        return res.status(503).json({ error: 'Database connection not available' });
      }

      const guildId = req.params.guildId;
      const config = await db.collection('guild_configs').findOne({ guildId });
      res.json(config || { guildId, whitelisted: false });
    } catch (error) {
      console.error('Error fetching guild config:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }));

  // Add endpoint to clear guild config cache
  router.post('/:guildId/clear-cache', asyncHandler(async (req, res) => {
    try {
      const { guildId } = req.params;
      // Clear cache in configService if it has a cache
      if (configService.clearCache) {
        await configService.clearCache(guildId);
      }
      res.json({ success: true, message: 'Guild config cache cleared' });
    } catch (error) {
      console.error('Error clearing guild config cache:', error);
      res.status(500).json({ error: 'Failed to clear cache' });
    }
  }));

  return router;
}