import { BaseTool } from './BaseTool.mjs';
import { reactToMessage, replyToMessage, sendAsWebhook, sendAvatarProfileEmbedFromObject } from "../../../services/discordService.mjs";
import { sanitizeInput } from "../../../utils/utils.mjs";

export class SummonTool extends BaseTool {
  constructor(services) {
    super();
    this.name = 'summon';
    this.description = 'Summons a new avatar';
    this.emoji = '🔮'; // Default emoji
    this.configService = services.configService;
    this.avatarService = services.avatarService;
    this.databaseService = services.databaseService;
    this.DAILY_SUMMON_LIMIT = 16;
  }
  
  async getEmoji(guildId) {
    if (!this.configService) return this.emoji;
    
    try {
      const guildConfig = await this.configService.getGuildConfig(
        this.databaseService.getDatabase(),
        guildId
      );
      
      // Check both new and old configuration paths
      if (guildConfig?.toolEmojis?.summon) {
        return guildConfig.toolEmojis.summon;
      } else if (guildConfig?.summonEmoji) {
        return guildConfig.summonEmoji;
      }
      return this.emoji;
    } catch (error) {
      console.error(`Error getting summon emoji from config: ${error.message}`);
      return this.emoji;
    }
  }

  getDescription() {
    return 'Summons a new avatar into existence';
  }

  async getSyntax(guildId) {
    const emoji = await this.getEmoji(guildId);
    return `${emoji} <description or name>`;
  }
  
  async checkDailySummonLimit(userId, services) {
    const db = services.databaseService.getDatabase();
    if (!db) {
      services.logger.error("Database not available for summon limit check.");
      return false;
    }
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return (await db.collection("daily_summons").countDocuments({ userId, timestamp: { $gte: today } })) < this.DAILY_SUMMON_LIMIT;
    } catch (error) {
      services.logger.error(`Error checking summon limit: ${error.message}`);
      return false;
    }
  }

  async trackSummon(userId, services) {
    const db = services.databaseService.getDatabase();
    if (!db) return;
    await db.collection("daily_summons").insertOne({ userId, timestamp: new Date() });
  }

  async execute(message, params, avatar, services) {
    try {
      const content = message.content.trim().substring(2).trim();
      const [avatarName] = content.split("\n").map(line => line.trim());
      const existingAvatar = await services.avatarService.getAvatarByName(avatarName);

      if (existingAvatar) {
        await reactToMessage(message, existingAvatar.emoji || "🔮");
        const updatedAvatar = await services.dungeonService.updateAvatarPosition(existingAvatar._id, message.channel.id);
        updatedAvatar.stats = await services.dungeonService.getAvatarStats(updatedAvatar._id);
        await services.avatarService.updateAvatar(updatedAvatar);
        await sendAvatarProfileEmbedFromObject(updatedAvatar);
        
        if (services.responseGenerator) {
          await services.responseGenerator.respondAsAvatar(message.channel, updatedAvatar);
        }
        
        return `${existingAvatar.name} has been summoned to this location.`;
      }

      // Check if this user can summon today
      const breed = Boolean(params.breed);
      const attributes = params.attributes || {};
      const canSummon = message.author.id === "1175877613017895032" || (await this.checkDailySummonLimit(message.author.id, services));
      if (!canSummon) {
        await replyToMessage(message, `Daily summon limit of ${this.DAILY_SUMMON_LIMIT} reached. Try again tomorrow!`);
        return `Failed to summon: Daily limit reached`;
      }

      const guildConfig = await services.configService.getGuildConfig(services.databaseService.getDatabase(), message.guild?.id, true);
      const summonPrompt = guildConfig?.prompts?.summon || "Create an avatar with the following description:";
      const avatarData = {
        prompt: sanitizeInput(`${summonPrompt}\n\nRequires you to design a creative character based on the following content:\n\n${content}`),
        channelId: message.channel.id,
      };
      
      if (summonPrompt.match(/^(https:\/\/.*\.arweave\.net\/|ar:\/\/)/)) {
        avatarData.arweave_prompt = summonPrompt;
      }

      const createdAvatar = await services.avatarService.createAvatar(avatarData);
      if (!createdAvatar || !createdAvatar.name) {
        await replyToMessage(message, "Failed to create avatar. Try a more detailed description.");
        return "Failed to create avatar. The description may be too vague.";
      }

      createdAvatar.summoner = `${message.author.username}@${message.author.id}`;
      createdAvatar.model = createdAvatar.model || (await services.aiService.selectRandomModel());
      createdAvatar.stats = await services.dungeonService.getAvatarStats(createdAvatar._id);
      await services.avatarService.updateAvatar(createdAvatar);
      await sendAvatarProfileEmbedFromObject(createdAvatar);

      const intro = await services.aiService.chat([
        { role: "system", content: `${createdAvatar.name}. ${createdAvatar.description} ${createdAvatar.personality}` },
        { role: "user", content: guildConfig?.prompts?.introduction || "You've just arrived. Introduce yourself." },
      ]);
      
      createdAvatar.dynamicPersonality = intro;
      createdAvatar.channelId = message.channel.id;
      createdAvatar.attributes = attributes;
      await services.avatarService.updateAvatar(createdAvatar);
      await sendAsWebhook(message.channel.id, intro, createdAvatar);

      await services.dungeonService.initializeAvatar(createdAvatar._id, message.channel.id);
      await reactToMessage(message, createdAvatar.emoji || "🎉");
      
      if (!breed) {
        await this.trackSummon(message.author.id, services);
      }
      
      if (services.responseGenerator) {
        await services.responseGenerator.respondAsAvatar(message.channel, createdAvatar);
      }
      
      return `${createdAvatar.name} has been summoned into existence.`;
    } catch (error) {
      services.logger.error(`Summon error: ${error.message}`);
      await reactToMessage(message, "❌");
      return `Failed to summon: ${error.message}`;
    }
  }
}