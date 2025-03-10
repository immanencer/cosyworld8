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

    // Get all guilds from the detected_guilds collection
    const detectedGuilds = await db.collection('detected_guilds')
      .find({})
      .sort({ updatedAt: -1 })
      .toArray();

    // Get existing whitelisted guilds
    const existingConfigs = await configService.getAllGuildConfigs(db);
    const existingGuildIds = new Set(existingConfigs.map(g => g.guildId));

    // Filter out guilds that are already configured
    const filteredGuilds = detectedGuilds
      .filter(guild => !existingGuildIds.has(guild.id))
      .map(guild => ({
        id: guild.id,
        name: guild.name,
        memberCount: guild.memberCount || 0,
        detectedAt: guild.detectedAt || guild.updatedAt || new Date()
      }));

    res.json(filteredGuilds);
  } catch (error) {
    console.error(`Error fetching detected guilds: ${error.message}`);
    res.status(500).json({ error: 'Failed to fetch detected guilds' });
  }
});

export default router;