import { ConversationHandler } from './ConversationHandler.mjs';
import { DecisionMaker } from './DecisionMaker.mjs';
import { MessageProcessor } from './MessageProcessor.mjs';
import { DatabaseService } from '../databaseService.mjs';

import { sendAsWebhook } from '../discordService.mjs'

import { DungeonService } from '../dungeon/DungeonService.mjs'; // Added import

const RESPONSE_RATE = parseFloat(process.env.RESPONSE_RATE) || 0.2; // 20% response rate
const SERVER_NAME = "Moonstone Sanctum";

export class ChatService {
  constructor(client, db, options = {}) {
    const dbService = new DatabaseService(this.logger);
    this.db = db || dbService.getDatabase();
    this.avatarService = options.avatarService;
    if (!client) {
      throw new Error('Discord client is required');
    }

    this.client = client;
    // Ensure logger exists, create no-op logger if not provided
    this.logger = options.logger || {
      info: () => { },
      error: () => { },
      warn: () => { },
      debug: () => { }
    };

    // Initialize core services with logger
    this.dungeonService = new DungeonService(
      client, this.logger, this.avatarService, this.db
    ); // Added initialization
    this.conversationHandler = new ConversationHandler(
      client,
      options.aiService,
      this.logger,
      options.avatarService,
      this.dungeonService
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

    // Store services from options
    this.avatarService = options.avatarService;
    this.aiService = options.aiService;

    if (!this.avatarService || !this.aiService) {
      throw new Error('avatarService and aiService are required');
    }

    this.responseQueue = new Map(); // channelId -> Set of avatarIds to respond
    this.responseTimeout = null;
    this.RESPONSE_DELAY = 3000; // Wait 3 seconds before processing responses

    this.AMBIENT_CHECK_INTERVAL = process.env.AMBIENT_CHECK_INTERVAL || 60 * 60 * 1000; // Check for ambient responses every hour
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
      await this.dungeonService.initializeDatabase(); // Add this line
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

  // find the 12 most mentioned 
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
    return sortedAvatars.map(([avatarId, count]) => avatars.find(a => a._id === avatarId));
  }

  // get the most recent limit messages prior to timestamp if provided or now
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

    const replyAvatars = topAvatars
      .sort(() => Math.random() - 0.6)
      .slice(0, 6);
    // respond as each of the top 6 avatars
    for (const avatar of replyAvatars) {
      const channel = await this.client.channels.cache.get(avatar.channelId);
      if (!channel) {
        this.logger.error(`${avatar.name}: channel ${avatar.channelId} not found`);
        continue;
      }

      if (Math.random() > RESPONSE_RATE) {
        continue;
      }

      try {
        await this.respondAsAvatar(
          channel, avatar, false
        );
      } catch (error) {
        this.logger.error(`Error responding as avatar ${avatar.name}: ${error.message}`);
      }
    }

    // schedule the next update
    setTimeout(() => this.UpdateActiveAvatars(), this.AMBIENT_CHECK_INTERVAL);
  }

  async respondAsAvatar(channel, avatar, force = false) {
    // Validate channel and avatar
    if (!channel?.id) {
      this.logger.error('Invalid channel or avatar provided to respondAsAvatar');
      return;
    }

    try {
      this.logger.info(`Attempting to respond as avatar ${avatar.name} in channel ${channel.id} (force: ${force})`);
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
            }
            // Otherwise create a new thread
            else {
              const newThread = await avatarsChannel.threads.create({
                name: `${avatar.name} Narratives`,
                autoArchiveDuration: 60,
                reason: 'Create inner monologue thread for avatar'
              });
              avatar.innerMonologueChannel = newThread.id;

              // Post the avatar's image to the inner monologue channel 📷✨
              sendAsWebhook(
                avatar.innerMonologueChannel,
                avatar.imageUrl,
                `${avatar.name} ${avatar.emoji}`, avatar.imageUrl
              );

              // Post the avatar's description to the inner monologue channel 📝💭
              sendAsWebhook(
                avatar.innerMonologueChannel,
                `📖 Description: ${avatar.description}`,
                `${avatar.name} ${avatar.emoji}`, avatar.imageUrl
              );

              // Post the avatar's personality to the inner monologue channel 🎭🔮
              sendAsWebhook(
                avatar.innerMonologueChannel,
                `🎭 Personality: ${avatar.personality}`,
                `${avatar.name} ${avatar.emoji}`, avatar.imageUrl
              );

              // Post the avatar's dynamic personality to the inner monologue channel 🌪️⚡
              sendAsWebhook(
                avatar.innerMonologueChannel,
                `🌪️ Dynamic Personality: ${avatar.dynamicPersonality}`,
                `${avatar.name} ${avatar.emoji}`, avatar.imageUrl
              );

            }
          }
          avatar = await this.avatarService.updateAvatar(avatar);
        }
        decision = force || await this.decisionMaker.shouldRespond(channel, avatar, this.client, this.avatarService);
      } catch (error) {
        this.logger.error(`Error in decision maker: ${error.message}`);
      }

      if (decision) {
        this.logger.info(`${avatar.name} decided to respond in ${channel.id}`);
        this.conversationHandler.sendResponse(channel, avatar);
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
}