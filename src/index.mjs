// index.mjs
import winston from "winston";
import { DatabaseService } from "./services/databaseService.mjs";
import { SpamControlService } from "./services/spamControlService.mjs";
import { GoogleAIService as AIService } from "./services/googleAIService.mjs";
import { AvatarGenerationService } from "./services/avatarService.mjs";

// Load and validate configuration
import configService from "./services/configService.mjs";
configService.validate();
const aiConfig = configService.getAIConfig();

import {
  client,
  reactToMessage,
  replyToMessage,
  sendAsWebhook,
  sendAvatarProfileEmbedFromObject,
} from "./services/discordService.mjs";
import { ChatService } from "./services/chat/ChatService.mjs";
import { MessageHandler } from "./services/chat/MessageHandler.mjs";

/**
 * ----------------------
 * Logging Configuration
 * ----------------------
 * Configures Winston logger with console and file transports.
 * In production, consider adding log aggregation (e.g., ELK stack).
 */
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(
      ({ timestamp, level, message }) =>
        `${timestamp} [${level.toUpperCase()}]: ${message}`
    )
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(
          ({ timestamp, level, message }) =>
            `${timestamp} [${level.toUpperCase()}]: ${message}`
        )
      ),
    }),
    new winston.transports.File({ filename: "application.log" }),
  ],
});

// Initialize core services
const databaseService = new DatabaseService(logger);
// Make database service globally available for components that need it
global.databaseService = databaseService;
const aiService = new AIService();
let avatarService = null;
let chatService;
let messageHandler;
let spamControlService;

// Ensure database connection is ready
process.on('unhandledRejection', (reason, promise) => {
  logger.error(`Unhandled Rejection at: ${promise} reason: ${reason}`);
});

/**
 * -----------------------
 * Environment Variables
 * -----------------------
 * Validates essential environment variables.
 * Use a library like 'envalid' in production for stricter validation.
 */
const MONGO_URI = process.env.MONGO_URI;
const MONGO_DB_NAME = process.env.MONGO_DB_NAME || "discord-bot";
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;

if (!MONGO_URI) {
  logger.error("MONGO_URI is not defined in the environment variables.");
  process.exit(1);
}
if (!DISCORD_BOT_TOKEN) {
  logger.error("DISCORD_BOT_TOKEN is not defined in the environment variables.");
  process.exit(1);
}
if (!DISCORD_CLIENT_ID) {
  logger.warn(
    "DISCORD_CLIENT_ID is not defined. Slash commands registration might fail."
  );
}

/**
 * Sanitizes user input to prevent injection attacks or malformed data.
 * @param {string} input - The user-provided input.
 * @returns {string} - Sanitized input.
 */
function sanitizeInput(input) {
  return input.replace(/[^\p{L}\p{N}\s\p{Emoji}]/gu, "").trim();
}

/**
 * Finds an avatar by name in a list of avatars.
 * @param {string} name - The name to search for.
 * @param {Array} avatars - List of avatar objects.
 * @returns {Object|null} - The matching avatar or null.
 */
async function findAvatarByName(name, avatars) {
  const sanitizedName = sanitizeInput(name.toLowerCase());
  return (
    avatars
      .filter(
        (avatar) =>
          avatar.name.toLowerCase() === sanitizedName ||
          sanitizeInput(avatar.name.toLowerCase()) === sanitizedName
      )
      .sort(() => Math.random() - 0.5)[0] || null
  );
}

/**
 * Handles the breed command to create a new avatar from two existing ones.
 * @param {Message} message - Discord message object.
 * @param {Array} args - Command arguments.
 * @param {string} commandLine - Full command text.
 */
