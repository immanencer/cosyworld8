import express from 'express';
import cors from 'cors';
import process from 'process';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * Initializes the application, including database, services, and routes.
 */
async function initializeApp(services) {
  try {

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    // Set static file directory based on environment
    const staticDir = process.env.NODE_ENV === 'production'
      ? path.join(__dirname, '..', 'dist')
      : path.join(__dirname, '..', 'public');

    const app = express();
    const PORT = process.env.WEB_PORT || 3001;

    // Middleware setup
    app.use(cors());
    app.use(express.json({ limit: '1mb' }));
    app.use(express.static(staticDir, { maxAge: '1h', etag: false }));
    app.use((req, res, next) => {
      res.setHeader('Cache-Control', 'no-cache');
      next();
    });
    app.use((req, res, next) => {
      res.setTimeout(30000, () => res.status(408).send('Request timeout'));
      next();
    });

    // Explicit routes for admin UI and API docs
    app.get('/api-docs', (req, res) => {
      res.sendFile('api-docs.html', { root: staticDir });
    });
    app.get('/admin/guild-settings', (req, res) => {
      res.sendFile('admin/guild-settings.html', { root: staticDir });
    });
    app.get('/admin/avatar-management', (req, res) => {
      res.sendFile('admin/avatar-management.html', { root: staticDir });
    });

    const logger = services.logger;
    logger.info('Initializing application...');

    // Store services in app.locals for route access
    app.locals.services = services;
    logger.info('Core services initialized and stored in app.locals');

    const db = await services.databaseService.getDatabase();

    // **Route Setup**
    // Pass db to routes; services are accessed via req.app.locals.services
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
    app.use('/api/guilds', (await import('./routes/guilds.mjs')).default(
      db, services.discordService.client, services.configService));
    app.use('/api/admin', (await import('./routes/admin.mjs')).default(db));
    app.use('/api/rati', (await import('./routes/rati.mjs')).default(db));

    // Custom route: Renounce claim
    app.post('/api/claims/renounce', async (req, res) => {
      const { avatarId, walletAddress } = req.body;
      try {
        const result = await db.avatar_claims.deleteOne({ avatarId, walletAddress });
        if (result.deletedCount === 0) {
          return res.status(404).json({ error: 'Claim not found' });
        }
        res.status(200).json({ message: 'Claim renounced successfully' });
      } catch (error) {
        logger.error('Error renouncing claim:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    // Additional routers
    app.use('/api/models', (await import('./routes/models.mjs')).default(db));
    app.use('/api/rati', (await import('./routes/rati.mjs')).default(db));

    // Version info endpoint
    app.get('/api/version', (req, res) => {
      res.json({
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        buildDate: new Date().toISOString(),
      });
    });

    // SPA support: Serve index.html for client-side routing
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api/') || path.extname(req.path)) {
        return next();
      }
      res.sendFile('index.html', { root: staticDir });
    });

    // Start the server
    app.listen(PORT, '0.0.0.0', () => {
      logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode`);
      logger.info(`Server running at http://0.0.0.0:${PORT}`);
      logger.info(`API documentation available at http://0.0.0.0:${PORT}/api-docs`);
    });

    // **Graceful Shutdown**
    process.on('SIGINT', async () => {
      try {
        await app.locals.services.databaseService.close();
        logger.info('MongoDB connection closed');
        if (app.locals.services.discordService.client) {
          await app.locals.services.discordService.client.destroy();
          logger.info('Discord client destroyed');
        }
        process.exit(0);
      } catch (error) {
        logger.error('Error during shutdown:', error);
        process.exit(1);
      }
    });

    return app;
  } catch (error) {
    logger.error('Failed to initialize server:', error);
    process.exit(1);
  }
}

export default initializeApp;