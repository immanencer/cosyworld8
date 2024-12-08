import { sendAsWebhook } from '../discordService.mjs';

export class MessageHandler {
  constructor(chatService, avatarService, logger) {
    this.chatService = chatService;
    this.avatarService = avatarService;
    this.logger = logger;
    this.RECENT_MESSAGES_CHECK = 10;
    this.PROCESS_INTERVAL = 5 * 60 * 1000; // 30 seconds
    this.ACTIVE_CHANNEL_WINDOW = 5 * 60 * 1000; // 5 minutes
    this.db = chatService.db;
    this.messagesCollection = this.db.collection('messages');
    this.processingMessages = new Set();
    this.startProcessing();
  }

  startProcessing() {
    this.processingInterval = setInterval(() => {
      this.processActiveChannels();
    }, this.PROCESS_INTERVAL);
  }

  channelTimeMap = new Map();
  async processActiveChannels() {
    try {
      // Find channels with recent messages
      const activeChannels = await this.messagesCollection.distinct('channelId', {
        timestamp: { $gt: Date.now() - this.ACTIVE_CHANNEL_WINDOW }
      });

      for (const channelId of activeChannels) {
        await this.processChannel(channelId);
        this.channelTimeMap[channelId] = Date.now();
      }
    } catch (error) {
      this.logger.error('Error processing active channels:', error);
    }
  }

  async processChannel(channelId) {
    try {
      // Get avatars in channel
      const avatarsInChannel = await this.avatarService.getAvatarsInChannel(channelId);
      if (!avatarsInChannel.length) return;

      // Get recent messages
      const messages = await this.chatService.getRecentMessagesFromDatabase(channelId);
      const latestMessage = messages[messages.length - 1];

      const recentAvatars = await this.chatService.getLastMentionedAvatars(messages, avatarsInChannel);
      const latestAvatars = await this.chatService.getLastMentionedAvatars([latestMessage], avatarsInChannel);
      // shuffle(recentAvatars);
      recentAvatars.sort(t => Math.random() - 0.5);

      // deduplicate
      const recentAvatarSet = new Set([...latestAvatars, ...recentAvatars]);

      [...Array.from(recentAvatarSet)].forEach(async (avatarId) => {
        const avatar = avatarsInChannel.find(a => a._id === avatarId);
        if (!avatar) {
          this.logger.error(`Avatar not found in channel: ${avatarId}`);
          return;
        }
        // Skip if already processing this avatar for this channel
        const processingKey = `${channelId}-${avatar._id}`;
        if (this.processingMessages.has(processingKey)) {
          this.logger.debug(`Skipping already processing response: ${processingKey}`);
          return;
        }

        try {
          this.processingMessages.add(processingKey);
          const avatar = await this.avatarService.getAvatarById(avatarId);
          if (avatar) {
            const channel = await this.chatService.client.channels.fetch(channelId);
            await this.chatService.respondAsAvatar(channel, avatar, !latestMessage.author.bot);
          }
        } finally {
          this.processingMessages.delete(processingKey);
        }
      });


    } catch (error) {
      this.logger.error(`Error processing channel ${channelId}:`, error);
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

        // Count name mentions
        const nameRegex = new RegExp(avatar.name.toLowerCase(), 'g');
        const nameMatches = content.match(nameRegex);
        if (nameMatches) {
          count += nameMatches.length;
        }

        // Count emoji mentions
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