async function handleBreedCommand(message, args, commandLine) {
  const avatars = await avatarService.getAvatarsInChannel(message.channel.id);
  const mentionedAvatars = Array.from(
    avatarService.extractMentionedAvatars(commandLine, avatars)
  )
    .sort(() => Math.random() - 0.5)
    .slice(-2);

  if (mentionedAvatars.length !== 2) {
    await replyToMessage(message, "Please mention exactly two avatars to breed.");
    return;
  }

  const [avatar1, avatar2] = mentionedAvatars;
  if (avatar1._id === avatar2._id) {
    await replyToMessage(message, "Both avatars must be different to breed.");
    return;
  }

  const breedingDate1 = await avatarService.getLastBredDate(avatar1._id.toString());
  if (breedingDate1 && Date.now() - new Date(breedingDate1) < 24 * 60 * 60 * 1000) {
    await replyToMessage(
      message,
      `${avatar1.name} has already been bred in the last 24 hours.`
    );
    return;
  }

  const breedingDate2 = await avatarService.getLastBredDate(avatar2._id.toString());
  if (breedingDate2 && Date.now() - new Date(breedingDate2) < 24 * 60 * 60 * 1000) {
    await replyToMessage(
      message,
      `${avatar2.name} has already been bred in the last 24 hours.`
    );
    return;
  }

  await replyToMessage(message, `Breeding ${avatar1.name} with ${avatar2.name}...`);

  const memories1 = (
    await chatService.conversationHandler.memoryService.getMemories(avatar1._id)
  )
    .map((m) => m.memory)
    .join("\n");
  const narrative1 = await chatService.conversationHandler.buildNarrativePrompt(
    avatar1,
    [memories1]
  );
  const memories2 = (
    await chatService.conversationHandler.memoryService.getMemories(avatar2._id)
  )
    .map((m) => m.memory)
    .join("\n");
  const narrative2 = await chatService.conversationHandler.buildNarrativePrompt(
    avatar2,
    [memories2]
  );

  const prompt = `Breed the following avatars to combine them, develop a short backstory for the offspring of these two avatars and include it in the final description:\n\n` +
    `AVATAR 1: ${avatar1.name} - ${avatar1.prompt}\n${avatar1.description}\n${avatar1.personality}\n${narrative1}\n\n` +
    `AVATAR 2: ${avatar2.name} - ${avatar2.prompt}\n${avatar2.description}\n${avatar2.personality}\n${narrative2}\n\n` +
    `Combine their attributes creatively, avoid cosmic or mystical creatures and aim for a down to earth feel suitable for the moonstone sanctum.`;

  logger.info(prompt);
  // Store original content to restore after summoning
  const originalContent = message.content;
  // Set the breeding prompt as content for the summon command
  message.content = `🔮 ${prompt}`;
  await handleSummonCommand(message, true, {
    summoner: `${message.author.username}@${message.author.id}`,
    parents: [avatar1._id, avatar2._id],
  });
  // Restore original content after summoning
  message.content = originalContent;
}

/**
 * Tracks and enforces daily summon limits.
 */
const DAILY_SUMMON_LIMIT = 16;

async function checkDailySummonLimit(userId) {
  const db = databaseService.getDatabase();
  if (!db) {
    logger.error("Database not available when checking summon limits");
    return false; // Fail closed - if we can't check, don't allow
  }

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const summonCount = await db
      .collection("daily_summons")
      .countDocuments({ userId, timestamp: { $gte: today } });
    return summonCount < DAILY_SUMMON_LIMIT;
  } catch (error) {
    logger.error(`Error checking summon limit: ${error.message}`);
    return false; // Fail closed on errors
  }
}

async function trackSummon(userId) {
  await databaseService.db.collection("daily_summons").insertOne({
    userId,
    timestamp: new Date(),
  });
}

/**
 * Handles the summon command to create or retrieve an avatar.
 * @param {Message} message - Discord message object.
 * @param {boolean} breed - Indicates if this is a breed operation.
 * @param {Object} attributes - Additional attributes for the avatar.
 */
