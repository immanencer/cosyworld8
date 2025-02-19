import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { ObjectId } from 'mongodb'; // Added for MongoDB interaction

export default function adminRoutes(db) {
  const router = express.Router();
  const configPath = path.join(process.cwd(), 'src/config');

  async function loadConfig() {
    const defaultConfig = JSON.parse(await fs.readFile(path.join(configPath, 'default.config.json')));
    const userConfig = JSON.parse(await fs.readFile(path.join(configPath, 'user.config.json')));
    return { ...defaultConfig, ...userConfig };
  }

  async function saveUserConfig(config) {
    await fs.writeFile(
      path.join(configPath, 'user.config.json'),
      JSON.stringify(config, null, 2)
    );
  }

  router.get('/config', async (req, res) => {
    try {
      const config = await loadConfig();
      res.json(config);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.post('/whitelist/guild', async (req, res) => {
    try {
      const { guildId } = req.body;
      const config = await loadConfig();

      if (!config.whitelistedGuilds.includes(guildId)) {
        config.whitelistedGuilds.push(guildId);
        await saveUserConfig(config);
      }

      res.json({ success: true, whitelistedGuilds: config.whitelistedGuilds });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Endpoint to retrieve users permanently blacklisted by SpamControlService
  router.get('/blacklist', async (req, res) => {
    try {
      // **REPLACE THIS WITH ACTUAL DATABASE QUERY**
      // This is a placeholder;  replace with your database interaction to fetch blacklisted users.
      const blacklistedUsers = await db.collection('users').find({ 'spamControl.permanentlyBlacklisted': true }).toArray();
      res.json(blacklistedUsers);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });


  return router;
}