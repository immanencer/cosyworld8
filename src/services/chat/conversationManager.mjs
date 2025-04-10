import { handleCommands } from '../commands/commandHandler.mjs';
import { BasicService } from '../foundation/basicService.mjs';
import { MapService } from '../map/mapService.mjs';

const GUILD_NAME = process.env.GUILD_NAME || 'The Guild';

export class ConversationManager extends BasicService {
  constructor(services) {
    super(services);
    this.services = services;
    this.logger = services.logger;
    this.databaseService = services.databaseService;
    this.aiService = services.aiService;
    this.discordService = services.discordService;
    this.avatarService = services.avatarService;
    this.memoryService = services.memoryService;
    this.promptService = services.promptService;
    this.configService = services.configService;
    this.mapService = services.mapService;

    this.GLOBAL_NARRATIVE_COOLDOWN = 60 * 60 * 1000; // 1 hour
    this.lastGlobalNarrativeTime = 0;
    this.channelLastMessage = new Map();
    this.CHANNEL_COOLDOWN = 5 * 1000; // 5 seconds
    this.MAX_RESPONSES_PER_MESSAGE = 2;
    this.channelResponders = new Map();
    this.requiredPermissions = ['ViewChannel', 'SendMessages', 'ReadMessageHistory', 'ManageWebhooks'];
   
    this.db = this.databaseService.getDatabase();
  }

  async checkChannelPermissions(channel) {
    try {
      if (!channel.guild) {
        this.logger.warn(`Channel ${channel.id} has no associated guild.`);
        return false;
      }
      const member = channel.guild.members.cache.get(this.discordService.client.user.id);
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
      if (!this.db) {
        this.logger.error('DB not initialized yet. Narrative generation aborted.');
        return null;
      }
      if (Date.now() - this.lastGlobalNarrativeTime < this.GLOBAL_NARRATIVE_COOLDOWN) {
        return null;
      }
      if (!avatar.model) {
        avatar.model = await this.aiService.selectRandomModel();
        await this.avatarService.updateAvatar(avatar);
      }

      const kgContext = await this.services.knowledgeService.queryKnowledgeGraph(avatar._id);
      const chatMessages = await this.promptService.getNarrativeChatMessages(avatar);

      // Inject KG context into user prompt
      if (chatMessages && chatMessages.length > 0) {
        const userMsg = chatMessages.find(m => m.role === 'user');
        if (userMsg) {
          userMsg.content = `Knowledge Graph:\n${kgContext}\n\n${userMsg.content}`;
        }
      }

      const narrative = await this.aiService.chat(chatMessages, { model: avatar.model, max_tokens: 2048 });
      if (!narrative) {
        this.logger.error(`No narrative generated for ${avatar.name}.`);
        return null;
      }

      await this.memoryService.storeNarrative(avatar._id, narrative);
      avatar = await this.memoryService.updateNarrativeHistory(avatar, narrative);
      avatar.prompt = await this.promptService.getFullSystemPrompt(avatar, this.db);
      avatar.dynamicPrompt = narrative;
      await this.avatarService.updateAvatar(avatar);
      this.lastGlobalNarrativeTime = Date.now();

      // Update KG with new narrative
      await this.services.knowledgeService.updateKnowledgeGraph(avatar._id, narrative, this.services.creationService);

      return narrative;
    } catch (error) {
      this.logger.error(`Error generating narrative for ${avatar.name}: ${error.message}`);
      throw error;
    }
  }

  async getLastNarrative(avatarId) {
    return this.memoryService.getLastNarrative(avatarId);
  }

  async storeNarrative(avatarId, content) {
    return this.memoryService.storeNarrative(avatarId, content);
  }

  async getChannelContext(channelId, limit = 50) {
    try {
      this.logger.info(`Fetching channel context for channel ${channelId}`);
      if (this.db) {
        try {
          const messagesCollection = this.db.collection('messages');
          const messages = await messagesCollection
            .find({ channelId })
            .sort({ timestamp: -1 })
            .limit(limit)
            .toArray();
          if (messages && messages.length > 0) {
            this.logger.debug(`Retrieved ${messages.length} messages from database for channel ${channelId}`);
            return messages.reverse();
          }
        } catch (dbError) {
          this.logger.error(`Database error fetching messages: ${dbError.message}`);
        }
      }
      const channel = await this.discordService.client.channels.fetch(channelId);
      if (!channel) {
        this.logger.warn(`Channel ${channelId} not found`);
        return [];
      }
      const discordMessages = await channel.messages.fetch({ limit });
      const formattedMessages = Array.from(discordMessages.values())
        .map(msg => ({
          messageId: msg.id,
          channelId: msg.channel.id,
          authorId: msg.author.id,
          authorUsername: msg.author.username,
          content: msg.content,
          hasImages: msg.attachments.some(a => a.contentType?.startsWith('image/')) || msg.embeds.some(e => e.image || e.thumbnail),
          imageDescription: null, // Rely on database for this
          timestamp: msg.createdTimestamp,
        }))
        .sort((a, b) => a.timestamp - b.timestamp);
      this.logger.debug(`Retrieved ${formattedMessages.length} messages from Discord API for channel ${channelId}`);
      if (this.db) {
        const messagesCollection = this.db.collection('messages');
        await Promise.all(formattedMessages.map(msg =>
          messagesCollection.updateOne(
            { messageId: msg.messageId },
            { $set: msg },
            { upsert: true }
          )
        ));
      }
      return formattedMessages;
    } catch (error) {
      this.logger.error(`Error fetching channel context for channel ${channelId}: ${error.message}`);
      return [];
    }
  }

