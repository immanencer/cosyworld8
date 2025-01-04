// discordService.js

import {
  Client,
  GatewayIntentBits,
  Partials,
  WebhookClient,
  EmbedBuilder
} from 'discord.js';
import winston from 'winston';

import { chunkMessage } from './utils/messageChunker.mjs';
import { processMessageLinks } from './utils/linkProcessor.mjs';

// Initialize Logger
const logger = winston.createLogger({
  level: 'info',
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



// Instantiate the Discord client with necessary permissions
export const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});


// Webhook management cache
const webhookCache = new Map();

/**
 * Reacts to a message with a specified emoji.
 * @param {Client} client - The Discord client instance.
 * @param {string} channelId - The ID of the channel containing the message.
 * @param {string} messageId - The ID of the message to react to.
 * @param {string} emoji - The emoji to react with.
 */
export async function reactToMessage(client, channelId, messageId, emoji) {
  try {
    const channel = await client.channels.fetch(channelId);
    if (!channel) throw new Error(`Channel with ID ${channelId} not found.`);
    const message = await channel.messages.fetch(messageId);
    if (!message) throw new Error(`Message with ID ${messageId} not found.`);
    await message.react(emoji);
    logger.info(`Reacted to message ${messageId} in channel ${channelId} with ${emoji}`);
  } catch (error) {
    logger.error(`Failed to react to message ${messageId} in channel ${channelId}: ${error.message}`);
  }
}

/**
 * Replies to a specific message.
 * @param {Client} client - The Discord client instance.
 * @param {string} channelId - The ID of the channel containing the message.
 * @param {string} messageId - The ID of the message to reply to.
 * @param {string} replyContent - The content of the reply.
 */
export async function replyToMessage(channelId, messageId, replyContent) {
  try {
    const channel = await client.channels.fetch(channelId);
    if (!channel) throw new Error(`Channel with ID ${channelId} not found.`);
    const message = await channel.messages.fetch(messageId);
    if (!message) throw new Error(`Message with ID ${messageId} not found.`);
    await message.reply(replyContent);
    logger.info(`Replied to message ${messageId} in channel ${channelId} with: ${replyContent}`);
  } catch (error) {
    logger.error(`Failed to reply to message ${messageId} in channel ${channelId}: ${error.message}`);
  }
}

/**
 * Creates or fetches a webhook for a given channel.
 * @param {Client} client - The Discord client instance.
 * @param {Channel} channel - The Discord channel object.
 * @returns {WebhookClient|null} - The webhook client or null if failed.
 */
async function getOrCreateWebhook(channel) {
  try {

    if (channel.isThread()) {
      channel = await channel.parent.fetch();
    }


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
    logger.error(`Failed to create or fetch webhook for channel ${channel.id}: ${error.message}`);
    throw error;
  }
}


import models from '../models.config.mjs';
/**
 * Finds the rarity of a given model.
 * @param {string} modelName - The name of the model.
 * @returns {string} - The rarity level ('common', 'uncommon', 'rare', 'legendary').
 */
function getModelRarity(modelName) {
  const model = models.find(m => m.model === modelName);
  return model ? model.rarity : 'undefined'; // Default to 'common' if not found
}

import rarityColors from './utils/rarityColors.mjs';

function generateProgressBar(value, increment, emoji) {
  return emoji.repeat(Math.floor(value / increment));
}

/**
 * Sends an avatar profile as an embed via webhook with a custom username and avatar.
 * Includes dungeon stats such as Attack, Defense, and HP.
 * @param {Client} client - The Discord client instance.
 * @param {Object} avatar - The avatar object containing profile information.
 */
