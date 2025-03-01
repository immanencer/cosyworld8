
import express from 'express';
import { ObjectId } from 'mongodb';
import openApiRouter from './openapi.mjs';

const router = express.Router();

// Mount OpenAPI specification route
router.use('/openapi', openApiRouter);

// Wrap async route handlers to catch errors
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export default function(db) {
  // Avatars endpoints
  router.get('/avatars', asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;
    
    const query = {};
    if (req.query.status && req.query.status !== 'all') {
      query.status = req.query.status;
    }
    
    const total = await db.avatars.countDocuments(query);
    const data = await db.avatars
      .find(query)
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .toArray();
    
    res.json({ data, total, limit, offset });
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

  router.get('/avatars/name/:name', asyncHandler(async (req, res) => {
    const name = req.params.name;
    const avatar = await db.avatars.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') } 
    });
    
    if (!avatar) {
      return res.status(404).json({ error: 'Avatar not found' });
    }
    
    res.json(avatar);
  }));

  router.get('/avatars/:id/inventory', asyncHandler(async (req, res) => {
    let id;
    try {
      id = new ObjectId(req.params.id);
    } catch (err) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }
    
    // First check if avatar exists
    const avatar = await db.avatars.findOne({ _id: id });
    if (!avatar) {
      return res.status(404).json({ error: 'Avatar not found' });
    }
    
    // Get items owned by this avatar
    const items = await db.collection('items').find({ owner: id.toString() }).toArray();
    res.json(items);
  }));

  // Items endpoints
  router.get('/items', asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;
    
    const query = {};
    if (req.query.locationId) {
      query.locationId = req.query.locationId;
    }
    
    const total = await db.collection('items').countDocuments(query);
    const data = await db.collection('items')
      .find(query)
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .toArray();
    
    res.json({ data, total, limit, offset });
  }));

  router.get('/items/:id', asyncHandler(async (req, res) => {
    let id;
    try {
      id = new ObjectId(req.params.id);
    } catch (err) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }
    
    const item = await db.collection('items').findOne({ _id: id });
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    res.json(item);
  }));

  // Locations endpoints
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

  router.get('/locations/:id', asyncHandler(async (req, res) => {
    let id;
    try {
      id = new ObjectId(req.params.id);
    } catch (err) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }
    
    const location = await db.collection('locations').findOne({ _id: id });
    if (!location) {
      return res.status(404).json({ error: 'Location not found' });
    }
    
    res.json(location);
  }));

  router.get('/locations/:id/avatars', asyncHandler(async (req, res) => {
    let id;
    try {
      id = new ObjectId(req.params.id);
    } catch (err) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }
    
    // First check if location exists
    const location = await db.collection('locations').findOne({ _id: id });
    if (!location) {
      return res.status(404).json({ error: 'Location not found' });
    }
    
    // Get avatars in this location
    const avatars = await db.avatars.find({ 
      locationId: id.toString(),
      status: { $ne: 'dead' }
    }).toArray();
    
    res.json(avatars);
  }));

  router.get('/locations/:id/items', asyncHandler(async (req, res) => {
    let id;
    try {
      id = new ObjectId(req.params.id);
    } catch (err) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }
    
    // First check if location exists
    const location = await db.collection('locations').findOne({ _id: id });
    if (!location) {
      return res.status(404).json({ error: 'Location not found' });
    }
    
    // Get unowned items in this location
    const items = await db.collection('items').find({ 
      locationId: id.toString(),
      owner: null
    }).toArray();
    
    res.json(items);
  }));

  // Memories endpoints
  router.get('/memories/:avatarId', asyncHandler(async (req, res) => {
    const avatarId = req.params.avatarId;
    let id;
    
    try {
      id = new ObjectId(avatarId);
    } catch (err) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }
    
    // First check if avatar exists
    const avatar = await db.avatars.findOne({ _id: id });
    if (!avatar) {
      return res.status(404).json({ error: 'Avatar not found' });
    }
    
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;
    
    const total = await db.memories.countDocuments({ avatarId: avatarId });
    const data = await db.memories
      .find({ avatarId: avatarId })
      .sort({ timestamp: -1 })
      .skip(offset)
      .limit(limit)
      .toArray();
    
    res.json({ data, total, limit, offset });
  }));

  // Chat endpoints
  router.post('/chat/avatars/:avatarId', asyncHandler(async (req, res) => {
    const { message, channelId, contextSize = 10 } = req.body;
    const avatarId = req.params.avatarId;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    let id;
    try {
      id = new ObjectId(avatarId);
    } catch (err) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }
    
    // Check if avatar exists
    const avatar = await db.avatars.findOne({ _id: id });
    if (!avatar) {
      return res.status(404).json({ error: 'Avatar not found' });
    }
    
    // Get recent messages for context
    let context = [];
    if (channelId) {
      context = await db.messages
        .find({ channelId })
        .sort({ timestamp: -1 })
        .limit(contextSize)
        .toArray();
        
      // Reverse to get chronological order
      context.reverse();
    }
    
    try {
      // Import here to avoid circular dependencies
      const { OpenRouterService } = await import('../../../src/services/openrouterService.mjs');
      const aiService = new OpenRouterService();
      
      // Generate avatar response
      const prompt = `As ${avatar.name}, respond to the following message. 
      Your personality: ${avatar.personality}
      ${avatar.dynamicPersonality ? `Current mindset: ${avatar.dynamicPersonality}` : ''}
      
      Recent conversation:
      ${context.map(msg => `${msg.authorUsername}: ${msg.content}`).join('\n')}
      
      User: ${message}
      
      ${avatar.name}:`;
      
      const response = await aiService.generateCompletion(prompt);
      
      // Record the message
      const timestamp = new Date();
      await db.messages.insertOne({
        authorId: avatarId,
        authorUsername: avatar.name,
        content: response,
        channelId: channelId || 'api',
        timestamp
      });
      
      res.json({
        response,
        avatarId,
        avatarName: avatar.name,
        timestamp
      });
    } catch (error) {
      console.error('Error generating chat response:', error);
      res.status(500).json({ error: 'Failed to generate response' });
    }
  }));

  router.post('/chat/group', asyncHandler(async (req, res) => {
    const { message, avatarIds, channelId } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    if (!Array.isArray(avatarIds) || avatarIds.length === 0) {
      return res.status(400).json({ error: 'At least one avatarId is required' });
    }
    
    // Convert string IDs to ObjectIds
    const objectIds = avatarIds.map(id => {
      try {
        return new ObjectId(id);
      } catch (err) {
        return null;
      }
    }).filter(id => id !== null);
    
    // Get all avatars
    const avatars = await db.avatars
      .find({ _id: { $in: objectIds } })
      .toArray();
    
    if (avatars.length === 0) {
      return res.status(404).json({ error: 'No valid avatars found' });
    }
    
    // Get context
    let context = [];
    if (channelId) {
      context = await db.messages
        .find({ channelId })
        .sort({ timestamp: -1 })
        .limit(10)
        .toArray();
        
      context.reverse();
    }
    
    try {
      // Import here to avoid circular dependencies
      const { OpenRouterService } = await import('../../../src/services/openrouterService.mjs');
      const aiService = new OpenRouterService();
      
      // Generate responses from each avatar
      const responses = [];
      
      for (const avatar of avatars) {
        const prompt = `As ${avatar.name}, respond to the following message in a group conversation. 
        Your personality: ${avatar.personality}
        ${avatar.dynamicPersonality ? `Current mindset: ${avatar.dynamicPersonality}` : ''}
        
        Recent conversation:
        ${context.map(msg => `${msg.authorUsername}: ${msg.content}`).join('\n')}
        
        User: ${message}
        
        ${avatar.name}:`;
        
        const response = await aiService.generateCompletion(prompt);
        const timestamp = new Date();
        
        // Record the message
        await db.messages.insertOne({
          authorId: avatar._id.toString(),
          authorUsername: avatar.name,
          content: response,
          channelId: channelId || 'api',
          timestamp
        });
        
        responses.push({
          response,
          avatarId: avatar._id.toString(),
          avatarName: avatar.name,
          timestamp
        });
        
        // Add this response to context for subsequent avatars
        context.push({
          authorUsername: avatar.name,
          content: response
        });
      }
      
      res.json(responses);
    } catch (error) {
      console.error('Error generating group chat responses:', error);
      res.status(500).json({ error: 'Failed to generate responses' });
    }
  }));

  return router;
}
import express from 'express';
import { openApiSpec } from './openapi.mjs';

