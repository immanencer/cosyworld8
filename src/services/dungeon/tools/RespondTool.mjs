import { BaseTool } from './BaseTool.mjs';
import { AIService } from "../../aiService.mjs";
import { MemoryService } from '../../memoryService.mjs';
import { sendAsWebhook } from '../../discordService.mjs';

export class RespondTool extends BaseTool {
  constructor() {
    super();
    this.name = 'respond';
    this.description = 'Generates a thoughtful in-character response with reflection';
    this.emoji = '💭';
    this.aiService = new AIService();
  }

  getDescription() {
    return 'Generates a thoughtful in-character response based on conversation context and a specific message';
  }

  getSyntax() {
    return '💭 <message or context to respond to> (or reply to a message)';
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
        return "Please provide a message to respond to or reply to a message.";
      }

      // Step 2: Fetch conversation context
      const context = await this.getChannelContext(message.channel);

      // Step 3: Generate a reflection
      const reflectionPrompt = `Based on this conversation:\n${context}\nYou are about to respond to the message: "${messageToRespondTo}". Reflect in detail on the context, think carefully about the conversation and analyze its meaning.`;

      console.log(reflectionPrompt);
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
      const memoryService = new MemoryService(this.logger);
      await memoryService.addMemory(avatar._id, "[💭 Reflection]\n" + reflection);
      if (avatar.innerMonologueChannel) {
        sendAsWebhook(avatar.innerMonologueChannel, reflection, avatar);
      }

      return '-# [💭 Reflection Generated]';
    } catch (error) {
      console.error('Error in RespondTool:', error);
      return `${avatar.name} seems unable to respond...`;
    }
  }
}