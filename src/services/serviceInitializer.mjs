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
  const { MONGO_URI, DISCORD_BOT_TOKEN, DISCORD_CLIENT_ID } = process.env;
  if (!MONGO_URI || !DISCORD_BOT_TOKEN) {
    logger.error("Missing MONGO_URI or DISCORD_BOT_TOKEN. Exiting.");
    process.exit(1);
  }
  if (!DISCORD_CLIENT_ID) {
    logger.warn("DISCORD_CLIENT_ID missing; slash commands may fail.");
  }

  // Initialize and connect to the database
  const databaseService = new DatabaseService(logger);
  await databaseService.connect();
  const db = databaseService.getDatabase();
  if (!db) throw new Error("Database connection failed.");

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

  // Add dungeon service to the container
  services.dungeonService = new DungeonService(client, logger, avatarService, db, services);

  // Initialize and start the chat service
  const chatService = new ChatService(client, db, services);
  await chatService.start();

  // Update avatar prompts (e.g., sync with Arweave)
  await avatarService.updateAllArweavePrompts();

  // Return all initialized services for external use
  return {
    databaseService,
    aiService,
    avatarService,
    chatService,
    spamControlService,
    imageProcessingService,
    configService,
    logger,
    client
  };
}