import { BasicService } from "../basicService.mjs";
import { handleCommands } from "../commands/commandHandler.mjs";
/**
 * Handles Discord messages by processing commands, managing avatars, generating responses,
 * and performing structured content moderation.
 */
export class MessageHandler extends BasicService {
  /**
   * Constructs the MessageHandler with required services.
   * @param {Object} services - An object containing all necessary service dependencies.
   */
  constructor(services) {
    super(services, [
      'discordService',
      'aiService',
      'avatarService',
      'toolService',
      'spamControlService',
      'configService',
      'channelManager',
      'schedulingService',
      'databaseService',
      'decisionMaker',
      'conversationManager',
      'riskManagerService'
    ]);
    this.client = services.discordService.client;
    this.started = false;

    /**
     * Static regex patterns for immediate moderation triggers.
     * URL detection is always included.
     */
    this.staticModerationRegexes = [
      /(https?:\/\/[^\s]+)/i
    ];

    /**
     * Dynamic AI-generated regex pattern (string or null).
     */
    this.dynamicModerationRegex = null;
  }

  async start() {
    if (this.started) {
      this.logger.warn("MessageHandler is already started.");
      return;
    }
    this.started = true;
    this.client.on('messageCreate', (message) => this.handleMessage(message));
    this.logger.info('MessageHandler started.');

    // Periodically refresh dynamic regex and update if backlog exceeds threshold
    this.schedulingService.addTask('refreshDynamicRegex', async () => {
      try {
        const regex = await this.services.riskManagerService.loadDynamicRegex();
        this.dynamicModerationRegex = regex;

        await this.services.riskManagerService.updateDynamicModerationRegex();
      } catch (error) {
        this.logger.error(`Error refreshing dynamic regex: ${error.message}`);
      }
    }, 5 * 60 * 1000); // every 5 minutes
  }

  async stop() {
    this.schedulingService.stop();
    this.logger.info('MessageHandler stopped.');
  }

  /**
   * Processes a Discord message through various stages including authorization, spam control,
   * image analysis, command handling, avatar management, and content moderation.
   * @param {Object} message - The Discord message object to process.
   */
  async handleMessage(message) {

    if (this.discordService.messageCache) {
      // Check if the message is already cached
      const cachedMessage = this.discordService.messageCache.get(message.id);
      if (cachedMessage) {
        this.logger.debug(`Message ${message.id} is already cached.`);
        return;
      }
      // Cache the message to avoid reprocessing
      this.discordService.messageCache.set(message.id, message);
      this.logger.debug(`Caching message ${message.id}.`);
    }

    // Persist the message to the database
    await this.databaseService.saveMessage(message);

    const channel = message.channel;
    if (channel && channel.name) {
      if (process.env.NODE_ENV === 'development') {
        // In dev mode, only respond in channels starting with the construction roadblock emoji
        if (!channel.name.startsWith('🚧')) {
          this.logger.debug(`Dev mode: Ignoring message in channel ${channel.name} as it does not start with 🚧.`);
          return;
        }
      } else {
        // In production, ignore channels that start with the construction roadblock emoji
        if (channel.name.startsWith('🚧')) {
          this.logger.debug(`Prod mode: Ignoring message in construction channel ${channel.name}.`);
          return;
        }
      }
    }

    // Ensure the message is from a guild
    if (!message.guild) {
      this.logger.debug("Message not in a guild, skipping.");
      return;
    }

    // Check guild authorization
    if (!(await this.isGuildAuthorized(message))) {
      this.logger.warn(`Guild ${message.guild.name} (${message.guild.id}) not authorized.`);
      return;
    }

    // Apply spam control
    if (!(await this.services.spamControlService.shouldProcessMessage(message))) {
      this.logger.debug("Message skipped by spam control.");
      return;
    }

    // Analyze images and enhance message object
    await this.handleImageAnalysis(message);

    // Check if the message is from the bot itself
    if (message.author.bot) {
      this.logger.debug("Message is from the bot itself, skipping.");
      return;
    }

    // Check if the message is a command
    const avatar = (await this.services.avatarService.getAvatarFromMessage(message)) ||
      (await this.services.avatarService.summonUserAvatar(message)).avatar;
    if (avatar) {
      await handleCommands(message, this.services, avatar);
    }

    const channelId = message.channel.id;
    const guildId = message.guild.id;

    // Mark the channel as active
    await this.databaseService.markChannelActive(channelId, guildId);

    // Process the channel (initial pass, e.g., for immediate responses)
    await this.processChannel(channelId, message);

    // Process the channel again (e.g., post-avatar creation responses)
    await this.processChannel(channelId, message);

    // Structured moderation: analyze links and assign threat level
    await this.moderateMessageContent(message);

    // Structured moderation: backlog moderation if needed
    await this.moderateBacklogIfNeeded(message.channel);

    this.logger.debug(`Message processed successfully in channel ${channelId}`);
  }

