import { MongoClient } from 'mongodb';
import { MemoryService } from '../memoryService.mjs';
import { PromptService } from '../promptService.mjs';

const GUILD_NAME = process.env.GUILD_NAME || 'The Guild';

export class ConversationManager {
  constructor(services) {
    this.services = services;
    this.logger = services.logger;
    this.GLOBAL_NARRATIVE_COOLDOWN = 60 * 60 * 1000; // 1 hour
    this.lastGlobalNarrativeTime = 0;
    this.channelLastMessage = new Map();
    this.CHANNEL_COOLDOWN = 5 * 1000; // 5 seconds
    this.MAX_RESPONSES_PER_MESSAGE = 2;
    this.channelResponders = new Map();
    this.requiredPermissions = ['ViewChannel', 'SendMessages', 'ReadMessageHistory', 'ManageWebhooks'];
    this.dbClient = null;
    this.db = null;
    this._initializeDb().catch(err => this.logger.error(`Failed to initialize DB: ${err.message}`));
  }

  async _initializeDb() {
    if (!process.env.MONGO_URI || !process.env.MONGO_DB_NAME) {
      this.logger.error('MongoDB URI or Database Name not provided in environment variables.');
      return;
    }
    try {
      this.dbClient = new MongoClient(process.env.MONGO_URI);
      await this.dbClient.connect();
      this.db = this.dbClient.db(process.env.MONGO_DB_NAME);
      this.logger.info('Successfully connected to MongoDB.');
    } catch (error) {
      this.logger.error(`Error connecting to MongoDB: ${error.message}`);
      throw error;
    }
  }

  async checkChannelPermissions(channel) {
    try {
      if (!channel.guild) {
        this.logger.warn(`Channel ${channel.id} has no associated guild.`);
        return false;
      }
      const member = channel.guild.members.cache.get(this.services.discordService.client.user.id);
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
        this.logger.info('Global narrative cooldown active. Skipping narrative generation.');
        return null;
      }
      if (!avatar.model) {
        avatar.model = await this.services.aiService.selectRandomModel();
        await this.services.avatarService.updateAvatar(avatar);
      }
      const chatMessages = await this.services.promptService.getNarrativeChatMessages(avatar);
      const narrative = await this.services.aiService.chat(chatMessages, { model: avatar.model, max_tokens: 2048 });
      if (!narrative) {
        this.logger.error(`No narrative generated for ${avatar.name}.`);
        return null;
      }
      await this.storeNarrative(avatar._id, narrative);
      this.updateNarrativeHistory(avatar, narrative);
      avatar.prompt = await this.services.promptService.getFullSystemPrompt(avatar, this.db);
      avatar.dynamicPrompt = narrative;
      await this.services.avatarService.updateAvatar(avatar);
      this.lastGlobalNarrativeTime = Date.now();
      return narrative;
    } catch (error) {
      this.logger.error(`Error generating narrative for ${avatar.name}: ${error.message}`);
      return null;
    }
  }

  async storeNarrative(avatarId, content) {
    try {
      if (!this.db) {
        this.logger.error('DB not initialized. Cannot store narrative.');
        return;
      }
      await this.db.collection('narratives').insertOne({ avatarId, content, timestamp: Date.now() });
    } catch (error) {
      this.logger.error(`Error storing narrative for avatar ${avatarId}: ${error.message}`);
    }
  }

  async getLastNarrative(avatarId) {
    try {
      if (!this.db) {
        this.logger.error('DB not initialized. Cannot fetch narrative.');
        return null;
      }
      return await this.db.collection('narratives').findOne(
        { $or: [{ avatarId }, { avatarId: avatarId.toString() }] },
        { sort: { timestamp: -1 } }
      );
    } catch (error) {
      this.logger.error(`Error fetching last narrative for avatar ${avatarId}: ${error.message}`);
      return null;
    }
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
      const channel = await this.client.channels.fetch(channelId);
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
    const avatar = await this.services.avatarService.getAvatarById(avatarId);
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
    const summary = await this.services.aiService.chat([
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
    if (!content) return;
    if (avatar.innerMonologueChannel) {
      await this.services.discordService.sendAsWebhook(avatar.innerMonologueChannel, `-# [Narrative Update ${Date.now().toLocaleString()}] \n\n ${content}`, avatar);
    }
    const guildName = GUILD_NAME;
    const narrativeData = { timestamp: Date.now(), content, guildName };
    avatar.narrativeHistory = avatar.narrativeHistory || [];
    avatar.narrativeHistory.unshift(narrativeData);
    avatar.narrativeHistory = avatar.narrativeHistory.slice(0, 5);
    avatar.narrativesSummary = avatar.narrativeHistory
      .map(r => `[${new Date(r.timestamp).toLocaleDateString()}] ${r.guildName}: ${r.content}`)
      .join('\n\n');
  }

  removeAvatarPrefix(response, avatar) {
    const prefixes = [`${avatar.name} ${avatar.emoji}:`, `${avatar.emoji} ${avatar.name}:`, `${avatar.name}:`];
    for (const prefix of prefixes) {
      if (response.startsWith(prefix)) return response.slice(prefix.length).trim();
    }
    return response;
  }

  async sendResponse(channel, avatar) {
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
      if (recentImageMessage && this.services.aiService.supportsMultimodal) {
        const attachment = recentImageMessage.attachments.find(a => a.contentType?.startsWith('image/'));
        if (attachment) {
          imagePromptParts.push({ type: 'image_url', image_url: { url: attachment.url } });
          this.logger.info(`Using image URL ${attachment.url} for multimodal input`);
        }
      }
      const channelHistory = await this.getChannelContext(channel.id, 50);
      const channelSummary = await this.getChannelSummary(avatar._id, channel.id);
      let chatMessages = await this.services.promptService.getResponseChatMessages(avatar, channel, channelHistory, channelSummary, this.db);
      let userContent = chatMessages.find(msg => msg.role === 'user').content;
      if (this.services.aiService.supportsMultimodal && imagePromptParts.length > 0) {
        userContent = [...imagePromptParts, { type: 'text', text: userContent }];
        chatMessages = chatMessages.map(msg => msg.role === 'user' ? { role: 'user', content: userContent } : msg);
      }
      let response = await this.services.aiService.chat(chatMessages, { model: avatar.model, max_tokens: 1024 });
      if (!response) {
        this.logger.error(`Empty response generated for ${avatar.name}`);
        return null;
      }
      response = this.removeAvatarPrefix(response, avatar);
      const { commands, cleanText } = this.services.toolService.extractToolCommands(response);
      let sentMessage = null;
      let commandResults = [];
      if (commands.length > 0) {
        this.logger.info(`Processing ${commands.length} command(s) for ${avatar.name}`);
        commandResults = await Promise.all(
          commands.map(cmd =>
            this.services.toolService.processAction(
              { channel, author: { id: avatar._id, username: avatar.name }, content: response },
              cmd.command,
              cmd.params,
              avatar,
              this.services
            )
          )
        );
        if (commandResults.length) {
          sentMessage = await this.services.discordService.sendAsWebhook(
            avatar.channelId,
            commandResults.map(t => `-# [${t}]`).join('\n'),
            { name: `${avatar.name.split(',')[0]} used a command`, emoji: `🛠️`, imageUrl: avatar.imageUrl }
          );
        }
        avatar = await this.services.avatarService.getAvatarById(avatar._id);
      }
      const finalText = commands.length ? cleanText : response;
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
          await this.services.avatarService.updateAvatar(avatar);
        }
        if (cleanedText) {
          sentMessage = await this.services.discordService.sendAsWebhook(avatar.channelId, cleanedText, avatar);
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