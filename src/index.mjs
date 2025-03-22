// index.mjs
import winston from "winston";
import { initializeServices } from "./services/serviceInitializer.mjs";
import { client } from "./services/discordService.mjs";

// Define the log format once
const logFormat = winston.format.printf(
  ({ timestamp, level, message }) => `${timestamp} [${level.toUpperCase()}]: ${message}`
);

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp(), // Adds timestamp to log entries
    logFormat                  // Applies the custom format
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(), // Adds color to console output
        logFormat                  // Uses the same custom format
      ),
    }),
    new winston.transports.File({ filename: "application.log" }),
  ],
});

async function shutdown(signal, services) {
  logger.info(`Received ${signal}. Shutting down gracefully...`);
  
  try {
    if (services.client) {
      await services.client.destroy();
      logger.info("Disconnected from Discord.");
    }
    
    if (services.databaseService) {
      await services.databaseService.close();
      logger.info("Closed MongoDB connection.");
    }
    
    if (services.chatService) {
      await services.chatService.stop();
      logger.info("ChatService stopped.");
    }
  } catch (error) {
    logger.error(`Error during shutdown: ${error.message}`);
  }
  
  process.exit(0);
}

async function main() {
  let services = { client };
  try {
    services = await initializeServices(logger, client);

    await client.login(process.env.DISCORD_BOT_TOKEN);
    await new Promise((resolve) => client.once("ready", resolve));
    logger.info("✅ Discord client ready");

    process.on("SIGINT", () => shutdown("SIGINT", services));
    process.on("SIGTERM", () => shutdown("SIGTERM", services));
  } catch (error) {
    logger.error(`Fatal startup error: ${error.stack}`);
    await shutdown("STARTUP_ERROR", { client, databaseService: services?.databaseService });
  }
}

main().catch((error) => {
  logger.error(`Unhandled startup error: ${error}`);
  process.exit(1);
});