import express from 'express';
import cors from 'cors';
import { MongoClient } from 'mongodb';

const app = express();
const PORT = process.env.PORT || 3001;

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

    // Set up collections
    db.avatars = db.collection('avatars');
    db.messages = db.collection('messages');
    db.narratives = db.collection('narratives');
    db.memories = db.collection('memories');
    db.dungeon_stats = db.collection('dungeon_stats');
    db.dungeon_log = db.collection('dungeon_log');
    db.token_transactions = db.collection('token_transactions');
    db.minted_nfts = db.collection('minted_nfts');
    db.avatar_claims = db.collection('avatar_claims');

    console.log(`Connected to MongoDB database: ${mongoDbName}`);

    // Initialize indexes
    await initializeIndexes(db);

    // Mount the API router
    app.use('/api', (await import('./routes/api/index.mjs')).default(db));

    // Explicitly mount your original routes with database connection
    // You'll need to gradually migrate these to the OpenAPI format

    app.use('/api/leaderboard', (await import('./routes/leaderboard.mjs')).default(db));
    app.use('/api/dungeon', (await import('./routes/dungeon.mjs')).default(db));
    app.use('/api/health', (await import('./routes/health.mjs')).default(db));
    app.use('/api/avatars', (await import('./routes/avatars.mjs')).default(db));
    app.use('/api/tokens', (await import('./routes/tokens.mjs')).default(db));
    app.use('/api/tribes', (await import('./routes/tribes.mjs')).default(db));
    app.use('/api/xauth', (await import('./routes/xauth.mjs')).default(db));
    app.use('/api/wiki', (await import('./routes/wiki.mjs')).default(db));
    app.use('/api/social', (await import('./routes/social.mjs')).default(db));
    app.use('/api/claims', (await import('./routes/claims.mjs')).default(db));
    app.use('/api/v1', (await import('./routes/api/index.mjs')).default(db));

    // Add renounce claim route
    app.post('/api/claims/renounce', async (req, res) => {
      const { avatarId, walletAddress } = req.body;
      try {
        const result = await db.avatar_claims.deleteOne({ avatarId, walletAddress });
        if (result.deletedCount === 0) {
          return res.status(404).json({ error: 'Claim not found' });
        }
        res.status(200).json({ message: 'Claim renounced successfully' });
      } catch (error) {
        console.error('Error renouncing claim:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    // Models route
    const modelsRouter = await import('./routes/models.mjs');
    app.use('/api/models', modelsRouter.default(db));

    // Start server
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running at http://0.0.0.0:${PORT}`);
      console.log(`API documentation available at http://0.0.0.0:${PORT}/api-docs`);
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
      ]),
      // Avatar claims indexes
      db.avatar_claims.createIndexes([
        { key: { avatarId: 1 }, unique: true, background: true },
        { key: { walletAddress: 1 }, background: true },
        { key: { status: 1 }, background: true }
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