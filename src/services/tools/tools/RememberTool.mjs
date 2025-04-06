import { BasicTool } from '../BasicTool.mjs';

export class RememberTool extends BasicTool {
  constructor(services) {
    super(services, [
      'aiService',
      'avatarService',
      'memoryService',
      'discordService',
      'mcpClientService',
    ]);
    this.name = 'remember';
    this.description = 'Generates a memory from the current context and stores it in persistent memory.';
    this.emoji = '🧠';
  }

  async getChannelContext(channel) {
    const messages = await channel.messages.fetch({ limit: 10 });
    return messages.map(m => `${m.author.username}: ${m.content}`).join('\n');
  }

  async generateMemory(context, prompt = '') {
    const systemPrompt = "You are a concise memory recorder. Create a single memorable moment or observation based on the context. Keep it under 280 characters. Focus on key events, emotions, or revelations.";

    const response = await this.aiService.chat([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Context:\n${context}\n${prompt ? `Remember specifically about: ${prompt}` : 'What seems most memorable from this context?'}` }
    ]);

    return response || 'Failed to generate memory';
  }

  async storeMemoryInMCP(avatar, memoryText) {
    try {
      const client = this.mcpClientService?.clients?.get('memory');
      if (!client) {
        this.logger?.warn('No MCP memory server connected');
        return;
      }
      await client.callTool({
        name: 'add_observations',
        arguments: {
          observations: [{
            entityName: avatar.name.replace(/\s+/g, '_'),
            contents: [memoryText]
          }]
        }
      });
    } catch (err) {
      this.logger?.error(`Failed to store memory in MCP: ${err.message}`);
    }
  }

  async execute(message, params, avatar) {
    const context = await this.getChannelContext(message.channel);
    const prompt = params.join(' ');
    const memory = await this.generateMemory(context, prompt);
    const formattedMemory = memory.trim();

    await this.memoryService.addMemory(avatar._id, formattedMemory);
    await this.storeMemoryInMCP(avatar, formattedMemory);

    if (avatar.innerMonologueChannel) {
      await this.services.discordService.sendAsWebhook(
        avatar.innerMonologueChannel,
        `-# [🧠 Memory Generated]\n${formattedMemory}`,
        avatar
      );
    }
    this.logger?.debug(`Generated memory: ${formattedMemory}`);
    return `-# [Memory Generated]`;
  }

  getDescription() {
    return 'Remember an important fact or generate a memory from context.';
  }

  async getSyntax() {
    return `${this.emoji} [optional focus]`;
  }
}
