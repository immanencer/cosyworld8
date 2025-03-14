import { ConversationHandler } from './ConversationHandler.mjs';
import { DecisionMaker } from './DecisionMaker.mjs';
import { MessageProcessor } from './MessageProcessor.mjs';
import { DatabaseService } from '../databaseService.mjs';
import { sendAsWebhook } from '../discordService.mjs';
import { DungeonService } from '../dungeon/DungeonService.mjs'; // Added import
import { TokenTransferHookInvalidSeed } from '@solana/spl-token';

const RESPONSE_RATE = parseFloat(process.env.RESPONSE_RATE) || 0.2; // 20% response rate
const SERVER_NAME = "Project 89";

export class ChatService {
  constructor(client, db, options = {}) {
    // Ensure logger exists; initialize early for subsequent services.
    this.logger = options.logger || {
      info: () => { },
      error: () => { },
      warn: () => { },
      debug: () => { }
    };

    // Initialize the database service with the logger.
    const dbService = new DatabaseService(this.logger);
    this.db = db || dbService.getDatabase();

    if (!client) {
      throw new Error('Discord client is required');
    }
    this.client = client;
    this.avatarService = options.avatarService;
    this.aiService = options.aiService;
    this.imageProcessingService = options.imageProcessingService; // Added imageProcessingService check

    if (!this.avatarService || !this.aiService || !this.imageProcessingService) {
      throw new Error('avatarService, aiService, and imageProcessingService are required');
    }

    // Initialize core services with logger
    this.dungeonService = new DungeonService(
      client,
      this.logger,
      this.avatarService,
      this.db,
      { summon: options.handleSummonCommand }
    );
    this.conversationHandler = new ConversationHandler(
      client,
      options.aiService,
      this.logger,
      options.avatarService,
      this.dungeonService,
      this.imageService
    );
    this.decisionMaker = new DecisionMaker(options.aiService, this.logger);
    this.messageProcessor = new MessageProcessor(options.avatarService);

    this.retryAttempts = 3;
    this.retryDelay = 5000; // 5 seconds

    // Track initialization state
    this.setupComplete = false;
    this.isConnected = false;

    this.REFLECTION_INTERVAL = 1 * 3600000; // 1 hour
    this.reflectionTimer = 0;
    this.avatarThreads = new Map(); // guildId -> avatarId -> threadId
    this.lastActiveGuild = new Map(); // avatarId -> guildId

    this.lastMessageTime = Date.now();
    this.IDLE_TIMEOUT = 30000; // 30 seconds
    this.idleCheckInterval = null;

    // Bind the method to this instance
    this.updateLastMessageTime = this.updateLastMessageTime.bind(this);

    // Store services from options (already set above)
    this.responseQueue = new Map(); // channelId -> Set of avatarIds to respond
    this.responseTimeout = null;
    this.RESPONSE_DELAY = 3000; // Wait 3 seconds before processing responses

    this.AMBIENT_CHECK_INTERVAL = process.env.AMBIENT_CHECK_INTERVAL || 60 * 60 * 1000; // Check for ambient responses every hour
    this.lastAmbientBurst = new Map();
    this.recentResponders = new Map();
    this.avatarLastResponse = new Map();
  }

  async setupDatabase() {
    try {
      const db = await this.db;

      // Initialize collections if needed
      this.avatarsCollection = db.collection('avatars');
      this.messagesCollection = db.collection('messages');
      this.channelsCollection = db.collection('channels');

      // Ensure indexes
      await Promise.all([
        this.avatarsCollection.createIndex({ name: 1 }),
        this.avatarsCollection.createIndex({ messageCount: -1 }), // Ensure index for leaderboard
        this.messagesCollection.createIndex({ timestamp: 1 }),
        this.channelsCollection.createIndex({ lastActive: 1 })
      ]);

      this.logger.info('Database setup completed');
    } catch (error) {
      this.logger.error('Failed to setup database:', error);
      throw error;
    }
  }

  async setup() {
    try {
      await this.setupAvatarChannelsAcrossGuilds();
      await this.dungeonService.initializeDatabase(); // Added initialization
      await this.setupDatabase(); // Ensure database setup
      this.setupReflectionInterval();
      // update active avatars
      await this.UpdateActiveAvatars();

      this.logger.info('ChatService setup completed');
      this.setupComplete = true;
      this.isConnected = true;
    } catch (error) {
      this.logger.error('Setup failed:', error);
      throw error;
    }
  }

