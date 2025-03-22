import {
  Client,
  GatewayIntentBits,
  Partials,
  WebhookClient,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} from 'discord.js';
import { DatabaseService } from './databaseService.mjs';
import configService from './configService.mjs';
import winston from 'winston';
import { chunkMessage } from './utils/messageChunker.mjs';
import { processMessageLinks } from './utils/linkProcessor.mjs';
import models from '../models.config.mjs';
import rarityColors from './utils/rarityColors.mjs';

// Initialize Logger
const logger = winston.createLogger({
  level: configService.get('logging.level') || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(
      ({ timestamp, level, message }) => `${timestamp} [${level.toUpperCase()}]: ${message}`
    )
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'discordService.log' }),
  ],
});

// Get Discord configuration
const discordConfig = configService.getDiscordConfig();

// Validate required configuration early
if (!discordConfig?.botToken) {
  logger.error('Discord bot token not configured. Please set DISCORD_BOT_TOKEN in your .env file.');
  throw new Error('Discord bot token is required');
}

if (!discordConfig.clientId) {
  logger.warn('Discord client ID not configured - some features may be limited');
}

// Initialize database service
const databaseService = new DatabaseService(logger);

// Instantiate the Discord client
export const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});


/**
 * Updates the database with both connected and detected guilds
 * @returns {Promise<void>}
 */
async function updateDetectedGuilds() {
  if (!client.db) {
    logger.error('Database not connected, cannot update detected guilds');
    return;
  }

  try {
    const allGuilds = client.guilds.cache.map(guild => ({
      id: guild.id,
      name: guild.name,
      memberCount: guild.memberCount,
      icon: guild.icon,
      detectedAt: new Date(),
      updatedAt: new Date(),
    }));

    logger.info(`Updating ${allGuilds.length} detected guilds from Discord client's cache`);

    if (allGuilds.length > 0) {
      const bulkOps = allGuilds.map(guild => ({
        updateOne: {
          filter: { id: guild.id },
          update: { $set: guild },
          upsert: true,
        },
      }));
      await client.db.collection('detected_guilds').bulkWrite(bulkOps);
    }
  } catch (error) {
    logger.error('Error updating detected guilds: ' + error.message);
  }
}

// Webhook management cache
const webhookCache = new Map();

// Connect to MongoDB and initialize client on ready
client.once('ready', async () => {
  try {
    const db = await databaseService.connect();
    client.db = db;
    logger.info(`Bot is ready as ${client.user.tag} and connected to MongoDB`);
    await updateConnectedGuilds();
    await updateDetectedGuilds();
    client.guildWhitelist = new Map(); // Initialize guild whitelist cache
  } catch (error) {
    logger.error('Failed to initialize bot: ' + error.message);
    process.exit(1); // Exit if initialization fails
  }
});

/**
 * Updates the database with the list of connected guilds
 * @returns {Promise<void>}
 */
async function updateConnectedGuilds() {
  if (!client.db) {
    logger.error('Database not connected, cannot update guilds');
    return;
  }

  try {
    const connectedGuilds = client.guilds.cache.map(guild => ({
      id: guild.id,
      name: guild.name,
      memberCount: guild.memberCount,
      icon: guild.icon,
      updatedAt: new Date(),
    }));

    logger.info(`Updating ${connectedGuilds.length} connected guilds`);

    if (connectedGuilds.length > 0) {
      const bulkOps = connectedGuilds.map(guild => ({
        updateOne: {
          filter: { id: guild.id },
          update: { $set: guild },
          upsert: true,
        },
      }));
      await client.db.collection('connected_guilds').bulkWrite(bulkOps);
    }
  } catch (error) {
    logger.error('Error updating connected guilds: ' + error.message);
  }
}

/**
 * Validates an avatar object
 * @param {Object} avatar - The avatar object to validate
 * @throws {Error} If validation fails
 */
