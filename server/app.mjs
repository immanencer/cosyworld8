import express from 'express';
import cors from 'cors';
import { MongoClient } from 'mongodb';

// External route modules
import leaderboardRoutes from './routes/leaderboard.mjs';
import dungeonRoutes from './routes/dungeon.mjs';
import healthRoutes from './routes/health.mjs';
import avatarRoutes from './routes/avatars.mjs';
import tribeRoutes from './routes/tribes.mjs';
import xauthRoutes from './routes/xauth.mjs';
import wikiRoutes from './routes/wiki.mjs';
import socialRoutes from './routes/social.mjs';

const app = express();
const PORT = process.env.PORT || 3080;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// MongoDB Setup
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017';
const mongoDbName = process.env.MONGO_DB_NAME || 'cosyworld';

async function initializeApp() {
  try {
    const client = new MongoClient(mongoUri);
    await client.connect();
    const db = client.db(mongoDbName);
    console.log(`Connected to MongoDB database: ${mongoDbName}`);

    // Start scoring service
    await import('../src/services/scoring/scoringWorker.mjs');
    console.log('Started scoring service');

    // Initialize indexes
    await initializeIndexes(db);

    // Mount routes with database connection
    app.use('/api/leaderboard', leaderboardRoutes(db));
    app.use('/api/dungeon', dungeonRoutes(db));
    app.use('/api/health', healthRoutes(db));
    app.use('/api/avatars', avatarRoutes(db));
    app.use('/api/tribes', tribeRoutes(db));
    app.use('/auth/x', xauthRoutes(db));
    app.use('/api/wiki', wikiRoutes(db));
    app.use('/api/social', socialRoutes(db));

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
        await client.close();
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

async function initializeIndexes(db) {
  try {
    await Promise.all([
      db.collection('avatars').createIndexes([
        { key: { name: 1 }, background: true },
        { key: { emoji: 1 }, background: true },
        { key: { parents: 1 }, background: true },
        { key: { model: 1 }, background: true },
        { key: { createdAt: -1 }, background: true },
        { key: { name: 'text', description: 'text' }, background: true },
      ]),
      db.collection('messages').createIndexes([
        { key: { authorUsername: 1 }, background: true },
        { key: { timestamp: -1 }, background: true },
        { key: { avatarId: 1 }, background: true },
      ]),
      db.collection('narratives').createIndex(
        { avatarId: 1, timestamp: -1 },
        { background: true }
      ),
      db.collection('memories').createIndex(
        { avatarId: 1, timestamp: -1 },
        { background: true }
      ),
      db.collection('dungeon_stats').createIndex(
        { avatarId: 1 },
        { unique: true, background: true }
      ),
      db.collection('dungeon_log').createIndexes([
        { key: { timestamp: -1 }, background: true },
        { key: { actor: 1 }, background: true },
        { key: { target: 1 }, background: true },
      ]),
      db.collection('token_transactions').createIndexes([
        { key: { walletAddress: 1, timestamp: -1 }, background: true },
        { key: { transactionSignature: 1 }, unique: true, background: true },
      ]),
      db.collection('minted_nfts').createIndexes([
        { key: { walletAddress: 1 }, background: true },
        { key: { avatarId: 1 }, background: true },
      ])
    ]);
    console.log('Database indexes created successfully');
  } catch (error) {
    console.error('Error creating indexes:', error);
    throw error;
  }
}

initializeApp().catch(console.error);

export default app;