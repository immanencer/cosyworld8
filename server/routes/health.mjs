
import { Router } from 'express';

export default function healthRoutes(db) {
  const router = Router();

  router.get('/', async (req, res) => {
    try {
      if (!db) {
        return res.status(503).json({
          status: 'error',
          message: 'Database not connected',
        });
      }
      res.json({ status: 'ok', database: 'connected' });
    } catch (err) {
      res.status(503).json({
        status: 'error',
        message: 'Database not connected',
      });
    }
  });

  return router;
}
