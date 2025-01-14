import { MongoClient } from 'mongodb';

import { sendAsWebhook } from '../discordService.mjs';
import { MemoryService } from '../memoryService.mjs';

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

    // Cooldowns and timing
    this.channelCooldowns = new Map();
    this.COOLDOWN_TIME = 6 * 60 * 60 * 1000; // 6 hours
    this.SUMMARY_LIMIT = 5;
    this.IDLE_TIME = 60 * 60 * 1000;        // 1 hour
    this.lastUpdate = Date.now();

    // Update cooldown times
    this.HUMAN_RESPONSE_COOLDOWN = 5000;     // 5 seconds for human messages
    this.BOT_RESPONSE_COOLDOWN = 300000;     // 5 minutes for bot messages
    this.INITIAL_RESPONSE_COOLDOWN = 10000;  // 10 seconds after joining channel

    // Required Discord permissions
    this.requiredPermissions = [
      'ViewChannel',
      'SendMessages',
      'ReadMessageHistory',
      'ManageWebhooks'
    ];

    // Create and store a single MongoDB connection for the instance
    this.dbClient = null;
    this.db = null;
    this._initializeDb().catch(err =>
      this.logger.error(`Failed to initialize DB: ${err.message}`)
    );
  }

  /**
   * Initializes the MongoDB client and database connection, ensuring a single instance is used.
   */
  async _initializeDb() {
    if (!process.env.MONGO_URI || !process.env.MONGO_DB_NAME) {
      this.logger.error('MongoDB URI or Database Name not provided in environment variables.');
      return;
    }

    try {
      this.dbClient = new MongoClient(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });

      await this.dbClient.connect();
      this.db = this.dbClient.db(process.env.MONGO_DB_NAME);
      this.logger.info('Successfully connected to MongoDB.');
    } catch (error) {
      this.logger.error(`Error connecting to MongoDB: ${error.message}`);
      throw error;
    }
  }

  /**
   * Checks if the bot has all required permissions in the specified channel.
   * @param {*} channel 
   * @returns {boolean}
   */
  async checkChannelPermissions(channel) {
    try {
      if (!channel.guild) {
        this.logger.warn(`Channel ${channel.id} has no associated guild.`);
        return false;
      }

      const member = channel.guild.members.cache.get(this.client.user.id);
      if (!member) return false;

      const permissions = channel.permissionsFor(member);
      const missingPermissions = this.requiredPermissions.filter(perm =>
        !permissions.has(perm)
      );

      if (missingPermissions.length > 0) {
        this.logger.warn(
          `Missing permissions in channel ${channel.id}: ${missingPermissions.join(', ')}`
        );
        return false;
      }
      return true;
    } catch (error) {
      this.logger.error(`Permission check error for channel ${channel.id}: ${error.message}`);
      return false;
    }
  }

  /**
   * Generates a narrative or reflection for an avatar, respecting cooldowns.
   * This narrative can be used to update the avatar's dynamic prompts.
   * @param {*} avatar 
   * @returns {string | null} The generated narrative (if any).
   */
  async generateNarrative(avatar) {
    try {
      if (!this.db) {
        this.logger.error('DB not initialized yet. Narrative generation aborted.');
        return null;
      }

      const lastNarrative = await this.getLastNarrative(avatar._id);
      if (lastNarrative && Date.now() - lastNarrative.timestamp < this.COOLDOWN_TIME) {
        this.logger.info(`Narrative cooldown active for ${avatar.name}`);
        return null;
      }

      // Ensure avatar has a model selected
      if (!avatar.model) {
        avatar.model = await this.aiService.selectRandomModel();
        await this.avatarService.updateAvatar(avatar);
      }

      // Gather memories
      const memoryRecords = await this.memoryService.getMemories(avatar._id);
      const memories = (memoryRecords || []).map(m => m.memory).join('\n');

      // Build narrative prompt
      const prompt = this.buildNarrativePrompt(avatar, memories);

      // Call AI service
      const narrative = await this.aiService.chat([
        {
          role: 'system',
          content: avatar.prompt || `You are ${avatar.name}. ${avatar.personality}`
        },
        { role: 'assistant', content: `I remember: ${memories}` },
        { role: 'user', content: prompt }
      ], { model: avatar.model });

      // Store the narrative and update the avatar
      await this.storeNarrative(avatar._id, narrative);
      this.updateNarrativeHistory(avatar, narrative);

      // Build/refresh the avatar prompts
      avatar.prompt = await this.buildSystemPrompt(avatar);
      avatar.dynamicPrompt = narrative;
      await this.avatarService.updateAvatar(avatar);

      return narrative;
    } catch (error) {
      this.logger.error(`Error generating narrative for ${avatar.name}: ${error.message}`);
      return null;
    }
  }

  /**
   * Builds the prompt for the narrative generation based on avatar info and memories.
   * @param {*} avatar 
   * @param {string} memories 
   * @returns {string}
   */
  buildNarrativePrompt(avatar, memories) {
    return `
I am ${avatar.name || ''}.

${avatar.personality || ''}

${avatar.description || ''}

${memories}
    `.trim();
  }

  /**
   * Stores the given narrative in the 'narratives' collection.
   * @param {*} avatarId 
   * @param {string} content 
   */
  async storeNarrative(avatarId, content) {
    try {
      if (!this.db) {
        this.logger.error('DB not initialized. Cannot store narrative.');
        return;
      }
      await this.db.collection('narratives').insertOne({
        avatarId,
        content,
        timestamp: Date.now()
      });
    } catch (error) {
      this.logger.error(`Error storing narrative for avatar ${avatarId}: ${error.message}`);
    }
  }

  /**
   * Retrieves the last narrative for the specified avatar.
   * @param {*} avatarId 
   * @returns {Object | null} The last narrative document.
   */
  async getLastNarrative(avatarId) {
    try {
      if (!this.db) {
        this.logger.error('DB not initialized. Cannot fetch narrative.');
        return null;
      }
      const lastNarrative = await this.db.collection('narratives').findOne(
        {
          $or: [
            { avatarId },
            { avatarId: avatarId.toString() },
            { avatarId: { $exists: false } }
          ]
        },
        { sort: { timestamp: -1 } }
      );
      return lastNarrative;
    } catch (error) {
      this.logger.error(`Error fetching last narrative for avatar ${avatarId}: ${error.message}`);
      return null;
    }
  }

  /**
   * Updates the avatar's narrative history and optionally posts an update
   * to the avatar's inner monologue channel.
   * @param {*} avatar 
   * @param {string} content 
   */
  updateNarrativeHistory(avatar, content) {
    if (!content) return;

    if (avatar.innerMonologueChannel) {
      // Post dynamic personality to the inner monologue channel
      sendAsWebhook(
        avatar.innerMonologueChannel,
        `🌪️ Dynamic Personality Update: ${avatar.dynamicPersonality || ''}`,
        `${avatar.name} ${avatar.emoji}`,
        avatar.imageUrl
      );
    }

    const guildName = GUILD_NAME;
    const narrativeData = { timestamp: Date.now(), content, guildName };
    avatar.narrativeHistory = avatar.narrativeHistory || [];
    avatar.narrativeHistory.unshift(narrativeData);
    avatar.narrativeHistory = avatar.narrativeHistory.slice(0, this.SUMMARY_LIMIT);

    avatar.narrativesSummary = avatar.narrativeHistory
      .map(r => `[${new Date(r.timestamp).toLocaleDateString()}] ${r.guildName}: ${r.content}`)
      .join('\n\n');
  }

  /**
   * Sends a response in-character for the specified avatar, if conditions allow.
   * @param {*} channel 
   * @param {*} avatar 
   * @returns {string | null} The response from the AI, if any.
   */
  async sendResponse(channel, avatar) {
    if (!await this.checkChannelPermissions(channel)) {
      this.logger.error(`Cannot send response - missing permissions in channel ${channel.id}`);
      return null;
    }

    try {
      // Fetch recent channel messages
      const messages = await channel.messages.fetch({ limit: 18 });
      const messageHistory = messages
        .reverse()
        .map(msg => ({
          author: msg.author.username,
          content: msg.content,
          timestamp: msg.createdTimestamp
        }));

      // If the last message was from this avatar, skip responding
      if (messageHistory[messageHistory.length - 1]?.author === avatar.name) {
        return null;
      }

      // Retrieve last narrative for context
      const lastNarrative = await this.getLastNarrative(avatar._id);

      // Build context for the AI
      const context = {
        recentMessages: messageHistory,
        lastReflection: lastNarrative?.content || 'No previous reflection',
        channelName: channel.name,
        guildName: channel.guild?.name || 'Unknown Guild'
      };

      // Ensure avatar has a model
      if (!avatar.model || typeof avatar.model !== 'string') {
        avatar.model = await this.aiService.selectRandomModel();
        await this.avatarService.updateAvatar(avatar);
      }

      avatar.channelName = channel.name;

      // Build system and dungeon prompts
      const systemPrompt = await this.buildSystemPrompt(avatar);
      const dungeonPrompt = await this.buildDungeonPrompt(avatar);

      // Generate response via AI service
      let response = await this.aiService.chat([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: dungeonPrompt },
        { role: 'assistant', content: lastNarrative?.content || 'No previous reflection' },
        {
          role: 'user',
          content: `
Channel: #${context.channelName} in ${context.guildName}
Recent messages:
${context.recentMessages.map(m => `${m.author}: ${m.content}`).join('\n')}

In general, your response should be short. No more than two or three funny sentences. you don't need to use capital letters or proper spelling. have fun.

You are ${avatar.name}. Respond to the chat in character, advancing your goals and keeping others engaged.

          `.trim()
        }
      ], { model: avatar.model });

      if (!response) {
        this.logger.error(`Empty response generated for ${avatar.name}`);
        return null;
      }

      // Remove leading "AvatarName:" if present
      if (response.startsWith(`${avatar.name}:`)) {
        response = response.replace(`${avatar.name}:`, '').trim();
      }

      // Truncate overly long responses at a newline near 2000 chars
      if (response.length > 2000) {
        this.logger.warn(`Truncating response for ${avatar.name} to avoid exceed Discord limit`);
        const safeIndex = response.lastIndexOf('\n', 1500);
        if (safeIndex > 0) {
          response = response.substring(0, safeIndex);
        } else {
          response = response.substring(0, 1500);
        }
      }

      // Extract and process dungeon tool commands
      const { commands, cleanText } = this.dungeonService.extractToolCommands(response);

      let sentMessage = null;
      let commandResults = [];

      // If there are commands, process them first
      if (commands.length > 0) {
        this.logger.info(`Processing ${commands.length} command(s) for ${avatar.name}`);

        commandResults = await Promise.all(
          commands.map(cmd =>
            this.dungeonService.processAction(
              { channel, author: { id: avatar._id, username: avatar.name }, content: response },
              cmd.command,
              cmd.params,
              avatar
            )
          )
        );

        if (commandResults.length) {
          sentMessage = await sendAsWebhook(
            avatar.channelId,
            commandResults.join('\n'),
            `🛠️ ${avatar.name}`,
            avatar.imageUrl
          );
        }
        // Refresh avatar after potential state changes from commands
        avatar = await this.avatarService.getAvatarById(avatar._id);
      }

      // Send main text response if there's leftover clean text or if no commands were used
      const finalText = commands.length ? cleanText : response;
      if (finalText && finalText.trim()) {
        sentMessage = await sendAsWebhook(
          avatar.channelId,
          finalText.trim(),
          avatar.name,
          avatar.imageUrl
        );
      }

      return response;
    } catch (error) {
      this.logger.error(`Error sending response for ${avatar.name}: ${error.message}`);
      return null;
    }
  }

  /**
   * Constructs a dungeon prompt indicating possible commands and current location info.
   * @param {*} avatar 
   * @returns {string}
   */
  async buildDungeonPrompt(avatar) {
    const commandsDescription = this.dungeonService.getCommandsDescription(avatar) || '';
    const location = await this.dungeonService.getLocationDescription(avatar.channelId, avatar.channelName);
    const locationText = location
      ? `You are currently in ${location.name}. ${location.description}`
      : `You are in ${avatar.channelName || 'a chat channel'}.`;

    return `
These commands are available in this location (you can also use breed and summon):
${commandsDescription}

${locationText}
    `.trim();
  }

  /**
   * Builds the system prompt for the AI model, incorporating the avatar's identity and last narrative.
   * @param {*} avatar 
   * @returns {string}
   */
  async buildSystemPrompt(avatar) {
    const lastNarrative = await this.getLastNarrative(avatar._id);
    return `
You are ${avatar.name}.

${avatar.personality}

${lastNarrative ? lastNarrative.content : ''}
    `.trim();
  }
}
