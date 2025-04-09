import express from 'express';

export default function (db) {
  const router = express.Router();

  router.get('/:templateId', async (req, res) => {
    try {
      const { templateId } = req.params;

      // Check if the template is already cached
      const cachedTemplate = await db.collection('crossmint_dev').findOne({ templateId });

      if (cachedTemplate) {
        return res.json({
          id: templateId,
          metadata: cachedTemplate.metadata || {},
          collectionId: cachedTemplate.collectionId
        });
      }

      const apiKey = process.env.CROSSMINT_API_KEY;
      const collectionId = process.env.CROSSMINT_COLLECTION_ID;
      const baseUrl = process.env.CROSSMINT_BASE_URL || 'https://staging.crossmint.com/api/2022-06-09';

      if (!apiKey || !collectionId) {
        return res.status(500).json({ error: 'Crossmint API configuration missing' });
      }

      const url = `${baseUrl}/collections/${collectionId}/templates/${templateId}`;
      const response = await fetch(url, {
        headers: { 'X-API-KEY': apiKey }
      });

      if (!response.ok) {
        return res.status(response.status).json({ error: 'Failed to fetch template from Crossmint' });
      }

      const data = await response.json();

      // Cache the fetched template
      await db.collection('crossmint_dev').updateOne(
        { templateId },
        {
          $set: {
            templateId,
            metadata: data.metadata,
            collectionId,
            updatedAt: new Date()
          }
        },
        { upsert: true }
      );

      res.json({
        id: templateId,
        metadata: data.metadata,
        collectionId
      });
    } catch (error) {
      console.error('Error fetching template:', error);
      res.status(500).json({
        error: 'Error fetching template details',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });

  return router;
}
