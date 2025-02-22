// discordService.js

import {
  Client,
  GatewayIntentBits,
  Partials,
  WebhookClient
} from 'discord.js';
import configService from './configService.mjs';
import { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js';
import winston from 'winston';

import { chunkMessage } from './utils/messageChunker.mjs';
import { processMessageLinks } from './utils/linkProcessor.mjs';

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

// Instantiate the Discord client with necessary permissions
export const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
  token: discordConfig.botToken
});

// Validate required configuration
if (!discordConfig.botToken) {
  logger.error('Discord bot token not configured');
  throw new Error('Discord bot token is required');
}

if (!discordConfig.clientId) {
  logger.warn('Discord client ID not configured - some features may be limited');
}

// Webhook management cache
const webhookCache = new Map();

/**
 * Reacts to a message with a specified emoji.
 * @param {Client} client - The Discord client instance.
 * @param {string} channelId - The ID of the channel containing the message.
 * @param {string} messageId - The ID of the message to react to.
 * @param {string} emoji - The emoji to react with.
 */
export async function reactToMessage(message, emoji) {
  try {

    await message.react(emoji);
    logger.info(`Reacted to message ${message.id} in channel ${message.channel.id} with ${emoji}`);
  } catch (error) {
    logger.error(`Failed to react to message: ` + error.message);
  }

}

/**
 * Replies to a specific message.
 * @param {Client} client - The Discord client instance.
 * @param {string} channelId - The ID of the channel containing the message.
 * @param {string} messageId - The ID of the message to reply to.
 * @param {string} replyContent - The content of the reply.
 */
export async function replyToMessage(message, replyContent) {
  try {
    await message.reply(replyContent);
    logger.info(`Replied to message ${messageId} in channel ${channelId} with: ${replyContent}`);
  } catch (error) {
    logger.error(`Failed to reply to message ${messageId} in channel ${channelId}: ${error.message}`);
  }
}

/**
 * Creates or fetches a webhook for a given channel.
 * @param {Channel} channel - The Discord channel object.
 * @returns {Promise<WebhookClient|null>} - The webhook client or null if failed.
 */
async function getOrCreateWebhook(channel) {
  try {
    if (!discordConfig.botToken) {
      throw new Error('Discord bot token not configured');
    }

    // If the channel is a thread, fetch its parent channel
    if (channel.isThread()) {
      channel = await channel.parent.fetch();
    }

    // Check cache first
    if (webhookCache.has(channel.id)) {
      return webhookCache.get(channel.id);
    }

    const webhooks = await channel.fetchWebhooks();
    let webhook = webhooks.find((wh) => wh.owner.id === client.user.id);

    if (!webhook) {
      webhook = await channel.createWebhook({
        name: 'Multi-Avatar Bot Webhook',
        avatar: client.user.displayAvatarURL(),
      });
      logger.info(`Created new webhook for channel ${channel.id}`);
    }

    webhookCache.set(channel.id, webhook);
    return webhook;
  } catch (error) {
    logger.error(`Failed to create or fetch webhook for channel ${channel?.id}: ${error.message}`);
    throw error;
  }
}

import models from '../models.config.mjs';
/**
 * Finds the rarity of a given model.
 * @param {string} modelName - The name of the model.
 * @returns {string} - The rarity level ('common', 'uncommon', 'rare', 'legendary', 'undefined').
 */
function getModelRarity(modelName) {
  const model = models.find(m => m.model === modelName);
  return model ? model.rarity : 'undefined';
}

import rarityColors from './utils/rarityColors.mjs';

function generateProgressBar(value, increment, emoji) {
  return emoji.repeat(Math.floor(value / increment));
}


