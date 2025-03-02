// index.mjs
import winston from "winston";
import { DatabaseService } from "./services/databaseService.mjs";
import { SpamControlService } from "./services/spamControlService.mjs";
import { GoogleAIService as AIService } from "./services/googleAIService.mjs";
import { AvatarGenerationService } from "./services/avatarService.mjs";
import configService from "./services/configService.mjs";
import {
  client,
  reactToMessage,
  replyToMessage,
  sendAsWebhook,
  sendAvatarProfileEmbedFromObject,
} from "./services/discordService.mjs";
import { ChatService } from "./services/chat/ChatService.mjs";
import { MessageHandler } from "./services/chat/MessageHandler.mjs";

// --------------------------
// Configuration & Setup
// --------------------------
configService.validate();
const aiConfig = configService.getAIConfig();

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

// Initialize global services
let databaseService = new DatabaseService(logger);
global.databaseService = databaseService;
let aiService = new AIService();
let avatarService = null;
let chatService = null;
let messageHandler = null;
let spamControlService = null;

// Validate essential environment variables
const { MONGO_URI, MONGO_DB_NAME = "discord-bot", DISCORD_BOT_TOKEN, DISCORD_CLIENT_ID } = process.env;
if (!MONGO_URI || !DISCORD_BOT_TOKEN) {
  logger.error("Essential environment variables (MONGO_URI or DISCORD_BOT_TOKEN) are missing. Exiting.");
  process.exit(1);
}
if (!DISCORD_CLIENT_ID) {
  logger.warn("DISCORD_CLIENT_ID is not defined. Slash commands registration might fail.");
}

// --------------------------
// Utility Functions
// --------------------------
const sanitizeInput = (input) =>
  input.replace(/[^\p{L}\p{N}\s\p{Emoji}]/gu, "").trim();

async function findAvatarByName(name, avatars) {
  const sanitizedName = sanitizeInput(name.toLowerCase());
  return (
    avatars
      .filter((avatar) =>
        avatar.name.toLowerCase() === sanitizedName ||
        sanitizeInput(avatar.name.toLowerCase()) === sanitizedName
      )
      .sort(() => Math.random() - 0.5)[0] || null
  );
}

// --------------------------
// Command Handlers
// --------------------------
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

  // Check if either avatar was bred within the last 24 hours
  const checkRecentBreed = async (avatar) => {
    const lastBred = await avatarService.getLastBredDate(avatar._id.toString());
    return lastBred && (Date.now() - new Date(lastBred) < 24 * 60 * 60 * 1000);
  };

  if (await checkRecentBreed(avatar1)) {
    await replyToMessage(message, `${avatar1.name} has already been bred in the last 24 hours.`);
    return;
  }
  if (await checkRecentBreed(avatar2)) {
    await replyToMessage(message, `${avatar2.name} has already been bred in the last 24 hours.`);
    return;
  }

  await replyToMessage(message, `Breeding ${avatar1.name} with ${avatar2.name}...`);

  // Build narrative prompts for both avatars
  const buildNarrative = async (avatar) => {
    const memories = (await chatService.conversationHandler.memoryService.getMemories(avatar._id))
      .map((m) => m.memory)
      .join("\n");
    return chatService.conversationHandler.buildNarrativePrompt(avatar, [memories]);
  };

  const narrative1 = await buildNarrative(avatar1);
  const narrative2 = await buildNarrative(avatar2);

  const prompt = `Breed the following avatars to combine them, develop a short backstory for the offspring:\n\n` +
    `AVATAR 1: ${avatar1.name} - ${avatar1.prompt}\n${avatar1.description}\n${avatar1.personality}\n${narrative1}\n\n` +
    `AVATAR 2: ${avatar2.name} - ${avatar2.prompt}\n${avatar2.description}\n${avatar2.personality}\n${narrative2}\n\n` +
    `Combine their attributes creatively, avoiding cosmic or mystical elements and aiming for a down-to-earth feel suitable for the moonstone sanctum.`;

  logger.info(prompt);
  const originalContent = message.content;
  // Temporarily set the breeding prompt as the message content
  message.content = `🔮 ${prompt}`;
  await handleSummonCommand(message, true, {
    summoner: `${message.author.username}@${message.author.id}`,
    parents: [avatar1._id, avatar2._id],
  });
  // Restore original message content
  message.content = originalContent;
}

const DAILY_SUMMON_LIMIT = 16;
async function checkDailySummonLimit(userId) {
  const db = databaseService.getDatabase();
  if (!db) {
    logger.error("Database not available for summon limit check.");
    return false;
  }
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const summonCount = await db.collection("daily_summons").countDocuments({
      userId,
      timestamp: { $gte: today },
    });
    return summonCount < DAILY_SUMMON_LIMIT;
  } catch (error) {
    logger.error(`Error checking summon limit: ${error.message}`);
    return false;
  }
}

async function trackSummon(userId) {
  await databaseService.db.collection("daily_summons").insertOne({
    userId,
    timestamp: new Date(),
  });
}

