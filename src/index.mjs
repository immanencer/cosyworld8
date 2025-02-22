// index.mjs
import winston from 'winston';
import { DatabaseService } from './services/databaseService.mjs';
import { SpamControlService } from './services/spamControlService.mjs';


import configService from './services/configService.mjs';
// import { OllamaService as AIService } from './services/ollamaService.mjs';
import { OpenRouterService as AIService } from './services/openrouterService.mjs';
import { AvatarGenerationService } from './services/avatarService.mjs';

// Initialize and load config
import configService from './services/configService.mjs';
configService.validate();
const aiConfig = configService.getAIConfig();

import {
  client,
  reactToMessage,
  replyToMessage,
  sendAsWebhook,
  sendAvatarProfileEmbedFromObject,
} from './services/discordService.mjs';
import { ChatService } from './services/chat/ChatService.mjs';
import { MessageHandler } from './services/chat/MessageHandler.mjs';

/**
 * ----------------------
 * Logging Configuration
 * ----------------------
 * For production, consider adding more sophisticated transports or log aggregation.
 */
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(
      ({ timestamp, level, message }) => `${timestamp} [${level.toUpperCase()}]: ${message}`
    )
  ),
  transports: [
    // Transport for console output (VSCode Debugger-friendly)
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(
          ({ timestamp, level, message }) => `${timestamp} [${level.toUpperCase()}]: ${message}`
        )
      ),
    }),

    // Transport for file output
    new winston.transports.File({ filename: 'application.log' }),
  ],
});

const databaseService = new DatabaseService(logger);

/**
 * -----------------------
 * Environment Variables
 * -----------------------
 * In production, consider validating these with a library like "envalid".
 */
const MONGO_URI = process.env.MONGO_URI;
const MONGO_DB_NAME = process.env.MONGO_DB_NAME || 'discord-bot';
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;

if (!MONGO_URI) {
  logger.error('MONGO_URI is not defined in the environment variables.');
  process.exit(1);
}

if (!DISCORD_BOT_TOKEN) {
  logger.error('DISCORD_BOT_TOKEN is not defined in the environment variables.');
  process.exit(1);
}

if (!DISCORD_CLIENT_ID) {
  logger.warn('DISCORD_CLIENT_ID is not defined. Slash commands registration might fail.');
}

// Instantiate services (some require DB connection first)
let avatarService = null;
const aiService = new AIService();

// We will instantiate ChatService, SpamControlService and MessageHandler after DB is connected
let chatService;
let messageHandler;
let spamControlService;



/**
 * Tries to find an avatar by name in a list of avatars.
 * @param {string} name - The name to search for.
 * @param {Array} avatars - The list of avatar objects.
 */
async function findAvatarByName(name, avatars) {
  const sanitizedName = sanitizeInput(name.toLowerCase());
  return avatars
    .filter(
      (avatar) =>
        avatar.name.toLowerCase() === sanitizedName ||
        sanitizeInput(avatar.name.toLowerCase()) === sanitizedName
    )
    .sort(() => Math.random() - 0.5)
    .shift();
}

/**
 * Sanitizes user input to prevent injection attacks or malformed data.
 * @param {string} input - The user-provided input.
 * @returns {string} - The sanitized input.
 */
function sanitizeInput(input) {
  // Remove all characters except letters, numbers, whitespace, and emojis
  // \p{Emoji} matches any emoji character
  return input.replace(/[^\p{L}\p{N}\s\p{Emoji}]/gu, '').trim();
}

/**
 * Handles the !breed command to breed two avatars and create a new one.
 */
