import express from 'express';
import models from '../../src/models.config.mjs';

const router = express.Router();

export default function (db) {
  // Get paginated models with optional filters
  router.get('/', async (req, res) => {
    try {
      const page = Math.max(1, parseInt(req.query.page) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
      const skip = (page - 1) * limit;
      
      // Filter params
      const rarity = req.query.rarity?.toLowerCase();
      const search = req.query.search?.toLowerCase();
      
      // Filter models based on query parameters
      let filteredModels = [...models];
      
      if (rarity) {
        filteredModels = filteredModels.filter(model => 
          model.rarity.toLowerCase() === rarity
        );
      }
      
      if (search) {
        filteredModels = filteredModels.filter(model =>
          model.model.toLowerCase().includes(search)
        );
      }
      
      // Calculate pagination
      const total = filteredModels.length;
      const paginatedModels = filteredModels.slice(skip, skip + limit);
      
      // Sort models by rarity (legendary first, then rare, uncommon, and common)
      const rarityOrder = {
        'legendary': 0,
        'rare': 1,
        'uncommon': 2,
        'common': 3
      };
      
      paginatedModels.sort((a, b) => 
        rarityOrder[a.rarity] - rarityOrder[b.rarity]
      );
      
      // Prepare response
      const response = {
        models: paginatedModels,
        total,
        page,
        totalPages: Math.ceil(total / limit),
        limit,
        filters: {
          rarity: rarity || 'all',
          search: search || ''
        }
      };
      
      // Add available rarities to metadata
      const availableRarities = [...new Set(models.map(model => model.rarity))];
      response.metadata = {
        availableRarities: availableRarities.sort((a, b) => 
          rarityOrder[a] - rarityOrder[b]
        )
      };
      
      res.json(response);
      
    } catch (error) {
      console.error('Models listing error:', error);
      res.status(500).json({
        error: 'Failed to fetch models',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });

  // Get model by name
  router.get('/:modelName', async (req, res) => {
    try {
      const modelName = decodeURIComponent(req.params.modelName);
      const model = models.find(m => m.model === modelName);
      
      if (!model) {
        return res.status(404).json({
          error: 'Model not found'
        });
      }
      
      res.json(model);
      
    } catch (error) {
      console.error('Model fetch error:', error);
      res.status(500).json({
        error: 'Failed to fetch model',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });

  return router;
}