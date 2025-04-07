// serviceInitializer.mjs
import { container } from './serviceRegistry.mjs';

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

  const services = { logger };

  try {
    services.basic = container.resolve('basic');
    logger.info('Basic Service resolved.');

    services.schedulingService = container.resolve('schedulingService');
    logger.info('Scheduling Service resolved.');
  } catch (err) {
    logger.warn(`Failed to resolve BasicService: ${err.message}`);
  }

  try {
    services.mcpClientService = container.resolve('mcpClientService');
    logger.info('MCPClientService resolved.');
  } catch (err) {
    logger.warn(`Failed to resolve MCPClientService: ${err.message}`);
  }

  try {
    services.s3Service = container.resolve('s3Service');
    logger.info('S3Service resolved.');
  } catch (err) {
    logger.warn(`Failed to resolve S3Service: ${err.message}`);
  }

  try {
    services.arweaveService = container.resolve('arweaveService');
    logger.info('ArweaveService resolved.');
  } catch (err) {
    logger.warn(`Failed to resolve ArweaveService: ${err.message}`);
  }

  try {
    services.databaseService = container.resolve('databaseService');
    logger.info('DatabaseService resolved.');
    await services.databaseService.connect();
    const db = services.databaseService.getDatabase();
    if (!db && process.env.NODE_ENV !== 'development' && process.env.NODE_ENV !== 'test') {
      throw new Error('Database connection failed in production mode.');
    }
  } catch (err) {
    logger.error(`Failed to initialize DatabaseService: ${err.message}`);
    throw err;
  }

  try {
    services.configService = container.resolve('configService');
    logger.info('ConfigService resolved.');
    services.configService.validate();
  } catch (err) {
    logger.error(`Failed to initialize ConfigService: ${err.message}`);
    throw err;
  }

  try {
    services.discordService = container.resolve('discordService');
    logger.info('DiscordService resolved.');
    await services.discordService.initialize();
  } catch (err) {
    logger.error(`Failed to initialize DiscordService: ${err.message}`);
    throw err;
  }

  try {
    services.webService = container.resolve('webService');
    logger.info('WebService resolved.');
    await services.webService.start();
  } catch (err) {
    logger.warn(`Failed to start WebService: ${err.message}`);
  }

  const serviceNames = [
    'aiService',
    'riskManagerService',
    'imageProcessingService',
    'spamControlService',
    'statGenerationService',
    'creationService',
    'channelManager',
    'memoryService',
    'itemService',
    'decisionMaker',
    'mapService',
    'avatarService',
    'conversationManager',
    'locationService',
    'toolService',
    'promptService',
    'messageHandler'
  ];

  for (const name of serviceNames) {
    try {
      services[name] = container.resolve(name);
      logger.info(`${name} resolved.`);
    } catch (err) {
      logger.warn(`Failed to resolve ${name}: ${err.message}`);
    }
  }

  try {
    await services.mapService?.initializeDatabase();
  } catch {}

  try {
    await services.avatarService?.initializeDatabase();
  } catch {}

  try {
    services.messageHandler?.start();
  } catch {}

  try {
    services.basicService = container.resolve('basicService');
    await services.basicService.initializeServices();
  } catch {}

  try {
    await services.avatarService?.updateAllArweavePrompts();
    logger.info('Arweave prompts updated.');
  } catch (error) {
    logger.warn(`Failed to update Arweave prompts: ${error.message}`);
  }

  return {
    discordService: services.discordService,
    databaseService: services.databaseService,
    aiService: services.aiService,
    avatarService: services.avatarService,
    spamControlService: services.spamControlService,
    imageProcessingService: services.imageProcessingService,
    configService: services.configService,
    mapService: services.mapService,
    toolService: services.toolService,
    logger: services.logger,
    webService: services.webService,
    s3Service: services.s3Service,
    riskManagerService: services.riskManagerService,
  };
}