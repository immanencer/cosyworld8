
import { MemoryService } from '../../memoryService.mjs';
import { OpenRouterService } from '../../openrouterService.mjs';
import { BaseTool } from './BaseTool.mjs';
import { sendAsWebhook } from '../../discordService.mjs';

export class RememberTool extends BaseTool {
  constructor(dungeonService) {
    super(dungeonService);
    this.aiService = new OpenRouterService();
  }

  async getChannelContext(channel) {
    const messages = await channel.messages.fetch({ limit: 10 });
    return messages.map(m => `${m.author.username}: ${m.content}`).join('\n');
  }

  async generateMemory(context, prompt = '') {
    const systemPrompt = "You are a concise memory recorder. Create a single memorable moment or observation based on the context. Keep it under 280 characters. Focus on key events, emotions, or revelations.";
    
    const response = await this.aiService.chat([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Context:\n${context}\n${prompt ? `Remember specifically about: ${prompt}` : 'What seems most memorable from this context?'}`}
    ]);

    return response || 'Failed to generate memory';
  }

  async execute(message, params, avatar) {
    const context = await this.getChannelContext(message.channel);
    const prompt = params.join(' ');
    const memory = await this.generateMemory(context, prompt);

    const memoryService = new MemoryService(this.logger);
    await memoryService.addMemory(avatar._id, memory);

    // Post the memory to the avatar narrative channel
    if (avatar.innerMonologueChannel) {
      // Post dynamic personality to the inner monologue channel
      sendAsWebhook(
        avatar.innerMonologueChannel,
        `🧠 Memory Generated: ${avatar.dynamicPersonality || ''}`,
        `${avatar.name} ${avatar.emoji}`,
        avatar.imageUrl
      );
    }
    return `[🧠 Memory generated]`;
  }

  getDescription() {
    return 'Remember an important fact or generate a memory from context.';
  }

  getSyntax() {
    return '!remember [optional focus]';
  }
}
