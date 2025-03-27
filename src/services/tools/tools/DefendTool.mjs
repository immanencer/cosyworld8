
import { BasicTool } from '../BasicTool.mjs';

export class DefendTool extends BasicTool {
  constructor(services) {
    super(services, [
      'configService',
      'avatarService',
      'databaseService',
    ]);
    this.name = 'defend';
    this.description = 'Take a defensive stance';
    this.emoji = '🛡️';
  }

  async execute(message, params, avatar, services) {
    const avatarId = avatar._id;
    const stats = await services.avatarService.getOrCreateStats(avatarId, services);
    
    stats.isDefending = true;
    await services.avatarService.updateAvatarStats(avatarId, stats);

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
