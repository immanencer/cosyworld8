// discordService.mjs
import {
  Client,
  GatewayIntentBits,
  Partials,
  WebhookClient,
  EmbedBuilder,
} from 'discord.js';
import { chunkMessage } from './utils/messageChunker.mjs';
import { processMessageLinks } from './utils/linkProcessor.mjs';
import models from '../models.config.mjs';
import rarityColors from './utils/rarityColors.mjs';

import { BasicService } from './basicService.mjs';

export class DiscordService extends BasicService {
  constructor(services) {
    super(services, [
      'logger',
      'configService',
      'databaseService'
    ]);
    this.webhookCache = new Map();
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
      ],
      partials: [Partials.Message, Partials.Channel, Partials.Reaction],
    });
    this.db = services.databaseService.getDatabase();
    this.setupEventListeners();
  }

  async initialize() {
    const discordConfig = this.configService.getDiscordConfig();
    if (!discordConfig?.botToken) {
      this.logger.error('Discord bot token not configured.');
      throw new Error('Discord bot token is required');
    }
    await this.client.login(discordConfig.botToken);
    this.logger.info('Discord client logged in');
  }

  async shutdown() {
    if (this.client) {
      await this.client.destroy();
      this.logger.info('Disconnected from Discord.');
    }
  }

  setupEventListeners() {
    this.client.once('ready', async () => {
      this.logger.info(`Bot is ready as ${this.client.user.tag}`);
      await this.updateConnectedGuilds();
      await this.updateDetectedGuilds();
      this.client.guildWhitelist = new Map(); // Initialize guild whitelist cache
    });

    this.client.on('guildCreate', async guild => {
      this.logger.info(`Joined guild: ${guild.name} (${guild.id})`);
      await this.updateConnectedGuilds();
      await this.updateDetectedGuilds();
    });

    this.client.on('guildDelete', async guild => {
      this.logger.info(`Left guild: ${guild.name} (${guild.id})`);
      if (!this.db) return;
      try {
        await this.db.collection('connected_guilds').deleteOne({ id: guild.id });
      } catch (error) {
        this.logger.error(`Failed to remove guild ${guild.id} from database: ${error.message}`);
      }
    });
  }

  // Utility Methods (moved from module scope to class)

  async updateConnectedGuilds() {
    if (!this.db) {
      this.logger.error('Database not connected, cannot update guilds');
      return;
    }
    try {
      const connectedGuilds = this.client.guilds.cache.map(guild => ({
        id: guild.id,
        name: guild.name,
        memberCount: guild.memberCount,
        icon: guild.icon,
        updatedAt: new Date(),
      }));
      this.logger.info(`Updating ${connectedGuilds.length} connected guilds`);
      if (connectedGuilds.length > 0) {
        const bulkOps = connectedGuilds.map(guild => ({
          updateOne: {
            filter: { id: guild.id },
            update: { $set: guild },
            upsert: true,
          },
        }));
        await this.db.collection('connected_guilds').bulkWrite(bulkOps);
      }
    } catch (error) {
      this.logger.error('Error updating connected guilds: ' + error.message);
      throw error;
    }
  }

  async updateDetectedGuilds() {
    if (!this.db) {
      this.logger.error('Database not connected, cannot update detected guilds');
      return;
    }
    try {
      const allGuilds = this.client.guilds.cache.map(guild => ({
        id: guild.id,
        name: guild.name,
        memberCount: guild.memberCount,
        icon: guild.icon,
        detectedAt: new Date(),
        updatedAt: new Date(),
      }));
      this.logger.info(`Updating ${allGuilds.length} detected guilds from Discord client's cache`);
      if (allGuilds.length > 0) {
        const bulkOps = allGuilds.map(guild => ({
          updateOne: {
            filter: { id: guild.id },
            update: { $set: guild },
            upsert: true,
          },
        }));
        await this.db.collection('detected_guilds').bulkWrite(bulkOps);
      }
    } catch (error) {
      this.logger.error('Error updating detected guilds: ' + error.message);
    }
  }

  validateAvatar(avatar) {
    if (!avatar || typeof avatar !== 'object') throw new Error('Avatar must be a valid object');
    if (!avatar.name || typeof avatar.name !== 'string') throw new Error('Avatar name is required and must be a string');
    if (!avatar.imageUrl || typeof avatar.imageUrl !== 'string') throw new Error('Avatar imageUrl is required and must be a string');
  }

  async getOrCreateWebhook(channel) {
    if (!channel || !channel.isTextBased()) {
      this.logger.error('Invalid or non-text-based channel provided for webhook');
      return null;
    }
    try {
      const targetChannel = channel.isThread() ? await channel.parent.fetch() : channel;
      if (!targetChannel) throw new Error('Unable to fetch target channel');
      if (this.webhookCache.has(targetChannel.id)) return this.webhookCache.get(targetChannel.id);
      const webhooks = await targetChannel.fetchWebhooks();
      let webhook = webhooks.find(wh => wh.owner.id === this.client.user.id);
      if (!webhook) {
        webhook = await targetChannel.createWebhook({
          name: 'Multi-Avatar Bot Webhook',
          avatar: this.client.user.displayAvatarURL(),
        });
        this.logger.info(`Created webhook for channel ${targetChannel.id}`);
      }
      const webhookClient = new WebhookClient({ id: webhook.id, token: webhook.token });
      this.webhookCache.set(targetChannel.id, webhookClient);
      return webhookClient;
    } catch (error) {
      this.logger.error(`Failed to get/create webhook for channel ${channel.id}: ${error.message}`);
      return null;
    }
  }

  async sendAsWebhook(channelId, content, avatar) {
    try {
      this.validateAvatar(avatar);
      if (!channelId || typeof channelId !== 'string') throw new Error('Invalid channel ID');
      if (!content || typeof content !== 'string') throw new Error('Content is required and must be a string');
      const channel = await this.client.channels.fetch(channelId);
      if (!channel || !channel.isTextBased()) throw new Error('Channel not accessible or not text-based');
      const webhook = await this.getOrCreateWebhook(channel);
      if (!webhook) throw new Error('Failed to obtain webhook');
      const username = `${avatar.name.slice(0, 78)}${avatar.emoji || ''}`.slice(0, 80);
      const prefix = `${username}: `;
      const trimmed = content.startsWith(prefix) ? content.slice(prefix.length) : content;
      const preparedContent = processMessageLinks(trimmed, this.client);
      const chunks = chunkMessage(preparedContent);

      let sentMessage = null;

      for (const chunk of chunks) {
        sentMessage = await webhook.send({
          content: chunk,
          username,
          avatarURL: avatar.imageUrl,
          threadId: channel.isThread() ? channelId : undefined,
        });
      }
      this.logger.info(`Sent message to channel ${channelId} as ${username}`);
      return sentMessage;  
    } catch (error) {
      this.logger.error(`Failed to send webhook message to ${channelId}: ${error.message}`);
    }
  }

  async sendAvatarProfileEmbedFromObject(avatar, targetChannelId, services) {
    this.validateAvatar(avatar);
    const channelId = targetChannelId || avatar.channelId;
    if (!channelId || typeof channelId !== 'string') throw new Error('Invalid channel ID in avatar object');
    if (targetChannelId && targetChannelId !== avatar.channelId) {
      this.logger.debug(`Overriding avatar ${avatar.name}'s channelId ${avatar.channelId} with ${targetChannelId}`);
    }
    if (!this.db) {
      this.logger.error('Database not connected, cannot send avatar profile');
      return;
    }
    try {
      const channel = await this.client.channels.fetch(channelId);
      if (!channel || !channel.isTextBased()) throw new Error(`Channel not found or not text-based: ${channelId}`);
      const webhook = await this.getOrCreateWebhook(channel);
      if (!webhook) throw new Error('Failed to obtain webhook');
      const embed = await this.buildAvatarEmbed(avatar, services);
      const components = await this.buildAvatarComponents(avatar, services);
      await webhook.send({
        embeds: [embed],
        components,
        username: `${avatar.name.slice(0, 78)}${avatar.emoji || ''}`.slice(0, 80),
        avatarURL: avatar.imageUrl,
        threadId: channel.isThread() ? channelId : undefined,
      });
      this.logger.info(`Sent avatar profile for ${avatar.name} to channel ${channelId}`);
    } catch (error) {
      this.logger.error(`Failed to send avatar profile to ${channelId}: ${error.message}`);
    }
  }

  async buildAvatarEmbed(avatar, services) {
    // Destructure avatar properties
    const {
      _id,
      name,
      emoji,
      short_description,
      description,
      imageUrl,
      model,
      createdAt,
      updatedAt,
      traits,
      innerMonologueThreadId,
      channelId,
      stats,
      inventory = [], // Default to empty array if missing
    } = avatar;
  
    // Get rarity and color for the embed
    const rarity = this.getModelRarity(model);
    const embedColor = rarityColors[rarity.toLowerCase()] || rarityColors.undefined;
    const tier = { legendary: 'S', rare: 'A', uncommon: 'B', common: 'C', undefined: 'U' }[rarity.toLowerCase()] || 'U';
  
  
    // Create the embed
    const embed = new EmbedBuilder()
      .setColor(embedColor)
      .setTitle(`${emoji} ${name}`)
      .setURL(innerMonologueThreadId ? `https://discord.com/channels/${channelId}/${innerMonologueThreadId}` : null)
      .setAuthor({ name: `${name} ${emoji || ''}`, iconURL: imageUrl })
      .setDescription((short_description || (description ? description.slice(0, 4096) : 'No description available')).split('. ')[0] + '.') // Truncate to first sentence;
      .setThumbnail(imageUrl)
      .addFields(
        { name: '🎂 Summonsday', value: `<t:${Math.floor(new Date(createdAt || Date.now()).getTime() / 1000)}:F>`, inline: true },
        { name: `🧠 Tier ${tier}`, value: model || 'N/A', inline: true }
      );
  
    // Add D&D-style stats and health
    if (stats) {
      const { strength, dexterity, constitution, intelligence, wisdom, charisma, hp } = stats;

      // Calculate modifiers and derived stats
      const conModifier = Math.floor((constitution - 10) / 2);
      const maxHp = 10 + conModifier; // Assuming level 1 with d10 hit die
      const dexModifier = Math.floor((dexterity - 10) / 2);
      const ac = 10 + dexModifier; // Base AC without armor
      
      // Combine all stats into a single string
      const statsString = [
        `🛡️ AC ${ac} ❤️ HP ${hp} / ${maxHp}`,
        `-# ⚔️ ${strength} 🏃 ${dexterity} 🩸 ${constitution}`,
        `-# 🧠 ${intelligence} 🌟 ${wisdom} 💬 ${charisma}`,
      ].join('\n');
      
      // Add the single field to the embed
      embed.addFields({
        name: 'Stats',
        value: statsString,
        inline: false
      });
    }
  
    // Add inventory
    if (inventory && inventory.length > 0) {
      const inventoryList = inventory.map(item => `• ${item.name}`).join('\n');
      // Truncate if too long to avoid exceeding field limit (1024 characters)
      const truncatedList = inventoryList.length > 1000 ? `${inventoryList.slice(0, 997)}...` : inventoryList;
      embed.addFields({ name: '🎒 Inventory', value: truncatedList || 'No items', inline: false });
    } else {
      embed.addFields({ name: '🎒 Inventory', value: 'Empty', inline: false });
    }
  
    // Add optional fields
    if (traits) embed.addFields({ name: '🧬 Traits', value: traits, inline: false });
    if (innerMonologueThreadId) embed.addFields({ name: '🧵 Inner Monologue', value: `<#${innerMonologueThreadId}>`, inline: false });
  
    // Set footer and image
    embed
      .setImage(imageUrl)
      .setTimestamp(new Date(updatedAt || Date.now()))
      .setFooter({ text: `Profile of ${name}`, iconURL: imageUrl });
  
    return embed;
  }

  async buildAvatarComponents(avatar) {
    const components = [];
    try {
      const crossmintData = await this.db.collection('crossmint_dev').findOne({ avatarId: avatar._id, chain: 'base' });
      // Add button logic if needed (commented out in original)
    } catch (error) {
      this.logger.error(`Failed to fetch crossmint data for avatar ${avatar._id}: ${error.message}`);
    }
    return components;
  }

  generateProgressBar(value, increment, emoji) {
    const count = Math.min(Math.floor(value / increment), 10);
    return emoji.repeat(count);
  }

  getModelRarity(modelName) {
    const model = models.find(m => m.model === modelName);
    return model ? model.rarity : 'undefined';
  }

  async reactToMessage(message, emoji) {
    if (!message || !emoji || typeof emoji !== 'string') {
      this.logger.error('Invalid message or emoji for reaction');
      return;
    }
    try {
      await message.react(emoji);
      this.logger.info(`Reacted to message ${message.id} with ${emoji}`);
    } catch (error) {
      this.logger.error(`Failed to react to message ${message.id}: ${error.message}`);
    }
  }

  async replyToMessage(message, replyContent) {
    if (!message || !replyContent || typeof replyContent !== 'string') {
      this.logger.error('Invalid message or reply content');
      return;
    }
    try {
      await message.reply(replyContent);
      this.logger.info(`Replied to message ${message.id}`);
    } catch (error) {
      this.logger.error(`Failed to reply to message ${message.id}: ${error.message}`);
    }
  }

  async getRecentMessages(channelId, limit = 10) {
    if (!channelId || typeof channelId !== 'string' || limit < 1 || limit > 100) {
      this.logger.error('Invalid channel ID or limit for fetching messages');
      return [];
    }
    try {
      const channel = await this.client.channels.fetch(channelId);
      if (!channel || !channel.isTextBased()) throw new Error('Channel not found or not text-based');
      const messages = await channel.messages.fetch({ limit });
      return Array.from(messages.values());
    } catch (error) {
      this.logger.error(`Failed to fetch messages from ${channelId}: ${error.message}`);
      return [];
    }
  }
}