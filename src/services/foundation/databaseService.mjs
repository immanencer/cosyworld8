import { MongoClient, ObjectId } from 'mongodb';

export class DatabaseService {
  static instance = null;

  constructor(logger) {
    if (DatabaseService.instance) {
      return DatabaseService.instance;
    }

    this.logger = logger;
    this.dbClient = null;
    this.db = null;
    this.connected = false;
    this.reconnectDelay = 5000;
    this.dbName = process.env.MONGO_DB_NAME || 'moonstone';

    DatabaseService.instance = this;
  }

  async connect() {
    if (this.db) {
      return this.db;
    }

    // Check if we're in development mode
    const isDev = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test' || !process.env.NODE_ENV;

    if (!process.env.MONGO_URI) {
      throw new Error('MongoDB URI not provided in environment variables.');
    }

    try {
      this.logger.info('Connecting to MongoDB...');
      this.dbClient = new MongoClient(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 10000,
      });

      await this.dbClient.connect();
      this.db = this.dbClient.db(this.dbName);
      this.connected = true;
      this.logger.info(`Connected to MongoDB: ${this.dbName}`);
      await this.createIndexes();
      return this.db;
    } catch (error) {
      this.connected = false;
      this.logger.error(`MongoDB connection failed: ${error.message}`);

      if (this.dbClient) {
        try {
          await this.dbClient.close();
        } catch (closeError) {
          this.logger.error(`Error closing MongoDB connection: ${closeError.message}`);
        }
      }

      // Set up reconnection with exponential backoff
      const reconnectDelay = Math.min(this.reconnectDelay * 1.5, 30000); // Maximum 30 seconds
      this.logger.info(`Will attempt to reconnect in ${reconnectDelay / 1000} seconds...`);
      setTimeout(() => this.connect(), reconnectDelay);
      this.reconnectDelay = reconnectDelay;
      return null;
    }
  }

  async getMessageById(messageId) {
    if (!this.db) {
      this.logger.warn('Database is not connected. Cannot retrieve message.');
      return null;
    }

    try {
      const messages = this.db.collection('messages');
      return await messages.findOne({ _id: ObjectId.createFromTime(messageId) });
    } catch (error) {
      this.logger.error(`Error retrieving message by ID: ${error.message}`);
      return null;
    }
  }  
  /**
  * Marks a channel as active by updating its last activity timestamp in the database.
  * @param {string} channelId - The ID of the channel.
  * @param {string} guildId - The ID of the guild the channel belongs to.
  */
 async markChannelActive(channelId, guildId) {
  const channelActivityCollection = this.getDatabase().collection('channel_activity');
   await channelActivityCollection.updateOne(
     { _id: channelId },
     { $set: { lastActivityTimestamp: Date.now() }, $setOnInsert: { guildId: guildId } },
     { upsert: true }
   );
 }

    /**
   * Saves the message to the database.
   * @param {Object} message - The Discord message object to save.
   */
    async saveMessage(message) {
      try {
        const db = this.getDatabase();
        const messagesCollection = db.collection("messages");
      
        // Prepare the message data for insertion
        const attachments = Array.from(message.attachments.values()).map(a => ({
          id: a.id,
          url: a.url,
          proxyURL: a.proxyURL,
          filename: a.name,
          contentType: a.contentType,
          size: a.size,
          height: a.height,
          width: a.width,
        }));
  
        const embeds = message.embeds.map(e => ({
          type: e.type,
          title: e.title,
          description: e.description,
          url: e.url,
          image: e.image ? { url: e.image.url, proxyURL: e.image.proxyURL, height: e.image.height, width: e.image.width } : null,
          thumbnail: e.thumbnail ? { url: e.thumbnail.url, proxyURL: e.thumbnail.proxyURL, height: e.thumbnail.height, width: e.thumbnail.width } : null,
        }));
  
        const messageData = {
          guildId: message.guild.id,
          messageId: message.id,
          channelId: message.channel.id,
          authorId: message.author.id,
          authorUsername: message.author.username,
          author: { id: message.author.id, bot: message.author.bot, username: message.author.username, discriminator: message.author.discriminator, avatar: message.author.avatar },
          content: message.content,
          attachments,
          embeds,
          hasImages: attachments.some(a => a.contentType?.startsWith("image/")) || embeds.some(e => e.image || e.thumbnail),
          timestamp: message.createdTimestamp,
        };
  
        if (!messageData.messageId || !messageData.channelId) {
          this.logger.error("Missing required message data:", messageData);
          return;
        }
        await this.markChannelActive(message.channel.id, message.guild.id);

        // Insert the message into the database using updateOne with upsert
        const result = await messagesCollection.updateOne(
          { messageId: messageData.messageId },
          { $setOnInsert: messageData },
          { upsert: true }
        );
        
        // Check if a new document was inserted
        if (result.upsertedCount === 1) {
          this.logger.debug("💾 Message saved to database");
          return true;
        } else {
          this.logger.debug(`Message ${messageData.messageId} already exists in the database.`);
          return false;
        }
      } catch (error) {
        this.logger.error(`Error saving message to database: ${error.message}`);
        console.error(error.stack);
      }
    }

  async getRecentRiskyMessagesForUser(userId, limit = 20) {
    try {
      const db = this.getDatabase();
      if (!db) return [];
      const messagesCollection = db.collection('messages');
      const riskyMessages = await messagesCollection
        .find({
          authorId: userId,
          threatLevel: { $in: ['medium', 'high'] }
        })
        .sort({ timestamp: -1 })
        .limit(limit)
        .toArray();
      return riskyMessages;
    } catch (error) {
      this.logger.error(`Error fetching recent risky messages for user ${userId}: ${error.message}`);
      return [];
    }
  }

  getDatabase() {
    if (!this.connected || !this.db) {
      this.logger.warn('Database is not connected. Retrying connection...');
      // Schedule a connection attempt but don't wait for it
      this.connect().catch(err => {
        this.logger.error(`Failed to reconnect to database: ${err.message}`);
      });

      // Return the database object even if not fully initialized yet
      // This helps avoid null reference errors in some cases
      return this.db || null;
    }
    return this.db;
  }

  /**
   * Waits for database connection to be established
   * @param {number} maxRetries - Maximum number of retries
   * @param {number} delay - Delay between retries in milliseconds
   * @returns {Promise<Object|null>} - Returns database object or null
   */
  async waitForConnection(maxRetries = 5, delay = 1000) {
    let retries = 0;

    while (retries < maxRetries) {
      if (this.connected && this.db) {
        return this.db;
      }

      this.logger.info(`Waiting for database connection... (attempt ${retries + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
      retries++;
    }

    this.logger.error(`Failed to establish database connection after ${maxRetries} attempts`);
    return null;
  }

  async createIndexes() {
    const db = this.getDatabase();
    if (!db) return;

    try {
      await Promise.all([
        db.collection('messages').createIndexes([
          { key: { "author.username": 1 }, background: true },
          { key: { timestamp: -1 }, background: true },
          { key: { avatarId: 1 }, background: true },
          { key: { messageId: 1 }, unique: true }
        ]),
        db.collection('avatars').createIndexes([
          { key: { name: 1, createdAt: -1 }, background: true },
          { key: { model: 1 }, background: true },
          { key: { emoji: 1 }, background: true },
          { key: { parents: 1 }, background: true },
          { key: { createdAt: -1 }, background: true },
          { key: { channelId: 1 }, background: true },
          { key: { name: 'text', description: 'text' }, background: true },
        ]),
        db.collection('dungeon_stats').createIndex(
          { avatarId: 1 },
          { unique: true, background: true }
        ),
        db.collection('narratives').createIndex(
          { avatarId: 1, timestamp: -1 },
          { background: true }
        ),
        db.collection('memories').createIndex(
          { avatarId: 1, timestamp: -1 },
          { background: true }
        ),
        db.collection('dungeon_log').createIndexes([
          { key: { timestamp: -1 }, background: true },
          { key: { actor: 1 }, background: true },
          { key: { target: 1 }, background: true },
        ]),
        db.collection('messages').createIndex({ hasImages: 1 }),
        db.collection('messages').createIndex({ imageDescription: 1 }),
        db.collection('x_auth').createIndex({ avatarId: 1 }, { unique: true }),
        db.collection('social_posts').createIndex({ avatarId: 1, timestamp: -1 }),
      ]);
      this.logger.info('Database indexes created successfully');
    } catch (error) {
      this.logger.error(`Error creating indexes: ${error.message}`);
      throw error;
    }
  }

  async close() {
    if (this.dbClient) {
      await this.dbClient.close();
      this.connected = false;
      this.db = null;
      this.logger.info('MongoDB connection closed');
    }
  }
}