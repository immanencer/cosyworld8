// services/serviceInitializer.mjs
import { DatabaseService } from "./databaseService.mjs";
import { SpamControlService } from "./spamControlService.mjs";
import { AIService } from "./aiService.mjs";
import { AvatarGenerationService } from "./avatarService.mjs";
import { ImageProcessingService } from "./imageProcessingService.mjs";
import configService from "./configService.mjs";
import { ChatService } from "./chat/chatService.mjs";
import { handleSummonCommand } from "../commands/summonCommand.mjs";
import { handleBreedCommand } from "../commands/breedCommand.mjs";
import { DungeonService } from "./dungeon/DungeonService.mjs";

export async function initializeServices(logger, client) {
  configService.validate();

  const { MONGO_URI, DISCORD_BOT_TOKEN, DISCORD_CLIENT_ID } = process.env;
  if (!MONGO_URI || !DISCORD_BOT_TOKEN) {
    logger.error("Missing MONGO_URI or DISCORD_BOT_TOKEN. Exiting.");
    process.exit(1);
  }
  if (!DISCORD_CLIENT_ID) {
    logger.warn("DISCORD_CLIENT_ID missing; slash commands may fail.");
  }

  const databaseService = new DatabaseService(logger);
  await databaseService.connect();
  const db = databaseService.getDatabase();
  if (!db) throw new Error("Database connection failed.");

  const aiService = new AIService();
  const imageProcessingService = new ImageProcessingService(logger, aiService);
  const avatarService = new AvatarGenerationService(db, configService);
  const spamControlService = new SpamControlService(db, logger);
  const dungeonService = new DungeonService(client, logger, avatarService, db, {
    summon: handleSummonCommand,
    breed: handleBreedCommand
  });
  const chatService = new ChatService(client, db, {
    logger,
    avatarService,
    aiService,
    imageProcessingService,
    handleSummonCommand,
    handleBreedCommand,
    databaseService,
    spamControlService,
    configService,
    dungeonService
  });

  await avatarService.updateAllArweavePrompts();
  await chatService.start();

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