// index.mjs
import express from 'express';
import { logger } from "./services/logger.mjs";
import { initializeServices } from "./services/initializeServices.mjs";

const app = express();
const PORT = process.env.PORT || 3000;

async function shutdown(signal, services) {
  logger.info(`Received ${signal}. Shutting down gracefully...`);
  try {
    if (services.discordService) {
      await services.discordService.shutdown();
    }
    if (services.databaseService) {
      await services.databaseService.close();
      logger.info("Closed MongoDB connection.");
    }
  } catch (error) {
    logger.error(`Error during shutdown: ${error.message}`);
  }
  process.exit(0);
}

async function main() {
  try {
    const services = await initializeServices(logger);
    logger.info("✅ Application services initialized");

    process.on("SIGINT", () => shutdown("SIGINT", services));
    process.on("SIGTERM", () => shutdown("SIGTERM", services));
  } catch (error) {
    logger.error(`Fatal startup error: ${error.stack}`);
    await shutdown("STARTUP_ERROR", { databaseService: services?.databaseService });
  }
  
  app.listen(PORT, '0.0.0.0', () => {
    logger.info(`Server running on port ${PORT}`);
  });
}

main().catch((error) => {
  logger.error(`Unhandled startup error: ${error}`);
  process.exit(1);
});