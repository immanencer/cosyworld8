export class MessageHandler {
  /**
   * @param {object} avatarService - Service for avatar database operations.
   * @param {object} client - The Discord client instance.
   * @param {object} chatService - Service used to trigger chat responses.
   * @param {object} imageProcessingService - Optional service for processing images.
   * @param {object} logger - Logger instance (defaults to console)
   */
  constructor(avatarService, client, chatService, imageProcessingService = null, logger = console) {
    this.avatarService = avatarService;
    this.client = client;
    this.chatService = chatService;
    this.imageProcessingService = imageProcessingService;
    this.logger = logger;

    // Message Queue - for processing messages in order
    this.messageQueue = new Map(); // channelId -> array of messages
    this.processingStatus = new Map(); // channelId -> boolean (is processing)
    this.RECENT_MESSAGES_CHECK = 10;
    this.PROCESS_INTERVAL = 5 * 60 * 1000;
    this.ACTIVE_CHANNEL_WINDOW = 5 * 60 * 1000;
    this.RESPONSE_DELAY = 2000; // Delay between responses
    this.MAX_CONCURRENT_RESPONSES = 3; // Max concurrent responses per channel
    this.db = chatService.db;
    this.messagesCollection = this.db.collection('messages');
    this.processingMessages = new Set();
    this.responseQueue = new Map(); // channelId -> {queue: [], processing: number}
    this.channelTimeMap = new Map();
    this.imageDescriptionCache = new Map(); // Cache for storing image descriptions
    this.startProcessing();
  }

  startProcessing() {
    this.processingInterval = setInterval(() => {
      this.processActiveChannels();
    }, this.PROCESS_INTERVAL);
  }

  async processActiveChannels() {
    try {
      const activeChannels = await this.messagesCollection.distinct('channelId', {
        timestamp: { $gt: Date.now() - this.ACTIVE_CHANNEL_WINDOW }
      });

      for (const channelId of activeChannels) {
        await this.processChannel(channelId);
        this.channelTimeMap.set(channelId, Date.now());
      }
    } catch (error) {
      this.logger.error('Error processing active channels:', error);
    }
  }

  async processChannel(channelId) {
    try {
      const channel = await this.client.channels.fetch(channelId);
      if (!channel) {
        this.logger.error(`Channel ${channelId} not found.`);
        return;
      }

      // Get recent messages from the database or Discord API
      const messageHistory = await this.getChannelContext(channelId, 10);
      if (messageHistory.length === 0) {
        this.logger.info(`No messages in channel ${channelId}.`);
        return;
      }

      const latestMessage = messageHistory[messageHistory.length - 1];

      if (latestMessage.authorId === this.client.user.id) {
        this.logger.debug(`Latest message in channel ${channelId} is from the bot. Skipping.`);
        return;
      }

      const avatarsInChannel = await this.avatarService.getAvatarsInChannel(channelId);
      if (!avatarsInChannel.length) return;

      const recentAvatars = await this.chatService.getLastMentionedAvatars(messageHistory, avatarsInChannel);
      const latestAvatars = await this.chatService.getLastMentionedAvatars([latestMessage], avatarsInChannel);

      const shuffledRecentAvatars = recentAvatars.sort(() => Math.random() - 0.5);

      const seenAvatars = new Set();
      const prioritizedAvatars = [...latestAvatars, ...shuffledRecentAvatars].filter(avatarId => {
        if (seenAvatars.has(avatarId)) return false;
        seenAvatars.add(avatarId);
        return true;
      });

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
          messageId: latestMessage.messageId
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

  async processQueue(channelId) {
    const channelQueue = this.responseQueue.get(channelId);
    if (!channelQueue || channelQueue.processing >= this.MAX_CONCURRENT_RESPONSES) {
      return;
    }

    while (channelQueue.queue.length > 0 && channelQueue.processing < this.MAX_CONCURRENT_RESPONSES) {
      const item = channelQueue.queue.shift();
      channelQueue.processing++;

      try {
        const avatar = await this.avatarService.getAvatarById(item.avatarId);
        if (avatar) {
          const channel = await this.chatService.client.channels.fetch(channelId);
          const message = await this.chatService.getMessageById(item.messageId);

          if (message && message.attachments && message.attachments.length > 0) {
            const imageUrl = message.attachments[0].url;
            if (this.imageProcessingService) {
              const imageAnalysis = await this.imageProcessingService.analyzeImage(imageUrl);
              await this.chatService.respondAsAvatar(channel, avatar, !item.isBot, `Image analysis: ${JSON.stringify(imageAnalysis)}`);
            } else {
              this.logger.warn('imageProcessingService is not defined. Skipping image analysis.');
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
        if (channelQueue.queue.length > 0) {
          this.processQueue(channelId);
        }
      }
    }
  }

  stop() {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }
  }

  extractMentionsWithCount(content, avatars) {
    const mentionCounts = new Map();
    content = content.toLowerCase();

    for (const avatar of avatars) {
      try {
        let count = 0;
        const nameRegex = new RegExp(avatar.name.toLowerCase(), 'g');
        const nameMatches = content.match(nameRegex);
        if (nameMatches) {
          count += nameMatches.length;
        }

        if (avatar.emoji) {
          const emojiRegex = new RegExp(avatar.emoji, 'g');
          const emojiMatches = content.match(emojiRegex);
          if (emojiMatches) {
            count += emojiMatches.length;
          }
        }

        if (count > 0) {
          this.logger.info(`Found ${count} mentions of avatar: ${avatar.name} (${avatar._id})`);
          mentionCounts.set(avatar._id, count);
        }
      } catch (error) {
        this.logger.error(`Error processing avatar in extractMentionsWithCount:`, {
          error: error.message,
          avatar: JSON.stringify(avatar, null, 2)
        });
      }
    }

    return mentionCounts;
  }

  async getChannelContext(channelId, limit = 10) {
    try {
      // Validate channelId is provided
      if (!channelId) {
        this.logger.error("Channel ID is undefined or null");
        return [];
      }

      // Fetch messages from database if available
      const db = await this.getDb();
      if (db) {
        const messagesCollection = db.collection('messages');
        const messages = await messagesCollection
          .find({ channelId })
          .sort({ timestamp: -1 })
          .limit(limit)
          .toArray();

        if (messages.length > 0) {
          this.logger.debug(`Retrieved ${messages.length} messages from database for channel ${channelId}`);
          return messages.reverse();  // Chronological order
        }
      }

      // If db lookup fails or returns no results, try to fetch from Discord API
      try {
        const channel = await this.client.channels.fetch(channelId);
        if (!channel) {
          this.logger.warn(`Channel ${channelId} not found`);
          return [];
        }

        const discordMessages = await channel.messages.fetch({ limit });
        const formattedMessages = Array.from(discordMessages.values())
          .map(msg => {
            // More detailed image extraction
            const hasAttachmentImages = msg.attachments.some(a =>
              a.contentType?.startsWith('image/') ||
              /\.(jpg|jpeg|png|gif|webp)$/i.test(a.name || '')
            );

            const hasEmbedImages = msg.embeds.some(e =>
              e.image || e.thumbnail ||
              (e.type === 'image' || e.type === 'photo')
            );

            return {
              messageId: msg.id,
              channelId: msg.channel.id,
              authorId: msg.author.id,
              authorUsername: msg.author.username,
              authorIsBot: msg.author.bot,
              content: msg.content,
              hasImages: hasAttachmentImages || hasEmbedImages,
              timestamp: msg.createdTimestamp
            };
          })
          .sort((a, b) => a.timestamp - b.timestamp);

        this.logger.debug(`Retrieved ${formattedMessages.length} messages from Discord API for channel ${channelId}`);
        return formattedMessages;
      } catch (error) {
        this.logger.error(`Error fetching messages from Discord API for channel ${channelId}:`, error);
        return [];
      }
    } catch (error) {
      this.logger.error(`Error fetching channel context for channel ${channelId}:`, error);
      return [];
    }
  }

  async processUserAndBotMessages(channel) {
    try {
      // Get latest messages including those with images
      const recentMessages = await this.getChannelContext(channel.id, 15);

      // Process images and store descriptions if needed
      if (recentMessages.some(msg => msg.hasImages) && this.imageProcessingService) {
        this.logger.info(`Processing channel ${channel.id} with ${recentMessages.length} messages including images`);

        // Find messages with images that don't have descriptions yet
        for (const msg of recentMessages) {
          if (msg.hasImages && !msg.imageDescription) {
            // Check cache first
            if (!this.imageDescriptionCache.has(msg.messageId)) {
              try {
                // Get message from Discord to extract images
                const discordMsg = await channel.messages.fetch(msg.messageId);
                if (discordMsg) {
                  const extractedImages = await this.imageProcessingService.extractImagesFromMessage(discordMsg);

                  if (extractedImages && extractedImages.length > 0) {
                    // Get description for the first image only
                    const imageDesc = await this.imageProcessingService.getImageDescription(
                      extractedImages[0].base64,
                      extractedImages[0].mimeType
                    );

                    // Store in cache and update the message object
                    this.imageDescriptionCache.set(msg.messageId, imageDesc);
                    msg.imageDescription = imageDesc;

                    // Update the database with the description
                    const db = await this.getDb();
                    if (db) {
                      await db.collection("messages").updateOne(
                        { messageId: msg.messageId },
                        { $set: { imageDescription: imageDesc } }
                      );
                    }

                    this.logger.info(`Added image description for message ${msg.messageId}`);
                  }
                }
              } catch (error) {
                this.logger.error(`Error processing image for message ${msg.messageId}: ${error.message}`);
              }
            } else {
              // Use cached description
              msg.imageDescription = this.imageDescriptionCache.get(msg.messageId);
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

  async getDb() {
    return this.db;
  }
}