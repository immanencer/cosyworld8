
import express from 'express';
import configService from '../../../src/services/configService.mjs';

const router = express.Router();

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
        $or: [
          { message: { $regex: 'Guild .+ is not whitelisted' } },
          { message: { $regex: 'Retrieved guild config for .+ from database: whitelisted=false' } },
          { type: 'guild_access' }
        ],
        timestamp: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
      })
      .sort({ timestamp: -1 })
      .toArray();

    // Extract guild IDs and names from log messages
    const detectedGuilds = new Map();
    const guildInfoRegex1 = /Guild (.+) \((\d+)\) is not whitelisted/i;
    const guildInfoRegex2 = /Retrieved guild config for (\d+) from database: whitelisted=false/i;

    logs.forEach(log => {
      // First check if this is a structured guild_access log
      if (log.type === 'guild_access' && log.guildId && log.guildName) {
        if (!detectedGuilds.has(log.guildId)) {
          detectedGuilds.set(log.guildId, {
            id: log.guildId,
            name: log.guildName,
            detectedAt: log.timestamp
          });
        }
        return;
      }
      
      // Then check for pattern matches in log messages
      if (typeof log.message !== 'string') return;
      
      let match = guildInfoRegex1.exec(log.message);
      if (match && match.length >= 3) {
        const guildName = match[1].trim();
        const guildId = match[2];

        if (!detectedGuilds.has(guildId)) {
          detectedGuilds.set(guildId, {
            id: guildId,
            name: guildName,
            detectedAt: log.timestamp
          });
        }
      } else {
        // Try the second pattern
        match = guildInfoRegex2.exec(log.message);
        if (match && match.length >= 2) {
          const guildId = match[1];

          if (!detectedGuilds.has(guildId)) {
            detectedGuilds.set(guildId, {
              id: guildId,
              name: `Server ${guildId}`, // If we only have the ID, use it as the name temporarily
              detectedAt: log.timestamp
            });
          }
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
    console.error(`Error fetching detected guilds: ${error.message}`);
    res.status(500).json({ error: 'Failed to fetch detected guilds' });
  }
});

export default router;
