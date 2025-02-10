// index.mjs
import dotenv from 'dotenv';
import winston from 'winston';
import { MongoClient } from 'mongodb';
import { SpamControlService } from './services/chat/SpamControlService.mjs';
//
// import { OllamaService as AIService } from './services/ollamaService.mjs';
import { OpenRouterService as AIService } from './services/openrouterService.mjs';
import { AvatarGenerationService } from './services/avatarService.mjs';
import {
  client,
  reactToMessage,
  replyToMessage,
  sendAsWebhook,
  sendAvatarProfileEmbedFromObject,
} from './services/discordService.mjs';
import { ChatService } from './services/chat/ChatService.mjs';
import { MessageHandler } from './services/chat/MessageHandler.mjs';

// Load environment variables from .env file
dotenv.config();

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

// Create a MongoDB client instance
const mongoClient = new MongoClient(MONGO_URI);
let messagesCollection; // Will be set once DB connected

// Instantiate services (some require DB connection first)
let avatarService = null;
const aiService = new AIService();

// We will instantiate ChatService, SpamControlService and MessageHandler after DB is connected
let chatService;
let messageHandler;
let spamControlService;

/**
 * Saves a Discord message to the database.
 * @param {Message} message - The Discord message object.
 */
async function saveMessageToDatabase(message) {
  if (!messagesCollection) {
    logger.error('Messages collection not initialized');
    return;
  }

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

    // Validate required fields
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
  const avatars = await avatarService.getAvatarsInChannel();
  const mentionedAvatars = Array.from(extractMentionedAvatars(commandLine, avatars))
    .sort(() => Math.random() - 0.5)
    .slice(-2);

  // if there are two avatars mentioned, breed them
  if (mentionedAvatars.length === 2) {
    const [avatar1, avatar2] = mentionedAvatars;

    // Ensure both avatars are not the same
    if (avatar1._id === avatar2._id) {
      await replyToMessage(
        message.channel.id,
        message.id,
        'Both avatars must be different to breed.'
      );
      return;
    }

    // check if avatar1 has been bred in the last 24 hours
    const breedingDate1 = await avatarService.getLastBredDate(avatar1._id.toString());
    if (breedingDate1 && new Date() - new Date(breedingDate1) < 24 * 60 * 60 * 1000) {
      await replyToMessage(
        message.channel.id,
        message.id,
        `${avatar1.name} has already been bred in the last 24 hours.`
      );
      return;
    }

    // check if avatar2 has been bred in the last 24 hours
    const breedingDate2 = await avatarService.getLastBredDate(avatar2._id.toString());
    if (breedingDate2 && new Date() - new Date(breedingDate2) < 24 * 60 * 60 * 1000) {
      await replyToMessage(
        message.channel.id,
        message.id,
        `${avatar2.name} has already been bred in the last 24 hours.`
      );
      return;
    }

    await replyToMessage(
      message.channel.id,
      message.id,
      `Breeding ${avatar1.name} with ${avatar2.name}...`
    );

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
      `;

    // Return the created avatar from handleSummonCommand (passing breed: true)
    return await handleSummonCommand(message, [prompt], true, {
      summoner: `${message.author.username}@${message.author.id}`,
      parents: [avatar1._id, avatar2._id],
    });
  } else {
    await replyToMessage(
      message.channel.id,
      message.id,
      'Please mention two avatars to breed.'
    );
  }
}

/**
 * Handles the !attack command to attack another avatar.
 */
async function handleAttackCommand(message, args) {
  if (args.length < 1) {
    await replyToMessage(
      message.channel.id,
      message.id,
      'Please mention an avatar to attack.'
    );
    return;
  }

  const targetName = args.join(' ');
  const avatars = await avatarService.getAllAvatars();
  const targetAvatar = await findAvatarByName(targetName, avatars);

  if (!targetAvatar) {
    await replyToMessage(
      message.channel.id,
      message.id,
      `Could not find an avatar named "${targetName.substring(0, 32)}".`
    );
    return;
  }

  const attackResult = await chatService.dungeonService.tools
    .get('attack')
    .execute(message, [targetAvatar.name], targetAvatar);

  await replyToMessage(message.channel.id, message.id, `🔥 **${attackResult}**`);
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

  const db = mongoClient.db(MONGO_DB_NAME);
  const summonCount = await db.collection('daily_summons').countDocuments({
    userId,
    timestamp: { $gte: today }
  });

  return summonCount < DAILY_SUMMON_LIMIT;
}

async function trackSummon(userId) {
  const db = mongoClient.db(MONGO_DB_NAME);
  await db.collection('daily_summons').insertOne({
    userId,
    timestamp: new Date()
  });
}

async function handleSummonCommand(message, args, breed = false, attributes = {}) {
  let prompt = args.join(' ');
  let existingAvatar = null;

  try {
    // 1. Check if we're summoning an existing avatar by exact name
    existingAvatar = await avatarService.getAvatarByName(prompt.trim());
    if (existingAvatar) {
      // React with the avatar's default emoji or '🔮'
      await reactToMessage(client, message.channel.id, message.id, existingAvatar.emoji || '🔮');

      // Update the channel ID and position
      await chatService.dungeonService.updateAvatarPosition(
        existingAvatar._id,
        message.channel.id
      );
      existingAvatar.channelId = message.channel.id;
      await avatarService.updateAvatar(existingAvatar);

      // Retrieve stats and send the avatar's profile embed
      existingAvatar.stats = await chatService.dungeonService.getAvatarStats(
        existingAvatar._id
      );
      await sendAvatarProfileEmbedFromObject(existingAvatar);

      // Prompt the avatar to respond
      await chatService.respondAsAvatar(message.channel, existingAvatar, true);

      // Confirm the command
      await reactToMessage(client, message.channel.id, message.id, '✅');
      return;
    }

    // 2. If no existing avatar found, either breed or create a new one
    //    Optional: Restrict non-breed summons by role or user condition


    const canSummon = message.author.id === '1175877613017895032' || (await checkDailySummonLimit(message.author.id));
    if (!canSummon) {
      await message.reply(`You have reached your daily limit of ${DAILY_SUMMON_LIMIT} summons. Try again tomorrow!`);
      return;
    }

    // If no prompt is provided, use a default from .env or a fallback
    if (!prompt && process.env.DEFAULT_AVATAR_PROMPT) {
      prompt = process.env.DEFAULT_AVATAR_PROMPT;
    } else if (!prompt) {
      prompt = 'create a new avatar, use your imagination!';
    }

    // Get recent messages from the channel
    const recentMessages = await chatService.getRecentMessagesFromDatabase(message.channel.id);
    // Format the prompt with the recent messages
    const messageString = recentMessages.reduce(
      (acc, m) => `${acc}\n${m.author.username}: ${m.content}`,
      ''
    );

    const avatarData = {
      prompt: sanitizeInput(prompt),
      channelId: message.channel.id,
    };

    // Check if prompt is an Arweave URL
    if (prompt.match(/^(https:\/\/.*\.arweave\.net\/|ar:\/\/)/)) {
      avatarData.arweave_prompt = prompt;
    }

    const createdAvatar = await avatarService.createAvatar(avatarData);

    if (createdAvatar && createdAvatar.name) {
      // Select a random model if none provided
      if (!createdAvatar.model) {
        createdAvatar.model = await aiService.selectRandomModel();
      }

      // Retrieve stats
      createdAvatar.stats = await chatService.dungeonService.getAvatarStats(
        createdAvatar._id
      );

      // Send the avatar's profile embed
      await sendAvatarProfileEmbedFromObject(createdAvatar);

      // Update the avatar with the prompt
      await avatarService.updateAvatar(createdAvatar);

      // Generate an introductory message for the new avatar
      let intro = await aiService.chat(
        [
          {
            role: 'system',
            content: `
              You are the avatar ${createdAvatar.name}.
              ${createdAvatar.description}
              ${createdAvatar.personality}
            `,
          },
          {
            role: 'user',
            content: `You've just arrived. This is your one chance to introduce yourself. Impress me, and save yourself from elimination.`,
          },
        ],
        { model: createdAvatar.model }
      );

      // Store the introduction and any attributes (like breed parents)
      createdAvatar.dynamicPersonality = intro;
      createdAvatar.channelId = message.channel.id; // fix a minor typo if needed
      createdAvatar.attributes = attributes;
      await avatarService.updateAvatar(createdAvatar);

      // Send the avatar's introduction as a webhook-style message
      await sendAsWebhook(
        message.channel.id,
        intro,
        createdAvatar.name,
        createdAvatar.imageUrl
      );

      // Initialize dungeon position in the current channel
      await chatService.dungeonService.initializeAvatar(
        createdAvatar._id,
        message.channel.id
      );

      // React to the original message
      await reactToMessage(
        client,
        message.channel.id,
        message.id,
        createdAvatar.emoji || '🎉'
      );

      // Track summon if not breeding
      if (!breed) {
        await trackSummon(message.author.id);
      }

      // Prompt the new avatar to respond
      await chatService.respondAsAvatar(message.channel, createdAvatar, true);

      // Track summon if not breeding
      if (!breed) {
        await trackSummon(message.author.id);
      }
    } else {
      await reactToMessage(client, message.channel.id, message.id, '❌');
      throw new Error(
        `Avatar missing required fields after creation: ${JSON.stringify(
          createdAvatar,
          null,
          2
        )}`
      );
    }
  } catch (error) {
    logger.error(`Error in summon command: ${error.message}`);
    if (existingAvatar) {
      logger.debug('Avatar data:', JSON.stringify(existingAvatar, null, 2));
    }
    await reactToMessage(client, message.channel.id, message.id, '❌');
  }
}