  async getChannelSummary(avatarId, channelId) {
    if (!this.db) {
      this.logger.error('DB not initialized. Cannot fetch channel summary.');
      return '';
    }
    const summariesCollection = this.db.collection('channel_summaries');
    const messagesCollection = this.db.collection('messages');
    const summaryDoc = await summariesCollection.findOne({ avatarId, channelId });
    let messagesToSummarize = [];
    if (summaryDoc) {
      const lastUpdated = summaryDoc.lastUpdated;
      messagesToSummarize = await messagesCollection
        .find({ channelId, timestamp: { $gt: lastUpdated } })
        .sort({ timestamp: 1 })
        .toArray();
      if (messagesToSummarize.length < 50) return summaryDoc.summary;
    } else {
      messagesToSummarize = await messagesCollection
        .find({ channelId })
        .sort({ timestamp: -1 })
        .limit(50)
        .toArray();
      messagesToSummarize.reverse();
    }
    if (messagesToSummarize.length === 0) return summaryDoc ? summaryDoc.summary : '';
    const avatar = await this.avatarService.getAvatarById(avatarId);
    if (!avatar) {
      this.logger.error(`Avatar ${avatarId} not found for summarization.`);
      return summaryDoc ? summaryDoc.summary : '';
    }
    const messagesText = messagesToSummarize.map(msg =>
      `${msg.authorUsername || 'User'}: ${msg.content || '[No content]'}${msg.imageDescription ? ` [Image: ${msg.imageDescription}]` : ''}`
    ).join('\n');
    let prompt;
    if (summaryDoc) {
      prompt = `
  You are ${avatar.name}.
  Previous channel summary:
  ${summaryDoc.summary}
  New conversation:
  ${messagesText}
  Update the summary to incorporate the new conversation, focusing on key events, interactions, and how they relate to you.
      `.trim();
    } else {
      prompt = `
  You are ${avatar.name}.
  Summarize the following conversation from your perspective, focusing on key events, interactions, and how they relate to you.
  Conversation:
  ${messagesText}
      `.trim();
    }
    const summary = await this.aiService.chat([
      { role: 'system', content: avatar.prompt || `You are ${avatar.name}. ${avatar.personality}` },
      { role: 'user', content: prompt }
    ], { model: avatar.model, max_tokens: 500 });
    if (!summary) {
      this.logger.error(`Failed to generate summary for avatar ${avatar.name} in channel ${channelId}`);
      return summaryDoc ? summaryDoc.summary : '';
    }
    const lastMessage = messagesToSummarize[messagesToSummarize.length - 1];
    const lastUpdated = lastMessage.timestamp;
    const lastMessageId = lastMessage.messageId;
    if (summaryDoc) {
      await summariesCollection.updateOne(
        { _id: summaryDoc._id },
        { $set: { summary, lastUpdated, lastMessageId } }
      );
    } else {
      await summariesCollection.insertOne({ avatarId, channelId, summary, lastUpdated, lastMessageId });
    }
    return summary;
  }

  async updateNarrativeHistory(avatar, content) {
    return this.memoryService.updateNarrativeHistory(avatar, content);
  }

  removeAvatarPrefix(response, avatar) {
    const prefixes = [`${avatar.name} ${avatar.emoji}:`, `${avatar.emoji} ${avatar.name}:`, `${avatar.name}:`];
    for (const prefix of prefixes) {
      if (response.startsWith(prefix)) return response.slice(prefix.length).trim();
    }
    return response;
  }

