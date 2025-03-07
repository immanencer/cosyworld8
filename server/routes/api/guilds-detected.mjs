
import express from 'express';
import { DatabaseService } from '../../services/databaseService.mjs';
import configService from '../../services/configService.mjs';

const router = express.Router();
const databaseService = new DatabaseService();

// Helper function to wrap async route handlers
const asyncHandler = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Get detected but not configured guilds
router.get('/', asyncHandler(async (req, res) => {
  try {
    // First ensure DB connection
    const db = await databaseService.connect();
    
    // Get all connected guilds from the database
    const connectedGuilds = await db.collection('connected_guilds').find({}).toArray();
    
    // Get all configured guilds
    const configuredGuilds = await db.collection('guild_configs').find({}).toArray();
    
    // Find guilds that are connected but not configured
    const configuredGuildIds = configuredGuilds.map(g => g.guildId);
    const detectedGuilds = connectedGuilds.filter(guild => !configuredGuildIds.includes(guild.id));
    
    res.json(detectedGuilds);
  } catch (error) {
    console.error('Error fetching detected guilds:', error);
    res.status(500).json({ error: 'Failed to fetch detected guilds' });
  }
}));

export default router;
