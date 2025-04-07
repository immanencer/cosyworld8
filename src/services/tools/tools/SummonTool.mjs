import { BasicTool } from '../BasicTool.mjs';

export class SummonTool extends BasicTool {
  constructor(services) {
    super(services);


    this.discordService = services.discordService;
    this.mapService = services.mapService;
    this.conversationManager = services.conversationManager;
    this.avatarService = services.avatarService;
    this.configService = services.configService;
    this.databaseService = services.databaseService;
    this.aiService = services.aiService;
    this.statService = services.statService;

    this.db = this.databaseService.getDatabase(); // Assumes this always returns a valid database object
  

    this.name = 'summon';
    this.description = 'Summons a new avatar';
    this.emoji = '🔮'; // Default emoji
    this.DAILY_SUMMON_LIMIT = 16;
    this.replyNotification = true;
    this.cooldownMs = 10 * 1000; // 1 minute cooldown
  }

  /**
   * Returns a static description of the tool.
   * @returns {string} The description.
   */
  getDescription() {
    return 'Summons a new avatar into existence';
  }

  /**
   * Checks if the user has not exceeded the daily summon limit.
   * @param {string} userId - The ID of the user.
   * @returns {boolean} Whether the user can summon.
   */
  async checkDailySummonLimit(userId) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const count = await this.db.collection('daily_summons').countDocuments({
        userId,
        timestamp: { $gte: today },
      });
      return count < this.DAILY_SUMMON_LIMIT;
    } catch (error) {
      this.logger.error(`Error checking summon limit: ${error.message}`);
      return false;
    }
  }

  /**
   * Tracks a summon event for the user.
   * @param {string} userId - The ID of the user.
   */
  async trackSummon(userId) {
    try {
      await this.db.collection('daily_summons').insertOne({
        userId,
        timestamp: new Date(),
      });
    } catch (error) {
      this.logger.error(`Error tracking summon: ${error.message}`);
    }
  }

  /**
   * Executes the summon command, either summoning an existing avatar or creating a new one.
   * @param {Object} message - The Discord message object.
   * @param {Object} params - Parsed command parameters (e.g., { breed, attributes }).
   * @param {Object} avatar - The current avatar context, if applicable.
   * @returns {string} Result message for logging or further processing.
   */
  async execute(message, params = {}, avatar) {
    try {
      // Parse command content (assumes a 2-character prefix like "!")
      const content = message.content.trim().substring(2).trim();
      const [avatarName] = content.split('\n').map(line => line.trim());

      // Check for existing avatar
      const existingAvatar = await this.avatarService.getAvatarByName(avatarName);
      if (existingAvatar) {
        await this.discordService.reactToMessage(message, existingAvatar.emoji || '🔮');
        setTimeout(async () => {
          await this.discordService.sendAvatarEmbed(existingAvatar, message.channel.id, this.aiService);
          await this.conversationManager.sendResponse(message.channel, existingAvatar);
        }, 1000);
        return `-# ${this.emoji} [ ${existingAvatar.name} has been summoned to this location. ]`;
      }

      // Check summon limit (bypass for specific user ID, e.g., admin)
      const breed = Boolean(params.breed);
      const canSummon = message.author.id === '1175877613017895032' || (await this.checkDailySummonLimit(message.author.id));
      if (!canSummon) {
        await this.discordService.replyToMessage(message, `Daily summon limit of ${this.DAILY_SUMMON_LIMIT} reached. Try again tomorrow!`);
        return '-# [ Failed to summon: Daily limit reached. ]';
      }

      // Get guild configuration
      const guildId = message.guildId || message.guild?.id;
      const guildConfig = await this.configService.getGuildConfig(guildId, true);
      let summonPrompt = guildConfig?.prompts?.summon || 'Create an avatar with the following description:';
      let arweavePrompt = null;
      if (summonPrompt.match(/^(https:\/\/.*\.arweave\.net\/|ar:\/\/)/)) {
        arweavePrompt = summonPrompt;
        summonPrompt = null;
      }
      // Generate stats for the avatar
      const creationDate = new Date();
      const stats = this.statService.generateStatsFromDate(creationDate);

      // Prepare avatar creation data
      const prompt = summonPrompt
        ? `${summonPrompt}\n\n${content}\n\nStats: ${JSON.stringify(stats)}`
        : `${content}\n\nStats: ${JSON.stringify(stats)}`;
      const avatarData = {
        prompt,
        channelId: message.channel.id
      };

      // Create new avatar
      const createdAvatar = await this.avatarService.createAvatar(avatarData);
      createdAvatar.stats = stats;
      createdAvatar.createdAt = creationDate;
      if (!createdAvatar || !createdAvatar.name) {
        await this.discordService.replyToMessage(message, 'Failed to create avatar. Try a more detailed description.');
        return '-# [ Failed to create avatar. The description may be too vague. ]';
      }

      // Generate introduction
      const introPrompt = guildConfig?.prompts?.introduction || 'You\'ve just arrived. Introduce yourself.';
      const intro = await this.aiService.chat(
        [
          {
            role: 'system',
            content: `You are ${createdAvatar.name}, described as: ${createdAvatar.description}. Your personality is: ${createdAvatar.personality}.`,
          },
          { role: 'user', content: introPrompt },
        ],
        { model: createdAvatar.model }
      );
      createdAvatar.dynamicPersonality = intro;

      // Initialize avatar and react
      await this.avatarService.initializeAvatar(createdAvatar, message.channel.id);

      // Track summon if not breeding
      if (!breed) await this.trackSummon(message.author.id);

      // Send final response
      setImmediate(async () => {
        // Send profile and introduction
        await this.discordService.sendAsWebhook(message.channel.id, createdAvatar.imageUrl, createdAvatar);
        await this.discordService.sendAsWebhook(message.channel.id, intro, createdAvatar);
        await this.discordService.sendAvatarEmbed(createdAvatar, message.channel.id, this.aiService);
        await this.conversationManager.sendResponse(message.channel, avatar);
        await this.discordService.reactToMessage(message, createdAvatar.emoji || '🔮');
        setTimeout(() => this.conversationManager.sendResponse(message.channel, createdAvatar), 3000);
      });
      return `-# ${this.emoji} [ ${createdAvatar.name} has been summoned into existence. ]`;
    } catch (error) {
      this.logger.error(`Summon error: ${error.message}`);
      this.logger.debug(`${error.stack}`);
      await this.discordService.reactToMessage(message, '❌');
      return `-# [ Failed to summon: ${error.message} ]`;
    }
  }
}