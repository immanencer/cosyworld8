import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { ObjectId } from 'mongodb';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const configPath = path.join(process.cwd(), 'src/config');

// Helper function to handle async route handlers
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Config utility functions
async function loadConfig() {
  try {
    const defaultConfig = JSON.parse(await fs.readFile(path.join(configPath, 'default.config.json')));
    const userConfig = JSON.parse(await fs.readFile(path.join(configPath, 'user.config.json')));
    return { ...defaultConfig, ...userConfig };
  } catch (error) {
    console.error('Config load error:', error);
    // Return empty config if files don't exist
    return { 
      whitelistedGuilds: [],
      emojis: {
        summon: "🔮",
        breed: "🏹",
        attack: "⚔️",
        defend: "🛡️"
      },
      prompts: {
        introduction: "You have been summoned to this realm. This is your one chance to impress me, and save yourself from Elimination. Good luck, and DONT fuck it up.",
        summon: "Create a unique avatar with a special ability."
      },
      features: {
        breeding: true,
        combat: true,
        itemCreation: true
      },
      rateLimit: {
        messages: 5,
        interval: 10
      },
      adminRoles: ["Admin", "Moderator"]
    };
  }
}

async function saveUserConfig(config) {
  try {
    await fs.mkdir(configPath, { recursive: true });
    await fs.writeFile(
      path.join(configPath, 'user.config.json'),
      JSON.stringify(config, null, 2)
    );
    return true;
  } catch (error) {
    console.error('Config save error:', error);
    throw error;
  }
}

