/**
 * main server file (e.g., index.js or server.js)
 */

import express from 'express';
import cors from 'cors';
import { MongoClient } from 'mongodb';

// External route modules
import othersRoutes from './routes/others.mjs';  // The new extracted "others" file
import avatarRoutes from './routes/avatars.mjs';
import tribeRoutes from './routes/tribes.mjs';
import xauthRoutes from './routes/xauth.mjs';
import wikiRoutes from './routes/wiki.mjs';

// ----- Express & Environment Setup -----
const app = express();
const PORT = process.env.PORT || 3080;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// ----- MongoDB Setup -----
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017';
const mongoDbName = process.env.MONGO_DB_NAME || 'cosyworld';
const mongoClient = new MongoClient(mongoUri);

let db = null;

/**
 * A small helper to ensure `db` is available.
 * Throws an error if the DB is not yet connected.
 */
function ensureDbConnection() {
  if (!db) {
    throw new Error('Database not connected');
  }
  return db;
}

/**
 * Initialize all required indexes in the database.
 */
async function initializeIndexes(database) {
  try {
    // Avatars
    await database.collection('avatars').createIndexes([
      { key: { name: 1 }, background: true },
      { key: { emoji: 1 }, background: true },
      { key: { parents: 1 }, background: true },
      { key: { model: 1 }, background: true },
      { key: { createdAt: -1 }, background: true },
      { key: { name: 'text', description: 'text' }, background: true },
    ]);

    // Messages
    await database.collection('messages').createIndexes([
      { key: { authorUsername: 1 }, background: true },
      { key: { timestamp: -1 }, background: true },
      { key: { avatarId: 1 }, background: true },
    ]);

    // Narratives
    await database.collection('narratives').createIndexes([
      { key: { avatarId: 1, timestamp: -1 }, background: true },
    ]);

    // Memories
    await database.collection('memories').createIndexes([
      { key: { avatarId: 1, timestamp: -1 }, background: true },
    ]);

    // Dungeon Stats
    await database.collection('dungeon_stats').createIndexes([
      { key: { avatarId: 1 }, unique: true, background: true },
    ]);

    // Dungeon Log
    await database.collection('dungeon_log').createIndexes([
      { key: { timestamp: -1 }, background: true },
      { key: { actor: 1 }, background: true },
      { key: { target: 1 }, background: true },
    ]);

    // Token Transactions
    await database.collection('token_transactions').createIndexes([
      { key: { walletAddress: 1, timestamp: -1 }, background: true },
      { key: { transactionSignature: 1 }, unique: true, background: true },
    ]);

    // Minted NFTs
    await database.collection('minted_nfts').createIndexes([
      { key: { walletAddress: 1 }, background: true },
      { key: { avatarId: 1 }, background: true },
    ]);

    console.log('Database indexes created successfully');
  } catch (error) {
    console.error('Error creating indexes:', error);
  }
}

// Connect to MongoDB once during startup
(async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.warn('MONGO_URI not set, using default localhost');
    }

    // Connect to MongoDB
    await mongoClient.connect();
    db = mongoClient.db(mongoDbName);
    console.log(`Connected to MongoDB database: ${mongoDbName}`);

    // Initialize indexes
    await initializeIndexes(db);

    // Mount external routes
    // Here we mount the "others" routes at /api. That means:
    //  - GET /api/leaderboard/minted
    //  - GET /api/leaderboard
    //  - GET /api/dungeon/log
    //  - GET /api/health
    app.use('/api', othersRoutes(db));

    // Mount the avatar routes at /api/avatars
    app.use('/api/avatars', await avatarRoutes(db));

    // Tribes, xauth, wiki, models
    app.use('/api/tribes', await tribeRoutes(db));
    app.use('/api/xauth', await xauthRoutes(db));
    app.use('/api/wiki', wikiRoutes);
    app.use(
      '/api/models',
      await import('./routes/models.mjs').then((m) => m.default(db))
    );

    // Start the server
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running at http://0.0.0.0:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
})().catch((error) => {
  console.error('MongoDB connection error:', error);
  process.exit(1);
});

// ---- Graceful Shutdown ----
process.on('SIGINT', async () => {
  try {
    await mongoClient.close();
    console.log('MongoDB connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Error closing MongoDB connection:', error);
    process.exit(1);
  }
});

export default app;
