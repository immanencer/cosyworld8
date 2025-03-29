import { saveMessageToDatabase } from "../../utils/databaseUtils.mjs";
import { handleCommands } from "../commands/commandHandler.mjs";
/**
 * Handles Discord messages by processing commands, managing avatars, and generating responses.
 */
export class MessageHandler {
  /**
   * Constructs the MessageHandler with required services.
   * @param {Object} services - An object containing all necessary service dependencies.
   */
  constructor(services) {
    this.services = services;
    this.logger = services.logger;
    this.databaseService = services.databaseService;
    this.client = services.discordService.client;
    this.periodicTaskManager = services.periodicTaskManager;
    this.decisionMaker = services.decisionMaker;
    this.conversationManager = services.conversationManager;
    this.started = false;
  }

  async start() {
    if (this.started) {
      this.logger.warn("MessageHandler is already started.");
      return;
    }
    this.started = true;
    this.client.on('messageCreate', (message) => this.handleMessage(message));
    this.logger.info('MessageHandler started.');
  }

  async stop() {
    this.periodicTaskManager.stop();
    this.logger.info('MessageHandler stopped.');
  }

  /**
   * Processes a Discord message through various stages including authorization, spam control,
   * image analysis, command handling, and avatar management.
   * @param {Object} message - The Discord message object to process.
   */
  async handleMessage(message) {

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

    // Persist the message to the database
    await this.saveMessage(message);

    // Process any commands in the message
    await handleCommands(message, this.services);

    // Skip further processing if the author is a bot
    if (message.author.bot) {
      this.logger.debug("Message from bot, skipping further processing.");
      return;
    }

    const channelId = message.channel.id;
    const guildId = message.guild.id;

    // Mark the channel as active
    await this.services.channelManager.markChannelActive(channelId, guildId);

    // Process the channel (initial pass, e.g., for immediate responses)
    await this.processChannel(channelId, message);

    // Manage avatar creation or updates for the user
    await this.handleAvatarCreation(message, channelId);

    // Process the channel again (e.g., post-avatar creation responses)
    await this.processChannel(channelId, message);

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
   * Saves the message to the database.
   * @param {Object} message - The Discord message object to save.
   */
  async saveMessage(message) {
    try {
      await saveMessageToDatabase(message, {
        databaseService: this.databaseService,
        logger: this.logger,
      });
    } catch (error) {
      this.logger.error(`Error saving message to database: ${error.message}`);
      console.error(error.stack);
    }
  }

  /**
   * Handles avatar creation or retrieval for the message author.
   * @param {Object} message - The Discord message object.
   * @param {string} channelId - The ID of the channel.
   */
  async handleAvatarCreation(message, channelId) {
    try {
      const result = await this.services.avatarService.getOrCreateUniqueAvatarForUser(
        message.author.id,
        `A unique avatar for ${message.author.username} (${message.author.displayName})`,
        channelId
      );
      if (result.new) {
        result.avatar.model = result.avatar.model || (await this.aiService.selectRandomModel());
        result.avatar.stats = await this.toolService.getAvatarStats(result.avatar._id);
        await this.services.avatarService.updateAvatar(result.avatar);
        await this.services.discordService.sendAvatarProfileEmbedFromObject(result.avatar);

        await this.services.conversationManager.sendResponse(channel, avatar);
      }
    } catch (error) {
      this.logger.error(`Error handling avatar creation: ${error.message}`);
    }
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
      const allAvatars = await this.services.avatarService.getAvatarsInChannel(channelId);
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
}