async function handleBreedCommand(message, args, commandLine) {
  // find an avatar for each argument
  const avatars = await avatarService.getAvatarsInChannel(message.channel.id);
  const mentionedAvatars = Array.from(avatarService.extractMentionedAvatars(commandLine, avatars))
    .sort(() => Math.random() - 0.5)
    .slice(-2);

  // if there are two avatars mentioned, breed them
  if (mentionedAvatars.length === 2) {
    const [avatar1, avatar2] = mentionedAvatars;

    // Ensure both avatars are not the same
    if (avatar1._id === avatar2._id) {
      await replyToMessage(message, 'Both avatars must be different to breed.');
      return;
    }

    // check if avatar1 has been bred in the last 24 hours
    const breedingDate1 = await avatarService.getLastBredDate(avatar1._id.toString());
    if (breedingDate1 && new Date() - new Date(breedingDate1) < 24 * 60 * 60 * 1000) {
      await replyToMessage(message, `${avatar1.name} has already been bred in the last 24 hours.`);
      return;
    }

    // check if avatar2 has been bred in the last 24 hours
    const breedingDate2 = await avatarService.getLastBredDate(avatar2._id.toString());
    if (breedingDate2 && new Date() - new Date(breedingDate2) < 24 * 60 * 60 * 1000) {
      await replyToMessage(message, `${avatar2.name} has already been bred in the last 24 hours.`);
      return;
    }

    await replyToMessage(message, `Breeding ${avatar1.name} with ${avatar2.name}...`);

    const memories1 = (
      await chatService.conversationHandler.memoryService.getMemories(avatar1._id)
    )
      .map((m) => m.memory)
      .join('\n');
    const narrative1 = await chatService.conversationHandler.buildNarrativePrompt(
      avatar1,
      [...memories1]
    );
    const memories2 = (
      await chatService.conversationHandler.memoryService.getMemories(avatar2._id)
    )
      .map((m) => m.memory)
      .join('\n');
    const narrative2 = await chatService.conversationHandler.buildNarrativePrompt(
      avatar2,
      [...memories2]
    );

    // combine the prompt, dynamicPersonality, and description of the two avatars into a message for createAvatar
    const prompt = `Breed the following avatars, and create a new avatar:
    
      AVATAR 1: ${avatar1.name} - ${avatar1.prompt}
      ${avatar1.description}
      ${avatar1.personality}
      ${narrative1}

      AVATAR 2: ${avatar2.name} - ${avatar2.prompt}
      ${avatar2.description}
      ${avatar2.personality}
      ${narrative2}
      
  Combine their attributes in a creative way.
      `;

    // Return the created avatar from handleSummonCommand (passing breed: true)
    return await handleSummonCommand(message, true, {
      summoner: `${message.author.username}@${message.author.id}`,
      parents: [avatar1._id, avatar2._id],
    });
  } else {
    await replyToMessage(message, 'Please mention two avatars to breed.');
  }
}

/**
 * Handles the !summon command to create or retrieve an existing avatar.
 * @param {Message} message - The Discord message object.
 * @param {Array} args - The arguments provided with the command.
 */
const DAILY_SUMMON_LIMIT = 16; // Configure limit per user per day

async function checkDailySummonLimit(userId) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const summonCount = await databaseService.db.collection('daily_summons').countDocuments({
    userId,
    timestamp: { $gte: today }
  });

  return summonCount < DAILY_SUMMON_LIMIT;
}

async function trackSummon(userId) {
  await databaseService.db.collection('daily_summons').insertOne({
    userId,
    timestamp: new Date()
  });
}

