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
  router.get('/stats', async (req, res) => {
    try {
      const config = await loadConfig();
      const blacklistedUsers = await db.collection('user_spam_penalties')
        .find({ 
          $or: [
            { permanentlyBlacklisted: true },
            { penaltyExpires: { $gt: new Date() } }
          ]
        })
        .project({
          userId: 1,
          strikeCount: 1,
          penaltyExpires: 1,
          permanentlyBlacklisted: 1
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