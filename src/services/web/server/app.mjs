import express from 'express';
import cors from 'cors';
import process from 'process';
import path from 'path';
import { fileURLToPath } from 'url';

async function initializeApp(services) {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    const staticDir = process.env.NODE_ENV === 'production'
      ? path.join(__dirname,'../../../..', 'dist')
      : path.join(__dirname, '..', 'public');

    const app = express();
    const PORT = process.env.WEB_PORT || 3000;
    const logger = services.logger;

    // Middleware setup
    app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
    app.use(express.json({ limit: '1mb' }));
    app.use((req, res, next) => {
      logger.info(`Request: ${req.method} ${req.path}`);
      res.setHeader('Cache-Control', 'no-cache');
      next();
    });

    // Static files (optional, only if needed)
    app.use(express.static(staticDir, { maxAge: '1h', etag: false }));

    // Core services
    app.locals.services = services;
    await services.databaseService.connect();
    const db = await services.databaseService.getDatabase();
    logger.info('Database connected and services initialized');

    // Routes
    app.get('/test', (req, res) => res.json({ message: 'Test route working' }));
    app.use('/api/leaderboard', (await import('./routes/leaderboard.mjs')).default(db));
    app.use('/api/dungeon', (await import('./routes/dungeon.mjs')).default(db));
    app.use('/api/health', (await import('./routes/health.mjs')).default(db));
    app.use('/api/avatars', (await import('./routes/avatars.mjs')).default(db));
    app.use('/api/tokens', (await import('./routes/tokens.mjs')).default(db));
    app.use('/api/tribes', (await import('./routes/tribes.mjs')).default(db));
    app.use('/api/xauth', (await import('./routes/xauth.mjs')).default(services));
    app.use('/api/wiki', (await import('./routes/wiki.mjs')).default(db));
    app.use('/api/social', (await import('./routes/social.mjs')).default(db));
    app.use('/api/claims', (await import('./routes/claims.mjs')).default(db));
    app.use('/api/guilds', (await import('./routes/guilds.mjs')).default(db, services.discordService.client, services.configService));
    app.use('/api/admin', (await import('./routes/admin.mjs')).default(db));
    app.use('/api/rati', (await import('./routes/rati.mjs')).default(db));
    app.use('/api/models', (await import('./routes/models.mjs')).default(db));

    // Custom route
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

    // Version endpoint
    app.get('/api/version', (req, res) => {
      res.json({
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        buildDate: new Date().toISOString(),
      });
    });

    // SPA fallback (only if serving a frontend)
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api/') || path.extname(req.path)) {
        return next();
      }
      res.sendFile('index.html', { root: staticDir }, (err) => {
        if (err) next(err);
      });
    });

    // Global error handler
    app.use((err, req, res, next) => {
      logger.error('Express error:', err);
      const statusCode = err.statusCode || 500;
      const errorResponse = {
        error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
      };
      if (process.env.NODE_ENV !== 'production' && err.stack) {
        errorResponse.stack = err.stack;
      }
      res.status(statusCode).json(errorResponse);
    });

    // Start server
    const server = app.listen(PORT, '0.0.0.0', () => {
      logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode at http://0.0.0.0:${PORT}`);
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      logger.info('Shutting down...');
      server.close();
      await services.databaseService.close();
      if (services.discordService.client) await services.discordService.client.destroy();
      process.exit(0);
    });

    return app;
  } catch (error) {
    services.logger.error('Failed to initialize server:', error);
    process.exit(1);
  }
}

export default initializeApp;