  // Core service methods
  async checkMessages() {
    const avatars = await this.avatarService.getActiveAvatars();
    const validAvatars = avatars.filter(avatar => avatar._id && avatar.name);

    if (validAvatars.length !== avatars.length) {
      this.logger.warn(`${avatars.length - validAvatars.length} avatars were excluded due to missing 'id' or 'name'.`);
    }
  }

  async getLastMentionedAvatars(messages, avatars) {
    // for each message, check if any avatars are mentioned
    const mentionedAvatars = new Set();
    for (const message of messages) {
      for (const avatar of avatars) {
        if (message.content.includes(avatar.name)) {
          mentionedAvatars.add(avatar._id);
        }
      }
    }
    return [...mentionedAvatars];
  }

  // Find the 12 most mentioned avatars
  async getTopMentions(messages, avatars) {
    const avatarMentions = new Map();
    for (const avatar of avatars) {
      avatarMentions.set(avatar._id, 0);
    }

    for (const message of messages) {
      for (const avatar of avatars) {
        if (message.content.includes(avatar.name)) {
          avatarMentions.set(avatar._id, avatarMentions.get(avatar._id) + 1);
        }
      }
    }

    const sortedAvatars = [...avatarMentions.entries()].sort((a, b) => b[1] - a[1]);
    return sortedAvatars.map(([avatarId]) => avatars.find(a => a._id === avatarId));
  }

  // Get the most recent limit messages prior to timestamp if provided or now
  async getRecentMessagesFromDatabase(channelId = null, limit = 100, timestamp = null) {
    try {
      const query = { channelId: channelId || { $exists: true } };
      if (timestamp) {
        query.timestamp = { $lt: timestamp };
      }

      const messages = await this.db.collection('messages')
        .find(query)
        .sort({ timestamp: -1 })
        .limit(limit)
        .toArray();

      return messages.reverse();
    } catch (error) {
      this.logger.error(`Failed to fetch recent messages for channel ${channelId}:`, error);
      return [];
    }
  }

  async UpdateActiveAvatars() {
    const avatars = await this.avatarService.getAvatarsWithRecentMessages();
    const messages = await this.getRecentMessagesFromDatabase(null, 1000);
    const topAvatars = await this.getTopMentions(messages, avatars);

    // Track last forced conversation time per channel
    if (!this.lastForcedConversation) {
      this.lastForcedConversation = new Map();
    }

    const TEN_MINUTES = 10 * 60 * 1000;
    const replyAvatars = topAvatars.sort(() => Math.random() - 0.6).slice(0, 6);

    // Group avatars by channel
    const channelAvatars = new Map();
    for (const avatar of replyAvatars) {
      if (!channelAvatars.has(avatar.channelId)) {
        channelAvatars.set(avatar.channelId, []);
      }
      channelAvatars.get(avatar.channelId).push(avatar);
    }

    // Process each channel
    for (const [channelId, avatars] of channelAvatars) {
      const channel = await this.client.channels.cache.get(channelId);
      if (!channel) {
        this.logger.error(`Channel ${channelId} not found`);
        continue;
      }

      const lastForced = this.lastForcedConversation.get(channelId) || 0;
      const shouldForceConversation = Date.now() - lastForced > TEN_MINUTES;

      if (shouldForceConversation && avatars.length >= 2) {
        // Force a conversation between two random avatars
        const [avatar1, avatar2] = avatars.sort(() => Math.random() - 0.5).slice(0, 2);
        this.lastForcedConversation.set(channelId, Date.now());

        await this.respondAsAvatar(channel, avatar1, true);
        setTimeout(async () => {
          await this.respondAsAvatar(channel, avatar2, true);
        }, 2000);

        continue;
      }

      // Regular ambient responses
      for (const avatar of avatars) {
        if (Math.random() > RESPONSE_RATE) {
          continue;
        }

        try {
          await this.respondAsAvatar(channel, avatar, false);
        } catch (error) {
          this.logger.error(`Error responding as avatar ${avatar.name}: ${error.message}`);
        }
      }
    }

    // Schedule the next update
    setTimeout(() => this.UpdateActiveAvatars(), this.AMBIENT_CHECK_INTERVAL);
  }

