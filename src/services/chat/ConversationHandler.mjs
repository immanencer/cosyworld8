import { MongoClient } from 'mongodb';
import { sendAsWebhook } from '../discordService.mjs';
import { MemoryService } from '../memoryService.mjs';
import { DatabaseService } from '../databaseService.mjs';

const GUILD_NAME = process.env.GUILD_NAME || 'The Guild';

export class ConversationHandler {
  constructor(client, aiService, logger, avatarService, dungeonService) {
    this.client = client;
    this.aiService = aiService;
    this.logger = logger;
    this.avatarService = avatarService;
    this.dungeonService = dungeonService;

    // Memory service for storing and retrieving memories
    this.memoryService = new MemoryService(this.logger);

    // Database Service (Singleton)
    this.dbService = new DatabaseService(this.logger);
    this.db = this.dbService.getDatabase();

    // Global narrative cooldown
    this.GLOBAL_NARRATIVE_COOLDOWN = 60 * 60 * 1000; // 1 hour
    this.lastGlobalNarrativeTime = 0;

    // Channel and avatar rate limiting
    this.channelCooldowns = new Map(); // channelId -> timestamp
    this.avatarCooldowns = new Map(); // avatarId -> timestamp
    this.CHANNEL_COOLDOWN = 5 * 1000; // 5 seconds
    this.AVATAR_COOLDOWN = 10 * 1000; // 10 seconds per avatar
    this.MAX_RESPONSES_PER_MESSAGE = 2; // Max AI responses per human message
    this.channelResponders = new Map(); // channelId -> Set of responding avatar IDs

    this.requiredPermissions = ['ViewChannel', 'SendMessages', 'ReadMessageHistory', 'ManageWebhooks'];
  }

  async checkChannelPermissions(channel) {
    try {
      if (!channel.guild) {
        this.logger.warn(`Channel ${channel.id} has no associated guild.`);
        return false;
      }

      const member = channel.guild.members.cache.get(this.client.user.id);
      if (!member) return false;

      const permissions = channel.permissionsFor(member);
      const missingPermissions = this.requiredPermissions.filter(perm => !permissions.has(perm));

      if (missingPermissions.length > 0) {
        this.logger.warn(`Missing permissions in channel ${channel.id}: ${missingPermissions.join(', ')}`);
        return false;
      }
      return true;
    } catch (error) {
      this.logger.error(`Permission check error for channel ${channel.id}: ${error.message}`);
      return false;
    }
  }

  async generateNarrative(avatar) {
    try {
      if (!this.db) throw new Error('Database not initialized.');

      if (Date.now() - this.lastGlobalNarrativeTime < this.GLOBAL_NARRATIVE_COOLDOWN) {
        this.logger.info('Global narrative cooldown active.');
        return null;
      }

      if (!avatar.model) {
        avatar.model = await this.aiService.selectRandomModel();
        await this.avatarService.updateAvatar(avatar);
      }

      const [memoryRecords, recentActions] = await Promise.all([
        this.memoryService.getMemories(avatar._id),
        this.dungeonService.dungeonLog.getRecentActions(avatar.channelId)
      ]);

      const memories = (memoryRecords || []).map(m => m.memory).join('\n');
      const actions = (recentActions || [])
        .filter(action => action.actorId === avatar._id.toString())
        .map(a => a.description || a.action)
        .join('\n');

      const prompt = this.buildNarrativePrompt(avatar, memories, actions);
      const narrative = await this.aiService.chat([{ role: 'user', content: prompt }], { model: avatar.model });

      if (!narrative) throw new Error(`No narrative generated for ${avatar.name}.`);

      await this.storeNarrative(avatar._id, narrative);
      this.updateNarrativeHistory(avatar, narrative);

      avatar.dynamicPrompt = narrative;
      await this.avatarService.updateAvatar(avatar);

      this.lastGlobalNarrativeTime = Date.now();
      return narrative;
    } catch (error) {
      this.logger.error(`Error generating narrative for ${avatar.name}: ${error.message}`);
      return null;
    }
  }

  async generateHaiku(messages) {
    try {
      return await this.aiService.chat([
        { role: 'system', content: 'You are a haiku poet. Summarize the following chat context in a single haiku.' },
        { role: 'user', content: messages.map(m => `${m.author}: ${m.content}`).join('\n') }
      ]);
    } catch (error) {
      this.logger.error(`Error generating haiku: ${error.message}`);
      return null;
    }
  }


  async fetchRecentMessages(channel) {
    try {
      const messages = await channel.messages.fetch({ limit: 50 });
      return messages.reverse().map(msg => ({
        author: msg.author.username,
        content: msg.content,
        timestamp: msg.createdTimestamp
      }));
    } catch (error) {
      this.logger.error(`Error fetching messages from ${channel.id}: ${error.message}`);
      return [];
    }
  }

  async sendResponse(channel, avatar) {
    if (!await this.checkChannelPermissions(channel)) return null;

    const lastMessageTime = this.channelCooldowns.get(channel.id) || 0;
    if (Date.now() - lastMessageTime < this.CHANNEL_COOLDOWN) return null;

    const avatarLastResponse = this.avatarCooldowns.get(avatar._id) || 0;
    if (Date.now() - avatarLastResponse < this.AVATAR_COOLDOWN) return null;

    if (!this.channelResponders.has(channel.id)) this.channelResponders.set(channel.id, new Set());
    if (this.channelResponders.get(channel.id).size >= this.MAX_RESPONSES_PER_MESSAGE) return null;

    try {
      const messages = await this.fetchRecentMessages(channel);
      if (!messages.length) return null;

      const haiku = await this.generateHaiku(messages);
      const selectedTools = await this.selectTools(haiku, `Channel: ${channel.name}, Recent messages: ${messages.length}`);

      let response = await this.aiService.chat([{ role: 'user', content: haiku }], { model: avatar.model });
      if (!response) throw new Error(`No response generated for ${avatar.name}.`);

      response = response.startsWith(`${avatar.name}:`) ? response.replace(`${avatar.name}:`, '').trim() : response;
      response = response.length > 2000 ? response.substring(0, 1500) : response;

      this.channelCooldowns.set(channel.id, Date.now());
      this.avatarCooldowns.set(avatar._id, Date.now());
      this.channelResponders.get(channel.id).add(avatar._id);

      setTimeout(() => this.channelResponders.set(channel.id, new Set()), this.CHANNEL_COOLDOWN);

      return sendAsWebhook(avatar.channelId, response, avatar.name, avatar.imageUrl);
    } catch (error) {
      this.logger.error(`Error sending response for ${avatar.name}: ${error.message}`);
      return null;
    }
  }

  async buildDungeonPrompt(avatar) {
    const location = await this.dungeonService.getLocationDescription(avatar.channelId, avatar.channelName);
    const locationText = location ? `You are currently in ${location.name}. ${location.description}` : `You are in ${avatar.channelName || 'a chat channel'}.`;

    return `
Commands:
!summon <entity> - (Handled by ToolService)
!breed <avatar1> <avatar2> - (Handled by ToolService)
${this.dungeonService.getCommandsDescription(avatar)}

${locationText}
    `.trim();
  }

  async buildSystemPrompt(avatar) {
    const lastNarrative = await this.getLastNarrative(avatar._id);
    return `
You are ${avatar.name}.
${avatar.personality}
${lastNarrative ? lastNarrative.content : ''}
    `.trim();
  }
}
