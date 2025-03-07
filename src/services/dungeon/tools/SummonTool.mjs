
import { BaseTool } from './BaseTool.mjs';

export class SummonTool extends BaseTool {
  constructor(dungeonService) {
    super(dungeonService);
    this.name = 'summon';
    this.description = 'Summons a new avatar';
    this.emoji = '💼'; // Default emoji
    this.configService = dungeonService.configService || global.configService;
  }
  
  async getEmoji(guildId) {
    if (!this.configService) return this.emoji;
    
    try {
      const guildConfig = await this.configService.getGuildConfig(
        this.dungeonService.db || global.databaseService?.getDatabase(),
        guildId
      );
      return (guildConfig?.toolEmojis?.summon) || this.emoji;
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

  async execute(message, params) {
    try {
      return await this.dungeonService.handleSummonCommand(message, params);
    } catch (error) {
      console.error('Error in SummonTool:', error);
      return 'Failed to summon avatar...';
    }
  }
}
