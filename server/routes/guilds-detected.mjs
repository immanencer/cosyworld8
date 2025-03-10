
import express from 'express';
import { client } from '../../src/services/discordService.mjs';

const router = express.Router();

// Get detected but not whitelisted guilds
router.get('/', async (req, res) => {
  try {
    const db = req.app.locals.db;
    if (!db) {
      return res.status(500).json({ error: 'Database not connected' });
    }

    // Get all guilds from detected_guilds collection
    const detectedGuildsFromDB = await db.collection('detected_guilds')
      .find({})
      .sort({ updatedAt: -1 })
      .toArray();
    
    // Get guilds from Discord client if available
    const discordGuilds = [];
    if (client && client.guilds) {
      try {
        // Convert client's guild cache to array
        client.guilds.cache.forEach(guild => {
          discordGuilds.push({
            id: guild.id,
            name: guild.name,
            memberCount: guild.memberCount,
            icon: guild.icon,
            detectedAt: new Date(),
            updatedAt: new Date(),
            fromDiscordClient: true
          });
        });
        
        // If we have Discord guilds, update the detected_guilds collection
        if (discordGuilds.length > 0) {
          const bulkOps = discordGuilds.map(guild => ({
            updateOne: {
              filter: { id: guild.id },
              update: { $set: guild },
              upsert: true,
            },
          }));
          
          await db.collection('detected_guilds').bulkWrite(bulkOps);
        }
      } catch (discordError) {
        console.error('Error accessing Discord client guilds:', discordError);
      }
    }
    
    // Also check logs for non-whitelisted guild attempts
    const logsCollection = db.collection('logs');
    const guildAccessLogs = await logsCollection
      .find({ type: 'guild_access' })
      .sort({ timestamp: -1 })
      .limit(100)
      .toArray();
    
    // Extract guild info from logs
    const logGuilds = new Map();
    guildAccessLogs.forEach(log => {
      if (log.guildId && log.guildName) {
        if (!logGuilds.has(log.guildId)) {
          logGuilds.set(log.guildId, {
            id: log.guildId,
            name: log.guildName,
            fromLogs: true,
            detectedAt: log.timestamp || new Date(),
            updatedAt: new Date()
          });
        }
      }
    });
    
    // Combine sources, preferring data from Discord client
    const allDetectedGuilds = new Map();
    
    // First add DB guilds
    detectedGuildsFromDB.forEach(guild => {
      allDetectedGuilds.set(guild.id, guild);
    });
    
    // Then add log guilds (if not already in DB)
    logGuilds.forEach((guild, id) => {
      if (!allDetectedGuilds.has(id)) {
        allDetectedGuilds.set(id, guild);
      }
    });
    
    // Finally add Discord client guilds (override existing)
    discordGuilds.forEach(guild => {
      allDetectedGuilds.set(guild.id, guild);
    });
    
    // Check which guilds are already configured/whitelisted
    const configuredGuilds = await db.collection('guild_configs')
      .find({})
      .toArray();
    
    const whitelistedGuildIds = new Set(
      configuredGuilds
        .filter(g => g.whitelisted)
        .map(g => g.guildId)
    );
    
    // Prepare final response
    const result = Array.from(allDetectedGuilds.values()).map(guild => {
      return {
        ...guild,
        whitelisted: whitelistedGuildIds.has(guild.id)
      };
    });
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching detected guilds:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
