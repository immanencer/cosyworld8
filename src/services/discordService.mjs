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
      'databaseService',
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

  buildAvatarEmbed(avatar) {
    try {
      this.validateAvatar(avatar);

      const {
        name,
        emoji = '',
        short_description,
        description,
        imageUrl,
        model,
        createdAt,
        updatedAt,
        traits,
        stats,
        summoner,
        inventory = [],
      } = avatar;

      const rarity = this.getModelRarity(model);
      const embedColor = rarityColors[rarity.toLowerCase()] || rarityColors.undefined;
      const tier = { legendary: 'S', rare: 'A', uncommon: 'B', common: 'C', undefined: 'U' }[rarity.toLowerCase()] || 'U';

      const embed = new EmbedBuilder()
        .setColor(embedColor)
        .setTitle(`${emoji} ${name}`)
        .setDescription(short_description || (description ? description.split('. ')[0] + '.' : 'No description available'))
        .setThumbnail(imageUrl)
        .addFields(
          { name: '🎂 Summonsday', value: `<t:${Math.floor(new Date(createdAt || Date.now()).getTime() / 1000)}:F>`, inline: true },
          { name: `🧠 Tier ${tier}`, value: model || 'N/A', inline: true },
        )
        .setImage(imageUrl)
        .setTimestamp(new Date(updatedAt || Date.now()))
        .setFooter({ text: `Profile of ${name}`, iconURL: imageUrl });

      if (stats) {
        const { strength, dexterity, constitution, intelligence, wisdom, charisma, hp } = stats;
        const conModifier = Math.floor((constitution - 10) / 2);
        const maxHp = 10 + conModifier;
        const dexModifier = Math.floor((dexterity - 10) / 2);
        const ac = 10 + dexModifier;

        const statsString = [
          `🛡️ AC ${ac} ❤️ HP ${hp} / ${maxHp}`,
          `-# ⚔️ ${strength} 🏃 ${dexterity} 🩸 ${constitution}`,
          `-# 🧠 ${intelligence} 🌟 ${wisdom} 💬 ${charisma}`,
        ].join('\n');

        embed.addFields({ name: 'Stats', value: statsString, inline: false });
      }

      if (inventory.length > 0) {
        const inventoryList = inventory.map(item => `• ${item.name}`).join('\n');
        const truncatedList = inventoryList.length > 1000 ? `${inventoryList.slice(0, 997)}...` : inventoryList;
        embed.addFields({ name: '🎒 Inventory', value: truncatedList || 'No items', inline: false });
      } else {
        embed.addFields({ name: '🎒 Inventory', value: 'Empty', inline: false });
      }

      if (traits) embed.addFields({ name: '🧬 Traits', value: traits, inline: false });

      return embed;
    } catch (error) {
      this.logger.error(`Error building avatar embed: ${error.message}`);
      throw error;
    }
  }

  buildLocationEmbed(location, items = [], avatars = []) {
    try {
      if (!location || typeof location !== 'object') throw new Error('Invalid location object');

      const { name, description, imageUrl, rarity = 'common' } = location;
      const embedColor = rarityColors[rarity.toLowerCase()] || rarityColors.undefined;

      const embed = new EmbedBuilder()
        .setColor(embedColor)
        .setTitle(name)
        .setDescription(description ? description.split('. ')[0] + '.' : 'No description available')
        .setImage(imageUrl)
        .addFields(
          { name: 'Rarity', value: rarity, inline: true },
          { name: 'Items', value: `${items.length}` || 'None', inline: true },
          { name: 'Avatars', value: `${avatars.length}` || 'None', inline: true }
        )
        .setTimestamp()
        .setFooter({ text: 'Location Update' });

      return embed;
    } catch (error) {
      this.logger.error(`Error building location embed: ${error.message}`);
      throw error;
    }
  }

  async sendEmbedAsWebhook(channelId, embed, username, avatarURL) {
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

  async sendAvatarEmbed(avatar, targetChannelId) {
    this.validateAvatar(avatar);
    const channelId = targetChannelId || avatar.channelId;
    if (!channelId || typeof channelId !== 'string') {
      throw new Error('Invalid channel ID in avatar object');
    }
    try {
      const embed = await this.buildAvatarEmbed(avatar);
      await this.sendEmbedAsWebhook(channelId, embed, avatar.name, avatar.imageUrl);
    } catch (error) {
      this.logger.error(`Failed to send avatar embed to ${channelId}: ${error.message}`);
    }
  }
  async sendLocationEmbed(location, items, avatars, channelId) {
    if (!channelId || typeof channelId !== 'string') {
      throw new Error('Invalid channel ID');
    }
    try {
      const embed = this.buildLocationEmbed(location, items, avatars);
      await this.sendEmbedAsWebhook(channelId, embed, 'Location Update', this.client.user.displayAvatarURL());
    } catch (error) {
      this.logger.error(`Failed to send location embed to ${channelId}: ${error.message}`);
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