
import { BaseTool } from './BaseTool.mjs';

export class SummonTool extends BaseTool {
  constructor(dungeonService) {
    super(dungeonService);
    this.name = 'summon';
    this.description = 'Summons a new avatar';
    this.emoji = '💼';
  }

  getDescription() {
    return 'Summons a new avatar into existence';
  }

  getSyntax() {
    return '💼 <description or name>';
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
