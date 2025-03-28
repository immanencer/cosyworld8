import express from 'express';
import { v4 as uuidv4 } from 'uuid';

export default function createApp(db) {
const router = express.Router();

// Store user keys in memory (or use Redis/DB in production)
const userKeys = new Map();

// Generate a user key
router.post('/user/key', async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    
    // Check if user already has a key
    const existingKey = Array.from(userKeys.entries())
      .find(([key, data]) => data.userId === userId);
    
    if (existingKey) {
      return res.json({ 
        key: existingKey[0],
        message: 'Existing key retrieved' 
      });
    }
    
    // Generate a new key
    const newKey = uuidv4();
    
    // Store the key with user info
    userKeys.set(newKey, {
      userId,
      createdAt: new Date().toISOString(),
      packs: []
    });
    
    res.json({ 
      key: newKey,
      message: 'User key generated successfully' 
    });
  } catch (error) {
    console.error('Error generating user key:', error);
    res.status(500).json({ message: 'Failed to generate user key' });
  }
});

// Validate user key middleware
const validateUserKey = (req, res, next) => {
  const userKey = req.body.userKey || req.query.userKey;
  
  if (!userKey) {
    return res.status(401).json({ message: 'User key is required' });
  }
  
  if (!userKeys.has(userKey)) {
    return res.status(401).json({ message: 'Invalid user key' });
  }
  
  // Attach user data to request
  req.userData = userKeys.get(userKey);
  req.userKey = userKey;
  
  next();
};

// Get all packs for the user
router.get('/packs', validateUserKey, async (req, res) => {
  try {
    // Get the user's packs from their key data
    const userPacks = req.userData.packs || [];
    
    // In a real app, this would fetch packs from DB for this user
    res.json({ packs: userPacks });
  } catch (error) {
    console.error('Error fetching packs:', error);
    res.status(500).json({ message: 'Failed to fetch packs' });
  }
});

// Get all packs with pagination
router.get('/packs/all', validateUserKey, async (req, res) => {
  try {
    const { page = 1, limit = 9 } = req.query;
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    // Fetch packs from the database for the user
    const userPacks = await db.collection('packs')
      .find({ owner: req.userData.userId })
      .sort({ createdAt: -1 })
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber)
      .toArray();

    // Get the total count of packs for pagination
    const totalPacks = await db.collection('packs')
      .countDocuments({ owner: req.userData.userId });

    res.json({
      packs: userPacks,
      total: totalPacks,
      page: pageNumber,
      limit: limitNumber,
    });
  } catch (error) {
    console.error('Error fetching all packs:', error);
    res.status(500).json({ message: 'Failed to fetch packs' });
  }
});

// Redeem a pack using an encryption key
router.post('/packs/redeem', validateUserKey, async (req, res) => {
  try {
    const { encryptionKey } = req.body;
    
    if (!encryptionKey) {
      return res.status(400).json({ message: 'Encryption key is required' });
    }
    
    // Check if the key is in the list of valid keys
    // For demonstration, we'll just check if the key has a valid UUID format
    const isValidUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(encryptionKey);
    
    if (!isValidUuid) {
      return res.status(400).json({ message: 'Invalid encryption key format' });
    }
    
    // In a real implementation, check if the key has already been redeemed
    // For demo, assume it's already redeemed if key ends with '0'
    if (encryptionKey.endsWith('0')) {
      return res.status(409).json({ message: 'This pack has already been redeemed' });
    }
    
    // Generate new packs for this redemption
    const newPacks = Array.from({ length: 4 }, (_, i) => ({
      packId: 2000 + (i * 10) + Math.floor(Math.random() * 10),
      name: `Redeemed Pack #${i + 1}`,
      imageUrl: `https://via.placeholder.com/400x300?text=Redeemed+${i + 1}`,
      opened: false,
      createdAt: new Date().toISOString(),
      owner: req.userData.userId
    }));
    
    // Add new packs to user's collection
    req.userData.packs = [...(req.userData.packs || []), ...newPacks];
    userKeys.set(req.userKey, req.userData);
    
    res.json({ 
      message: 'Pack redeemed successfully', 
      packs: newPacks 
    });
  } catch (error) {
    console.error('Error redeeming pack:', error);
    res.status(500).json({ message: 'Failed to redeem pack' });
  }
});

// Open a specific pack
router.post('/packs/:packId/open', validateUserKey, async (req, res) => {
  try {
    const { packId } = req.params;
    
    // Find the pack in user's collection
    const packIndex = req.userData.packs.findIndex(p => p.packId == packId);
    
    if (packIndex === -1) {
      return res.status(404).json({ message: 'Pack not found in your collection' });
    }
    
    const pack = req.userData.packs[packIndex];
    
    // Check if pack is already opened
    if (pack.opened) {
      return res.status(400).json({ message: 'This pack is already opened' });
    }
    
    // Generate pack content (in a real app this would come from a database)
    const packContent = {
      packId: parseInt(packId),
      opened: true,
      openedAt: new Date().toISOString(),
      content: [
        {
          id: Math.floor(Math.random() * 1000),
          name: 'Cosmic Avatar',
          type: 'Avatar',
          rarity: 'Rare',
          imageUrl: 'https://via.placeholder.com/300x300?text=Avatar'
        },
        {
          id: Math.floor(Math.random() * 1000),
          name: 'Energy Sword',
          type: 'Item',
          rarity: 'Uncommon',
          imageUrl: 'https://via.placeholder.com/300x300?text=Item'
        },
        {
          id: Math.floor(Math.random() * 1000),
          name: 'Crystal Cave',
          type: 'Location',
          rarity: 'Epic',
          imageUrl: 'https://via.placeholder.com/300x300?text=Location'
        }
      ]
    };
    
    // Update pack in user's collection
    req.userData.packs[packIndex] = {
      ...pack,
      ...packContent
    };
    
    // Save updated user data
    userKeys.set(req.userKey, req.userData);
    
    res.json({ 
      message: 'Pack opened successfully', 
      pack: packContent 
    });
  } catch (error) {
    console.error('Error opening pack:', error);
    res.status(500).json({ message: 'Failed to open pack' });
  }
});

return router;
}