  async respondAsAvatar(channel, avatar, forceResponse = false) {
    try {
      if (!channel) {
        this.logger.error(`Invalid channel provided to respondAsAvatar`);
        return;
      }

      if (!this.imageProcessingService) {
        this.logger.error(`imageProcessingService is not initialized`);
        // Set a default value if available through constructor
        this.imageProcessingService = this.options?.imageProcessingService || null;
      }

      this.logger.info(`Attempting to respond as avatar ${avatar?.name} in channel ${channel.id} (force: ${forceResponse})`);
      let decision = true;
      try {
        if (!avatar.innerMonologueChannel) {
          // Find #avatars channel
          const avatarsChannel = channel.guild.channels.cache.find(c => c.name === 'avatars');
          if (avatarsChannel) {
            // Find a thread called avatar.name Narratives
            const innerMonologueChannel = avatarsChannel.threads.cache.find(t => t.name === `${avatar.name} Narratives`);
            if (innerMonologueChannel) {
              avatar.innerMonologueChannel = innerMonologueChannel.id;
            } else {
              // Otherwise create a new thread
              const newThread = await avatarsChannel.threads.create({
                name: `${avatar.name} Narratives`,
                autoArchiveDuration: 60,
                reason: 'Create inner monologue thread for avatar'
              });
              avatar.innerMonologueChannel = newThread.id;

              // Post the avatar's image, description, personality, and dynamic personality to the inner monologue channel
              sendAsWebhook(avatar.innerMonologueChannel, avatar.imageUrl, avatar);
              sendAsWebhook(avatar.innerMonologueChannel, `📖 Description: ${avatar.description}`, avatar);
              sendAsWebhook(avatar.innerMonologueChannel, `🎭 Personality: ${avatar.personality}`, avatar);
              sendAsWebhook(avatar.innerMonologueChannel, `🌪️ Dynamic Personality: ${avatar.dynamicPersonality}`, avatar);
            }
          }
          avatar = await this.avatarService.updateAvatar(avatar);
        }
        decision = forceResponse || await this.decisionMaker.shouldRespond(channel, avatar, this.client, this.avatarService);
      } catch (error) {
        this.logger.error(`Error in decision maker: ${error.message}`);
      }

      if (decision) {
        this.logger.info(`${avatar.name} decided to respond in ${channel.id}`);
        try {
          if (!this.conversationHandler.imageProcessingService && this.imageProcessingService) {
            this.conversationHandler.imageProcessingService = this.imageProcessingService;
          }
          await this.conversationHandler.sendResponse(channel, avatar);
        } catch (error) {
          this.logger.error(`CHAT: Error sending response for ${avatar.name}: ${error.message}`);
        }
      }
    } catch (error) {
      this.logger.error(`Error in respondAsAvatar: ${error.message}`);
      this.logger.error('Avatar data:', avatar);
      throw error;
    }
  }

