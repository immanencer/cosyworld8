// initializeServices.mjs
import { DatabaseService } from "./databaseService.mjs";
import { SpamControlService } from "./spamControlService.mjs";
import { AIService } from "./aiService.mjs";
import { AvatarGenerationService } from "./avatarService.mjs";
import { ImageProcessingService } from "./imageProcessingService.mjs";
import configService from "./configService.mjs";
import { ChatService } from "./chat/chatService.mjs";
import { ToolService } from "./tools/ToolService.mjs";
import { MapService } from "./map/mapService.mjs";
import { StatGenerationService } from "./tools/statGenerationService.mjs";
import { DiscordService } from "./discordService.mjs";

export async function initializeServices(logger) {
  configService.validate();
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

  if (!DISCORD_CLIENT_ID) logger.warn("DISCORD_CLIENT_ID missing; slash commands may fail.");

  const databaseService = new DatabaseService(logger);
  await databaseService.connect();
  const db = databaseService.getDatabase();
  if (!db && !isDev) throw new Error("Database connection failed in production mode.");

  const discordService = new DiscordService(logger, configService, databaseService);
  await discordService.initialize();

  const aiService = new AIService();
  const imageProcessingService = new ImageProcessingService(logger, aiService);
  const avatarService = new AvatarGenerationService(db, configService);
  const spamControlService = new SpamControlService(db, logger);
  const mapService = new MapService(discordService.client, logger, avatarService, db);
  await mapService.initializeDatabase();

  const services = {
    logger,
    avatarService,
    aiService,
    imageProcessingService,
    databaseService,
    spamControlService,
    configService,
    mapService,
    statGenerationService: new StatGenerationService(),
  };

  services.toolService = new ToolService(discordService.client, logger, avatarService, db, services);
  const chatService = new ChatService(discordService.client, db, services);
  await chatService.start();

  try {
    await avatarService.updateAllArweavePrompts();
  } catch (error) {
    logger.warn(`Failed to update Arweave prompts: ${error.message}`);
  }

  return {
    discordService,
    databaseService,
    aiService,
    avatarService,
    chatService,
    spamControlService,
    imageProcessingService,
    configService,
    mapService,
    toolService: services.toolService,
    logger,
  };
}