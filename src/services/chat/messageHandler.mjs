import { saveMessageToDatabase } from "../../utils/databaseUtils.mjs";
import { handleCommands } from "../../commands/commandHandler.mjs";
import { sendAvatarProfileEmbedFromObject } from "../discordService.mjs";

/**
 * Handles Discord messages by processing commands, managing avatars, and generating responses.
 */
export class MessageHandler {
  /**
   * Constructs the MessageHandler with required services.
   * @param {Object} services - An object containing all necessary service dependencies.
   */
  constructor(services) {
    this.databaseService = services.databaseService;
    this.spamControlService = services.spamControlService;
    this.avatarManager = services.avatarManager;
    this.channelManager = services.channelManager;
    this.configService = services.configService;
    this.aiService = services.aiService;
    this.responseGenerator = services.responseGenerator;
    this.dungeonService = services.dungeonService;
    this.avatarService = services.avatarService;
    this.statGenerationService = services.statGenerationService;
    this.chatService = services.chatService;
    this.client = services.client;
    this.logger = services.logger;
  }

  /**
   * Processes a Discord message through various stages including authorization, spam control,
   * image analysis, command handling, and avatar management.
   * @param {Object} message - The Discord message object to process.
   */
  async handleMessage(message) {
    // Validate required services
    if (!this.areServicesValid()) {
      console.error("Missing required services. Message processing aborted.");
      return;
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
    if (!(await this.spamControlService.shouldProcessMessage(message))) {
      this.logger.debug("Message skipped by spam control.");
      return;
    }

    // Analyze images and enhance message object
    await this.handleImageAnalysis(message);

    // Persist the message to the database
    await this.saveMessage(message);

    // Process any commands in the message
    await this.handleCommands(message);

    // Skip further processing if the author is a bot
    if (message.author.bot) {
      this.logger.debug("Message from bot, skipping further processing.");
      return;
    }

    const channelId = message.channel.id;

    // Mark the channel as active
    await this.markChannelActive(channelId, message.guild.id);

    // Process the channel (initial pass, e.g., for immediate responses)
    await this.processChannel(channelId, message);

    // Manage avatar creation or updates for the user
    await this.handleAvatarCreation(message, channelId);

    // Process the channel again (e.g., post-avatar creation responses)
    await this.processChannel(channelId, message);

    this.logger.debug(`Message processed successfully in channel ${channelId}`);
  }

  /**
   * Validates the presence of all required services.
   * @returns {boolean} True if all services are present, false otherwise.
   */
  areServicesValid() {
    const requiredServices = [
      "databaseService",
      "spamControlService",
      "avatarManager",
      "channelManager",
      "configService",
      "aiService",
      "responseGenerator",
      "dungeonService",
      "avatarService",
      "statGenerationService",
      "chatService",
      "client",
      "logger",
    ];
    return requiredServices.every((service) => {
      if (!this[service]) {
        console.error(`Missing required service: ${service}`);
        return false;
      }
      return true;
    });
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
        const guildConfig = await this.configService.getGuildConfig(db, guildId);
        const isAuthorized =
          guildConfig?.authorized === true ||
          (await this.configService.get("authorizedGuilds") || []).includes(guildId);
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
   * Handles commands within the message.
   * @param {Object} message - The Discord message object.
   */
  async handleCommands(message) {
    try {
      await handleCommands(message, {
        client: this.client,
        avatarService: this.avatarService,
        dungeonService: this.dungeonService,
        avatarManager: this.avatarManager,
        configService: this.configService,
        databaseService: this.databaseService,
        responseGenerator: this.responseGenerator,
        aiService: this.aiService,
        logger: this.logger,
        statGenerationService: this.statGenerationService,
        chatService: this.chatService,
      });
    } catch (error) {
      this.logger.error(`Error handling commands: ${error.message}`);
    }
  }

  /**
   * Marks the channel as active.
   * @param {string} channelId - The ID of the channel.
   * @param {string} guildId - The ID of the guild.
   */
  async markChannelActive(channelId, guildId) {
    try {
      await this.channelManager.markChannelActive(channelId, guildId);
    } catch (error) {
      this.logger.error(`Error marking channel active: ${error.message}`);
    }
  }

  /**
   * Handles avatar creation or retrieval for the message author.
   * @param {Object} message - The Discord message object.
   * @param {string} channelId - The ID of the channel.
   */
  async handleAvatarCreation(message, channelId) {
    try {
      const result = await this.avatarService.getOrCreateUniqueAvatarForUser(
        message.author.id,
        `A unique avatar for ${message.author.username} (${message.author.displayName})`,
        channelId
      );
      if (result.new) {
        result.avatar.model = result.avatar.model || (await this.aiService.selectRandomModel());
        result.avatar.stats = await this.dungeonService.getAvatarStats(result.avatar._id);
        await this.avatarManager.updateAvatar(result.avatar);
        await sendAvatarProfileEmbedFromObject(result.avatar);
        await this.responseGenerator.respondAsAvatar(message.channel, result.avatar);
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
      const allAvatars = await this.avatarManager.getAvatarsInChannel(channelId);
      const avatarsToConsider = this.responseGenerator.decisionMaker.selectAvatarsToConsider(
        allAvatars,
        message
      );
      await Promise.all(
        avatarsToConsider.slice(0, 3).map((avatar) =>
          this.responseGenerator.considerResponse(channel, avatar)
        )
      );
    } catch (error) {
      this.logger.error(`Error processing channel ${channelId}: ${error.message}`);
    }
  }
}