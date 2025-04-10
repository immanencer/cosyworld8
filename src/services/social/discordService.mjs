// discordService.mjs
import {
  Client,
  GatewayIntentBits,
  Partials,
  WebhookClient,
} from 'discord.js';
import { ObjectId } from 'mongodb';
import { chunkMessage } from '../utils/messageChunker.mjs';
import { processMessageLinks } from '../utils/linkProcessor.mjs';
import models from '../ai/models.config.mjs';
import { buildMiniAvatarEmbed, buildFullAvatarEmbed, buildMiniLocationEmbed, buildFullItemEmbed, buildFullLocationEmbed } from './discordEmbedLibrary.mjs';

export class DiscordService {
  constructor(services) {
    this.logger = services.logger;
    this.configService = services.configService;
    this.databaseService = services.databaseService;
    
    this.db = this.databaseService.getDatabase();
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
    this.setupEventListeners();

    this.messageCache = new Map(); // Initialize message cache
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

    this.client.on('interactionCreate', async interaction => {
      try {
        if (!interaction.isButton()) return;
        const { customId } = interaction;
        if (!customId.startsWith('view_full_')) return;

        await interaction.deferReply({ flags: 64 });

        const parts = customId.split('_');
        const type = parts[2];
        const id = ObjectId.createFromHexString(parts.slice(3).join('_'));

        let embedData;
        if (type === 'avatar') {
          const avatar = await this.db.collection('avatars').findOne({ _id: id });
          if (!avatar) return interaction.editReply('Avatar not found.');
          embedData = buildFullAvatarEmbed(avatar);
        } else if (type === 'item') {
          const item = await this.db.collection('items').findOne({ _id: id });
          if (!item) return interaction.editReply('Item not found.');
          embedData = buildFullItemEmbed(item);
        } else if (type === 'location') {
          const location = await this.db.collection('locations').findOne({ _id: id });
          if (!location) return interaction.editReply('Location not found.');
          embedData = buildFullLocationEmbed(location);
        } else {
          return interaction.editReply('Unknown profile type.');
        }

        await interaction.editReply({ embeds: [embedData.embed], components: embedData.components || [] });
      } catch (error) {
        this.logger.error('Interaction handler error: ' + error.message);
        try {
          if (interaction.deferred || interaction.replied) {
            await interaction.editReply('Failed to load profile.');
          } else {
            await interaction.reply({ content: 'Failed to load profile.', flags: 64 });
          }
        } catch (err) {
          this.logger.error('Failed to send error reply: ' + err.message);
        }
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
          username: username.replace(/discord/ig, ''),
          avatarURL: avatar.imageUrl || this.client.user.displayAvatarURL(),
          threadId: channel.isThread() ? channelId : undefined,
        });
      }
      this.logger.info(`Sent message to channel ${channelId} as ${username}`);
      sentMessage.rati = {
        avatarId: avatar.id,
      };
      sentMessage.guild = channel.guild;
      sentMessage.channel = channel;
      this.databaseService.saveMessage(sentMessage);
      this.logger.info(`Saved message to database with ID ${sentMessage.id}`);
      return sentMessage;
    } catch (error) {
      this.logger.error(`Failed to send webhook message to ${channelId}: ${error.message}`);
    }
  }

  async sendAvatarEmbed(avatar, targetChannelId, aiService) {
    this.validateAvatar(avatar);
    const channelId = targetChannelId || avatar.channelId;
    if (!channelId || typeof channelId !== 'string') {
      throw new Error('Invalid channel ID in avatar object');
    }
    try {
      const channel = await this.client.channels.fetch(channelId);
      const guildId = channel.guild?.id;
      const { embed, components } = buildFullAvatarEmbed(avatar, { guildId, aiService });
      await this.sendEmbedAsWebhook(channelId, embed, avatar.name, avatar.imageUrl, components);
    } catch (error) {
      this.logger.error(`Failed to send avatar embed to ${channelId}: ${error.message}`);
    }
  }

  async sendMiniAvatarEmbed(avatar, channelId, message = '') {
    try {
      const { embed, components } = buildMiniAvatarEmbed(avatar, message);
      await this.sendEmbedAsWebhook(channelId, embed, avatar.name, avatar.imageUrl, components);
    } catch (error) {
      this.logger.error(`Failed to send mini avatar embed: ${error.message}`);
    }
  }

  async sendLocationEmbed(location, items, avatars, channelId) {
    if (!channelId || typeof channelId !== 'string') {
      throw new Error('Invalid channel ID');
    }
    try {
      const { embed, components } = buildMiniLocationEmbed(location, items, avatars);
      await this.sendEmbedAsWebhook(channelId, embed, 'Location Update', this.client.user.displayAvatarURL(), components);
    } catch (error) {
      this.logger.error(`Failed to send location embed to ${channelId}: ${error.message}`);
    }
  }

  async sendEmbedAsWebhook(channelId, embed, username, avatarURL, components = []) {
    try {
      if (!channelId || typeof channelId !== 'string') throw new Error('Invalid channel ID');
      if (!embed) throw new Error('Embed is required');

      const channel = await this.client.channels.fetch(channelId);
      if (!channel || !channel.isTextBased()) throw new Error('Channel not accessible or not text-based');

      const webhook = await this.getOrCreateWebhook(channel);
      if (!webhook) throw new Error('Failed to obtain webhook');

      await webhook.send({
        embeds: [embed],
        username: username ? username.slice(0, 80) : undefined,
        avatarURL,
        threadId: channel.isThread() ? channelId : undefined,
        components,
      });

      this.logger.info(`Sent embed to channel ${channelId} as ${username}`);
    } catch (error) {
      this.logger.error(`Failed to send embed to ${channelId}: ${error.message}`);
      throw error;
    }
  }

  async getGuildByChannelId(channelId) {
    this.logger.info(`Fetching guild for channel ID: ${channelId}`);
    try {
      const channel = await this.client.channels.fetch(channelId);
      if (!channel || !channel.isTextBased()) throw new Error('Channel not accessible or not text-based');
      const guild = await this.client.guilds.fetch(channel.guild.id);
      return guild;
    }
    catch (error) {
      this.logger.error(`Failed to fetch guild for channel ID ${channelId}: ${error.message}`);
      throw error;
    }
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
    try {        
      if (!message) throw new Error('Message not found');
      if (!message.react) {
        // Try to fetch the message if it's a partial
        message = this.client.channels.cache.get(message.channel.id).messages.cache.get(message.id);
      }
      if (!message || !emoji || typeof emoji !== 'string') {
        this.logger.error('Invalid message or emoji for reaction');
        return;
      }
      await message.react(emoji);
      this.logger.info(`Reacted to message ${message.id} with ${emoji}`);
    } catch (error) {
      this.logger.error(`Failed to react to message ${message?.id}: ${error?.message}`);
    }
  }

  async replyToMessage(message, replyContent) {
    try {
      if (!message.reply) {
        // Try to fetch the message if it's a partial
        message = this.client.channels.cache.get(message.channel.id).messages.cache.get(message.id);
        if (!message) throw new Error('Message not found');
      }
      if (!message || !replyContent || typeof replyContent !== 'string') {
        this.logger.error('Invalid message or reply content');
        return;
      }
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