function validateAvatar(avatar) {
  if (!avatar || typeof avatar !== 'object') {
    throw new Error('Avatar must be a valid object');
  }
  if (!avatar.name || typeof avatar.name !== 'string') {
    throw new Error('Avatar name is required and must be a string');
  }
  if (!avatar.imageUrl || typeof avatar.imageUrl !== 'string') {
    throw new Error('Avatar imageUrl is required and must be a string');
  }
}

/**
 * Gets or creates a webhook for a channel
 * @param {import('discord.js').Channel} channel - The channel to get/create a webhook for
 * @returns {Promise<WebhookClient|null>}
 */
async function getOrCreateWebhook(channel) {
  if (!channel || !channel.isTextBased()) {
    logger.error('Invalid or non-text-based channel provided for webhook');
    return null;
  }

  try {
    const targetChannel = channel.isThread() ? await channel.parent.fetch() : channel;
    if (!targetChannel) {
      throw new Error('Unable to fetch target channel');
    }

    if (webhookCache.has(targetChannel.id)) {
      return webhookCache.get(targetChannel.id);
    }

    const webhooks = await targetChannel.fetchWebhooks();
    let webhook = webhooks.find(wh => wh.owner.id === client.user.id);

    if (!webhook) {
      webhook = await targetChannel.createWebhook({
        name: 'Multi-Avatar Bot Webhook',
        avatar: client.user.displayAvatarURL(),
      });
      logger.info(`Created webhook for channel ${targetChannel.id}`);
    }

    const webhookClient = new WebhookClient({ id: webhook.id, token: webhook.token });
    webhookCache.set(targetChannel.id, webhookClient);
    return webhookClient;
  } catch (error) {
    logger.error(`Failed to get/create webhook for channel ${channel.id}: ${error.message}`);
    return null;
  }
}

/**
 * Sends a message via webhook
 * @param {string} channelId - The channel ID
 * @param {string} content - The message content
 * @param {Object} avatar - The avatar object with name, emoji, and imageUrl
 * @returns {Promise<void>}
 */
export async function sendAsWebhook(channelId, content, avatar) {
  try {
    validateAvatar(avatar);
    if (!channelId || typeof channelId !== 'string') {
      throw new Error('Invalid channel ID');
    }
    if (!content || typeof content !== 'string') {
      throw new Error('Content is required and must be a string');
    }
    
    const channel = await client.channels.fetch(channelId);
    if (!channel || !channel.isTextBased()) {
      throw new Error('Channel not accessible or not text-based');
    }

    const webhook = await getOrCreateWebhook(channel);
    if (!webhook) {
      throw new Error('Failed to obtain webhook');
    }

    // Construct the username, ensuring a maximum length of 80 characters
    const username = `${avatar.name.slice(0, 78)}${avatar.emoji || ''}`.slice(0, 80);

    // Define the prefix to remove (username followed by ": ")
    const prefix = `${username}: `;

    // Remove the prefix only if it appears at the beginning of the content
    const trimmed = content.startsWith(prefix) ? content.slice(prefix.length) : content;

    // Process the trimmed content to handle message links
    const preparedContent = processMessageLinks(trimmed, client);

    // Split the prepared content into chunks
    const chunks = chunkMessage(preparedContent);

    for (const chunk of chunks) {
      await webhook.send({
        content: chunk,
        username,
        avatarURL: avatar.imageUrl,
        threadId: channel.isThread() ? channelId : undefined,
      });
    }
    logger.info(`Sent message to channel ${channelId} as ${username}`);
  } catch (error) {
    logger.error(`Failed to send webhook message to ${channelId}: ${error.message}`);
  }
}

/**
 * Sends an avatar profile embed
 * @param {Object} avatar - The avatar object
 * @param {string} [targetChannelId] - Optional channel ID to override the avatar's stored channelId
 * @returns {Promise<void>}
 */