async function handleSummonCommand(message, breed = false, attributes = {}) {
  const content = message.content.trim().substring(2).trim();
  const lines = content.split("\n");
  const avatarName = lines[0].trim();
  const existingAvatar = await avatarService.getAvatarByName(avatarName);

  try {
    if (existingAvatar) {
      await reactToMessage(message, existingAvatar.emoji || "🔮");
      await chatService.dungeonService.updateAvatarPosition(
        existingAvatar._id,
        message.channel.id
      );
      existingAvatar.stats = await chatService.dungeonService.getAvatarStats(
        existingAvatar._id
      );
      await avatarService.updateAvatar(existingAvatar);
      await sendAvatarProfileEmbedFromObject(existingAvatar);
      await chatService.respondAsAvatar(message.channel, existingAvatar, true);
      return;
    }

    // Ensure we have a database connection before checking limits
    const db = databaseService.getDatabase();
    if (!db) {
      logger.error("Database not available when checking summon limits");
      await replyToMessage(message, "Service temporarily unavailable. Please try again later.");
      return;
    }

    const canSummon =
      message.author.id === "1175877613017895032" ||
      (await checkDailySummonLimit(message.author.id));
    if (!canSummon) {
      await replyToMessage(
        message,
        `Daily summon limit of ${DAILY_SUMMON_LIMIT} reached. Try again tomorrow!`
      );
      return;
    }

    const prompt =
      configService.config.prompt.summon ||
      "Create a twisted avatar, a servant of darkness.";
    const avatarData = {
      prompt: sanitizeInput(`${prompt}\n\nSummon an avatar inspired by this concept:\n\n${content}`),
      channelId: message.channel.id,
    };
    if (prompt.match(/^(https:\/\/.*\.arweave\.net\/|ar:\/\/)/)) {
      avatarData.arweave_prompt = prompt;
    }

    const createdAvatar = await avatarService.createAvatar(avatarData);
    if (!createdAvatar || !createdAvatar.name) {
      throw new Error(`Avatar creation failed: ${JSON.stringify(createdAvatar)}`);
    }

    createdAvatar.summoner = `${message.author.username}@${message.author.id}`;
    createdAvatar.model = createdAvatar.model || (await aiService.selectRandomModel());
    createdAvatar.stats = await chatService.dungeonService.getAvatarStats(createdAvatar._id);
    await avatarService.updateAvatar(createdAvatar);
    await sendAvatarProfileEmbedFromObject(createdAvatar);

    const intro = await aiService.chat(
      [
        {
          role: "system",
          content: `You are ${createdAvatar.name}. ${createdAvatar.description} ${createdAvatar.personality}`,
        },
        {
          role: "user",
          content:
            configService.config.prompt.introduction ||
            "You've just arrived. Introduce yourself.",
        },
      ],
      { model: createdAvatar.model }
    );

    createdAvatar.dynamicPersonality = intro;
    createdAvatar.channelId = message.channel.id;
    createdAvatar.attributes = attributes;
    await avatarService.updateAvatar(createdAvatar);

    await sendAsWebhook(message.channel.id, intro, createdAvatar);
    await chatService.dungeonService.initializeAvatar(createdAvatar._id, message.channel.id);
    await reactToMessage(message, createdAvatar.emoji || "🎉");
    if (!breed) await trackSummon(message.author.id);
    await chatService.respondAsAvatar(message.channel, createdAvatar, true);
  } catch (error) {
    logger.error(`Summon error: ${error.message}`);
    await reactToMessage(message, "❌");
    throw error;
  }
}

/**
 * Handles the attack command.
 * @param {Message} message - Discord message object.
 * @param {Array} args - Command arguments.
 */