/**
 * Handles commands that start with '!' (e.g., !summon, !attack, !breed).
 */
async function handleCommands(message, args, commandLine) {
  // Summon command
  if (commandLine.startsWith('!summon ')) {
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

    const summonArgs = message.content.slice(8).trim().split(' ');
    await reactToMessage(client, message.channel.id, message.id, '🔮');
    await handleSummonCommand(message, summonArgs);
  }

  // Attack command
  if (commandLine.startsWith('!attack ')) {
    // For demonstration, let's block usage unless it's a bot
    if (!message.author.bot) {
      await replyToMessage(message.channel.id, message.id, '❌ Sword of violence not found.');
      return;
    }
    const attackArgs = message.content.slice(8).trim().split(' ');
    await reactToMessage(client, message.channel.id, message.id, '⚔️');
    await handleAttackCommand(message, attackArgs);
    await reactToMessage(client, message.channel.id, message.id, '✅');
  }

  // Breed command
  if (commandLine.startsWith('!breed ')) {
    // For demonstration, let's allow anyone (or block if not a bot).
    // if (!message.author.bot) {
    //   await replyToMessage(message.channel.id, message.id, '❌ Bow of cupidity not found.');
    //   return;
    // }
    const breedArgs = message.content.slice(6).trim().split(' ');
    await reactToMessage(client, message.channel.id, message.id, '🏹');
    await handleBreedCommand(message, breedArgs, commandLine);
    await reactToMessage(client, message.channel.id, message.id, '✅');
  }
}

