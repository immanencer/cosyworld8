
import { BaseTool } from './BaseTool.mjs';
import { handleSummonCommand } from '../../../commands/summonCommand.mjs';

export class SummonTool extends BaseTool {
  constructor(dungeonService) {
    super(dungeonService);
    this.name = 'summon';
    this.description = 'Summons a new avatar';
    this.emoji = '🔮'; // Default emoji
    this.configService = dungeonService.configService || global.configService;
  }
  
  async getEmoji(guildId) {
    if (!this.configService) return this.emoji;
    
    try {
      const guildConfig = await this.configService.getGuildConfig(
        this.dungeonService.db || global.databaseService?.getDatabase(),
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

  async execute(message, params, services) {
    try {
      return await handleSummonCommand(message, params, services);
    } catch (error) {
      console.error('Error in SummonTool:', error);
      return 'Failed to summon avatar...';
    }
  }
}
