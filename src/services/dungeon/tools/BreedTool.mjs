
import { BaseTool } from './BaseTool.mjs';
import { handleBreedCommand } from '../../../commands/breedCommand.mjs';

export class BreedTool extends BaseTool {
  constructor() {
    super();
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

  async execute(message, params, avatar, services) {
    try {
      return await handleBreedCommand(message, params, services);
    } catch (error) {
      console.error('Error in BreedTool:', error);
      return 'Failed to breed avatars...';
    }
  }
}