async function handleSummonCommand(message, breed = false, attributes = {}) {
  const content = message.content.trim().substring(2).trim();
  const [avatarName] = content.split("\n").map(line => line.trim());
  const existingAvatar = await avatarService.getAvatarByName(avatarName);

  try {
    if (existingAvatar) {
      await reactToMessage(message, existingAvatar.emoji || "🔮");
      await chatService.dungeonService.updateAvatarPosition(existingAvatar._id, message.channel.id);
      existingAvatar.stats = await chatService.dungeonService.getAvatarStats(existingAvatar._id);
      await avatarService.updateAvatar(existingAvatar);
      await sendAvatarProfileEmbedFromObject(existingAvatar);
      await chatService.respondAsAvatar(message.channel, existingAvatar, true);
      return;
    }

    const db = databaseService.getDatabase();
    if (!db) {
      logger.error("Database not available for summon command.");
      await replyToMessage(message, "Service temporarily unavailable. Please try again later.");
      return;
    }

    const canSummon = message.author.id === "1175877613017895032" ||
      (await checkDailySummonLimit(message.author.id));
    if (!canSummon) {
      await replyToMessage(message, `Daily summon limit of ${DAILY_SUMMON_LIMIT} reached. Try again tomorrow!`);
      return;
    }

    const summonPrompt = configService.config.prompt.summon ||
      "Create a twisted avatar, a servant of darkness.";
    const avatarData = {
      prompt: sanitizeInput(`${summonPrompt}\n\nSummon an avatar inspired by this concept:\n\n${content}`),
      channelId: message.channel.id,
    };
    if (summonPrompt.match(/^(https:\/\/.*\.arweave\.net\/|ar:\/\/)/)) {
      avatarData.arweave_prompt = summonPrompt;
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
          content: configService.config.prompt.introduction ||
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
  const attackResult = await chatService.dungeonService.tools.get("attack").execute(
    message,
    [targetAvatar.name],
    targetAvatar
  );
  await reactToMessage(message, "⚔️");
  await replyToMessage(message, `🔥 **${attackResult}**`);
}

async function handleCommands(message) {
  const content = message.content;
  if (content.startsWith("!summon")) {
    await replyToMessage(message, "Command Deprecated. Use 🔮 instead.");
    return;
  }
  if (content.startsWith("🔮")) {
    const member = message.guild?.members?.cache?.get(message.author.id);
    const requiredRole = process.env.SUMMONER_ROLE || "🔮";
    if (!message.author.bot && member && !member.roles.cache.some(
      (role) => role.id === requiredRole || role.name === requiredRole
    )) {
      await replyToMessage(message, "You lack the required role to summon.");
      return;
    }
    await reactToMessage(message, "🔮");
    await handleSummonCommand(message, false, {});
    return;
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
    return;
  }
  if (content.startsWith("🏹")) {
    const breedArgs = content.slice(2).trim().split(" ");
    await reactToMessage(message, "🏹");
    await handleBreedCommand(message, breedArgs, content);
    await reactToMessage(message, "✅");
    return;
  }
}

// --------------------------
// Database & Message Persistence
// --------------------------
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

client.on("messageCreate", async (message) => {
  try {
    if (!message.guild) return;

    // --------------------------
    // Guild Whitelist Check
    // --------------------------
    if (client.guildWhitelist?.has(message.guild.id)) {
      if (!client.guildWhitelist.get(message.guild.id)) {
        logger.warn(`Guild ${message.guild.name} (${message.guild.id}) is not whitelisted. Ignoring message.`);
        return;
      }
    } else {
      const db = databaseService.getDatabase();
      if (!db) return;
      const guildConfig = await configService.getGuildConfig(db, message.guild.id);
      if (guildConfig?.whitelisted === true) {
        client.guildWhitelist = client.guildWhitelist || new Map();
        client.guildWhitelist.set(message.guild.id, true);
      } else {
        const globalConfig = await configService.get("whitelistedGuilds");
        const whitelistedGuilds = Array.isArray(globalConfig) ? globalConfig : [];
        if (!whitelistedGuilds.includes(message.guild.id)) {
          logger.warn(`Guild ${message.guild.name} (${message.guild.id}) is not whitelisted. Ignoring message.`);
          return;
        }
        client.guildWhitelist = client.guildWhitelist || new Map();
        client.guildWhitelist.set(message.guild.id, true);
      }
    }

    if (!(await spamControlService.shouldProcessMessage(message))) return;

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

// --------------------------
// Shutdown & Startup Logic
// --------------------------
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

async function loadGuildWhitelist(database) {
  try {
    logger.info("Pre-loading guild whitelist settings...");
    const guildConfigs = await database.collection("guild_configs").find({}).toArray();
    client.guildWhitelist = new Map();
    for (const config of guildConfigs) {
      if (config.guildId && config.whitelisted === true) {
        client.guildWhitelist.set(config.guildId, true);
        logger.debug(`Pre-loaded whitelist for guild ${config.guildId}.`);
      }
    }
    logger.info(`Pre-loaded whitelist settings for ${client.guildWhitelist.size} guild(s).`);
  } catch (err) {
    logger.error(`Failed to pre-load guild whitelist settings: ${err.message}`);
  }
}

async function main() {
  try {
    client.guildWhitelist = new Map();
    configService.setClient(client);
    const db = await databaseService.connect();
    if (!db) {
      logger.warn("Initial database connection failed, will retry.");
      const dbConnection = await databaseService.waitForConnection(10, 2000);
      if (!dbConnection) throw new Error("Failed to establish database connection after multiple attempts.");
    }
    const database = databaseService.getDatabase();
    if (!database) throw new Error("Database connection not available.");

    await loadGuildWhitelist(database);

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
