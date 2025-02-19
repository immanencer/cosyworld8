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

  // Get admin stats including blacklist and whitelist
  // Delete guild from whitelist
  router.delete('/whitelist/guild/:guildId', async (req, res) => {
    try {
      const { guildId } = req.params;
      const config = await loadConfig();
      config.whitelistedGuilds = config.whitelistedGuilds.filter(id => id !== guildId);
      await saveUserConfig(config);
      res.json({ success: true, whitelistedGuilds: config.whitelistedGuilds });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.get('/stats', async (req, res) => {
    try {
      const config = await loadConfig();
      const blacklistedUsers = await db.collection('user_spam_penalties')
        .find({})
        .sort({ strikeCount: -1 })
        .project({
          userId: 1,
          strikeCount: 1,
          penaltyExpires: 1,
          permanentlyBlacklisted: 1,
          server: 1
        })
        .toArray();

      res.json({
        whitelistedGuilds: config.whitelistedGuilds || [],
        blacklistedUsers: blacklistedUsers
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Unban a user
  router.post('/unban', async (req, res) => {
    try {
      const { userId } = req.body;
      await db.collection('user_spam_penalties').updateOne(
        { userId },
        { 
          $set: { 
            strikeCount: 0,
            permanentlyBlacklisted: false,
            penaltyExpires: new Date()
          }
        }
      );
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}
  router.post('/ban', async (req, res) => {
    try {
      const { userId } = req.body;
      await db.collection('user_spam_penalties').updateOne(
        { userId },
        {
          $set: {
            permanentlyBlacklisted: true,
            blacklistedAt: new Date(),
            penaltyExpires: new Date(8640000000000000) // Max date
          },
          $inc: { strikeCount: 1 }
        },
        { upsert: true }
      );
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
