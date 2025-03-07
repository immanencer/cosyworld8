
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
import express from 'express';
import winston from 'winston';
import configService from '../../services/configService.mjs';

const router = express.Router();

// Initialize logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => 
      `${timestamp} [${level.toUpperCase()}]: ${message}`
    )
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'server.log' })
  ]
});

// Get detected but not whitelisted guilds
router.get('/', async (req, res) => {
  try {
    const db = req.app.locals.db;
    if (!db) {
      return res.status(500).json({ error: 'Database not connected' });
    }
    
    // Find log entries for guilds that attempted to interact with the bot
    // Look for messages about guilds not being whitelisted
    const logs = await db.collection('logs')
      .find({ 
        message: { $regex: 'Guild .+ is not whitelisted' },
        level: 'info',
        timestamp: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
      })
      .sort({ timestamp: -1 })
      .toArray();
    
    // Extract guild IDs and names from log messages
    const detectedGuilds = new Map();
    const guildInfoRegex = /Guild (.+) \((\d+)\) is not whitelisted/;
    
    logs.forEach(log => {
      const match = guildInfoRegex.exec(log.message);
      if (match && match.length >= 3) {
        const guildName = match[1];
        const guildId = match[2];
        
        if (!detectedGuilds.has(guildId)) {
          detectedGuilds.set(guildId, {
            id: guildId,
            name: guildName,
            detectedAt: log.timestamp
          });
        }
      }
    });
    
    // Get existing whitelisted guilds
    const existingConfigs = await configService.getAllGuildConfigs(db);
    const existingGuildIds = new Set(existingConfigs.map(g => g.guildId));
    
    // Filter out guilds that are already configured
    const detectedGuildsArray = Array.from(detectedGuilds.values())
      .filter(guild => !existingGuildIds.has(guild.id));
    
    res.json(detectedGuildsArray);
  } catch (error) {
    logger.error(`Error fetching detected guilds: ${error.message}`);
    res.status(500).json({ error: 'Failed to fetch detected guilds' });
  }
});

export default router;
