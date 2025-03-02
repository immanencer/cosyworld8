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
    if (!channelId) return;

    try {
      const avatarsInChannel = await this.avatarService.getAvatarsInChannel(channelId);
      if (!avatarsInChannel.length) return;

      const messages = await this.chatService.getRecentMessagesFromDatabase(channelId);
      const latestMessage = messages[messages.length - 1];

      const recentAvatars = await this.chatService.getLastMentionedAvatars(messages, avatarsInChannel);
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
          isBot: latestMessage.author.bot
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

}