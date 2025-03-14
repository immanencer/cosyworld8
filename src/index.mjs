// index.mjs
import winston from "winston";
import { DatabaseService } from "./services/databaseService.mjs";
import { SpamControlService } from "./services/spamControlService.mjs";
import { AIService } from "./services/aiService.mjs";
import { AvatarGenerationService } from "./services/avatarService.mjs";
import { ImageProcessingService } from "./services/imageProcessingService.mjs";
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
    `Combine their attributes creatively, avoiding cosmic or mystical elements and aiming for a down-to-earth feel suitable for the Project 89.`;

  logger.info(prompt);
  const originalContent = message.content;

  // Get the summon emoji for the guild
  const guildId = message.guild?.id;
  let summonEmoji = process.env.DEFAULT_SUMMON_EMOJI || "🔮";

  if (guildId) {
    try {
      const guildConfig = await configService.getGuildConfig(databaseService.getDatabase(), guildId);
      if (guildConfig) {
        if (guildConfig.toolEmojis && guildConfig.toolEmojis.summon) {
          summonEmoji = guildConfig.toolEmojis.summon;
        } else if (guildConfig.summonEmoji) {
          // For backwards compatibility with older config format
          summonEmoji = guildConfig.summonEmoji;
        }
      }
    } catch (error) {
      logger.error(`Error getting summon emoji from config: ${error.message}`);
    }
  }

  // Temporarily set the breeding prompt as the message content
  message.content = `${summonEmoji} ${prompt}`;
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
  } finally {
    //Optional cleanup here if needed.
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
  let existingAvatar = await avatarService.getAvatarByName(avatarName);

  try {
    if (existingAvatar) {
      await reactToMessage(message, existingAvatar.emoji || "🔮");

      existingAvatar = await chatService.dungeonService.updateAvatarPosition(existingAvatar._id, message.channel.id);
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
    const guildId = message.guild?.id;
    // Get guild-specific prompts - Refresh from database to ensure latest settings
    const guildConfig = await configService.getGuildConfig(db, guildId, true); // Force refresh from DB
    const guildPrompts = guildConfig?.prompts || {};
    logger.info(`Retrieved guild prompts for ${guildId}: ${JSON.stringify(guildPrompts)}`);

    const canSummon = message.author.id === "1175877613017895032" ||
      (await checkDailySummonLimit(message.author.id));
    if (!canSummon) {
      await replyToMessage(message, `Daily summon limit of ${DAILY_SUMMON_LIMIT} reached. Try again tomorrow!`);
      return;
    }
    const summonPrompt = guildPrompts.summon || "Create an avatar with the following description:";
    logger.info(`Using summon prompt for guild ${guildId}: ${summonPrompt}`);

    const avatarData = {
      prompt: sanitizeInput(`${summonPrompt}\n\nRequires you to design a creative character based on the following content:\n\n${content}`),
      channelId: message.channel.id,
    };
    if (summonPrompt && summonPrompt.match(/^(https:\/\/.*\.arweave\.net\/|ar:\/\/)/)) {
      avatarData.arweave_prompt = summonPrompt;
    }

    try {
      logger.info(`Avatar generation prompt: ${avatarData.prompt}`);
      const createdAvatar = await avatarService.createAvatar(avatarData);

      if (!createdAvatar) {
        // Enhanced error handling with more information
        logger.error(`Avatar creation failed. Input data: ${JSON.stringify(avatarData)}`);
        await replyToMessage(message, "Failed to create avatar. Please try again with a different description.");
        return;
      }

      if (!createdAvatar.name) {
        logger.warn(`Created avatar is missing name: ${JSON.stringify(createdAvatar)}`);
        await replyToMessage(message, "Avatar creation resulted in an incomplete character. Please try again with a more detailed description.");
        return;
      }

      createdAvatar.summoner = `${message.author.username}@${message.author.id}`;
      createdAvatar.model = createdAvatar.model || (await aiService.selectRandomModel());
      createdAvatar.stats = await chatService.dungeonService.getAvatarStats(createdAvatar._id);
      await avatarService.updateAvatar(createdAvatar);
      await sendAvatarProfileEmbedFromObject(createdAvatar);

      try {
        const intro = await aiService.chat([
          {
            role: "system",
            content: `You are ${createdAvatar.name}. ${createdAvatar.description} ${createdAvatar.personality}`,
          },
          {
            role: "user",
            content: guildPrompts.introduction || "You've just arrived. Introduce yourself.",
          }
        ]);

        createdAvatar.dynamicPersonality = intro;
        createdAvatar.channelId = message.channel.id;
        createdAvatar.attributes = attributes;
        await avatarService.updateAvatar(createdAvatar);

        await sendAsWebhook(message.channel.id, intro, createdAvatar);
      } catch (introError) {
        logger.error(`Error generating introduction: ${introError.message}`);
        // Continue even if introduction generation fails
      }

      await chatService.dungeonService.initializeAvatar(createdAvatar._id, message.channel.id);
      await reactToMessage(message, createdAvatar.emoji || "🎉");
      if (!breed) await trackSummon(message.author.id);
      await chatService.respondAsAvatar(message.channel, createdAvatar, true);
    } catch (error) {
      logger.error(`Summon error: ${error.message}`);
      await reactToMessage(message, "❌");
      await replyToMessage(message, `Failed to summon avatar: ${error.message}`);
    }
  } catch (error) {
    logger.error(`Error processing summon command: ${error.stack}`);
    await reactToMessage(message, "❌");
    await replyToMessage(message, "An error occurred while processing your summon command. Please try again later.");
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
    await replyToMessage(message, "Command Deprecated. Use 🔮 Instead.");
    return;
  }
  // Check if message starts with summon emoji from guild config
  const guildId = message.guild?.id;
  let summonEmoji = process.env.DEFAULT_SUMMON_EMOJI || "🔮";

  if (guildId) {
    try {
      const guildConfig = await configService.getGuildConfig(databaseService.getDatabase(), guildId);
      if (guildConfig) {
        if (guildConfig.toolEmojis && guildConfig.toolEmojis.summon) {
          summonEmoji = guildConfig.toolEmojis.summon;
        } else if (guildConfig.summonEmoji) {
          // For backwards compatibility with older config format
          summonEmoji = guildConfig.summonEmoji;
        }
      }
      logger.debug(`Using summon emoji ${summonEmoji} for guild ${guildId}`);
    } catch (error) {
      logger.error(`Error getting summon emoji from config: ${error.message}`);
    }
  }

  if (content.startsWith(summonEmoji)) {
    const member = message.guild?.members?.cache?.get(message.author.id);
    let requiredRole = null;
    
    try {
      if (guildId) {
        const guildConfig = await configService.getGuildConfig(databaseService.getDatabase(), guildId);
        requiredRole = guildConfig?.summonerRole || null;
      } else {
        requiredRole = process.env.SUMMONER_ROLE || null;
      }
    } catch (error) {
      logger.error(`Error getting summoner role from config: ${error.message}`);
    }
    
    // If there's a required role configured and user doesn't have it, prevent summoning
    if (requiredRole && !message.author.bot && member && !member.roles.cache.some(
      (role) => role.id === requiredRole || role.name === requiredRole
    )) {
      await replyToMessage(message, `You lack the required role (${requiredRole}) to summon.`);
      return;
    }
    
    await reactToMessage(message, summonEmoji);
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

async function saveMessageToDatabase(message) {
  const db = databaseService.getDatabase();
  if (!db) return;
  const messagesCollection = db.collection("messages");

  // Extract attachment URLs if present
  const attachments = Array.from(message.attachments.values()).map(attachment => ({
    id: attachment.id,
    url: attachment.url,
    proxyURL: attachment.proxyURL,
    filename: attachment.name,
    contentType: attachment.contentType,
    size: attachment.size,
    height: attachment.height,
    width: attachment.width
  }));

  // Extract embed data if present
  const embeds = message.embeds.map(embed => ({
    type: embed.type,
    title: embed.title,
    description: embed.description,
    url: embed.url,
    image: embed.image ? {
      url: embed.image.url,
      proxyURL: embed.image.proxyURL,
      height: embed.image.height,
      width: embed.image.width
    } : null,
    thumbnail: embed.thumbnail ? {
      url: embed.thumbnail.url,
      proxyURL: embed.thumbnail.proxyURL,
      height: embed.thumbnail.height,
      width: embed.thumbnail.width
    } : null
  }));

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
    attachments: attachments,
    embeds: embeds,
    hasImages: attachments.some(a => a.contentType?.startsWith('image/')) ||
      embeds.some(e => e.image || e.thumbnail),
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
    // Guild Authorization Check
    // --------------------------
    if (client.authorizedGuilds?.has(message.guild.id)) {
      if (!client.authorizedGuilds.get(message.guild.id)) {
        logger.warn(`Guild ${message.guild.name} (${message.guild.id}) is not authorized. Ignoring message.`);
        return;
      }
    } else {
      const db = databaseService.getDatabase();
      if (!db) return;
      const guildConfig = await configService.getGuildConfig(db, message.guild.id);
      if (guildConfig?.authorized === true) {
        client.authorizedGuilds = client.authorizedGuilds || new Map();
        client.authorizedGuilds.set(message.guild.id, true);
      } else {
        const globalConfig = await configService.get("authorizedGuilds");
        const authorizedGuilds = Array.isArray(globalConfig) ? globalConfig : [];
        if (!authorizedGuilds.includes(message.guild.id)) {
          const logMessage = `Guild ${message.guild.name} (${message.guild.id}) is not authorized. Ignoring message.`;
          logger.warn(logMessage);

          // Save to application_logs collection for audit purposes
          try {
            await db.collection('application_logs').insertOne({
              type: 'guild_access',
              message: logMessage,
              guildId: message.guild.id,
              guildName: message.guild.name,
              timestamp: new Date()
            });
          } catch (logError) {
            logger.error(`Failed to log guild access: ${logError.message}`);
          }

          return;
        }
        client.authorizedGuilds = client.authorizedGuilds || new Map();
        client.authorizedGuilds.set(message.guild.id, true);
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
    client.authorizedGuilds = new Map(); // Changed to authorizedGuilds
    for (const config of guildConfigs) {
      if (config.guildId && config.authorized === true) { // Changed to authorized
        client.authorizedGuilds.set(config.guildId, true); // Changed to authorizedGuilds
        logger.debug(`Pre-loaded whitelist for guild ${config.guildId}.`);
      }
    }
    logger.info(`Pre-loaded whitelist settings for ${client.authorizedGuilds.size} guild(s).`); // Changed to authorizedGuilds
  } catch (err) {
    logger.error(`Failed to pre-load guild whitelist settings: ${err.message}`);
  }
}

async function main() {
  try {
    client.authorizedGuilds = new Map(); // Changed to authorizedGuilds
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

    aiService = new AIService();
    const imageProcessingService = new ImageProcessingService(logger, aiService);

    avatarService = new AvatarGenerationService(database, configService);
    logger.info("✅ Connected to MongoDB successfully");

    await avatarService.updateAllArweavePrompts();
    logger.info("✅ Arweave prompts updated successfully");

    spamControlService = new SpamControlService(database, logger);
    chatService = new ChatService(client, database, {
      logger,
      avatarService,
      aiService,
      imageProcessingService,
      handleSummonCommand,
      handleBreedCommand
    });

    // Make sure DungeonService has a proper reference to avatarService
    if (chatService.dungeonService) {
      chatService.dungeonService.avatarService = avatarService;
      logger.info(`Set avatarService reference in DungeonService`);
    } else {
      logger.warn(`Cannot set avatarService in DungeonService: dungeonService not found in chatService`);
    }
    messageHandler = new MessageHandler(avatarService, client, chatService, imageProcessingService, logger);

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