function createRouter(db) {
  const router = express.Router();

  // ===== Avatar Routes =====

  router.post('/avatars', asyncHandler(async (req, res) => {
    const {
      name,
      description,
      personality,
      emoji,
      imageUrl,
      locationId,
      lives,
      status,
      model
    } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    // Create avatar object
    const avatar = {
      name,
      description: description || '',
      personality: personality || '',
      emoji: emoji || '✨',
      imageUrl: imageUrl || '',
      status: status || 'active',
      lives: lives || 3,
      locationId: locationId || null,
      model: model || 'gpt-4',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Insert into database
    const result = await db.avatars.insertOne(avatar);

    // Return created avatar with ID
    res.status(201).json({
      _id: result.insertedId,
      ...avatar
    });
  }));

  router.get('/avatars/:id', asyncHandler(async (req, res) => {
    let id;
    try {
      id = new ObjectId(req.params.id);
    } catch (err) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    const avatar = await db.avatars.findOne({ _id: id });
    if (!avatar) {
      return res.status(404).json({ error: 'Avatar not found' });
    }

    res.json(avatar);
  }));

  router.put('/avatars/:id', asyncHandler(async (req, res) => {
    let id;
    try {
      id = new ObjectId(req.params.id);
    } catch (err) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    const {
      name,
      description,
      personality,
      emoji,
      imageUrl,
      locationId,
      lives,
      status,
      model
    } = req.body;

    // Create update object with only provided fields
    const updateObj = {};
    if (name !== undefined) updateObj.name = name;
    if (description !== undefined) updateObj.description = description;
    if (personality !== undefined) updateObj.personality = personality;
    if (emoji !== undefined) updateObj.emoji = emoji;
    if (imageUrl !== undefined) updateObj.imageUrl = imageUrl;
    if (locationId !== undefined) updateObj.locationId = locationId;
    if (lives !== undefined) updateObj.lives = lives;
    if (status !== undefined) updateObj.status = status;
    if (model !== undefined) updateObj.model = model;

    // Add updated timestamp
    updateObj.updatedAt = new Date();

    // Validate required fields
    if (updateObj.name === '') {
      return res.status(400).json({ error: 'Name is required' });
    }

    // Update avatar
    const result = await db.avatars.updateOne(
      { _id: id },
      { $set: updateObj }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Avatar not found' });
    }

    // Return updated avatar
    const updatedAvatar = await db.avatars.findOne({ _id: id });
    res.json(updatedAvatar);
  }));

  router.delete('/avatars/:id', asyncHandler(async (req, res) => {
    let id;
    try {
      id = new ObjectId(req.params.id);
    } catch (err) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    // Delete avatar
    const result = await db.avatars.deleteOne({ _id: id });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Avatar not found' });
    }

    res.status(204).end();
  }));

  // ===== Item Routes =====
  router.get('/items', asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;

    const total = await db.collection('items').countDocuments();
    const data = await db.collection('items')
      .find()
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .toArray();

    res.json({ data, total, limit, offset });
  }));

  router.post('/items', asyncHandler(async (req, res) => {
    const {
      name,
      description,
      emoji,
      imageUrl,
      rarity,
      owner,
      locationId
    } = req.body;

    // Validate required fields
    if (!name || !description) {
      return res.status(400).json({ error: 'Name and description are required' });
    }

    // Create item object
    const item = {
      name,
      description,
      emoji: emoji || '🔮',
      imageUrl: imageUrl || '',
      rarity: rarity || 'common',
      owner: owner || null,
      locationId: locationId || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Insert into database
    const result = await db.collection('items').insertOne(item);

    // Return created item with ID
    res.status(201).json({
      _id: result.insertedId,
      ...item
    });
  }));

  // ===== Location Routes =====
  router.get('/locations', asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;

    const total = await db.collection('locations').countDocuments();
    const data = await db.collection('locations')
      .find()
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .toArray();

    res.json({ data, total, limit, offset });
  }));

  router.post('/locations', asyncHandler(async (req, res) => {
    const {
      name,
      description,
      imageUrl,
      type
    } = req.body;

    // Validate required fields
    if (!name || !description) {
      return res.status(400).json({ error: 'Name and description are required' });
    }

    // Create location object
    const location = {
      name,
      description,
      imageUrl: imageUrl || '',
      type: type || 'wilderness',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Insert into database
    const result = await db.collection('locations').insertOne(location);

    // Return created location with ID
    res.status(201).json({
      _id: result.insertedId,
      ...location
    });
  }));

  // ===== Configuration Routes =====
  router.get('/config', asyncHandler(async (req, res) => {
    try {
      const config = await loadConfig();
      res.json(config);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }));

  router.post('/whitelist/guild', asyncHandler(async (req, res) => {
    try {
      const { guildId } = req.body;
      const config = await loadConfig();

      if (!config.whitelistedGuilds) {
        config.whitelistedGuilds = [];
      }

      if (!config.whitelistedGuilds.includes(guildId)) {
        config.whitelistedGuilds.push(guildId);
        await saveUserConfig(config);
      }

      res.json({ success: true, whitelistedGuilds: config.whitelistedGuilds });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }));

  router.delete('/whitelist/guild/:guildId', asyncHandler(async (req, res) => {
    try {
      const { guildId } = req.params;
      const config = await loadConfig();

      if (config.whitelistedGuilds) {
        config.whitelistedGuilds = config.whitelistedGuilds.filter(id => id !== guildId);
        await saveUserConfig(config);
      }

      res.json({ success: true, whitelistedGuilds: config.whitelistedGuilds || [] });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }));

  // ===== User Management Routes =====
  router.post('/ban', asyncHandler(async (req, res) => {
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
  }));

  router.post('/unban', asyncHandler(async (req, res) => {
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
  }));

  // ===== Stats Routes =====
  router.get('/stats', asyncHandler(async (req, res) => {
    try {
      // Get counts
      const [avatarCount, itemCount, locationCount, memoryCount] = await Promise.all([
        db.avatars.countDocuments(),
        db.collection('items').countDocuments(),
        db.collection('locations').countDocuments(),
        db.memories ? db.memories.countDocuments() : 0
      ]);

      // Get recent activity (last 10 memories)
      const recentActivity = db.memories ? await db.memories
        .find()
        .sort({ timestamp: -1 })
        .limit(10)
        .toArray() : [];

      // Get blacklisted users
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
        counts: {
          avatars: avatarCount,
          items: itemCount,
          locations: locationCount,
          memories: memoryCount
        },
        recentActivity,
        whitelistedGuilds: config.whitelistedGuilds || [],
        blacklistedUsers
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }));

  // ===== Admin Routes =====
  const adminRouter = express.Router();

  // Get admin dashboard data
  adminRouter.get('/config', asyncHandler(async (req, res) => {
    try {
      // Get various stats from the database
      const avatarCount = await db.avatars.countDocuments();
      const messageCount = db.messages ? await db.messages.countDocuments() : 0;
      const locationCount = await db.collection('locations').countDocuments();

      // Get connected servers (mock data in this example)
      const servers = [
        {
          id: 'server1',
          name: 'CosyWorld Main',
          status: 'online',
          users: 124,
          avatars: 45
        },
        {
          id: 'server2',
          name: 'AI Tavern',
          status: 'online',
          users: 87,
          avatars: 23
        }
      ];

      const config = await loadConfig();

      res.json({
        success: true,
        stats: {
          avatarCount,
          userCount: 250, // Mock data
          messageCount,
          locationCount
        },
        servers,
        config
      });
    } catch (error) {
      console.error("Error fetching admin config:", error);
      res.status(500).json({ error: error.message });
    }
  }));

  // Save admin settings
  adminRouter.post('/settings', asyncHandler(async (req, res) => {
    try {
      const { features, rateLimit, prompts, adminRoles } = req.body;

      const config = await loadConfig();

      if (features) config.features = features;
      if (rateLimit) config.rateLimit = rateLimit;
      if (prompts) config.prompts = prompts;
      if (adminRoles) config.adminRoles = adminRoles;

      await saveUserConfig(config);

      res.json({ 
        success: true,
        message: 'Settings saved successfully'
      });
    } catch (error) {
      console.error("Error saving admin settings:", error);
      res.status(500).json({ error: error.message });
    }
  }));

  // Update emoji configuration
  adminRouter.post('/emojis', asyncHandler(async (req, res) => {
    try {
      const { emojis } = req.body;
      if (!emojis) {
        return res.status(400).json({ error: 'Emoji configuration is required' });
      }

      const config = await loadConfig();
      config.emojis = emojis;
      await saveUserConfig(config);

      res.json({ 
        success: true,
        message: 'Emoji configuration updated'
      });
    } catch (error) {
      console.error("Error updating emoji configuration:", error);
      res.status(500).json({ error: error.message });
    }
  }));

  // Update server configuration
  adminRouter.post('/servers', asyncHandler(async (req, res) => {
    try {
      const { servers } = req.body;

      // In a real app, we would save these to a database
      console.log('Server configuration updated:', servers);

      res.json({ 
        success: true,
        message: 'Server configuration updated'
      });
    } catch (error) {
      console.error("Error updating server configuration:", error);
      res.status(500).json({ error: error.message });
    }
  }));

  // Add admin routes to main router
  router.use('/admin', adminRouter);

  const checkWhitelistStatus = async (guildId) => {
    try {
      // Check if database is initialized
      if (!db) {
        console.error('Error checking whitelist status: Database connection not available');
        return false;
      }

      const config = await db.collection('guild_configs').findOne({ guildId });
      return config?.whitelisted || false;
    } catch (error) {
      console.error('Error checking whitelist status:', error);
      return false;
    }
  };

  return router;
}

export default createRouter;