
import { Router } from 'express';
import { ObjectId } from 'mongodb';

export default function adminRoutes(db) {
  const router = Router();

  // Get all avatars with pagination, filtering and search
  router.get('/avatars', async (req, res) => {
    try {
      const { 
        page = 1, 
        limit = 20, 
        filter = 'all',
        search = ''
      } = req.query;
      
      const pageNumber = parseInt(page, 10);
      const pageSize = parseInt(limit, 10);
      
      // Build query
      const query = {};
      
      // Apply filter
      if (filter === 'active') {
        query.status = 'alive';
      } else if (filter === 'inactive') {
        query.status = { $in: ['dead', 'inactive'] };
      }
      
      // Apply search
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
        
        // If search looks like an ObjectId
        if (/^[0-9a-fA-F]{24}$/.test(search)) {
          query.$or.push({ _id: new ObjectId(search) });
        }
      }
      
      // Count total avatars matching the query
      const total = await db.collection('avatars').countDocuments(query);
      
      // Fetch avatars
      const avatars = await db.collection('avatars')
        .find(query)
        .sort({ createdAt: -1 })
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize)
        .toArray();
      
      res.json({
        avatars,
        page: pageNumber,
        limit: pageSize,
        total
      });
    } catch (error) {
      console.error('Error fetching avatars:', error);
      res.status(500).json({ error: 'Failed to fetch avatars' });
    }
  });

  // Get a single avatar by ID
  router.get('/avatars/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const avatar = await db.collection('avatars').findOne({ _id: new ObjectId(id) });
      
      if (!avatar) {
        return res.status(404).json({ error: 'Avatar not found' });
      }
      
      res.json(avatar);
    } catch (error) {
      console.error('Error fetching avatar:', error);
      res.status(500).json({ error: 'Failed to fetch avatar' });
    }
  });

  // Update an avatar
  router.put('/avatars/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      // Remove _id if present to prevent conflicts
      delete updateData._id;
      
      // Add updatedAt timestamp
      updateData.updatedAt = new Date().toISOString();
      
      const result = await db.collection('avatars').updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData }
      );
      
      if (result.matchedCount === 0) {
        return res.status(404).json({ error: 'Avatar not found' });
      }
      
      res.json({ 
        success: true, 
        message: 'Avatar updated successfully',
        modifiedCount: result.modifiedCount
      });
    } catch (error) {
      console.error('Error updating avatar:', error);
      res.status(500).json({ error: 'Failed to update avatar' });
    }
  });

  // Delete an avatar
  router.delete('/avatars/:id', async (req, res) => {
    try {
      const { id } = req.params;
      
      const result = await db.collection('avatars').deleteOne({ _id: new ObjectId(id) });
      
      if (result.deletedCount === 0) {
        return res.status(404).json({ error: 'Avatar not found' });
      }
      
      res.json({ 
        success: true, 
        message: 'Avatar deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting avatar:', error);
      res.status(500).json({ error: 'Failed to delete avatar' });
    }
  });

  return router;
}
