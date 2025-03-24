import express from 'express';
import ratiService from '../../src/services/ratiService.mjs';

export default function ratiRoutes(db) {
  if (!db) {
    console.error('Database connection not provided to rati routes');
    throw new Error('Database not connected');
  }

  const router = express.Router();

  // Fetch metadata for avatars, locations, or items
  router.get('/:type', async (req, res) => {
    try {
      const { type } = req.params;
      const validTypes = ['avatars', 'locations', 'items'];
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const sort = req.query.sort || 'asc';
      
      if (!validTypes.includes(type)) {
        return res.status(400).json({ error: 'Invalid metadata type' });
      }

      // Check if the collection exists
      const collections = await db.listCollections().toArray();
      const collectionNames = collections.map((col) => col.name);
      if (!collectionNames.includes(type)) {
        return res.status(404).json({ error: `Collection '${type}' not found` });
      }

      // Get data from the appropriate collection
      const data = await db.collection(type).find({})
        .sort({ name: sort === 'asc' ? 1 : -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .toArray();
      
      // Apply ratiService transformation to generate metadata
      const items = data.map(item => ratiService.generateRatiMetadata(item, {}));
      
      // Get total count for pagination
      const total = await db.collection(type).countDocuments();
      
      res.json({
        items,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      });
    } catch (error) {
      console.error(`[RATi Metadata Fetch Error]:`, error);
      res.status(500).json({ error: `Failed to fetch ${req.params.type}`, details: error.message });
    }
  });

  // Fetch specific metadata by tokenId
  router.get('/:type/:tokenId', async (req, res) => {
    try {
      const { type, tokenId } = req.params;
      const validTypes = ['avatars', 'locations', 'items'];

      if (!validTypes.includes(type)) {
        return res.status(400).json({ error: 'Invalid metadata type' });
      }

      const item = await db.collection(type).findOne({ tokenId });
      if (!item) {
        return res.status(404).json({ error: 'Metadata not found' });
      }

      // Transform the item using ratiService
      const metadata = ratiService.generateRatiMetadata(item, {});
      res.json(metadata);
    } catch (error) {
      console.error(`[RATi Metadata Fetch Error]:`, error);
      res.status(500).json({ error: 'Failed to fetch metadata', details: error.message });
    }
  });

  // Fetch and combine data from all collections into packs
  router.post('/generate-packs', async (req, res) => {
    try {
      const { count = 5, itemsPerPack = 4 } = req.body;
      const collections = ['avatars', 'locations', 'items'];
      const allData = [];

      for (const collection of collections) {
        const data = await db.collection(collection).find({}).toArray();
        allData.push(
          ...data.map((item) => ({
            ...item,
            type: collection, // Add type to distinguish between avatars, locations, and items
          }))
        );
      }

      // Enhanced shuffling algorithm (Fisher-Yates)
      for (let i = allData.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allData[i], allData[j]] = [allData[j], allData[i]];
      }

      const packs = [];
      let packId = 1;
      
      // Create the requested number of packs with proper randomization
      for (let i = 0; i < count; i++) {
        // Select random items for each pack
        const packItems = [];
        for (let j = 0; j < itemsPerPack; j++) {
          const randomIndex = Math.floor(Math.random() * allData.length);
          if (allData[randomIndex]) {
            packItems.push(allData[randomIndex]);
          }
        }

        packs.push({
          packId: packId++,
          content: packItems,
          opened: false,
          createdAt: new Date().toISOString()
        });
      }

      // Store packs in the database
      const packsCollection = db.collection('packs');
      await packsCollection.deleteMany({}); // Clear existing packs
      await packsCollection.insertMany(packs);

      res.json({ message: 'Packs generated and stored successfully', totalPacks: packs.length });
    } catch (error) {
      console.error(`[RATi Pack Generation Error]:`, error);
      res.status(500).json({ error: 'Failed to generate packs', details: error.message });
    }
  });

  // Fetch packs
  router.get('/packs', async (req, res) => {
    try {
      const packsCollection = db.collection('packs');
      const packs = await packsCollection.find({}).sort({ createdAt: -1 }).toArray();
      res.json(packs);
    } catch (error) {
      console.error(`[RATi Fetch Packs Error]:`, error);
      res.status(500).json({ error: 'Failed to fetch packs', details: error.message });
    }
  });

  // Mark a pack as opened
  router.post('/packs/:packId/open', async (req, res) => {
    try {
      const { packId } = req.params;
      const packsCollection = db.collection('packs');
      const result = await packsCollection.updateOne(
        { packId: parseInt(packId) },
        { $set: { opened: true } }
      );

      if (result.modifiedCount === 0) {
        return res.status(404).json({ error: 'Pack not found or already opened' });
      }

      res.json({ message: `Pack ${packId} marked as opened` });
    } catch (error) {
      console.error(`[RATi Open Pack Error]:`, error);
      res.status(500).json({ error: 'Failed to open pack', details: error.message });
    }
  });

  return router;
}
