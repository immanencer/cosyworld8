
import { BaseTool } from './BaseTool.mjs';
import { OpenRouterService } from '../../openrouterService.mjs';

export class RespondTool extends BaseTool {
  constructor(dungeonService) {
    super(dungeonService);
    this.name = 'respond';
    this.description = 'Generates an in-character response';
    this.emoji = '💭';
    this.aiService = new OpenRouterService();
  }

  async execute(message, params, avatar) {
    try {
      const response = await this.aiService.chat([
        {
          role: 'system',
          content: avatar.prompt || `You are ${avatar.name}. ${avatar.personality}`
        },
        {
          role: 'assistant',
          content: avatar.dynamicPersonality || ''
        },
        {
          role: 'user',
          content: `Respond to this context:\n${params.join(' ')}`
        }
      ], { model: avatar.model });

      return response;
    } catch (error) {
      console.error('Error in RespondTool:', error);
      return `${avatar.name} seems unable to respond...`;
    }
  }
}