export async function sendAvatarProfileEmbedFromObject(avatar) {
  if (!avatar || typeof avatar !== 'object') {
    throw new Error('Invalid avatar object provided.');
  }

  const {
    _id, // Assuming _id is used to fetch dungeon stats
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
    traits, // Assuming 'traits' is a string; adjust if it's an array
    innerMonologueThreadId, // Optional
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

    // Determine the rarity of the model
    const rarity = getModelRarity(model);
    const embedColor = rarityColors[rarity.toLowerCase()] || rarityColors['no_model']; // Default to 'no_model' gray

    // Create the embed using EmbedBuilder
    const avatarEmbed = new EmbedBuilder()
      .setColor(embedColor) // Set color based on rarity
      .setTitle(`${emoji} ${name}`)
      .setURL(
        innerMonologueThreadId
          ? `https://discord.com/channels/${channel.guildId}/${channelId}/${innerMonologueThreadId}`
          : `https://discord.com/users/${channel.guildId}` // Adjust URL as needed
      )
      .setAuthor({
        name: `${name} ${emoji}`,
        iconURL: imageUrl,
        url: innerMonologueThreadId
          ? `https://discord.com/channels/${channel.guildId}/${channelId}/${innerMonologueThreadId}`
          : `https://discord.com/users/${channel.guildId}`, // Adjust URL as needed
      })
      .setDescription(short_description || description.substring(0, 77) + (description.length > 77 ? '...' : '') || 'No description found.')
      .setThumbnail(imageUrl)
      .addFields(
        {
          name: '🎂 Summonsday',
          value: `<t:${Math.floor(new Date(createdAt || Date.now()).getTime() / 1000)}:F>`,
          inline: true,
        },
        {
          name: `🧠 ${rarity}`,
          value: `${model || 'N/A'}`,
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

    // Add Inner Monologue Thread link if available
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

      // Generate visual progress bars
      const attackBar = generateProgressBar(attack, 5, '⚔️');
      const defenseBar = generateProgressBar(defense, 5, '🛡️');
      const hpBar = generateProgressBar(hp, 33, '❣️'); // Assuming max HP is 1000

      avatarEmbed.addFields(
        {
          name: 'Attack / Defense / HP',
          value: `${attackBar} / ${defenseBar} / ${hpBar} `,
          inline: true,
        },
      );
    } else {
      // If no stats found, indicate so
      avatarEmbed.addFields(
        {
          name: '⚔️ Attack',
          value: 'N/A',
          inline: true,
        },
        {
          name: '🛡️ Defense',
          value: 'N/A',
          inline: true,
        },
        {
          name: '❤️ HP',
          value: 'N/A',
          inline: true,
        }
      );
    }

    // Send the embed via webhook
    await webhookClient.send({
      embeds: [avatarEmbed],
      threadId: channel.isThread() ? channelId : undefined,
      username: `🔮 ${name.slice(0, 80)}`, // Discord limits usernames to 80 characters
      avatarURL: imageUrl,
    });

    console.log(`Sent avatar profile for ${name} via webhook to channel ${channelId}`);
  } catch (error) {
    console.error(`Failed to send avatar profile to channel ${channelId}: ${error.message}`);
    // Optionally, log the error using your logger
    // logger.error(`Failed to send avatar profile to channel ${channelId}: ${error.message}`);
  }
}



/**
 * Sends a message via webhook with a custom username and avatar.
 * @param {Client} client - The Discord client instance.
 * @param {string} channelId - The ID of the channel to send the message in.
 * @param {string} content - The content of the message.
 * @param {string} username - The username to display for the webhook message.
 * @param {string} avatarUrl - The URL of the avatar to display for the webhook message.
 */
export async function sendAsWebhook(channelId, content, username, avatarUrl) {
  try {
    const channel = await client.channels.fetch(channelId);
    if (!channel || !channel.isTextBased()) {
      throw new Error('Channel not accessible or not text-based');
    }
  if (!channelId || typeof channelId !== 'string') {
    throw new Error(`Invalid channel ID: ${channelId}`);
  }
  let channelName = null;

  try {
    const channel = await client.channels.fetch(channelId);
    if (!channel) {
      throw new Error(`Channel not found: ${channelId}`);
    }

    // Get parent channel if this is a thread
    const targetChannel = channel.isThread() ? channel.parent : channel;

    if (!targetChannel) {
      throw new Error(`Parent channel not found for thread ${channelId}`);
    }

    let webhook = await getOrCreateWebhook(targetChannel);

    const chunks = chunkMessage(processMessageLinks(content, client));
    for (const chunk of chunks) {
      // Send to thread if needed, otherwise send to channel
      await webhook.send({
        content: chunk,
        username: username.slice(0, 80),
        avatarURL: avatarUrl,
        threadId: channel.isThread() ? channelId : undefined
      });
      logger.info(`Sent message to channel ${channelId} via webhook`);
    }

  } catch (error) {
    console.error(error);
    console.error(channelName, channelId);
    logger.error(`Failed to send message to channel ${channelId} via webhook: ${error.message}`);
  }
}

/**
 * Fetches recent messages from a channel.
 * @param {Client} client - The Discord client instance.
 * @param {string} channelId - The ID of the channel to fetch messages from.
 * @param {number} limit - The number of messages to fetch.
 * @returns {Array} - An array of message objects.
 */
export async function getRecentMessages(client, channelId, limit = 10) {
  try {
    const channel = await client.channels.fetch(channelId);
    if (!channel) throw new Error(`Channel with ID ${channelId} not found.`);
    const messages = await channel.messages.fetch({ limit });
    logger.info(`Fetched ${messages.size} recent messages from channel ${channelId}`);
    return Array.from(messages.values());
  } catch (error) {
    logger.error(`Failed to fetch recent messages from channel ${channelId}: ${error.message}`);
    return [];
  }
}



