
import { Router } from 'express';

export default function healthRoutes(db) {
  const router = Router();

  router.get('/', async (req, res) => {
    try {
      if (!db) {
        console.error('Health check failed: Database not connected');
        return res.status(503).json({
          status: 'error',
          message: 'Database not connected',
        });
      }
      res.json({ status: 'ok', database: 'connected' });
    } catch (err) {
      console.error('Health check error:', err);
      res.status(503).json({
        status: 'error',
        message: err.message || 'Database not connected',
      });
    }
  });

  return router;
}
