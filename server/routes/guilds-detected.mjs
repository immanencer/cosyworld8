import express from 'express';
import configService from '../../src/services/configService.mjs';
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

    // Get existing whitelisted guilds
    const existingConfigs = await configService.getAllGuildConfigs(db);
    const existingGuildIds = new Set(existingConfigs.map(g => g.guildId));

    // Get fresh data after update
    const allDetectedGuilds = await db.collection('detected_guilds')
      .find({})
      .sort({ updatedAt: -1 })
      .toArray();

    // Filter out guilds that are already configured
    const filteredGuilds = allDetectedGuilds
      .filter(guild => !existingGuildIds.has(guild.id))
      .map(guild => ({
        id: guild.id,
        name: guild.name,
        memberCount: guild.memberCount || 0,
        icon: guild.icon || null,
        detectedAt: guild.detectedAt || guild.updatedAt || new Date()
      }));

    res.json(filteredGuilds);
  } catch (error) {
    console.error(`Error fetching detected guilds: ${error.message}`);
    res.status(500).json({ error: 'Failed to fetch detected guilds' });
  }
});

export default router;