  async sendResponse(channel, avatar, presetResponse = null) {
    if (!await this.checkChannelPermissions(channel)) {
      this.logger.error(`Cannot send response - missing permissions in channel ${channel.id}`);
      return null;
    }
    const lastMessageTime = this.channelLastMessage.get(channel.id) || 0;
    if (Date.now() - lastMessageTime < this.CHANNEL_COOLDOWN) {
      this.logger.debug(`Channel ${channel.id} is on cooldown`);
      return null;
    }
    if (!this.channelResponders.has(channel.id)) this.channelResponders.set(channel.id, new Set());
    const responders = this.channelResponders.get(channel.id);
    if (responders.size >= this.MAX_RESPONSES_PER_MESSAGE) {
      this.logger.debug(`Channel ${channel.id} has reached maximum responses`);
      return null;
    }
    if (responders.has(avatar._id)) {
      this.logger.debug(`Avatar ${avatar.name} has already responded in channel ${channel.id}`);
      return null;
    }
    try {
      let response = presetResponse;
      if (!response) {
      const messages = await channel.messages.fetch({ limit: 50 });
      const imagePromptParts = [];
      let recentImageMessage = null;
      for (const msg of Array.from(messages.values()).reverse()) {
        if (msg.author.id === avatar._id) continue;
        const hasImages = msg.attachments.some(a => a.contentType?.startsWith('image/')) || msg.embeds.some(e => e.image || e.thumbnail);
        if (hasImages) {
          recentImageMessage = msg;
          break;
        }
      }
      if (recentImageMessage && this.aiService.supportsMultimodal) {
        const attachment = recentImageMessage.attachments.find(a => a.contentType?.startsWith('image/'));
        if (attachment) {
          imagePromptParts.push({ type: 'image_url', image_url: { url: attachment.url } });
          this.logger.info(`Using image URL ${attachment.url} for multimodal input`);
        }
      }
      const channelHistory = await this.getChannelContext(channel.id, 50);
      const channelSummary = await this.getChannelSummary(avatar._id, channel.id);
      let chatMessages = await this.promptService.getResponseChatMessages(avatar, channel, channelHistory, channelSummary, this.db);
      let userContent = chatMessages.find(msg => msg.role === 'user').content;
      if (this.aiService.supportsMultimodal && imagePromptParts.length > 0) {
        userContent = [...imagePromptParts, { type: 'text', text: userContent }];
        chatMessages = chatMessages.map(msg => msg.role === 'user' ? { role: 'user', content: userContent } : msg);
      }
      response = await this.aiService.chat(chatMessages, { model: avatar.model, max_tokens: 256 });
      if (!response) {
        this.logger.error(`Empty response generated for ${avatar.name}`);
        return null;
      }
      response = this.removeAvatarPrefix(response, avatar);
    }

      const finalText = response;
      if (finalText && finalText.trim()) {
        const thinkRegex = /<think>(.*?)<\/think>/gs;
        const thoughts = [];
        const cleanedText = finalText.replace(thinkRegex, (match, thought) => {
          thoughts.push(thought.trim());
          return '';
        }).trim();
        if (thoughts.length > 0) {
          avatar.narrativeHistory = avatar.narrativeHistory || [];
          const guildName = GUILD_NAME;
          thoughts.forEach(thought => {
            if (thought) {
              const narrativeData = { timestamp: Date.now(), content: thought, guildName };
              avatar.narrativeHistory.unshift(narrativeData);
            }
          });
          avatar.narrativeHistory = avatar.narrativeHistory.slice(0, 5);
          avatar.narrativesSummary = avatar.narrativeHistory
            .map(r => `[${new Date(r.timestamp).toLocaleDateString()}] ${r.guildName}: ${r.content}`)
            .join('\n\n');
          await this.avatarService.updateAvatar(avatar);
        }
        if (cleanedText) {
          let sentMessage = await this.discordService.sendAsWebhook(channel.id, cleanedText, avatar);
          if (!sentMessage) {
            this.logger.error(`Failed to send message in channel ${channel.id}`);
            return null;
          }
          let guild = await this.discordService.getGuildByChannelId(channel.id);
          if (!guild) {
            this.logger.error(`Guild not found for channel ${avatar.channelId}`);
            return null;
          }
          sentMessage.guildId = guild.id;
          sentMessage.channel = channel;

          handleCommands(sentMessage, {
            mapService: this.mapService,
            toolService: this.toolService,
            avatarService: this.avatarService,
            discordService: this.discordService,
            configService: this.configService
          }, avatar);
        }
      }
      this.channelLastMessage.set(channel.id, Date.now());
      this.channelResponders.get(channel.id).add(avatar._id);
      setTimeout(() => this.channelResponders.set(channel.id, new Set()), this.CHANNEL_COOLDOWN);
      return response;
    } catch (error) {
      this.logger.error(`CONVERSATION: Error sending response for ${avatar.name}: ${error.message}`);
      throw error;
    }
  }
}