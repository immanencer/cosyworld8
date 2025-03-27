import { BasicTool } from '../BasicTool.mjs';

export class SummonTool extends BasicTool {
  constructor(services) {
    super(services, [
      'discordService',
      'mapService',
      'conversationManager',
      'avatarService',
      'configService',
      'databaseService',
    ]);
    this.name = 'summon';
    this.description = 'Summons a new avatar';
    this.emoji = '🔮'; // Default emoji
    this.DAILY_SUMMON_LIMIT = 16;
    this.db = this.databaseService.getDatabase(); // Assumes this always returns a valid database object
  }

  /**
   * Retrieves the summon emoji for a guild, falling back to the default if unavailable.
   * @param {string} guildId - The ID of the guild.
   * @returns {string} The emoji to use.
   */
  async getEmoji(guildId) {
    if (!this.configService) return this.emoji;

    try {
      const guildConfig = await this.configService.getGuildConfig(this.db, guildId);
      return guildConfig?.toolEmojis?.summon || guildConfig?.summonEmoji || this.emoji;
    } catch (error) {
      console.error(`Error getting summon emoji: ${error.message}`);
      return this.emoji;
    }
  }

  /**
   * Returns a static description of the tool.
   * @returns {string} The description.
   */
  getDescription() {
    return 'Summons a new avatar into existence';
  }

  /**
   * Returns the command syntax with the guild-specific emoji.
   * @param {string} guildId - The ID of the guild.
   * @returns {string} The syntax string.
   */
  async getSyntax(guildId) {
    const emoji = await this.getEmoji(guildId);
    return `${emoji} <description or name>`;
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
      this.services.logger.error(`Error checking summon limit: ${error.message}`);
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
      this.services.logger.error(`Error tracking summon: ${error.message}`);
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
      const existingAvatar = await this.services.avatarService.getAvatarByName(avatarName);
      if (existingAvatar) {
        await this.discordService.reactToMessage(message.channel.id, message.id, existingAvatar.emoji || '🔮');
        const updatedAvatar = await this.mapService.updateAvatarPosition(existingAvatar._id, message.channel.id);
        updatedAvatar.stats = await this.mapService.getAvatarStats(updatedAvatar._id);
        await this.avatarService.updateAvatar(updatedAvatar);
        await this.discordService.sendAvatarProfileEmbedFromObject(updatedAvatar);
        await this.conversationManager.sendResponse(message.channel, avatar);
        return `${existingAvatar.name} has been summoned to this location.`;
      }

      // Check summon limit (bypass for specific user ID, e.g., admin)
      const breed = Boolean(params.breed);
      const attributes = params.attributes || {};
      const canSummon = message.author.id === '1175877613017895032' || (await this.checkDailySummonLimit(message.author.id));
      if (!canSummon) {
        await this.services.discordService.replyToMessage(message, `Daily summon limit of ${this.DAILY_SUMMON_LIMIT} reached. Try again tomorrow!`);
        return 'Failed to summon: Daily limit reached';
      }

      // Get guild configuration
      const guildId = message.guild?.id || message.guildId;
      const guildConfig = await this.services.configService.getGuildConfig(this.db, guildId, true);
      let summonPrompt = guildConfig?.prompts?.summon || 'Create an avatar with the following description:';
      let arweavePrompt = null;
      if (summonPrompt.match(/^(https:\/\/.*\.arweave\.net\/|ar:\/\/)/)) {
        arweavePrompt = summonPrompt;
        summonPrompt = null;
      }

      // Prepare avatar creation data
      const prompt = summonPrompt ? `${summonPrompt}\n\n${content}` : content;
      const avatarData = {
        prompt,
        channelId: message.channel.id,
        arweave_prompt: arweavePrompt,
      };

      // Create new avatar
      const createdAvatar = await this.services.avatarService.createAvatar(avatarData);
      if (!createdAvatar || !createdAvatar.name) {
        await this.services.discordService.replyToMessage(message, 'Failed to create avatar. Try a more detailed description.');
        return 'Failed to create avatar. The description may be too vague.';
      }

      // Set avatar properties
      createdAvatar.model = createdAvatar.model
        ? await this.services.aiService.getModel(createdAvatar.model)
        : await this.services.aiService.selectRandomModel();
      createdAvatar.summoner = avatar ? `AVATAR:${avatar._id}` : `${message.author.username}@${message.author.id}`;
      createdAvatar.stats = await this.services.mapService.getAvatarStats(createdAvatar._id);
      createdAvatar.attributes = attributes;

      // Generate introduction
      const introPrompt = guildConfig?.prompts?.introduction || 'You\'ve just arrived. Introduce yourself.';
      const intro = await this.services.aiService.chat(
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

      // Update avatar with all changes at once
      await this.services.avatarService.updateAvatar(createdAvatar);

      // Send profile and introduction
      await this.services.discordService.sendAvatarProfileEmbedFromObject(createdAvatar);
      await this.services.discordService.replyToMessage(message, intro, createdAvatar);

      // Initialize avatar and react
      await this.services.avatarService.initializeAvatar(createdAvatar._id, message.channel.id);
      await this.services.discordService.reactToMessage(message, createdAvatar.emoji || '🎉');

      // Track summon if not breeding
      if (!breed) await this.trackSummon(message.author.id);

      // Send final response
      await this.services.conversationManager.sendResponse(message.channel, avatar);
      return `${createdAvatar.name} has been summoned into existence.`;
    } catch (error) {
      this.services.logger.error(`Summon error: ${error.message}`);
      await this.services.discordService.reactToMessage(message, '❌');
      return `Failed to summon: ${error.message}`;
    }
  }
}