async function handleAttackCommand(message, args) {
  if (!args.length) {
    await replyToMessage(message, "Mention an avatar to attack.");
    return;
  }
  const targetName = args.join(" ");
  const avatars = await avatarService.getAllAvatars();
  const targetAvatar = await findAvatarByName(targetName, avatars);
  if (!targetAvatar) {
    await replyToMessage(message, `Avatar "${targetName}" not found.`);
    return;
  }
  const attackResult = await chatService.dungeonService.tools
    .get("attack")
    .execute(message, [targetAvatar.name], targetAvatar);
  await reactToMessage(message, "⚔️");
  await replyToMessage(message, `🔥 **${attackResult}**`);
}

/**
 * Processes commands starting with specific emojis.
 * @param {Message} message - Discord message object.
 */
async function handleCommands(message) {
  const content = message.content;

  if (content.startsWith("!summon")) {
    await replyToMessage(message, "Command Deprecated. Use 🔮 instead.");
    return;
  }

  if (content.startsWith("🔮")) {
    const member = message.guild?.members?.cache?.get(message.author.id);
    const requiredRole = process.env.SUMMONER_ROLE || "🔮";
    if (
      !message.author.bot &&
      member &&
      !member.roles.cache.some(
        (role) => role.id === requiredRole || role.name === requiredRole
      )
    ) {
      await replyToMessage(message, "You lack the required role to summon.");
      return;
    }
    await reactToMessage(message, "🔮");
    await handleSummonCommand(message, false, {});
  }

  if (content.startsWith("⚔️")) {
    if (!message.author.bot) {
      await replyToMessage(message, "❌ Sword of violence not found.");
      return;
    }
    const attackArgs = content.slice(2).trim().split(" ");
    await reactToMessage(message, "⚔️");
    await handleAttackCommand(message, attackArgs);
    await reactToMessage(message, "✅");
  }

  if (content.startsWith("🏹")) {
    const breedArgs = content.slice(2).trim().split(" ");
    await reactToMessage(message, "🏹");
    await handleBreedCommand(message, breedArgs, content);
    await reactToMessage(message, "✅");
  }
}

/**
 * Discord message event handler.
 */
client.on("messageCreate", async (message) => {
  try {
    // Ignore DMs and messages without a guild
    if (!message.guild) return;
    
    // Check if guild is whitelisted
    try {
      // Make sure database is available
      const db = databaseService.getDatabase();
      if (!db) {
        // If database is not available, use memory cache or fall back to default behavior
        if (client.guildWhitelist && client.guildWhitelist.has(message.guild.id)) {
          logger.debug(`Guild ${message.guild.name}(${message.guild.id}) is whitelisted via client memory cache.`);
        } else {
          logger.warn(`Database not available for whitelist check, defaulting to allow messages.`);
          // Consider updating this to match your security policy (allow or deny by default)
        }
        return;
      }

      const guildConfig = await configService.getGuildConfig(db, message.guild.id);

      if (guildConfig && guildConfig.whitelisted === true) {
        // Guild is explicitly whitelisted in its config, proceed with message processing
        logger.debug(`Guild ${message.guild.name}(${message.guild.id}) is whitelisted via guild config.`);

        // Cache this result in memory for faster access
        if (!client.guildWhitelist) client.guildWhitelist = new Map();
        client.guildWhitelist.set(message.guild.id, true);
      } else {
        // Check global whitelist as fallback
        const globalConfig = await configService.get('whitelistedGuilds');
        const whitelistedGuilds = Array.isArray(globalConfig) ? globalConfig : [];

        if (!whitelistedGuilds.includes(message.guild.id)) {
          logger.warn(`Guild ${message.guild.name}(${message.guild.id}) is not whitelisted. Ignoring message from user ${message.author.id} - ${message.author.username}.`);
          return;
        }
        logger.debug(`Guild ${message.guild.name}(${message.guild.id}) is whitelisted via global config.`);

        // Cache this result in memory for faster access
        if (!client.guildWhitelist) client.guildWhitelist = new Map();
        client.guildWhitelist.set(message.guild.id, true);
      }
    } catch (error) {
      logger.error(`Error checking whitelist status: ${error.message}`);
      // Cache the guild whitelist status in client memory if it is whitelisted
      if (client.guildWhitelist && client.guildWhitelist.has(message.guild.id)) {
        logger.debug(`Guild ${message.guild.name}(${message.guild.id}) is whitelisted via client memory cache.`);
      } else {
        // Default to ignoring the message for safety
        return;
      }
    }


    if (!(await spamControlService.shouldProcessMessage(message))) {
      return;
    }

    await saveMessageToDatabase(message);
    await handleCommands(message);

    if (message.author.bot) return;

    await messageHandler.processChannel(message.channel.id);

    const result = await avatarService.getOrCreateUniqueAvatarForUser(
      message.author.id,
      `A unique avatar for ${message.author.username} (${message.author.displayName})`,
      message.channel.id
    );

    if (result.new) {
      result.avatar.model = result.avatar.model || (await aiService.selectRandomModel());
      result.avatar.stats = await chatService.dungeonService.getAvatarStats(result.avatar._id);
      await avatarService.updateAvatar(result.avatar);
      await sendAvatarProfileEmbedFromObject(result.avatar);
      await chatService.respondAsAvatar(message.channel, result.avatar, true);
    }

    await messageHandler.processChannel(message.channel.id);
  } catch (error) {
    logger.error(`Error processing message: ${error.stack}`);
  }
});