export async function sendAvatarProfileEmbedFromObject(avatar, targetChannelId) {
  validateAvatar(avatar);
  const channelId = targetChannelId || avatar.channelId;
  if (!channelId || typeof channelId !== 'string') {
    throw new Error('Invalid channel ID in avatar object');
  }

  // Log the override if it's happening
  if (targetChannelId && targetChannelId !== avatar.channelId) {
    logger.debug(`Overriding avatar ${avatar.name}'s channelId ${avatar.channelId} with ${targetChannelId} for profile embed`);
  }

  if (!client.db) {
    logger.error('Database not connected, cannot send avatar profile');
    return;
  }

  try {
    const channel = await client.channels.fetch(channelId);
    if (!channel || !channel.isTextBased()) {
      throw new Error(`Channel not found or not text-based: ${channelId}`);
    }

    const webhook = await getOrCreateWebhook(channel);
    if (!webhook) {
      throw new Error('Failed to obtain webhook');
    }

    const embed = await buildAvatarEmbed(avatar);
    const components = await buildAvatarComponents(avatar);

    await webhook.send({
      embeds: [embed],
      components,
      username: `${avatar.name.slice(0, 78)}${avatar.emoji || ''}`.slice(0, 80),
      avatarURL: avatar.imageUrl,
      threadId: channel.isThread() ? channelId : undefined,
    });

    logger.info(`Sent avatar profile for ${avatar.name} to channel ${channelId}`);
  } catch (error) {
    logger.error(`Failed to send avatar profile to ${channelId}: ${error.message}`);
  }
}

/**
 * Builds the avatar embed
 * @param {Object} avatar - The avatar object
 * @returns {Promise<EmbedBuilder>}
 */
async function buildAvatarEmbed(avatar) {
  const {
    _id, name, emoji, short_description, description, imageUrl,
    model, createdAt, updatedAt, stats, traits, innerMonologueThreadId, channelId,
  } = avatar;

  const rarity = getModelRarity(model);
  const embedColor = rarityColors[rarity.toLowerCase()] || rarityColors.undefined;
  const tier = { legendary: 'S', rare: 'A', uncommon: 'B', common: 'C', undefined: 'U' }[rarity.toLowerCase()] || 'U';

  const embed = new EmbedBuilder()
    .setColor(embedColor)
    .setTitle(`${emoji} ${name}`)
    .setURL(innerMonologueThreadId ? `https://discord.com/channels/${channelId}/${innerMonologueThreadId}` : null)
    .setAuthor({ name: `${name} ${emoji || ''}`, iconURL: imageUrl })
    .setDescription(short_description || (description ? description.slice(0, 4096) : 'No description available'))
    .setThumbnail(imageUrl)
    .addFields(
      { name: '🎂 Summonsday', value: `<t:${Math.floor(new Date(createdAt || Date.now()).getTime() / 1000)}:F>`, inline: true },
      { name: `🧠 Tier ${tier}`, value: model || 'N/A', inline: true }
    )
    .setImage(imageUrl)
    .setTimestamp(new Date(updatedAt || Date.now()))
    .setFooter({ text: `Profile of ${name}`, iconURL: imageUrl });

  if (traits) embed.addFields({ name: '🧬 Traits', value: traits, inline: false });
  if (innerMonologueThreadId) embed.addFields({ name: '🧵 Inner Monologue', value: `<#${innerMonologueThreadId}>`, inline: false });

  if (stats) {
    const { attack, defense, hp } = stats;
    embed.addFields({
      name: 'Stats',
      value: `${generateProgressBar(attack, 5, '⚔️')} ${attack}\n${generateProgressBar(defense, 5, '🛡️')} ${defense}\n${generateProgressBar(hp, 33, '❣️')} ${hp}`,
      inline: true,
    });
  } else {
    embed.addFields({ name: 'Stats', value: 'N/A', inline: true });
  }

  return embed;
}

/**
 * Builds components for the avatar embed (e.g., collect button)
 * @param {Object} avatar - The avatar object
 * @returns {Promise<ActionRowBuilder[]>}
 */