export async function sendAvatarProfileEmbedFromObject(avatar) {
  if (!avatar || typeof avatar !== 'object') {
    throw new Error('Invalid avatar object provided.');
  }

  const {
    _id,
    name,
    emoji,
    short_description,
    description,
    imageUrl,
    channelId,
    model,
    createdAt,
    updatedAt,
    stats,
    traits,
    innerMonologueThreadId,
    templateId,
  } = avatar;

  if (!channelId || typeof channelId !== 'string') {
    throw new Error(`Invalid channel ID: ${channelId}`);
  }

  try {
    const channel = await client.channels.fetch(channelId);
    if (!channel || !channel.isTextBased()) {
      throw new Error(`Channel not found or is not a text channel: ${channelId}`);
    }

    // Get or create webhook
    const webhookClient = await getOrCreateWebhook(channel);
    if (!webhookClient) {
      throw new Error(`Failed to get or create webhook for channel ${channelId}`);
    }

    // Convert rarity to tier
    const rarityToTier = {
      legendary: 'S',
      rare: 'A',
      uncommon: 'B',
      common: 'C',
      undefined: 'U'
    };

    // Determine the rarity and tier of the model
    const rarity = getModelRarity(model);
    const tier = rarityToTier[rarity.toLowerCase()] || 'U';
    const embedColor = rarityColors[rarity.toLowerCase()] || rarityColors['undefined'];

    // Create the embed using EmbedBuilder
    const avatarEmbed = new EmbedBuilder()
      .setColor(embedColor)
      .setTitle(`${emoji} ${name}`)
      .setURL(
        innerMonologueThreadId
          ? `https://discord.com/channels/${channel.guildId}/${channelId}/${innerMonologueThreadId}`
          : `https://discord.com/users/${channel.guildId}`
      )
      .setAuthor({
        name: `${name} ${emoji}`,
        iconURL: imageUrl,
        url: innerMonologueThreadId
          ? `https://discord.com/channels/${channel.guildId}/${channelId}/${innerMonologueThreadId}`
          : `https://discord.com/users/${channel.guildId}`,
      })
      .setDescription(
        short_description ||
        (description
          ? description.substring(0, 77) + (description.length > 77 ? '...' : '')
          : 'No description found.')
      )
      .setThumbnail(imageUrl)
      .addFields(
        {
          name: '🎂 Summonsday',
          value: `<t:${Math.floor(new Date(createdAt || Date.now()).getTime() / 1000)}:F>`,
          inline: true,
        },
        {
          name: `🧠 Tier ${tier}`,
          value: model || 'N/A',
          inline: true,
        },
      )
      .setImage(imageUrl)
      .setTimestamp(new Date(updatedAt || Date.now()))
      .setFooter({
        text: `Profile of ${name}`,
        iconURL: imageUrl,
      });

    if (traits) {
      avatarEmbed.addFields({
        name: '🧬 Traits',
        value: traits,
        inline: false,
      });
    }

    if (innerMonologueThreadId) {
      avatarEmbed.addFields({
        name: '🧵 Inner Monologue Thread',
        value: `<#${innerMonologueThreadId}>`,
        inline: false,
      });
    }

    // Add Dungeon Stats if available
    if (stats) {
      const { attack, defense, hp } = stats;
      const attackBar = generateProgressBar(attack, 5, '⚔️');
      const defenseBar = generateProgressBar(defense, 5, '🛡️');
      const hpBar = generateProgressBar(hp, 33, '❣️'); // Example max HP logic

      avatarEmbed.addFields({
        name: 'Attack / Defense / HP',
        value: `${attackBar} / ${defenseBar} / ${hpBar}`,
        inline: true,
      });
    } else {
      avatarEmbed.addFields(
        { name: '⚔️ Attack', value: 'N/A', inline: true },
        { name: '🛡️ Defense', value: 'N/A', inline: true },
        { name: '❤️ HP', value: 'N/A', inline: true }
      );
    }

    const components = [];
    if (templateId) {
      // Fetch collectionId from crossmint_dev collection
      const db = this.client.db;
      const crossmintData = await db.collection('crossmint_dev').findOne({ avatarId: _id });
      const collectionId = crossmintData?.collectionId || process.env.CROSSMINT_COLLECTION_ID;

      const collectButton = new ButtonBuilder()
        .setLabel('Collect')
        .setStyle(ButtonStyle.Link)
        .setURL(`${process.env.PUBLIC_URL}/checkout.html?templateId=${templateId}&collectionId=${collectionId}`);
      const actionRow = new ActionRowBuilder().addComponents(collectButton);
      components.push(actionRow);
    }

    await webhookClient.send({
      embeds: [avatarEmbed],
      components,
      threadId: channel.isThread() ? channelId : undefined,
      username: `🔮 ${name.slice(0, 80)}`,
      avatarURL: imageUrl,
    });

    logger.info(`Sent avatar profile for ${name} via webhook to channel ${channelId}`);
  } catch (error) {
    logger.error(`Failed to send avatar profile to channel ${channelId}: ${error.message}`);
  }
}


/**
 * Sends a message via webhook with a custom username and avatar.
 * @param {string} channelId - The ID of the channel to send the message in.
 * @param {string} content - The content of the message.
 * @param {string} username - The username to display for the webhook message.
 * @param {string} avatarUrl - The URL of the avatar to display for the webhook message.
 */
export async function sendAsWebhook(channelId, content, username, avatarUrl) {
  if (!channelId || typeof channelId !== 'string') {
    throw new Error(`Invalid channel ID: ${channelId}`);
  }

  try {
    const channel = await client.channels.fetch(channelId);
    if (!channel || !channel.isTextBased()) {
      throw new Error('Channel not accessible or not text-based');
    }

    // If this is a thread, fetch the parent channel
    const targetChannel = channel.isThread() ? channel.parent : channel;
    if (!targetChannel) {
      throw new Error(`Parent channel not found for thread ${channelId}`);
    }

    const webhook = await getOrCreateWebhook(targetChannel);
    const preparedContent = processMessageLinks(content, client);
    const chunks = chunkMessage(preparedContent);

    for (const chunk of chunks) {
      await webhook.send({
        content: chunk,
        username: username.slice(0, 80), // Discord limits to 80 chars
        avatarURL: avatarUrl,
        threadId: channel.isThread() ? channelId : undefined,
      });
    }

    logger.info(`Sent message to channel ${channelId} via webhook`);
  } catch (error) {
    logger.error(`Failed to send message to channel ${channelId} via webhook: ${error.message}`);
  }
}

/**
 * Fetches recent messages from a channel.
 * @param {Client} client - The Discord client instance.
 * @param {string} channelId - The ID of the channel to fetch messages from.
 * @param {number} limit - The number of messages to fetch.
 * @returns {Promise<Array>} - An array of message objects.
 */
export async function getRecentMessages(client, channelId, limit = 10) {
  try {
    const channel = await client.channels.fetch(channelId);
    if (!channel) {
      throw new Error(`Channel with ID ${channelId} not found.`);
    }

    const messages = await channel.messages.fetch({ limit });
    logger.info(`Fetched ${messages.size} recent messages from channel ${channelId}`);
    return Array.from(messages.values());
  } catch (error) {
    logger.error(`Failed to fetch recent messages from channel ${channelId}: ${error.message}`);
    return [];
  }
}

client.on('messageCreate', async (message) => {
  try {
    // Ignore DMs and messages without a guild
    if (!message.guild) return;

    // Load config and check whitelist
    const config = await configService.get('whitelistedGuilds');
    const whitelistedGuilds = Array.isArray(config) ? config : [];

    // Only process messages from whitelisted guilds
    if (!whitelistedGuilds.includes(message.guild.id)) {
      return;
    }

  } catch (error) {
    logger.error(`Error processing message: ${error.message}`);
  }
});

client.login(discordConfig.botToken);