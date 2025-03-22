// services/serviceInitializer.mjs
import { DatabaseService } from "./databaseService.mjs";
import { SpamControlService } from "./spamControlService.mjs";
import { AIService } from "./aiService.mjs";
import { AvatarGenerationService } from "./avatarService.mjs";
import { ImageProcessingService } from "./imageProcessingService.mjs";
import configService from "./configService.mjs";
import { ChatService } from "./chat/chatService.mjs";
import { DungeonService } from "./dungeon/DungeonService.mjs";
import { StatGenerationService } from "./dungeon/statGenerationService.mjs";
import { ToolService } from "./dungeon/tools/ToolService.mjs";

/**
 * Initializes all services required for the Discord bot.
 * @param {Object} logger - The logging utility.
 * @param {Object} client - The Discord client instance.
 * @returns {Object} An object containing all initialized services.
 */
export async function initializeServices(logger, client) {
  // Validate configuration settings
  configService.validate();

  // Verify required environment variables
  const { MONGO_URI, DISCORD_BOT_TOKEN, DISCORD_CLIENT_ID, NODE_ENV } = process.env;
  
  // In development mode, we can be more lenient with missing env vars
  const isDev = NODE_ENV === 'development' || NODE_ENV === 'test' || !NODE_ENV;
  
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
      // Set a dummy token for development
      process.env.DISCORD_BOT_TOKEN = "dev_mode_token";
    } else {
      logger.error("Missing DISCORD_BOT_TOKEN in production environment. Exiting.");
      process.exit(1);
    }
  }
  
  if (!DISCORD_CLIENT_ID) {
    logger.warn("DISCORD_CLIENT_ID missing; slash commands may fail.");
  }

  // Initialize and connect to the database
  const databaseService = new DatabaseService(logger);
  await databaseService.connect();
  const db = databaseService.getDatabase();
  
  // In dev mode, we proceed even without a DB connection
  if (!db && !isDev) {
    throw new Error("Database connection failed in production mode.");
  }

  // Create AI and image processing services
  const aiService = new AIService();
  const imageProcessingService = new ImageProcessingService(logger, aiService);

  // Create avatar and spam control services
  const avatarService = new AvatarGenerationService(db, configService);
  const spamControlService = new SpamControlService(db, logger);

  // Create a services container for dependency sharing
  const services = {
    logger,
    avatarService,
    aiService,
    imageProcessingService,
    databaseService,
    spamControlService,
    configService,
    statGenerationService: new StatGenerationService(),
  };

  // Initialize the ToolService for centralized tool management
  services.toolService = new ToolService(services);
  
  // Add dungeon service to the container
  services.dungeonService = new DungeonService(client, logger, avatarService, db, services);

  // Initialize and start the chat service
  const chatService = new ChatService(client, db, services);
  await chatService.start();

  // Update avatar prompts (e.g., sync with Arweave)
  try {
    await avatarService.updateAllArweavePrompts();
  } catch (error) {
    logger.warn(`Failed to update Arweave prompts: ${error.message}`);
  }

  // Return all initialized services for external use
  return {
    databaseService,
    aiService,
    avatarService,
    chatService,
    spamControlService,
    imageProcessingService,
    configService,
    toolService: services.toolService,
    dungeonService: services.dungeonService,
    logger,
    client
  };
}