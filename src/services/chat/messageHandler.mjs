import { saveMessageToDatabase } from "../../utils/databaseUtils.mjs";
import { handleCommands } from "../../commands/commandHandler.mjs";
import { sendAvatarProfileEmbedFromObject } from "../discordService.mjs";

/**
 * MessageHandler class to manage incoming Discord message processing.
 * Integrates various services to handle guild authorization, spam control, message persistence,
 * command execution, channel activity, and avatar interactions.
 */
export class MessageHandler {
  /**
   * Constructor for MessageHandler.
   * @param {object} client - The Discord client instance.
   * @param {object} databaseService - Service for database operations.
   * @param {object} spamControlService - Service for spam detection and control.
   * @param {object} avatarManager - Manager for avatar-related operations.
   * @param {object} channelManager - Manager for channel activity tracking.
   * @param {object} configService - Service for configuration management.
   * @param {object} aiService - Service for AI-related operations (e.g., model selection).
   * @param {object} responseGenerator - Generator for considering and sending avatar responses.
   * @param {object} [logger=console] - Logger instance for debugging and error reporting.
   */
  constructor(services) {
    this.client = services.client;
    this.databaseService = services.databaseService;
    this.spamControlService = services.spamControlService;
    this.avatarService = services.avatarService;
    this.avatarManager = services.avatarManager;
    this.channelManager = services.channelManager;
    this.configService = services.configService;
    this.aiService = services.aiService;
    this.responseGenerator = services.responseGenerator;
    this.logger = services.logger;
    this.dungeonService = services.dungeonService;
  }

  /**
   * Handles an incoming Discord message.
   * Performs guild checks, spam control, message saving, command handling,
   * and avatar-related interactions.
   * @param {object} message - The Discord message object to process.
   */
  async handleMessage(message) {
    // Validate required services
    if (
      !this.databaseService ||
      !this.spamControlService ||
      !this.avatarManager ||
      !this.channelManager ||
      !this.configService ||
      !this.aiService ||
      !this.responseGenerator ||
      !this.dungeonService ||
      !this.avatarService
    ) {
      this.logger.error("Missing required services");
      console.log(Object.keys(this).map(key => `${key}:${!!this[key]}`));
      return;
    }

    // Ignore messages not from a guild
    if (!message.guild) return;

    // Guild authorization check
    try {
      if (!this.client.authorizedGuilds?.get(message.guild.id)) {
        const db = this.databaseService.getDatabase();
        if (!db) return;
        const guildConfig = await this.configService.getGuildConfig(db, message.guild.id);
        const isAuthorized =
          guildConfig?.authorized === true ||
          (await this.configService.get("authorizedGuilds") || []).includes(message.guild.id);
        this.client.authorizedGuilds = this.client.authorizedGuilds || new Map();
        this.client.authorizedGuilds.set(message.guild.id, isAuthorized);
        if (!isAuthorized) {
          this.logger.warn(`Guild ${message.guild.name} (${message.guild.id}) not authorized.`);
          return;
        }
      }
    } catch (error) {
      this.logger.error(`Error checking guild authorization: ${error.message}`);
      return;
    }

    // Apply spam control
    if (!(await this.spamControlService.shouldProcessMessage(message))) return;

    // Save message to database
    try {
      await saveMessageToDatabase(message, {
        databaseService: this.databaseService,
        logger: this.logger,
      });
    } catch (error) {
      this.logger.error(`Error saving message to database: ${error.message}`);
    }

    // Handle commands
    await handleCommands(message, {
      client: this.client,
      avatarManager: this.avatarManager
    });

    // Ignore bot messages
    if (message.author.bot) return;

    const channelId = message.channel.id;

    // Mark channel as active
    try {
      this.channelManager.markChannelActive(channelId, message.guild.id);
    } catch (error) {
      this.logger.error(`Error marking channel active: ${error.message}`);
    }

    // Process channel (trigger responses from existing avatars)
    try {
      await this.processChannel(channelId);
    } catch (error) {
      this.logger.error(`Error processing channel: ${error.message}`);
    }

    // Handle user's avatar
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
        await this.responseGenerator.respondAsAvatar(message.channel, result.avatar, true);
      }
    } catch (error) {
      this.logger.error(`Error handling avatar creation: ${error.message}`);
    }

    // Process channel again (e.g., after new avatar creation)
    try {
      await this.processChannel(channelId);
    } catch (error) {
      this.logger.error(`Error in second channel processing: ${error.message}`);
    }

    this.logger.debug(`Message processed successfully in channel ${channelId}`);
  }

  /**
   * Processes a channel by fetching avatars and triggering potential responses.
   * @param {string} channelId - The ID of the channel to process.
   */
  async processChannel(channelId) {
    try {
      const avatars = await this.avatarManager.getAvatarsInChannel(channelId);
      for (const avatar of avatars) {
        await this.responseGenerator.considerResponse(this.client.channels.cache.get(channelId), avatar);
      }
    } catch (error) {
      this.logger.error(`Error in processChannel for channel ${channelId}: ${error.message}`);
    }
  }
}