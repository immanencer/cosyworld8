
import express from 'express';
import { ObjectId } from 'mongodb';

const router = express.Router();

// Wrap async route handlers to catch errors
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export default function(db) {
  // Create new avatar
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
  
  // Delete avatar
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
  
  // Update avatar
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
  
  // Create new item
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
  
  // Create new location
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
  
  // System stats endpoint
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
  
  return router;
}