/**
 * Discord.js message handler
 */
client.on('messageCreate', async (message) => {
  try {
    // Use the Spam Control Service to check if the message should be processed.
    if (!(await spamControlService.shouldProcessMessage(message))) {
      // If the message is from a spammy user, silently ignore it.
      return;
    }

    // Process commands if any
    const lines = message.content.split('\n');
    let counter = 2;
    for (const line of lines) {
      if (line.startsWith('!')) {
        await handleCommands(message, line.split(' '), line.toLowerCase());
        counter--;
      }
      if (counter === 0) break;
    }

    // Save message to database and process channel messages as before
    await saveMessageToDatabase(message);
    if (message.author.bot) return;
    await messageHandler.processChannel(message.channel.id);

  } catch (error) {
    logger.error(`Error processing message: ${error.stack}`);
  }
});
/**
 * Gracefully shuts down the application on termination signals.
 * @param {string} signal - The signal received (e.g., SIGINT, SIGTERM).
 */
async function shutdown(signal) {
  logger.info(`Received ${signal}. Shutting down gracefully...`);

  const shutdownTasks = [
    // Discord client
    (async () => {
      try {
        await client.destroy();
        logger.info('Disconnected from Discord.');
      } catch (error) {
        logger.error(`Error disconnecting from Discord: ${error.message}`);
      }
    })(),
    // MongoDB client
    (async () => {
      try {
        await mongoClient.close(true);
        logger.info('Closed MongoDB connection.');
      } catch (error) {
        logger.error(`Error closing MongoDB connection: ${error.message}`);
      }
    })(),
    // Chat service
    (async () => {
      if (chatService) {
        try {
          await chatService.stop();
          logger.info('ChatService stopped.');
        } catch (error) {
          logger.error(`Error stopping ChatService: ${error.message}`);
        }
      }
    })(),
  ];

  await Promise.allSettled(shutdownTasks);
  process.exit(0);
}

