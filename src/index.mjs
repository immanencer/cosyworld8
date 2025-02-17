import dotenv from 'dotenv';
import winston from 'winston';
import { DatabaseService } from './services/databaseService.mjs';
import { SpamControlService } from './services/chat/SpamControlService.mjs';
import { OpenRouterService as AIService } from './services/openrouterService.mjs';
import { AvatarGenerationService } from './services/avatarService.mjs';
import { client, reactToMessage, replyToMessage, sendAsWebhook, sendAvatarProfileEmbedFromObject } from './services/discordService.mjs';
import { ChatService } from './services/chat/ChatService.mjs';
import { MessageHandler } from './services/chat/MessageHandler.mjs';

// Load environment variables
dotenv.config();

/** ----------------------
 * Logging Configuration
 * ---------------------- */
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => `${timestamp} [${level.toUpperCase()}]: ${message}`)
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message }) => `${timestamp} [${level.toUpperCase()}]: ${message}`)
      ),
    }),
    new winston.transports.File({ filename: 'application.log' }),
  ],
});

// Environment Variables
const { MONGO_URI, MONGO_DB_NAME, DISCORD_BOT_TOKEN, DISCORD_CLIENT_ID } = process.env;

if (!MONGO_URI || !DISCORD_BOT_TOKEN) {
  logger.error('Required environment variables missing.');
  process.exit(1);
}

// Initialize Services
const dbService = new DatabaseService(logger);
await dbService.connect();
await dbService.createIndexes();
const aiService = new AIService();
const avatarService = new AvatarGenerationService(dbService.getDatabase());
const spamControlService = new SpamControlService(dbService.getDatabase(), logger);
const chatService = new ChatService(client, dbService.getDatabase(), { logger, avatarService, aiService });
const messageHandler = new MessageHandler(chatService, avatarService, logger);

/**
 * ---------------------
 * Handles Commands (!)
 * ---------------------
 */
async function handleCommand(message, command, args) {
  switch (command) {
    case '!summon':
      await handleSummonCommand(message, args);
      break;
    case '!attack':
      await handleAttackCommand(message, args);
      break;
    case '!breed':
      await handleBreedCommand(message, args, message.content);
      break;
    default:
      break;
  }
}

/**
 * -----------------------
 * Message Event Handling
 * -----------------------
 */
client.on('messageCreate', async (message) => {
  if (!message.author.bot && !(await spamControlService.shouldProcessMessage(message))) return;

  const [command, ...args] = message.content.trim().split(/\s+/);
  if (command.startsWith('!')) await handleCommand(message, command, args);

  await saveMessageToDatabase(message);
  if (!message.author.bot) await messageHandler.processChannel(message.channel.id);
});

/**
 * ----------------------
 * Saves Messages to DB
 * ----------------------
 */
async function saveMessageToDatabase(message) {
  try {
    const messagesCollection = dbService.getDatabase().collection('messages');
    if (!messagesCollection) throw new Error('Messages collection not initialized');

    const messageData = {
      messageId: message.id,
      channelId: message.channel.id,
      author: {
        id: message.author.id,
        bot: message.author.bot,
        username: message.author.username,
      },
      content: message.content,
      timestamp: message.createdTimestamp,
    };

    await messagesCollection.insertOne(messageData);
    logger.debug('💾 Message saved to database');
  } catch (error) {
    logger.error(`Failed to save message to database: ${error.message}`);
  }
}

/**
 * ------------------
 * Bot Startup Logic
 * ------------------
 */
async function main() {
  try {
    await client.login(DISCORD_BOT_TOKEN);
    logger.info('✅ Logged into Discord successfully');

    await new Promise((resolve) => client.once('ready', resolve));
    logger.info('✅ Discord client ready');

    await chatService.setup();
    await chatService.start();
    logger.info('✅ ChatService started successfully');
  } catch (error) {
    logger.error(`Startup error: ${error.stack || error.message}`);
    await shutdown('STARTUP_ERROR');
  }
}

/**
 * ----------------------
 * Graceful Shutdown
 * ----------------------
 */
async function shutdown(signal) {
  logger.info(`Received ${signal}. Shutting down...`);

  await Promise.allSettled([
    (async () => {
      try { await client.destroy(); logger.info('Disconnected from Discord.'); } 
      catch (error) { logger.error(`Error disconnecting Discord: ${error.message}`); }
    })(),
    (async () => {
      try { await dbService.close(); logger.info('Closed MongoDB connection.'); } 
      catch (error) { logger.error(`Error closing MongoDB: ${error.message}`); }
    })(),
    (async () => {
      try { await chatService.stop(); logger.info('ChatService stopped.'); } 
      catch (error) { logger.error(`Error stopping ChatService: ${error.message}`); }
    })(),
  ]);

  process.exit(0);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

await main();