/**
 * Saves a message to the database.
 * @param {Message} message - Discord message object.
 */
async function saveMessageToDatabase(message) {
  const db = databaseService.getDatabase();
  if (!db) return;

  const messagesCollection = db.collection("messages");
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
    logger.error("Missing required message data:", messageData);
    return;
  }

  await messagesCollection.insertOne(messageData);
  logger.debug("💾 Message saved to database");
}

/**
 * Gracefully shuts down the application.
 * @param {string} signal - The signal received.
 */
async function shutdown(signal) {
  logger.info(`Received ${signal}. Shutting down gracefully...`);
  await client.destroy();
  logger.info("Disconnected from Discord.");
  await databaseService.close();
  logger.info("Closed MongoDB connection.");
  if (chatService) {
    await chatService.stop();
    logger.info("ChatService stopped.");
  }
  process.exit(0);
}

/**
 * Main application entry point.
 */
async function main() {
  try {
    // Initialize client whitelist cache
    client.guildWhitelist = new Map();
    
    // Connect to database with retry logic
    const db = await databaseService.connect();
    if (!db) {
      logger.warn("Initial database connection failed, will retry");
      // Wait for database connection with retry logic
      const dbConnection = await databaseService.waitForConnection(10, 2000);
      if (!dbConnection) {
        throw new Error("Failed to establish database connection after multiple attempts");
      }
    }

    // Ensure we have a valid database connection
    const database = databaseService.getDatabase();
    if (!database) {
      throw new Error("Database connection not available");
    }

    avatarService = new AvatarGenerationService(database, configService);
    logger.info("✅ Connected to MongoDB successfully");

    await avatarService.updateAllArweavePrompts();
    logger.info("✅ Arweave prompts updated successfully");

    spamControlService = new SpamControlService(database, logger);
    chatService = new ChatService(client, database, { logger, avatarService, aiService, handleSummonCommand, handleBreedCommand });
    messageHandler = new MessageHandler(chatService, avatarService, logger);

    await client.login(DISCORD_BOT_TOKEN);
    logger.info("✅ Logged into Discord successfully");

    await new Promise((resolve) => client.once("ready", resolve));
    logger.info("✅ Discord client ready");

    await chatService.setup();
    await chatService.start();
    logger.info("✅ ChatService started successfully");
  } catch (error) {
    logger.error(`Fatal startup error: ${error.stack || error.message}`);
    await shutdown("STARTUP_ERROR");
  }
}

main().catch((error) => {
  logger.error(`Unhandled startup error: ${error}`);
  process.exit(1);
});

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));