  /**
   * Checks if the guild is authorized to use the bot.
   * @param {Object} message - The Discord message object.
   * @returns {Promise<boolean>} True if authorized, false otherwise.
   */
  async isGuildAuthorized(message) {
    if (!message.guild) return false;
    try {
      const guildId = message.guild.id;
      if (!this.client.authorizedGuilds?.get(guildId)) {
        const db = this.databaseService.getDatabase();
        if (!db) return false;
        const guildConfig = await this.services.configService.getGuildConfig(guildId);
        const isAuthorized =
          guildConfig?.authorized === true ||
          (await this.services.configService.get("authorizedGuilds") || []).includes(guildId);
        this.client.authorizedGuilds = this.client.authorizedGuilds || new Map();
        this.client.authorizedGuilds.set(guildId, isAuthorized);
      }
      return this.client.authorizedGuilds.get(guildId);
    } catch (error) {
      this.logger.error(`Error checking guild authorization: ${error.message}`);
      return false;
    }
  }

  /**
   * Analyzes images in the message and attaches descriptions.
   * @param {Object} message - The Discord message object to enhance.
   */
  async handleImageAnalysis(message) {
    const hasImages =
      message.attachments?.some((a) => a.contentType?.startsWith("image/")) ||
      message.embeds?.some((e) => e.image || e.thumbnail);

    let imageDescription = null;
    if (hasImages && this.aiService?.analyzeImage) {
      const attachment = message.attachments?.find((a) =>
        a.contentType?.startsWith("image/")
      );
      if (attachment) {
        try {
          imageDescription = await this.aiService.analyzeImage(attachment.url);
      
          this.logger.info(
            `Generated image description for message ${message.id}: ${imageDescription}`
          );
        } catch (error) {
          this.logger.error(`Error analyzing image for message ${message.id}: ${error.message}`);
          imageDescription = "Image analysis failed.";
        }
      }
    } else if (hasImages) {
      this.logger.warn("AI service lacks image analysis capability; skipping.");
      imageDescription = "Image present but not analyzed.";
    }

    message.imageDescription = imageDescription;
    message.hasImages = hasImages;
  }

