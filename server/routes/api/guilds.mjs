import express from 'express';
import { ObjectId } from 'mongodb';
import configService from '../../../src/services/configService.mjs';

const router = express.Router();

// Wrap async route handlers to catch errors
import express from 'express';
import * as configService from '../../services/configService.mjs';

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
      
      // Otherwise create a new config
      const result = await db.collection('guild_configs').insertOne({
        ...guildData,
        updatedAt: new Date()
      });
      
      const newConfig = await configService.getGuildConfig(db, guildData.guildId);
      res.status(201).json(newConfig);
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


  return router;
}