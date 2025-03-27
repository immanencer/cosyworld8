// index.mjs
import winston from "winston";
import { initializeServices } from "./services/initializeServices.mjs";

const logFormat = winston.format.printf(
  ({ timestamp, level, message }) => `${timestamp} [${level.toUpperCase()}]: ${message}`
);

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "debug",
  format: winston.format.combine(winston.format.timestamp(), logFormat),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(logFormat),
    }),
  ],
});

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
}

main().catch((error) => {
  logger.error(`Unhandled startup error: ${error}`);
  process.exit(1);
});