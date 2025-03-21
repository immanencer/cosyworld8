
import { BaseTool } from './BaseTool.mjs';

export class DefendTool extends BaseTool {
  constructor(services) {
    super();
    this.name = 'defend';
    this.description = 'Take a defensive stance';
    this.emoji = '🛡️';
    this.configService = services?.configService;
    this.avatarService = services?.avatarService;
    this.databaseService = services?.databaseService;
  }

  async execute(message, params, avatar, services) {
    const avatarId = avatar._id;
    const stats = await services.dungeonService.getOrCreateStatsForAvatar(avatarId, services);
    
    stats.isDefending = true;
    await services.dungeonService.updateAvatarStats(avatarId, stats);

    return `🛡️ ${message.author.username} takes a defensive stance! AC increased by 2 until next attack.`;
  }

  getDescription() {
    return 'Take a defensive stance (+2 AC until next attack)';
  }

  async getEmoji(guildId) {
    if (!this.configService) return this.emoji;
    
    try {
      const guildConfig = await this.configService.getGuildConfig(
        this.databaseService.getDatabase(),
        guildId
      );
      
      if (guildConfig?.toolEmojis?.defend) {
        return guildConfig.toolEmojis.defend;
      }
      return this.emoji;
    } catch (error) {
      console.error(`Error getting defend emoji from config: ${error.message}`);
      return this.emoji;
    }
  }

  async getSyntax(guildId) {
    const emoji = await this.getEmoji(guildId);
    return `${emoji}`;
  }
}
