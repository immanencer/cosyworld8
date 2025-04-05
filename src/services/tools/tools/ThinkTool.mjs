import { BasicTool } from '../BasicTool.mjs';

export class ThinkTool extends BasicTool {
  constructor(services) {
    super(services, [
      'aiService',
      'memoryService',
      'discordService',
    ]);
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

  // Borrowed from RememberTool to fetch channel context
  async getChannelContext(channel) {
    const messages = await channel.messages.fetch({ limit: 10 });
    return messages.map(m => `${m.author.username}: ${m.content}`).join('\n');
  }

  async execute(message, params, avatar) {
    try {
      // Step 1: Determine the message to respond to
      let messageToRespondTo;
      if (message.reference) {
        const repliedMessage = await message.channel.messages.fetch(message.reference.messageId);
        messageToRespondTo = repliedMessage.content;
      } else if (params.length > 0) {
        messageToRespondTo = params.join(' ');
      } else {
        messageToRespondTo = 'Let your mind wander...';
      }

      // Step 2: Fetch conversation context
      const context = await this.getChannelContext(message.channel);

      // Step 3: Generate a reflection
      const reflectionPrompt = `Based on this conversation:\n${context}\nYou are about to respond to the message: "${messageToRespondTo}". Reflect in detail on the context, think carefully about the conversation and analyze its meaning.`;

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

      // Step 4: Store the reflection as a memory
      await this.memoryService.addMemory(avatar._id, reflection);
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