async function handleSummonCommand(message, breed = false, attributes = {}) {
  const content = message.content.trim();
  // Remove the orb from the beginning and trim
  const afterOrb = content.substring(2).trim();

  // split the content by newlines
  const lines = afterOrb.split('\n');
  let existingAvatar = await avatarService.getAvatarByName(lines[0].trim());

  try {
    if (existingAvatar) {
      await reactToMessage(message, existingAvatar.emoji || '🔮');
      await chatService.dungeonService.updateAvatarPosition(existingAvatar._id, message.channel.id);
      existingAvatar.channelId = message.channel.id;
      await avatarService.updateAvatar(existingAvatar);
      existingAvatar.stats = await chatService.dungeonService.getAvatarStats(existingAvatar._id);
      await sendAvatarProfileEmbedFromObject(existingAvatar);
      await chatService.respondAsAvatar(message.channel, existingAvatar, true);
      return;
    }

    const canSummon = message.author.id === '1175877613017895032' || (await checkDailySummonLimit(message.author.id));
    if (!canSummon) {
      await message.reply(`Daily summon limit of ${DAILY_SUMMON_LIMIT} reached. Try again tomorrow!`);
      return;
    }

    const prompt = configService.config.prompt.summon || 'Create a twisted avatar, a servant of darkness.';
    const recentMessages = await chatService.getRecentMessagesFromDatabase(message.channel.id);
    recentMessages.reverse();
    const messageString = recentMessages.map((m) => `${m.author?.username || 'Whisper'}: ${m.content}`).join('\n');
    const avatarData = { prompt: sanitizeInput(prompt + "\n\n Summon an avatar with the following concept or idea:\n\n" + content), channelId: message.channel.id };
    if (prompt.match(/^(https:\/\/.*\.arweave\.net\/|ar:\/\/)/)) avatarData.arweave_prompt = prompt;

    console.log('avatarData', avatarData);
    const createdAvatar = await avatarService.createAvatar(avatarData);
    if (!createdAvatar || !createdAvatar.name) throw new Error(`Avatar creation failed: ${JSON.stringify(createdAvatar)}`);

    createdAvatar.summoner = `${message.author.username}@${message.author.id}`;
    createdAvatar.model = createdAvatar.model || (await aiService.selectRandomModel());
    createdAvatar.stats = await chatService.dungeonService.getAvatarStats(createdAvatar._id);
    await sendAvatarProfileEmbedFromObject(createdAvatar);
    await avatarService.updateAvatar(createdAvatar);

    let intro = await aiService.chat([
      { role: 'system', content: `You are ${createdAvatar.name}. ${createdAvatar.description} ${createdAvatar.personality}` },
      { role: 'user', content: `You've just arrived. Introduce yourself.` },
    ], { model: createdAvatar.model });

    createdAvatar.dynamicPersonality = intro;
    createdAvatar.channelId = message.channel.id;
    createdAvatar.attributes = attributes;
    await avatarService.updateAvatar(createdAvatar);

    await sendAsWebhook(message.channel.id, intro, createdAvatar.name, createdAvatar.imageUrl);
    await chatService.dungeonService.initializeAvatar(createdAvatar._id, message.channel.id);
    await reactToMessage(message, createdAvatar.emoji || '🎉');
    if (!breed) await trackSummon(message.author.id);
    await chatService.respondAsAvatar(message.channel, createdAvatar, true);
  } catch (error) {
    logger.error(`Summon error: ${error.message}`);
    throw error;
    await reactToMessage(message, '❌');
  }
}

async function handleAttackCommand(message, args) {
  if (!args.length) {
    await replyToMessage(message, 'Mention an avatar to attack.');
    return;
  }
  const targetName = args.join(' ');
  const avatars = await avatarService.getAllAvatars();
  const targetAvatar = await findAvatarByName(targetName, avatars);
  if (!targetAvatar) {
    await replyToMessage(message, `Avatar "${targetName}" not found.`);
    return;
  }
  const attackResult = await chatService.dungeonService.tools.get('attack').execute(message, [targetAvatar.name], targetAvatar);
  await reactToMessage(message, '⚔️');
  await replyToMessage(message, `🔥 **${attackResult}**`);
}


/**
 * Handles commands that start with '!' (e.g., !summon, !attack, !breed).
 */
async function handleCommands(message) {
  const content = message.content;
  if (content.startsWith('!summon')) {
    await message.reply('Command Deprecated. Use the 🔮 instead.');
  }
  // Summon command
  if (content.startsWith('🔮')) {
    const member = message.guild?.members?.cache?.get(message.author.id);
    const requiredRole = process.env.SUMMONER_ROLE || '🔮';

    // Example: If user doesn't have the summoner role, deny
    if (
      !message.author.bot &&
      member &&
      !member.roles.cache.some(
        (role) => role.id === requiredRole || role.name === requiredRole
      )
    ) {
      await message.reply('You do not have the required role to use this command.');
      return;
    }

    await reactToMessage(message, '🔮');
    await handleSummonCommand(message, false, {});
  }

  // Attack command
  if (message.content.startsWith('⚔️')) {
    // For demonstration, let's block usage unless it's a bot
    if (!message.author.bot) {
      await replyToMessage(message, '❌ Sword of violence not found.');
      return;
    }
    const attackArgs = message.content.slice(8).trim().split(' ');
    await reactToMessage(message, '⚔️');
    await handleAttackCommand(message, attackArgs);
    await reactToMessage(message, '✅');
  }

  // Breed command
  if (content.startsWith('🏹')) {
    // For demonstration, let's allow anyone (or block if not a bot).
    // if (!message.author.bot) {
    //   await replyToMessage(message, '❌ Bow of cupidity not found.');
    //   return;
    // }
    const breedArgs = message.content.slice(6).trim().split(' ');
    await reactToMessage(message, '🏹');
    await handleBreedCommand(message, breedArgs, commandLine);
    await reactToMessage(message, '✅');
  }
}