/**
 * Application Entry Point
 */
async function main() {
  let dbConnected = false;

  try {
    // 1. Connect to MongoDB
    await mongoClient.connect();
    dbConnected = true;
    const db = mongoClient.db(MONGO_DB_NAME);
    messagesCollection = db.collection('messages');
    avatarService = new AvatarGenerationService(db);
    // Initialize the Spam Control Service
    spamControlService = new SpamControlService(db, logger);

    logger.info('✅ Connected to MongoDB successfully');

    // 2. Update Arweave prompts for avatars (if relevant)
    logger.info('Updating Arweave prompts for avatars...');
    await avatarService.updateAllArweavePrompts();
    logger.info('✅ Arweave prompts updated successfully');

    // 3. Initialize ChatService
    chatService = new ChatService(client, db, {
      logger,
      avatarService,
      aiService,
    });

    // 4. Initialize MessageHandler
    messageHandler = new MessageHandler(
      chatService,
      avatarService,
      logger
    );

    // 5. Login to Discord
    await client.login(DISCORD_BOT_TOKEN);
    logger.info('✅ Logged into Discord successfully');

    // 6. Wait for Discord client to be ready
    await new Promise((resolve) => client.once('ready', resolve));
    logger.info('✅ Discord client ready');

    // 7. Setup and start the ChatService
    await chatService.setup();
    await chatService.start();
    logger.info('✅ ChatService started successfully');
  } catch (error) {
    logger.error(`Fatal startup error: ${error.stack || error.message}`);

    // Close DB if connected to avoid a resource leak
    if (dbConnected) {
      try {
        await mongoClient.close();
      } catch (closeError) {
        logger.error(`Error closing database: ${closeError.message}`);
      }
    }
    await shutdown('STARTUP_ERROR');
  }
}

// Start the application
main().catch((error) => {
  logger.error(`Unhandled startup error: ${error}`);
  process.exit(1);
});

// Additional environment checks (non-fatal)
if (!DISCORD_BOT_TOKEN) {
  console.error('DISCORD_BOT_TOKEN is required');
  process.exit(1);
}

if (!DISCORD_CLIENT_ID) {
  console.warn('DISCORD_CLIENT_ID is not set - some features may be limited');
}

// Handle graceful shutdown signals
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