  /**
   * Processes the channel by selecting avatars and considering responses.
   * @param {string} channelId - The ID of the channel to process.
   * @param {Object} message - The Discord message object.
   */
  async processChannel(channelId, message) {
    try {
      const channel = this.client.channels.cache.get(channelId);
      if (!channel) {
        this.logger.error(`Channel ${channelId} not found in cache.`);
        return;
      }
      const allAvatars = await this.avatarService.getAvatarsInChannel(channelId);
      const avatarsToConsider = this.decisionMaker.selectAvatarsToConsider(
        allAvatars,
        message
      );
      await Promise.all(
        avatarsToConsider.slice(0, 3).map(async (avatar) => {
          const shouldRespond = await this.decisionMaker.shouldRespond(channel, avatar, this.client);
          if (shouldRespond) {
            await this.conversationManager.sendResponse(channel, avatar);
          }
        })
      );
    } catch (error) {
      this.logger.error(`Error processing channel ${channelId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Analyzes message content for links, assigns threat level, and reacts accordingly.
   * @param {Object} message - The Discord message object.
   */
  async moderateMessageContent(message) {
    try {
      const content = message.content || '';

      // Check static regexes
      let matched = this.staticModerationRegexes.some((regex) => regex.test(content));

      // Check dynamic regex if exists
      if (!matched && this.dynamicModerationRegex) {
        try {
          const dynRegex = new RegExp(this.dynamicModerationRegex, 'i');
          matched = dynRegex.test(content);
        } catch (e) {
          this.logger.warn('Invalid dynamic moderation regex, skipping.');
        }
      }

      let threatLevel = 'low';
      let reason = '';

      if (matched) {
        const prompt = `Classify the risk level of this message, considering the following risky behaviors and content types on Discord:

1. Hate speech or discrimination
2. Harassment, bullying, or threats
3. Spam, scams, or phishing attempts
4. Misinformation or harmful advice
5. Self-harm or suicide content
6. Violence or incitement
7. Sexual or explicit content
8. Malware or suspicious links
9. Impersonation of others (users, staff, bots)
10. Soliciting direct messages (DMs), especially for suspicious reasons
11. Manipulative, coercive, or grooming behavior
12. Attempts to evade moderation or rules
13. Any other emerging or suspicious risky behavior

Message: "${content}"

Respond ONLY with one of: low, medium, high, and a brief reason explaining the risk.`;
        const schema = {
          type: 'object',
          properties: {
            threat_level: { type: 'string', enum: ['low', 'medium', 'high'] },
            reason: { type: 'string' }
          },
          required: ['threat_level', 'reason']
        };

        const result = await this.services.aiService.generateStructuredOutput({ prompt, schema });
        threatLevel = result.threat_level;
        reason = result.reason;
      }

      // Escalate if warning emoji exists
      const warningEmoji = '🚨';
      const warningReaction = message.reactions?.cache?.find(r => r.emoji.name === warningEmoji);
      if (warningReaction && warningReaction.count > 0) {
        threatLevel = 'high';
      }

      // --- User profiling ---
      let userProfile = '';
      try {
        const userId = message.author?.id;
        if (userId) {
          const recentRiskyMessages = await this.databaseService.getRecentRiskyMessagesForUser(userId, 20);
          const highCount = recentRiskyMessages.filter(m => m.threatLevel === 'high').length;
          const mediumCount = recentRiskyMessages.filter(m => m.threatLevel === 'medium').length;
          const totalWarnings = mediumCount + highCount;
          // Emoji risk profile: 1 warning=⚠️, 1 high=🚨, scale up
          const warningEmojis = '⚠️'.repeat(mediumCount);
          const dangerEmojis = '🚨'.repeat(highCount);
          userProfile = `${warningEmojis}${dangerEmojis}`;
        }
      } catch (err) {
        this.logger.error(`Error generating user risk profile: ${err.message}`);
      }

      let emoji = '✅';
      if (threatLevel === 'high') {
        emoji = '🚨';
      } else if (threatLevel === 'medium') {
        emoji = '⚠️';
      }

      // React accordingly
      await message.react(emoji);

      // Reply to medium and high risk messages with reason and user profile
      if (threatLevel === 'medium' || threatLevel === 'high') {
        let roleMentions = '';
        try {
          const guild = message.guild;
          if (guild && guild.roles) {
            const rolesToTag = guild.roles.cache.filter(role => {
              const name = role.name.toLowerCase();
              return name.includes('moderator') || name.includes('moderater') || name.includes('admin');
            });
            if (rolesToTag.size > 0) {
              roleMentions = Array.from(rolesToTag.values()).map(r => `<@&${r.id}>`).join(' ');
            }
          }
        } catch (err) {
          this.logger.error(`Error fetching roles for tagging: ${err.message}`);
        }

        const replyText = `${roleMentions} ${userProfile} -# ${emoji} [${reason}] \n`;
        await message.reply(replyText);
      }

      // If medium or high, store risky message for user profiling
      try {
        if (threatLevel === 'medium' || threatLevel === 'high') {
          await this.databaseService.storeRiskyMessage({
            userId: message.author?.id,
            messageId: message.id,
            channelId: message.channel.id,
            guildId: message.guild?.id,
            content,
            reason,
            threatLevel,
            timestamp: Date.now()
          });
        }
      } catch (err) {
        this.logger.error(`Error storing risky message: ${err.message}`);
      }

      // If high risk, store in risk DB and assign tags
      if (threatLevel === 'high') {
        await this.services.riskManagerService.storeHighRiskMessage({
          messageId: message.id,
          channelId: message.channel.id,
          guildId: message.guild?.id,
          content,
          reason
        });

        const tags = await this.services.aiService.generateTagsForContent(content);
        await this.services.riskManagerService.updateMessageTags(message.id, tags);
      }

    } catch (error) {
      this.logger.error(`Error during message moderation: ${error.message}`);
    }
  }

  /**
   * Checks backlog of unmoderated messages in a channel and moderates if over threshold.
   * @param {Object} channel - The Discord channel object.
   */
  async moderateBacklogIfNeeded(channel) {
    try {
      const messages = await channel.messages.fetch({ limit: 100 });
      const unmoderated = messages.filter(m =>
        !m.reactions.cache.some(r => ['✅', '⚠️', '🚨'].includes(r.emoji.name))
      );

      if (unmoderated.size > 50) {
        this.logger.info(`Moderating backlog of ${unmoderated.size} messages in channel ${channel.id}`);
        for (const msg of unmoderated.values()) {
          await this.moderateMessageContent(msg);
        }
      }
    } catch (error) {
      this.logger.error(`Error moderating backlog: ${error.message}`);
    }
  }
}