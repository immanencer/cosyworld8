/**
 * MessageHandler class to manage message processing in Discord channels.
 * Handles channel activity, avatar mentions, and image processing with improved efficiency.
 */
export class MessageHandler {
  /**
   * @param {object} avatarService - Service for avatar database operations.
   * @param {object} client - The Discord client instance.
   * @param {object} chatService - Service used to trigger chat responses.
   * @param {object} [imageProcessingService] - Optional service for processing images.
   * @param {object} [logger=console] - Logger instance for debugging and error reporting.
   */
  constructor(avatarService, client, chatService, imageProcessingService = null, logger = console) {
    this.avatarService = avatarService;
    this.client = client;
    this.chatService = chatService;
    this.imageProcessor = imageProcessingService ? new ImageProcessor(imageProcessingService, logger) : null;
    this.logger = logger;

    // Configuration constants
    this.RECENT_MESSAGES_CHECK = 10; // Number of recent messages to check
    this.PROCESS_INTERVAL = 5 * 60 * 1000; // Interval for processing active channels (5 minutes)
    this.ACTIVE_CHANNEL_WINDOW = 5 * 60 * 1000; // Time window for active channels (5 minutes)
    this.RESPONSE_DELAY = 2000; // Delay between responses in milliseconds
    this.MAX_CONCURRENT_RESPONSES = 3; // Max concurrent responses per channel

    // State management
    this.messageQueue = new Map(); // channelId -> array of messages
    this.processingStatus = new Map(); // channelId -> boolean (is processing)
    this.db = chatService.db;
    this.messagesCollection = this.db.collection('messages');
    this.processingMessages = new Set(); // Tracks messages being processed
    this.responseQueue = new Map(); // channelId -> {queue: [], processing: number}
    this.channelTimeMap = new Map(); // Tracks last processed time per channel

    this.startProcessing();
  }

  /** Starts the interval for processing active channels. */
  startProcessing() {
    this.processingInterval = setInterval(() => {
      this.processActiveChannels();
    }, this.PROCESS_INTERVAL);
  }

