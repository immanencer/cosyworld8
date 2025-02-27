
import { BaseTool } from './BaseTool.mjs';

export class BreedTool extends BaseTool {
  constructor(dungeonService) {
    super(dungeonService);
    this.name = 'breed';
    this.description = 'Breeds two avatars together';
    this.emoji = '🏹';
  }

  getDescription() {
    return 'Breeds two existing avatars to create a new one';
  }

  getSyntax() {
    return '🏹 <avatar1> <avatar2>';
  }

  async execute(message, params, commandLine) {
    try {
      return await this.dungeonService.handleBreedCommand(message, params, commandLine);
    } catch (error) {
      console.error('Error in BreedTool:', error);
      return 'Failed to breed avatars...';
    }
  }
}
