import { BasicTool } from '../BasicTool.mjs';

export class RememberTool extends BasicTool {
  constructor(services) {
    super(services);

    this.avatarService = services.avatarService;
    this.memoryService = services.memoryService;
    this.aiService = services.aiService;
    this.discordService = services.discordService;
    this.promptService = services.promptService;
    this.databaseService = services.databaseService;
    
    
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

  async execute(message, params, avatar) {
    const context = await this.getChannelContext(message.channel);
    const prompt = params.join(' ');

    let kgContext = '';
    try {
      const kgEntries = await this.services.knowledgeService.queryKnowledgeGraph(avatar._id);
      kgContext = kgEntries.join('\n');
    } catch {}

    let lastNarrative = '';
    try {
      lastNarrative = (await this.promptService.getLastNarrative(avatar, this.databaseService.getDatabase()))?.content || '';
    } catch {}

    const combinedContext = `Knowledge Graph:\n${kgContext}\n\nLatest narrative:\n${lastNarrative}\n\nRecent conversation:\n${context}`;

    const memory = await this.generateMemory(combinedContext, prompt);
    const formattedMemory = memory.trim();

    await this.memoryService.addMemory(avatar._id, formattedMemory);

    if (avatar.innerMonologueChannel) {
      await this.discordService.sendAsWebhook(
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
