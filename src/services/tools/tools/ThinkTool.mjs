import { BasicTool } from '../BasicTool.mjs';

export class ThinkTool extends BasicTool {
  constructor(services) {
    super(services);

    this.aiService = services.aiService;
    this.memoryService = services.memoryService;
    this.discordService = services.discordService;
    this.promptService = services.promptService;
    this.databaseService = services.databaseService;

    this.name = 'think';
    this.description = 'Take a moment to reflect on a message or conversation, updating your thoughts and memories.';
    this.emoji = '💭';
  }

  getDescription() {
    return this.description;
  }

  async getSyntax() {
    return `${this.emoji} <message>`;
  }

  async getChannelContext(channel) {
    const messages = await channel.messages.fetch({ limit: 10 });
    return messages.map(m => `${m.author.username}: ${m.content}`).join('\n');
  }

  async execute(message, params, avatar) {
    try {
      let messageToRespondTo;
      if (message.reference) {
        const repliedMessage = await message.channel.messages.fetch(message.reference.messageId);
        messageToRespondTo = repliedMessage.content;
      } else if (params.length > 0) {
        messageToRespondTo = params.join(' ');
      } else {
        messageToRespondTo = 'Let your mind wander...';
      }

      const context = await this.getChannelContext(message.channel);
      let lastNarrative = '';
      try {
        lastNarrative = (await this.promptService.getLastNarrative(avatar, this.databaseService.getDatabase()))?.content || '';
      } catch {}

      const reflectionPrompt = `Based on this conversation:\n${context}\n\nLatest narrative:\n${lastNarrative}\nYou are about to respond to the message: "${messageToRespondTo}". Reflect in detail on the context, think carefully about the conversation and analyze its meaning.`;

      const reflection = await this.aiService.chat([
        {
          role: 'system',
          content: avatar.prompt || `You are ${avatar.name}. ${avatar.personality}`
        },
        {
          role: 'user',
          content: reflectionPrompt
        }
      ], {
        model: avatar.model,
        max_tokens: 2048,
        temperature: 0.7,
        top_p: 0.95,
        frequency_penalty: 0,
        presence_penalty: 0.6,
        stream: false
      });

      await this.memoryService.addMemory(avatar._id, reflection);

      // Extract knowledge points from reflection
      try {
        const schema = {
          name: 'KnowledgeExtraction',
          description: 'Extract key knowledge points from a reflection',
          schema: {
            type: 'object',
            properties: {
              knowledge: {
                type: 'array',
                items: { type: 'string' },
                description: 'List of knowledge points or facts learned'
              }
            },
            required: ['knowledge'],
            additionalProperties: false
          }
        };

        const prompt = `Extract a concise list of key knowledge points or facts from the following reflection. Each should be a standalone fact or insight.\n\nReflection:\n${reflection}`;

        const result = await this.services.schemaService.executePipeline({ prompt, schema });
        if (result?.knowledge?.length) {
          for (const knowledge of result.knowledge) {
            await this.services.knowledgeService.addKnowledgeTriple(avatar._id, 'knows', knowledge);
          }
        }
      } catch (kgError) {
        console.error('Knowledge extraction failed:', kgError);
      }

      if (avatar.innerMonologueChannel) {
        await this.discordService.sendAsWebhook(
          avatar.innerMonologueChannel, reflection, avatar
        );
      }

      return '-# [ Reflection Generated ]';
    } catch (error) {
      console.error('Error in ThinkTool:', error);
      return `-# [Error generating reflection: ${error.message}]`;
    }
  }
}