  async start() {
    try {
      if (!this.setupComplete) {
        await this.setup();
      }

      if (!this.isConnected) {
        throw new Error('ChatService not properly initialized');
      }

      // Force a random reflection on startup
      const avatars = await this.avatarService.getAllAvatars();
      if (avatars.length > 0) {
        const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];
        this.logger.info(`🎯 Forcing startup reflection for ${randomAvatar.name}`);
        await this.conversationHandler.generateNarrative(randomAvatar, SERVER_NAME);
      }

      this.logger.info('✅ ChatService started.');
    } catch (error) {
      this.logger.error(`Failed to start ChatService: ${error.message}`);
      throw error;
    }
  }

  async stop() {
    this.logger.info('Stopping ChatService...');

    // Clear intervals first
    if (this.interval) clearInterval(this.interval);

    this.isConnected = false;
  }

  async setupAvatarChannelsAcrossGuilds() {
    try {
      const guilds = await this.client.guilds.fetch();

      for (const [guildId, guild] of guilds) {
        const fetchedGuild = await guild.fetch();
        let avatarChannel = fetchedGuild.channels.cache.find(c => c.name === 'avatars');

        if (!avatarChannel) {
          avatarChannel = await fetchedGuild.channels.create({
            name: 'avatars',
            topic: 'Avatar reflections and cross-guild interactions'
          });
        }

        if (!this.avatarThreads.has(guildId)) {
          this.avatarThreads.set(guildId, new Map());
        }
      }
    } catch (error) {
      this.logger.error('Failed to setup avatar channels:', error);
    }
  }

  setupReflectionInterval() {
    setInterval(async () => {
      const avatars = await this.avatarService.getActiveAvatars();
      avatars.sort(() => Math.random() - 0.5);
      for (const avatar of avatars) {
        await this.conversationHandler.generateNarrative(avatar, SERVER_NAME);
      }
    }, this.REFLECTION_INTERVAL);
  }

  async setupAvatarChannel() {
    try {
      const guild = this.client.guilds.cache.first();
      let avatarChannel = guild.channels.cache.find(c => c.name === 'avatars');

      if (!avatarChannel) {
        avatarChannel = await guild.channels.create({
          name: 'avatars',
          topic: 'Avatar introductions and reflections'
        });
      }

      this.avatarChannelId = avatarChannel.id;
    } catch (error) {
      this.logger.error('Failed to setup avatar channel:', error);
    }
  }

  updateLastMessageTime() {
    this.lastMessageTime = Date.now();
  }

  /**
   * Retrieve a Discord message by ID using the database as the primary source.
   * If not found, it falls back to fetching from Discord and caches the result.
   * @param {string} channelId - The Discord channel ID
   * @param {string} messageId - The Discord message ID
   * @returns {Promise<Object|null>} - The message object or null if not found
   */
  async getMessageById(messageId) {
    try {
      // Ensure messagesCollection is ready
      if (!this.messagesCollection) {
        await this.setupDatabase();
      }

      // Attempt to fetch the message from the database.
      const messageDoc = await this.messagesCollection.findOne({ messageId });
      if (messageDoc) {
        this.logger.info(`Message ${messageId} retrieved from the database.`);
        return messageDoc;
      }

      throw new Error(`Message ${messageId} not found in the database.`);
    } catch (error) {
      this.logger.error(`Failed to fetch message ${messageId}`, error);
      return null;
    }
  }

  async fetchMessage(channelId, messageId) {
    try {
      if (!channelId || !messageId) {
        this.logger.error(`Invalid channel or message ID: ${channelId}, ${messageId}`);
        return null;
      }

      if (this.db) {
        // Try to find in database first
        try {
          const messagesCollection = this.db.collection('messages');
          const messageDoc = await messagesCollection.findOne({
            messageId,
            channelId
          });
          if (messageDoc) {
            this.logger.debug(`Message ${messageId} found in database cache.`);
            return messageDoc;
          }
        } catch (dbError) {
          this.logger.error(`Database error while fetching message: ${dbError.message}`);
        }
      }

      // If not found in the DB, fallback to Discord API.
      try {
        const channel = await this.client.channels.fetch(channelId);
        if (!channel) {
          this.logger.warn(`Channel ${channelId} not found on Discord.`);
          return null;
        }
        const discordMessage = await channel.messages.fetch(messageId);
        if (discordMessage && this.db) {
          // Construct a simplified document for caching.
          const newMessageDoc = {
            messageId: discordMessage.id,
            channelId,
            content: discordMessage.content,
            authorId: discordMessage.author.id,
            authorUsername: discordMessage.author.username,
            author: {
              id: discordMessage.author.id,
              bot: discordMessage.author.bot,
              username: discordMessage.author.username,
              discriminator: discordMessage.author.discriminator,
              avatar: discordMessage.author.avatar
            },
            timestamp: discordMessage.createdTimestamp,
            attachments: Array.from(discordMessage.attachments.values()).map(a => ({
              id: a.id,
              url: a.url,
              proxyURL: a.proxyURL,
              filename: a.name,
              contentType: a.contentType,
              size: a.size
            })),
            embeds: discordMessage.embeds.map(e => ({
              type: e.type,
              title: e.title,
              description: e.description,
              url: e.url
            }))
          };

          try {
            await this.db.collection('messages').insertOne(newMessageDoc);
            this.logger.info(`Message ${messageId} fetched from Discord and cached in the database.`);
          } catch (insertError) {
            this.logger.error(`Error caching message in database: ${insertError.message}`);
          }
        }
        return discordMessage;
      } catch (discordError) {
        this.logger.error(`Discord API error while fetching message: ${discordError.message}`);
        return null;
      }
    } catch (error) {
      this.logger.error(`Failed to fetch message ${messageId} for channel ${channelId}: ${error.message}`);
      return null;
    }
  }
}