async function buildAvatarComponents(avatar) {
  const components = [];
  try {
    const crossmintData = await client.db.collection('crossmint_dev').findOne({
      avatarId: avatar._id,
      chain: 'base',
    });

    // if (crossmintData?.templateId) {
    //   const publicUrl = process.env.PUBLIC_URL || 'https://default-url.com';
    //   const collectButton = new ButtonBuilder()
    //     .setLabel('Collect on Base')
    //     .setStyle(ButtonStyle.Link)
    //     .setURL(`${publicUrl}/checkout.html?templateId=${crossmintData.templateId}&collectionId=${crossmintData.collectionId}`);
    //   components.push(new ActionRowBuilder().addComponents(collectButton));
    // }
  } catch (error) {
    logger.error(`Failed to fetch crossmint data for avatar ${avatar._id}: ${error.message}`);
  }
  return components;
}

/**
 * Generates a progress bar
 * @param {number} value - The stat value
 * @param {number} increment - The increment per emoji
 * @param {string} emoji - The emoji to use
 * @returns {string}
 */
function generateProgressBar(value, increment, emoji) {
  const count = Math.min(Math.floor(value / increment), 10); // Cap at 10 emojis
  return emoji.repeat(count);
}

/**
 * Gets model rarity
 * @param {string} modelName - The model name
 * @returns {string}
 */
function getModelRarity(modelName) {
  const model = models.find(m => m.model === modelName);
  return model ? model.rarity : 'undefined';
}

/**
 * Reacts to a message
 * @param {import('discord.js').Message} message - The message to react to
 * @param {string} emoji - The emoji to react with
 * @returns {Promise<void>}
 */
export async function reactToMessage(message, emoji) {
  if (!message || !emoji || typeof emoji !== 'string') {
    logger.error('Invalid message or emoji for reaction');
    return;
  }
  try {
    await message.react(emoji);
    logger.info(`Reacted to message ${message.id} with ${emoji}`);
  } catch (error) {
    logger.error(`Failed to react to message ${message.id}: ${error.message}`);
  }
}

/**
 * Replies to a message
 * @param {import('discord.js').Message} message - The message to reply to
 * @param {string} replyContent - The reply content
 * @returns {Promise<void>}
 */
export async function replyToMessage(message, replyContent) {
  if (!message || !replyContent || typeof replyContent !== 'string') {
    logger.error('Invalid message or reply content');
    return;
  }
  try {
    await message.reply(replyContent);
    logger.info(`Replied to message ${message.id}`);
  } catch (error) {
    logger.error(`Failed to reply to message ${message.id}: ${error.message}`);
  }
}

/**
 * Fetches recent messages
 * @param {string} channelId - The channel ID
 * @param {number} limit - Number of messages to fetch (max 100)
 * @returns {Promise<import('discord.js').Message[]>}
 */
export async function getRecentMessages(channelId, limit = 10) {
  if (!channelId || typeof channelId !== 'string' || limit < 1 || limit > 100) {
    logger.error('Invalid channel ID or limit for fetching messages');
    return [];
  }
  try {
    const channel = await client.channels.fetch(channelId);
    if (!channel || !channel.isTextBased()) {
      throw new Error('Channel not found or not text-based');
    }
    const messages = await channel.messages.fetch({ limit });
    return Array.from(messages.values());
  } catch (error) {
    logger.error(`Failed to fetch messages from ${channelId}: ${error.message}`);
    return [];
  }
}

// Guild event handlers
client.on('guildCreate', async guild => {
  logger.info(`Joined guild: ${guild.name} (${guild.id})`);
  await updateConnectedGuilds();
  await updateDetectedGuilds();
});

client.on('guildDelete', async guild => {
  logger.info(`Left guild: ${guild.name} (${guild.id})`);
  if (!client.db) return;
  try {
    await client.db.collection('connected_guilds').deleteOne({ id: guild.id });
    // We keep the guild in detected_guilds even if we leave it
  } catch (error) {
    logger.error(`Failed to remove guild ${guild.id} from database: ${error.message}`);
  }
});

// Login to Discord
client.login(discordConfig.botToken).catch(error => {
  logger.error('Failed to login to Discord: ' + error.message);
  process.exit(1);
});