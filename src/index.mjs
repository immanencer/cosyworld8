// index.mjs
import { services } from './services/core/serviceRegistry.mjs';
import { initializeServices } from './services/core/serviceInitializer.mjs';

async function shutdown(signal) {
  services.logger.info(`Received ${signal}. Shutting down gracefully...`);
  try {
    if (services.discordService) {
      await services.discordService.shutdown();
    }
    if (services.databaseService) {
      await services.databaseService.close();
      services.logger.info('Closed MongoDB connection.');
    }
  } catch (error) {
    services.logger.error(`Error during shutdown: ${error.message}`);
  }
  process.exit(0);
}

async function main() {
  try {
    await initializeServices(services.logger);
    services.logger.info('✅ Application services initialized');

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    services.logger.error(`Fatal startup error: ${error.stack}`);
    await shutdown('STARTUP_ERROR');
  }
}

main().catch((error) => {
  console.error(`Unhandled startup error: ${error}`);
  process.exit(1);
});