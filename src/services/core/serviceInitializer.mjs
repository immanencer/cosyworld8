// serviceInitializer.mjs
import { services } from './serviceRegistry.mjs';

/**
 * Validates the environment variables and sets defaults or exits as needed.
 * @param {Object} logger - The logger instance for logging warnings and errors.
 */
async function validateEnvironment(logger) {
  const { MONGO_URI, DISCORD_BOT_TOKEN, DISCORD_CLIENT_ID, NODE_ENV } = process.env;
  const isDev = NODE_ENV === "development" || NODE_ENV === "test" || !NODE_ENV;

  if (!MONGO_URI) {
    if (isDev) {
      logger.warn("MONGO_URI not provided. Running with in-memory database for development.");
      process.env.MONGO_URI = "mongodb://localhost:27017/moonstone";
    } else {
      logger.error("Missing MONGO_URI in production environment. Exiting.");
      process.exit(1);
    }
  }

  if (!DISCORD_BOT_TOKEN) {
    if (isDev) {
      logger.warn("DISCORD_BOT_TOKEN not provided. Some features will be limited.");
      process.env.DISCORD_BOT_TOKEN = "dev_mode_token";
    } else {
      logger.error("Missing DISCORD_BOT_TOKEN in production environment. Exiting.");
      process.exit(1);
    }
  }

  if (!DISCORD_CLIENT_ID) {
    logger.warn("DISCORD_CLIENT_ID missing; slash commands may fail.");
  }
}

/**
 * Initializes all services in the application.
 * @param {Object} logger - The logger instance for logging initialization steps.
 * @returns {Promise<Object>} An object containing the initialized services.
 */
export async function initializeServices(logger) {
  await validateEnvironment(logger);

  try {
    await services.databaseService.connect();
    logger.info('DatabaseService connected.');
  } catch (err) {
    logger.error(`Failed to connect DatabaseService: ${err.message}`);
    throw err;
  }

  try {
    services.configService.validate();
    logger.info('ConfigService validated.');
  } catch (err) {
    logger.error(`Failed to validate ConfigService: ${err.message}`);
    throw err;
  }

  try {
    await services.discordService.initialize();
    logger.info('DiscordService initialized.');
  } catch (err) {
    logger.error(`Failed to initialize DiscordService: ${err.message}`);
    throw err;
  }

  try {
    await services.webService.start();
    logger.info('WebService started.');
  } catch (err) {
    logger.warn(`Failed to start WebService: ${err.message}`);
  }

  try {
    services.messageHandler?.start();
    logger.info('MessageHandler started.');
  } catch (err) {
    logger.warn(`Failed to start MessageHandler: ${err.message}`);
  }

  try {
    await services.avatarService?.initializeServices();
    logger.info('AvatarService initialized.');
  } catch (err) {
    logger.warn(`Failed to initialize AvatarService: ${err.message}`);
  }

  try {
    await services.channelManager?.initializeServices();
    logger.info('ChannelManager initialized.');
  } catch (err) {
    logger.warn(`Failed to initialize ChannelManager: ${err.message}`);
  }

  try {
    await services.schedulingService?.start();
    logger.info('SchedulingService started.');
  } catch (err) {
    logger.warn(`Failed to start SchedulingService: ${err.message}`);
  }

  return services;
}