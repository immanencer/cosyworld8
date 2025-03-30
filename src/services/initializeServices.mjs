// initializeServices.mjs
import { DatabaseService } from "./databaseService.mjs";
import { ConfigService } from "./configService.mjs";
import { SpamControlService } from "./spamControlService.mjs";
import { AIService } from "./aiService.mjs";
import { AvatarService } from "./avatarService.mjs";
import { ImageProcessingService } from "./imageProcessingService.mjs";
import { ToolService } from "./tools/ToolService.mjs";
import { MapService } from "./map/mapService.mjs";
import { StatGenerationService } from "./tools/statGenerationService.mjs";
import { DiscordService } from "./discordService.mjs";
import { MessageHandler } from "./chat/messageHandler.mjs";
import { PeriodicTaskManager } from "./chat/periodicTaskManager.mjs";
import { ChannelManager } from "./chat/channelManager.mjs";
import { ConversationManager } from "./chat/conversationManager.mjs";
import { DecisionMaker } from "./chat/decisionMaker.mjs";
import { ItemService } from "./item/itemService.mjs";
import { PromptService } from "./promptService.mjs";
import { MemoryService } from "./memoryService.mjs";
import { WebService } from "./webService.mjs";
import { CreationService } from './creationService.mjs';
import { S3Service } from './s3/s3Service.mjs';
import { LocationService } from './location/locationService.mjs';

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
  // Validate environment variables first
  await validateEnvironment(logger);

  // Initialize services object with logger and configService
  const services = {
    logger
  };

  // S3ImageService
  services.logger.info("Initializing S3Service...");
  services.s3Service = new S3Service(services.configService, services.logger);
  services.logger.info("S3Service initialized.");

  // DatabaseService
  services.logger.info("Initializing DatabaseService...");
  services.databaseService = new DatabaseService(services.logger);
  await services.databaseService.connect();
  const db = services.databaseService.getDatabase();
  if (!db && process.env.NODE_ENV !== "development" && process.env.NODE_ENV !== "test") {
    throw new Error("Database connection failed in production mode.");
  }
  services.logger.info("DatabaseService initialized.");

  // ConfigService
  services.logger.info("Initializing ConfigService...");
  services.configService = new ConfigService(services);
  services.configService.validate();
  services.logger.info("ConfigService initialized.");

  // Removed: PromptPipelineService initialization

  // DiscordService
  services.logger.info("Initializing DiscordService...");
  services.discordService = new DiscordService(services);
  await services.discordService.initialize();
  services.logger.info("DiscordService initialized.");

  // AIService
  services.logger.info("Initializing AIService...");
  services.aiService = new AIService();
  services.logger.info("AIService initialized.");

  // ImageProcessingService
  services.logger.info("Initializing ImageProcessingService...");
  services.imageProcessingService = new ImageProcessingService(services.logger, services.aiService);
  services.logger.info("ImageProcessingService initialized.");

  // SpamControlService
  services.logger.info("Initializing SpamControlService...");
  services.spamControlService = new SpamControlService(services);
  services.logger.info("SpamControlService initialized.");

  // StatGenerationService
  services.logger.info("Initializing StatGenerationService...");
  services.statGenerationService = new StatGenerationService(services);
  services.logger.info("StatGenerationService initialized.");

  // MapService
  services.logger.info("Initializing MapService...");
  services.mapService = new MapService(services);
  await services.mapService.initializeDatabase();
  services.logger.info("MapService initialized.");
  
  // CreationService
  services.logger.info("Initializing CreationService...");
  services.creationService = new CreationService(services);
  services.logger.info("CreationService initialized.");

  // AvatarService
  services.logger.info("Initializing AvatarService...");
  services.avatarService = new AvatarService(services);
  await services.avatarService.initializeDatabase();
  services.logger.info("AvatarService initialized.");
  
  // ChannelManager
  services.logger.info("Initializing ChannelManager...");
  services.channelManager = new ChannelManager(services);
  services.logger.info("ChannelManager initialized.");

  // MemoryService
  services.logger.info("Initializing MemoryService...");
  services.memoryService = new MemoryService(services);
  services.logger.info("MemoryService initialized.");

  // ItemService
  services.logger.info("Initializing ItemService...");
  services.itemService = new ItemService(services);
  services.logger.info("ItemService initialized.");


  // DecisionMaker
  services.logger.info("Initializing DecisionMaker...");
  services.decisionMaker = new DecisionMaker(services);
  services.logger.info("DecisionMaker initialized.");

  
  // ConversationManager
  services.logger.info("Initializing ConversationManager...");
  services.conversationManager = new ConversationManager(services);
  services.logger.info("ConversationManager initialized.");
  
  // LocationService
  services.logger.info("Initializing LocationService...");
  services.locationService = new LocationService(services);
  services.logger.info("LocationService initialized.");

  // ToolService
  services.logger.info("Initializing ToolService...");
  services.toolService = new ToolService(services);
  services.logger.info("ToolService initialized.");

  // PromptService
  services.logger.info("Initializing PromptService...");
  services.promptService = new PromptService(services);
  services.logger.info("PromptService initialized.");


  // WebService
  services.logger.info("Initializing WebService...");
  services.webService = new WebService(services);
  await services.webService.start();
  services.logger.info("WebService initialized.");

  // PeriodicTaskManager
  services.logger.info("Initializing PeriodicTaskManager...");
  services.periodicTaskManager = new PeriodicTaskManager(services);
  services.periodicTaskManager.start();
  
  // MessageHandler
  services.logger.info("Initializing MessageHandler...");
  services.messageHandler = new MessageHandler(services);
  services.messageHandler.start();

  // Update Arweave prompts
  services.logger.info("Updating Arweave prompts...");
  try {
    await services.avatarService.updateAllArweavePrompts();
    services.logger.info("Arweave prompts updated.");
  } catch (error) {
    services.logger.warn(`Failed to update Arweave prompts: ${error.message}`);
  }

  // Return the subset of services needed by the caller
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
    webService: services.webService, // Added WebService to the returned object
    s3Service: services.s3Service,
  };
}