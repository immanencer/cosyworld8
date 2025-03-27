import express from 'express';
import cors from 'cors';
import { MongoClient } from 'mongodb';
import process from 'process';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables from the appropriate .env file
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env';
dotenv.config({ path: envFile });
console.log(`Loading environment from ${envFile}`);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Determine static file directory based on environment
const staticDir = process.env.NODE_ENV === 'production'
  ? path.join(__dirname, '..', 'dist')
  : path.join(__dirname, '..', 'public');

console.log(`Static files will be served from: ${staticDir}`);

const app = express();
const PORT = process.env.WEB_PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.static(staticDir, {
  maxAge: '1h',
  etag: false
}));
// Add compression
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-cache');
  next();
});
app.use((req, res, next) => {
  res.setTimeout(30000, () => {
    res.status(408).send('Request timeout');
  });
  next();
});

// Explicit route for API documentation
app.get('/api-docs', (req, res) => {
  res.sendFile('api-docs.html', { root: staticDir });
});

// Admin routes
app.get('/admin/guild-settings', (req, res) => {
  res.sendFile('admin/guild-settings.html', { root: staticDir });
});

app.get('/admin/avatar-management', (req, res) => {
  res.sendFile('admin/avatar-management.html', { root: staticDir });
});

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
    
    // Import and initialize main services for the admin UI
    try {
      // Only import if Discord bot is enabled 
      if (process.env.DISCORD_BOT_TOKEN) {
        const { Client } = await import('discord.js');
        const client = new Client({ intents: [] }); // Minimal client for admin tools
        
        // Import core services
        const { ConversationManager } = await import('../src/services/chat/conversationManager.mjs');
        const { AIService } = await import('../src/services/aiService.mjs');
        const { AvatarService } = await import('../src/services/avatarService.mjs');
        
        // Initialize minimal services
        const logger = console;
        const aiService = new AIService();
        const avatarService = new AvatarService(db, { getAIConfig: () => ({
          replicate: {
            apiToken: process.env.REPLICATE_API_TOKEN,
          }
        }), getMongoConfig: () => ({ }) });
        
        // Create conversation handler
        const conversationManager = new ConversationManager(client, aiService, logger, avatarService);
        
        // Make services available to routes
        app.locals.services = {
          conversationManager,
          aiService,
          avatarService,
          client
        };
        
        console.log('Core services initialized for admin UI');
      }
    } catch (error) {
      console.error('Failed to initialize services for admin UI:', error);
      // Continue anyway - the app should work without these services
    }

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
    app.use('/api/guilds', (await import('./routes/guilds.mjs')).default(db));
    app.use('/api/admin', (await import('./routes/admin.mjs')).default(db));
    app.use('/api/rati', (await import('./routes/rati.mjs')).default(db));
    
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

    // Add ratiRoutes for metadata
    const ratiRouter = await import('./routes/rati.mjs');
    app.use('/api/rati', ratiRouter.default(db));

    // Add version info endpoint for SPA
    app.get('/api/version', (req, res) => {
      res.json({
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        buildDate: new Date().toISOString()
      });
    });

    // SPA support - serve index.html for client-side routing
    app.get('*', (req, res, next) => {
      // Skip API routes
      if (req.path.startsWith('/api/')) {
        return next();
      }
      
      // Skip direct file requests
      if (path.extname(req.path)) {
        return next();
      }
      
      // For non-API routes without file extensions, serve index.html
      res.sendFile('index.html', { root: staticDir });
    });

    // Start server
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode`);
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
    console.error('Failed to initialize server', error);
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
      ]),
      // Guild configurations index
      db.collection('guild_configs').createIndex(
        { guildId: 1 },
        { unique: true, background: true }
      )
    ]);
    console.log('Database indexes created successfully');
  } catch (error) {
    console.error('Error creating indexes:', error);
    throw error;
  }
}

initializeApp().catch(console.error);

export default app;