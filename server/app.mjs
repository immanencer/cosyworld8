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
    
    db.avatars = db.collection('avatars');
    db.messages = db.collection('messages');
    db.narratives = db.collection('narratives');
    db.memories = db.collection('memories');
    db.dungeon_stats = db.collection('dungeon_stats');
    db.dungeon_log = db.collection('dungeon_log');
    db.token_transactions = db.collection('token_transactions');
    db.minted_nfts = db.collection('minted_nfts');

    console.log(`Connected to MongoDB database: ${mongoDbName}`);

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
      // Consolidated messages indexes
      db.messages.createIndexes([
        { key: { authorUsername: 1 }, background: true },
        { key: { timestamp: -1 }, background: true },
        { key: { avatarId: 1 }, background: true },
      ]),
      // Consolidated avatars indexes
      db.avatars.createIndexes([
        { key: { name: 1, createdAt: -1 }, background: true },
        { key: { model: 1 }, background: true },
        { key: { emoji: 1 }, background: true },
        { key: { parents: 1 }, background: true },
        { key: { createdAt: -1 }, background: true },
        { key: { name: 'text', description: 'text' }, background: true },
      ]),
      // Dungeon stats index
      db.dungeon_stats.createIndex(
        { avatarId: 1 },
        { unique: true, background: true }
      ),
      // Narratives index
      db.narratives.createIndex(
        { avatarId: 1, timestamp: -1 },
        { background: true }
      ),
      // Memories index
      db.memories.createIndex(
        { avatarId: 1, timestamp: -1 },
        { background: true }
      ),
      // Dungeon log indexes
      db.dungeon_log.createIndexes([
        { key: { timestamp: -1 }, background: true },
        { key: { actor: 1 }, background: true },
        { key: { target: 1 }, background: true },
      ]),
      // Token transactions indexes
      db.token_transactions.createIndexes([
        { key: { walletAddress: 1, timestamp: -1 }, background: true },
        { key: { transactionSignature: 1 }, unique: true, background: true },
      ]),
      // Minted nfts indexes
      db.minted_nfts.createIndexes([
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