import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { ObjectId } from 'mongodb';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

function createRouter(db) {
  const router = express.Router();

  //Original routes
  router.get('/avatars', asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;

    const total = await db.avatars.countDocuments();
    const data = await db.avatars
      .find()
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .toArray();

    res.json({ data, total, limit, offset });
  }));

  router.post('/avatars', asyncHandler(async (req, res) => {
    const { name, description, personality, emoji, model } = req.body;

    // Basic validation
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const newAvatar = {
      name,
      description: description || '',
      personality: personality || '',
      emoji: emoji || '🧙‍♂️',
      model: model || 'gpt-4',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.avatars.insertOne(newAvatar);
    newAvatar._id = result.insertedId;

    res.status(201).json(newAvatar);
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

    const { name, description, personality, emoji, model, status } = req.body;

    // Basic validation
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const updatedAvatar = {
      name,
      description,
      personality,
      emoji,
      model,
      status,
      updatedAt: new Date()
    };

    const result = await db.avatars.updateOne(
      { _id: id },
      { $set: updatedAvatar }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Avatar not found' });
    }

    res.json({ ...updatedAvatar, _id: id });
  }));

  router.delete('/avatars/:id', asyncHandler(async (req, res) => {
    let id;
    try {
      id = new ObjectId(req.params.id);
    } catch (err) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    const result = await db.avatars.deleteOne({ _id: id });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Avatar not found' });
    }

    res.status(204).end();
  }));

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

  // Admin routes
  const configPath = path.join(process.cwd(), 'src/config');

  async function loadConfig() {
    try {
      const defaultConfig = JSON.parse(await fs.readFile(path.join(configPath, 'default.config.json')));
      const userConfig = JSON.parse(await fs.readFile(path.join(configPath, 'user.config.json')));
      return { ...defaultConfig, ...userConfig };
    } catch (error) {
      console.error('Config load error:', error);
      // Return empty config if files don't exist
      return { whitelistedGuilds: [] };
    }
  }

  async function saveUserConfig(config) {
    try {
      await fs.mkdir(configPath, { recursive: true });
      await fs.writeFile(
        path.join(configPath, 'user.config.json'),
        JSON.stringify(config, null, 2)
      );
    } catch (error) {
      console.error('Config save error:', error);
      throw error;
    }
  }

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

  // Get connected servers
  router.get('/servers', asyncHandler(async (req, res) => {
    try {
      // Mock data or fetch from database
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

      res.json({ success: true, servers });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }));

  // Get emoji configuration
  router.get('/config/emojis', asyncHandler(async (req, res) => {
    try {
      const config = await loadConfig();
      res.json({ 
        success: true, 
        emojis: config.emojis || {
          summon: "🔮",
          breed: "🏹",
          attack: "⚔️",
          defend: "🛡️"
        },
        prompts: config.prompts || {
          introduction: "You have been summoned to this realm. This is your one chance to impress me, and save yourself from Elimination. Good luck, and DONT fuck it up.",
          summon: "Create a unique avatar with a special ability."
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }));

  // Update emoji configuration
  router.post('/config/emojis', asyncHandler(async (req, res) => {
    try {
      const { emojis } = req.body;
      if (!emojis) {
        return res.status(400).json({ error: 'Emoji configuration is required' });
      }

      const config = await loadConfig();
      config.emojis = emojis;
      await saveUserConfig(config);

      res.json({ success: true, emojis });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }));

  // Update prompt configuration
  router.post('/config/prompts', asyncHandler(async (req, res) => {
    try {
      const { prompts } = req.body;
      if (!prompts) {
        return res.status(400).json({ error: 'Prompt configuration is required' });
      }

      const config = await loadConfig();
      config.prompts = prompts;
      await saveUserConfig(config);

      res.json({ success: true, prompts });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }));

  // Update admin settings
  router.post('/settings', asyncHandler(async (req, res) => {
    try {
      const { features, rateLimit, adminRoles } = req.body;

      const config = await loadConfig();
      if (features) config.features = features;
      if (rateLimit) config.rateLimit = rateLimit;
      if (adminRoles) config.adminRoles = adminRoles;

      await saveUserConfig(config);

      res.json({ success: true, config: { features, rateLimit, adminRoles } });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }));

  // Get all configuration for admin panel
  router.get('/admin/config', asyncHandler(async (req, res) => { // Added admin prefix to avoid conflict
    try {
      // Get various stats from the database
      const avatarCount = await db.avatars.countDocuments();
      const messageCount = await db.messages.countDocuments();
      const locations = await db.collection('locations').countDocuments();

      const config = await loadConfig();
      res.json({
        success: true,
        stats: {
          avatarCount,
          userCount: 250, // Mock data
          messageCount,
          locationCount: locations
        },
        config: {
          features: config.features || {
            breeding: true,
            combat: true,
            itemCreation: true
          },
          adminRoles: config.adminRoles || ["Admin", "Moderator"],
          rateLimit: config.rateLimit || {
            messages: 5,
            interval: 10
          }
        }
      });
    } catch (error) {
      console.error("Error fetching admin config:", error);
      res.status(500).json({ error: error.message });
    }
  }));

  router.get('/stats', asyncHandler(async (req, res) => {
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
  }));

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

  router.get('/avatars', asyncHandler(async (req, res) => {
    try {
      const avatars = await db.collection('avatars')
        .find({})
        .sort({ createdAt: -1 })
        .limit(100)
        .toArray();

      res.json(avatars);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }));

  router.post('/avatar/update', asyncHandler(async (req, res) => {
    try {
      const { avatarId, status, personality } = req.body;

      const updateData = {};
      if (status) updateData.status = status;
      if (personality) updateData.personality = personality;

      const result = await db.collection('avatars').updateOne(
        { _id: new ObjectId(avatarId) },
        { $set: updateData }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ error: 'Avatar not found' });
      }

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }));

  router.post('/avatars', asyncHandler(async (req, res) => {
    const {
      name,
      description,
      personality,
      emoji,
      imageUrl,
      locationId,
      lives,
      status
    } = req.body;

    // Validate required fields
    if (!name || !description || !personality) {
      return res.status(400).json({ error: 'Name, description, and personality are required' });
    }

    // Create avatar object
    const avatar = {
      name,
      description,
      personality,
      emoji: emoji || '✨',
      imageUrl: imageUrl || '',
      status: status || 'alive',
      lives: lives || 3,
      locationId: locationId || null,
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

    res.json({ message: 'Avatar deleted successfully' });
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
      status
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

    // Add updated timestamp
    updateObj.updatedAt = new Date();

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

  router.get('/stats', asyncHandler(async (req, res) => {
    // Get counts
    const [avatarCount, itemCount, locationCount, memoryCount] = await Promise.all([
      db.avatars.countDocuments(),
      db.collection('items').countDocuments(),
      db.collection('locations').countDocuments(),
      db.memories.countDocuments()
    ]);

    // Get recent activity (last 10 memories)
    const recentActivity = await db.memories
      .find()
      .sort({ timestamp: -1 })
      .limit(10)
      .toArray();

    res.json({
      counts: {
        avatars: avatarCount,
        items: itemCount,
        locations: locationCount,
        memories: memoryCount
      },
      recentActivity
    });
  }));


  // Inject the admin routes from the edited code
  const adminRouter = adminRouterFactory(db);
  router.use('/admin', adminRouter);


  return router;
}

//This function is injected from the edited code.
export default function adminRouterFactory(db) {
  const router = express.Router();

  // Get admin dashboard data
  router.get('/config', asyncHandler(async (req, res) => {
    try {
      // Get various stats from the database
      const avatarCount = await db.avatars.countDocuments();
      const messageCount = await db.messages.countDocuments();
      const locationCount = await db.collection('locations').countDocuments();

      // Mock server data (in a real app, this would come from a database)
      const servers = [
        {
          id: 'server-1',
          name: 'Fantasy Realm',
          status: 'online',
          users: 128,
          avatars: 12
        },
        {
          id: 'server-2',
          name: 'Dragon\'s Lair',
          status: 'online',
          users: 85,
          avatars: 8
        }
      ];

      // Mock config data (in a real app, this would come from a database or config file)
      const config = {
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
  router.post('/settings', asyncHandler(async (req, res) => {
    try {
      const { features, rateLimit, prompts, adminRoles } = req.body;

      // In a real app, we would save these to a database or config file
      console.log('New settings received:', { features, rateLimit, prompts, adminRoles });

      res.json({ 
        success: true,
        message: 'Settings saved successfully'
      });
    } catch (error) {
      console.error("Error saving admin settings:", error);
      res.status(500).json({ error: error.message });
    }
  }));

  // Update server configuration
  router.post('/servers', asyncHandler(async (req, res) => {
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

  // Update emoji configuration
  router.post('/emojis', asyncHandler(async (req, res) => {
    try {
      const { emojis } = req.body;

      // In a real app, we would save these to a database
      console.log('Emoji configuration updated:', emojis);

      res.json({ 
        success: true,
        message: 'Emoji configuration updated'
      });
    } catch (error) {
      console.error("Error updating emoji configuration:", error);
      res.status(500).json({ error: error.message });
    }
  }));

  return router;
}

export default createRouter;