
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

  getDescription() {
    return 'Generates an in-character response based on the provided context';
  }

  getSyntax() {
    return '!respond <message or context to respond to>';
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
      ], {
        model: avatar.model,
        // Limits the response to a manageable size.
        max_tokens: 200,
        // A lower temperature yields more predictable responses.
        temperature: 0.7,
        // top_p near 1.0 allows nearly full diversity without extreme randomness.
        top_p: 0.95,
        // No extra penalty on repeating words.
        frequency_penalty: 0.6,
        // A slight presence penalty to encourage new topics.
        presence_penalty: 0.6,
        // Streaming can be enabled if you want responses to appear incrementally.
        stream: false,
      });

      return response;
    } catch (error) {
      console.error('Error in RespondTool:', error);
      return `${avatar.name} seems unable to respond...`;
    }
  }
}
