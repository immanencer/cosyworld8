import { saveMessageToDatabase } from "../../utils/databaseUtils.mjs";
import { handleCommands } from "../../commands/commandHandler.mjs";
import { sendAvatarProfileEmbedFromObject } from "../discordService.mjs";

export class MessageHandler {
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

  async handleMessage(message) {
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

    if (!message.guild) return;

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

    if (!(await this.spamControlService.shouldProcessMessage(message))) return;

    // Add image description to the original message object
    let imageDescription = null;
    const hasImages = message.attachments?.some(a => a.contentType?.startsWith('image/')) ||
      message.embeds?.some(e => e.image || e.thumbnail);

    if (hasImages && this.aiService && typeof this.aiService.analyzeImage === 'function') {
      const attachment = message.attachments?.find(a => a.contentType?.startsWith('image/'));
      if (attachment) {
        try {
          imageDescription = await this.aiService.analyzeImage(attachment.url);
          this.logger.info(`Generated image description for message ${message.id}: ${imageDescription}`);
        } catch (error) {
          this.logger.error(`Error analyzing image for message ${message.id}: ${error.message}`);
          imageDescription = 'Image analysis failed.';
        }
      }
    } else if (hasImages) {
      this.logger.warn('AI service lacks image analysis capability; skipping image description.');
      imageDescription = 'Image present but not analyzed.';
    }

    // Attach imageDescription to the message object
    message.imageDescription = imageDescription;
    message.hasImages = hasImages;

    // Save the enhanced message object to the database
    try {
      this.logger.debug(`Saving message ${message.id} with imageDescription: ${imageDescription}`);
      await saveMessageToDatabase(message, {
        databaseService: this.databaseService,
        logger: this.logger,
      });
    } catch (error) {
      this.logger.error(`Error saving message to database: ${error.message}`);
      console.error(error.stack); // Log stack trace for more detail
    }

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
    });

    if (message.author.bot) return;

    const channelId = message.channel.id;

    try {
      this.channelManager.markChannelActive(channelId, message.guild.id);
    } catch (error) {
      this.logger.error(`Error marking channel active: ${error.message}`);
    }

    try {
      await this.processChannel(channelId, message);
    } catch (error) {
      this.logger.error(`Error processing channel: ${error.message}`);
      throw error;
    }

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

    try {
      await this.processChannel(channelId, message);
    } catch (error) {
      this.logger.error(`Error in second channel processing: ${error.message}`);
    }

    this.logger.debug(`Message processed successfully in channel ${channelId}`);
  }

  async processChannel(channelId, message) {
    try {
      const channel = this.client.channels.cache.get(channelId);
      if (!channel) {
        this.logger.error(`Channel ${channelId} not found in cache.`);
        return;
      }
      const allAvatars = await this.avatarManager.getAvatarsInChannel(channelId);
      const avatarsToConsider = this.responseGenerator.decisionMaker.selectAvatarsToConsider(allAvatars, message);
      await Promise.all(avatarsToConsider.slice(0,3).map(avatar =>
        this.responseGenerator.considerResponse(channel, avatar)
      ));
    } catch (error) {
      this.logger.error(`Error in processChannel for channel ${channelId}: ${error.message}`);
      throw error;
    }
  }
}