export const router = express.Router();

// OpenAPI specification endpoint
router.get('/openapi.json', (req, res) => {
  res.json(openApiSpec);
});

// Avatar endpoints
router.get('/avatars', async (req, res) => {
  try {
    const avatarService = req.app.get('avatarService');
    const avatars = await avatarService.getAllAvatars();
    res.json(avatars);
  } catch (error) {
    console.error('Error fetching avatars:', error);
    res.status(500).json({ error: 'Failed to fetch avatars' });
  }
});

router.get('/avatars/:id', async (req, res) => {
  try {
    const avatarService = req.app.get('avatarService');
    const avatar = await avatarService.getAvatarById(req.params.id);
    if (!avatar) {
      return res.status(404).json({ error: 'Avatar not found' });
    }
    res.json(avatar);
  } catch (error) {
    console.error(`Error fetching avatar ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to fetch avatar' });
  }
});

router.get('/avatars/:id/memory', async (req, res) => {
  try {
    // This is a placeholder - implement based on your memory storage system
    const db = req.app.get('db');
    const memories = await db.collection('memories')
      .find({ avatarId: req.params.id })
      .sort({ timestamp: -1 })
      .toArray();
    
    res.json(memories);
  } catch (error) {
    console.error(`Error fetching memories for avatar ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to fetch avatar memories' });
  }
});

// Item endpoints
router.get('/items', async (req, res) => {
  try {
    const db = req.app.get('db');
    const items = await db.collection('items').find({}).toArray();
    res.json(items);
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

router.get('/items/:id', async (req, res) => {
  try {
    const db = req.app.get('db');
    const item = await db.collection('items').findOne({ _id: req.params.id });
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json(item);
  } catch (error) {
    console.error(`Error fetching item ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to fetch item' });
  }
});

// Location endpoints
router.get('/locations', async (req, res) => {
  try {
    const db = req.app.get('db');
    const locations = await db.collection('locations').find({}).toArray();
    res.json(locations);
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({ error: 'Failed to fetch locations' });
  }
});

router.get('/locations/:id', async (req, res) => {
  try {
    const db = req.app.get('db');
    const location = await db.collection('locations').findOne({ _id: req.params.id });
    if (!location) {
      return res.status(404).json({ error: 'Location not found' });
    }
    res.json(location);
  } catch (error) {
    console.error(`Error fetching location ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to fetch location' });
  }
});

router.get('/locations/:id/avatars', async (req, res) => {
  try {
    const db = req.app.get('db');
    const location = await db.collection('locations').findOne({ _id: req.params.id });
    if (!location) {
      return res.status(404).json({ error: 'Location not found' });
    }
    
    const avatarService = req.app.get('avatarService');
    // Assuming location has currentAvatars field with avatar IDs
    if (!location.currentAvatars || !location.currentAvatars.length) {
      return res.json([]);
    }
    
    const avatars = await avatarService.getAvatars(location.currentAvatars);
    res.json(avatars);
  } catch (error) {
    console.error(`Error fetching avatars for location ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to fetch location avatars' });
  }
});

// Chat endpoint
router.post('/chat', async (req, res) => {
  try {
    const { avatarId, message, locationId } = req.body;
    
    if (!avatarId || !message) {
      return res.status(400).json({ error: 'Avatar ID and message are required' });
    }
    
    const avatarService = req.app.get('avatarService');
    const chatService = req.app.get('chatService');
    
    const avatar = await avatarService.getAvatarById(avatarId);
    if (!avatar) {
      return res.status(404).json({ error: 'Avatar not found' });
    }
    
    // This is a simplified example - your chat logic will be more complex
    const aiService = req.app.get('aiService');
    const response = await aiService.chat([
      { role: 'system', content: `You are ${avatar.name}, with the following personality: ${avatar.personality}. You are in ${locationId ? 'the location: ' + locationId : 'an unknown location'}.` },
      { role: 'user', content: message }
    ]);
    
    res.json({
      response: response.content,
      avatarId: avatar._id,
      avatarName: avatar.name
    });
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    res.status(500).json({ error: 'Failed to process chat request' });
  }
});

export default router;
