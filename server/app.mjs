import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

import { DatabaseService } from '../src/services/databaseService.mjs';

// External route modules
import leaderboardRoutes from './routes/leaderboard.mjs';
import dungeonRoutes from './routes/dungeon.mjs';
import healthRoutes from './routes/health.mjs';
import avatarRoutes from './routes/avatars.mjs';
import tokenRoutes from './routes/tokens.mjs';
import tribeRoutes from './routes/tribes.mjs';
import xauthRoutes from './routes/xauth.mjs';
import wikiRoutes from './routes/wiki.mjs';
import socialRoutes from './routes/social.mjs';
import adminRoutes from './routes/admin.mjs';

const app = express();
const PORT = process.env.PORT || 3080;

app.use(cors());
app.use(express.json());
import { serveCheckout } from './routes/checkout.mjs';

// Serve static files before dynamic routes
app.use(express.static('public'));
app.get('/checkout', serveCheckout);


async function initializeApp() {
  try {
    // Use the centralized DatabaseService
    const dbService = new DatabaseService(console);
    const db = await dbService.connect();
    if (!db) {
      throw new Error('Failed to connect to database');
    }

    // Initialize indexes
    await dbService.createIndexes();

    // Mount routes with database connection
    app.use('/api/leaderboard', leaderboardRoutes(db));
    app.use('/api/dungeon', dungeonRoutes(db));
    app.use('/api/health', healthRoutes(db));
    app.use('/api/avatars', avatarRoutes(db));
    app.use('/api/tokens', tokenRoutes(db));
    app.use('/api/tribes', tribeRoutes(db));
    app.use('/api/xauth', xauthRoutes(db));
    app.use('/api/wiki', wikiRoutes(db));
    app.use('/api/social', socialRoutes(db));
    app.use('/api/admin', adminRoutes(db));

    // Models route
    const modelsRouter = await import('./routes/models.mjs');
    app.use('/api/models', modelsRouter.default(db));

    // Start server
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running at http://0.0.0.0:${PORT}`);
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      try {
        await db.close(); // Assuming db has a close method
        console.log('MongoDB connection closed');
        process.exit(0);
      } catch (error) {
        console.error('Error closing MongoDB connection:', error);
        process.exit(1);
      }
    });

  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
}

initializeApp().catch(console.error);

export default app;