/**
 * Discord.js message handler
 */
client.on('messageCreate', async (message) => {
  try {
    // Use the Spam Control Service to check if the message should be processed.
    if (!(await spamControlService.shouldProcessMessage((message)))) {
      // If the message is from a spammy user, silently ignore it.
      return;
    }


    // Save message to database and process channel messages as before
    await saveMessageToDatabase(message);

    await handleCommands(message);

    if (message.author.bot) return;
    await messageHandler.processChannel(message.channel.id);

    const result = await avatarService.getOrCreateUniqueAvatarForUser(message.author.id,
      `A unique avatar for ${message.author.username} (${message.author.displayName})`, message.channel.id);

    if (result.new) {
      // Show the avatar profile embed
      result.avatar.model = result.avatar.model || (await aiService.selectRandomModel());
      result.avatar.stats = await chatService.dungeonService.getAvatarStats(result.avatar._id);
      await avatarService.updateAvatar(result.avatar);
      await sendAvatarProfileEmbedFromObject(result.avatar);
      await chatService.respondAsAvatar(message.channel, result.avatar, true);
      // 
    }
    await messageHandler.processChannel(message.channel.id);

  } catch (error) {
    logger.error(`Error processing message: ${error.stack}`);
  }
});

async function saveMessageToDatabase(message) {
  const db = databaseService.getDatabase();
  if (!db) return;

  const messagesCollection = databaseService.db.collection('messages');

  try {
    const messageData = {
      messageId: message.id,
      channelId: message.channel.id,
      authorId: message.author.id,
      authorUsername: message.author.username,
      author: {
        id: message.author.id,
        bot: message.author.bot,
        username: message.author.username,
        discriminator: message.author.discriminator,
        avatar: message.author.avatar,
      },
      content: message.content,
      timestamp: message.createdTimestamp,
    };

    if (!messageData.messageId || !messageData.channelId) {
      logger.error('Missing required message data:', messageData);
      return;
    }

    await messagesCollection.insertOne(messageData);
    logger.debug('💾 Message saved to database');
  } catch (error) {
    logger.error(`Failed to save message to database: ${error.message}`);
  }
}

// Message handler moved to single implementation above

async function shutdown(signal) {
  logger.info(`Received ${signal}. Shutting down gracefully...`);

  await client.destroy();
  logger.info('Disconnected from Discord.');

  await databaseService.close();
  logger.info('Closed MongoDB connection.');

  if (chatService) {
    await chatService.stop();
    logger.info('ChatService stopped.');
  }

  process.exit(0);
}

async function main() {
  try {
    const db = await databaseService.connect();
    if (!db) {
      throw new Error('Failed to connect to the database');
    }

    avatarService = new AvatarGenerationService(db, configService);

    logger.info('✅ Connected to MongoDB successfully');

    await avatarService.updateAllArweavePrompts();
    logger.info('✅ Arweave prompts updated successfully');

    spamControlService = new SpamControlService(db, logger);
    chatService = new ChatService(client, db, { logger, avatarService, aiService });
    messageHandler = new MessageHandler(chatService, avatarService, logger);

    await client.login(process.env.DISCORD_BOT_TOKEN);
    logger.info('✅ Logged into Discord successfully');

    await new Promise((resolve) => client.once('ready', resolve));
    logger.info('✅ Discord client ready');

    await chatService.setup();
    await chatService.start();
    logger.info('✅ ChatService started successfully');
  } catch (error) {
    logger.error(`Fatal startup error: ${error.stack || error.message}`);
    await shutdown('STARTUP_ERROR');
  }
}

main().catch((error) => {
  logger.error(`Unhandled startup error: ${error}`);
  process.exit(1);
});

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

if (!process.env.DISCORD_BOT_TOKEN) {
  console.error('DISCORD_BOT_TOKEN is required');
  process.exit(1);
}
if (!process.env.DISCORD_CLIENT_ID) {
  console.warn('DISCORD_CLIENT_ID is not set - some features may be limited');
}