  /** Stops the processing interval. */
  stop() {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }
  }

  /**
   * Processes all active channels in parallel.
   * Fetches distinct channel IDs with recent activity and processes them concurrently.
   */
  async processActiveChannels() {
    try {
      const activeChannels = await this.messagesCollection.distinct('channelId', {
        timestamp: { $gt: Date.now() - this.ACTIVE_CHANNEL_WINDOW },
      });

      await Promise.all(activeChannels.map(channelId => this.processChannel(channelId)));
    } catch (error) {
      this.logger.error('Error processing active channels:', error);
    }
  }

  /**
   * Processes a single channel by fetching recent messages and handling avatar responses.
   * @param {string} channelId - The ID of the channel to process.
   */
  async processChannel(channelId) {
    try {
      const recentMessages = await this.getRecentMessages(channelId, this.RECENT_MESSAGES_CHECK);
      if (recentMessages.length === 0) {
        this.logger.info(`No messages in channel ${channelId}.`);
        return;
      }

      const latestMessage = recentMessages[recentMessages.length - 1];
      if (latestMessage.authorId === this.client.user.id) {
        this.logger.debug(`Latest message in channel ${channelId} is from the bot. Skipping.`);
        return;
      }

      const avatarsInChannel = await this.getAvatarsInChannel(channelId);
      if (!avatarsInChannel.length) return;

      const recentAvatars = await this.chatService.getLastMentionedAvatars(recentMessages, avatarsInChannel);
      const latestAvatars = await this.chatService.getLastMentionedAvatars([latestMessage], avatarsInChannel);

      // Prioritize latest avatars and shuffle recent ones for variety
      const shuffledRecentAvatars = recentAvatars.sort(() => Math.random() - 0.5);
      const seenAvatars = new Set();
      const prioritizedAvatars = [...latestAvatars, ...shuffledRecentAvatars].filter(avatarId => {
        if (seenAvatars.has(avatarId)) return false;
        seenAvatars.add(avatarId);
        return true;
      });

      // Initialize response queue for the channel if not present
      if (!this.responseQueue.has(channelId)) {
        this.responseQueue.set(channelId, { queue: [], processing: 0 });
      }

      for (const avatarId of prioritizedAvatars) {
        const avatar = avatarsInChannel.find(a => a._id === avatarId);
        if (!avatar) {
          this.logger.error(`Avatar not found in channel: ${avatarId}`);
          continue;
        }

        const processingKey = `${channelId}-${avatar._id}`;
        if (this.processingMessages.has(processingKey)) {
          this.logger.debug(`Skipping already queued response: ${processingKey}`);
          continue;
        }

        this.processingMessages.add(processingKey);
        const queueItem = {
          avatarId,
          processingKey,
          isBot: latestMessage.authorIsBot || false,
          messageId: latestMessage.messageId,
        };

        const channelQueue = this.responseQueue.get(channelId);
        channelQueue.queue.push(queueItem);
        this.processQueue(channelId);
      }
    } catch (error) {
      const errorMessage = error ? (error.message || error.toString()) : 'Unknown error';
      this.logger.error(`Error processing channel ${channelId}: ${errorMessage}`);
    }
  }

  /**
   * Processes the response queue for a channel, respecting concurrency limits.
   * @param {string} channelId - The ID of the channel whose queue to process.
   */
  async processQueue(channelId) {
    const channelQueue = this.responseQueue.get(channelId);
    if (!channelQueue || channelQueue.processing >= this.MAX_CONCURRENT_RESPONSES) return;

    while (channelQueue.queue.length > 0 && channelQueue.processing < this.MAX_CONCURRENT_RESPONSES) {
      const item = channelQueue.queue.shift();
      channelQueue.processing++;

      try {
        const avatar = await this.avatarService.getAvatarById(item.avatarId);
        if (avatar) {
          const channel = await this.chatService.client.channels.fetch(channelId);
          const message = await this.chatService.getMessageById(item.messageId);

          if (message && message.hasImages && this.imageProcessor) {
            const imageDesc = await this.imageProcessor.processImage(message);
            if (imageDesc) {
              await this.chatService.respondAsAvatar(channel, avatar, !item.isBot, `Image analysis: ${JSON.stringify(imageDesc)}`);
            } else {
              await this.chatService.respondAsAvatar(channel, avatar, !item.isBot);
            }
          } else {
            await this.chatService.respondAsAvatar(channel, avatar, !item.isBot);
          }
          await new Promise(resolve => setTimeout(resolve, this.RESPONSE_DELAY));
        }
      } catch (error) {
        const errorMessage = error ? (error.message || error.toString()) : 'Unknown error';
        this.logger.error(`Error processing avatar response: ${errorMessage}`);
      } finally {
        channelQueue.processing--;
        this.processingMessages.delete(item.processingKey);
        if (channelQueue.queue.length > 0) this.processQueue(channelId);
      }
    }
  }

  /**
   * Extracts mention counts for avatars in message content efficiently.
   * @param {string} content - The message content to analyze.
   * @param {object[]} avatars - Array of avatar objects with name and optional emoji.
   * @returns {Map} - Map of avatar IDs to their mention counts.
   */
  extractMentionsWithCount(content, avatars) {
    const mentionCounts = new Map();
    content = content.toLowerCase();
    const words = content.split(/\s+/);

    for (const avatar of avatars) {
      try {
        let count = 0;
        const name = avatar.name.toLowerCase();
        const emoji = avatar.emoji ? avatar.emoji.toLowerCase() : null;

        for (const word of words) {
          if (word === name || (emoji && word === emoji)) count++;
        }

        if (count > 0) {
          this.logger.info(`Found ${count} mentions of avatar: ${avatar.name} (${avatar._id})`);
          mentionCounts.set(avatar._id, count);
        }
      } catch (error) {
        this.logger.error(`Error processing avatar in extractMentionsWithCount:`, {
          error: error.message,
          avatar: JSON.stringify(avatar, null, 2),
        });
      }
    }
    return mentionCounts;
  }

  /**
   * Fetches recent messages from a channel, prioritizing database then Discord API.
   * @param {string} channelId - The ID of the channel.
   * @param {number} [limit=10] - Number of messages to fetch.
   * @returns {object[]} - Array of formatted message objects.
   */
  async getRecentMessages(channelId, limit = 10) {
    try {
      const messages = await this.messagesCollection
        .find({ channelId })
        .sort({ timestamp: -1 })
        .limit(limit)
        .toArray();

      if (messages.length > 0) return messages.reverse();

      const channel = await this.client.channels.fetch(channelId);
      if (!channel) {
        this.logger.warn(`Channel ${channelId} not found`);
        return [];
      }

      const discordMessages = await channel.messages.fetch({ limit });
      return Array.from(discordMessages.values())
        .map(msg => ({
          messageId: msg.id,
          channelId: msg.channel.id,
          authorId: msg.author.id,
          authorUsername: msg.author.username,
          authorIsBot: msg.author.bot,
          content: msg.content,
          hasImages:
            msg.attachments.some(a => a.contentType?.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp)$/i.test(a.name || '')) ||
            msg.embeds.some(e => e.image || e.thumbnail || e.type === 'image' || e.type === 'photo'),
          timestamp: msg.createdTimestamp,
        }))
        .sort((a, b) => a.timestamp - b.timestamp);
    } catch (error) {
      this.logger.error(`Error fetching recent messages for channel ${channelId}:`, error);
      return [];
    }
  }

  /**
   * Fetches avatars present in a channel.
   * @param {string} channelId - The ID of the channel.
   * @returns {object[]} - Array of avatar objects.
   */
  async getAvatarsInChannel(channelId) {
    try {
      return await this.avatarService.getAvatarsInChannel(channelId);
    } catch (error) {
      this.logger.error(`Error fetching avatars for channel ${channelId}:`, error);
      return [];
    }
  }

  /**
   * Fetches channel context with retry mechanism for reliability.
   * @param {string} channelId - The ID of the channel.
   * @param {number} [limit=10] - Number of messages to fetch.
   * @param {number} [retries=3] - Number of retry attempts.
   * @returns {object[]} - Array of formatted message objects.
   */
  async getChannelContext(channelId, limit = 10, retries = 3) {
    for (let i = 0; i < retries; i++) {
      try {
        const db = await this.getDb();
        if (db) {
          const messages = await db.collection('messages')
            .find({ channelId })
            .sort({ timestamp: -1 })
            .limit(limit)
            .toArray();
          if (messages.length > 0) {
            this.logger.debug(`Retrieved ${messages.length} messages from database for channel ${channelId}`);
            return messages.reverse();
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
            authorIsBot: msg.author.bot,
            content: msg.content,
            hasImages:
              msg.attachments.some(a => a.contentType?.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp)$/i.test(a.name || '')) ||
              msg.embeds.some(e => e.image || e.thumbnail || e.type === 'image' || e.type === 'photo'),
            timestamp: msg.createdTimestamp,
          }))
          .sort((a, b) => a.timestamp - b.timestamp);

        this.logger.debug(`Retrieved ${formattedMessages.length} messages from Discord API for channel ${channelId}`);
        return formattedMessages;
      } catch (error) {
        if (i < retries - 1) {
          this.logger.warn(`Error fetching channel context for channel ${channelId}, retrying...`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        } else {
          this.logger.error(`Error fetching channel context for channel ${channelId}:`, error);
          return [];
        }
      }
    }
  }

  /**
   * Processes user and bot messages, including image analysis if available.
   * @param {object} channel - The Discord channel object.
   * @returns {object[]} - Array of processed message objects.
   */
  async processUserAndBotMessages(channel) {
    try {
      const recentMessages = await this.getRecentMessages(channel.id, 15);

      if (this.imageProcessor) {
        for (const msg of recentMessages) {
          if (msg.hasImages && !msg.imageDescription) {
            const imageDesc = await this.imageProcessor.processImage(msg);
            if (imageDesc) {
              msg.imageDescription = imageDesc;
              const db = await this.getDb();
              if (db) {
                await db.collection('messages').updateOne(
                  { messageId: msg.messageId },
                  { $set: { imageDescription: imageDesc } }
                );
              }
            }
          }
        }
      }
      return recentMessages;
    } catch (error) {
      this.logger.error(`Error processing channel messages: ${error.message}`);
      return [];
    }
  }

  /** Retrieves the database instance. */
  async getDb() {
    return this.db;
  }
}

/**
 * ImageProcessor class to handle image extraction and description.
 */
class ImageProcessor {
  constructor(imageProcessingService, logger = console) {
    this.imageProcessingService = imageProcessingService;
    this.logger = logger;
    this.imageDescriptionCache = new Map();
  }

  /**
   * Processes images in a message, caching results for efficiency.
   * @param {object} message - The message object to process.
   * @returns {object|null} - Image description or null if no images or on error.
   */
  async processImage(message) {
    if (!message.hasImages) return null;

    if (this.imageDescriptionCache.has(message.messageId)) {
      return this.imageDescriptionCache.get(message.messageId);
    }

    try {
      const discordMsg = await message.channel.messages.fetch(message.messageId);
      const extractedImages = await this.imageProcessingService.extractImagesFromMessage(discordMsg);

      if (extractedImages && extractedImages.length > 0) {
        const imageDesc = await this.imageProcessingService.getImageDescription(
          extractedImages[0].base64,
          extractedImages[0].mimeType
        );
        this.imageDescriptionCache.set(message.messageId, imageDesc);
        return imageDesc;
      }
    } catch (error) {
      this.logger.error(`Error processing image for message ${message.messageId}: ${error.message}`);
    }
    return null;
  }
}