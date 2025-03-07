
import express from 'express';
import { ObjectId } from 'mongodb';
import axios from 'axios';

export default function(db) {
  const router = express.Router();
  
  // Get template details from Crossmint API
  router.get('/:templateId', async (req, res) => {
    try {
      const { templateId } = req.params;
      
      // First check if we have this template cached in our database
      const cachedTemplate = await db.collection('crossmint_dev').findOne({ templateId });
      
      if (cachedTemplate) {
        return res.json({
          id: templateId,
          metadata: cachedTemplate.metadata || {},
          collectionId: cachedTemplate.collectionId
        });
      }
      
      // If not in our database, try to fetch from Crossmint API
      // This requires your API key and proper authentication
      const apiKey = process.env.CROSSMINT_API_KEY;
      const collectionId = process.env.CROSSMINT_COLLECTION_ID;
      
      if (!apiKey || !collectionId) {
        return res.status(500).json({ error: 'Crossmint API configuration missing' });
      }
      
      const response = await axios.get(
        `${process.env.CROSSMINT_BASE_URL || 'https://staging.crossmint.com/api/2022-06-09'}/collections/${collectionId}/templates/${templateId}`,
        {
          headers: {
            'X-API-KEY': apiKey
          }
        }
      );
      
      if (response.data) {
        // Cache this template for future use
        await db.collection('crossmint_dev').updateOne(
          { templateId },
          { 
            $set: { 
              templateId,
              metadata: response.data.metadata,
              collectionId,
              updatedAt: new Date()
            }
          },
          { upsert: true }
        );
        
        return res.json({
          id: templateId,
          metadata: response.data.metadata,
          collectionId
        });
      }
      
      res.status(404).json({ error: 'Template not found' });
    } catch (error) {
      console.error('Error fetching template:', error.response?.data || error);
      res.status(500).json({ 
        error: 'Error fetching template details',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });
  
  return router;
}
