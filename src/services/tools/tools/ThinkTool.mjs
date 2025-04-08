import { BasicTool } from '../BasicTool.mjs';

export class ThinkTool extends BasicTool {
  constructor(services) {
    super(services);

    this.aiService = services.aiService;
    this.memoryService = services.memoryService;
    this.discordService = services.discordService;
    this.mcpClientService = services.mcpClientService;
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

  async fetchMemoryFromMCP(avatar) {
    try {
      const tools = this.mcpClientService.getTools('memory');
      if (!tools.find(t => t.name === 'open_nodes')) return '';
      const entityName = avatar._id.toString();
      const result = await this.mcpClientService.callTool('memory', {
        name: 'open_nodes',
        arguments: { names: [entityName] }
      });
      const entities = result?.entities || [];
      const observations = entities.flatMap(e => e.observations || []);
      return observations.join('\n');
    } catch (err) {
      this.logger?.warn(`Failed to fetch MCP memory: ${err.message}`);
      return '';
    }
  }

  async storeReflectionInMCP(avatar, reflection) {
    try {
      const entityName = avatar._id.toString();
      const tools = this.mcpClientService.getTools('memory');
      if (!tools.find(t => t.name === 'add_observations')) return;
      try {
        await this.mcpClientService.callTool('memory', {
          name: 'add_observations',
          arguments: {
            observations: [{ entityName, contents: [reflection] }]
          }
        });
      } catch (err) {
        if (err.message?.includes('not found') && tools.find(t => t.name === 'create_entities')) {
          this.logger?.warn(`MCP entity ${entityName} not found. Creating entity.`);
          await this.mcpClientService.callTool('memory', {
            name: 'create_entities',
            arguments: {
              entities: [{
                name: entityName,
                entityType: 'person',
                observations: [
                  `Name: ${avatar.name}`,
                  `Persona: ${avatar.personality || ''}`,
                  `Created: ${(new Date()).toISOString()}`
                ]
              }]
            }
          });
          await this.mcpClientService.callTool('memory', {
            name: 'add_observations',
            arguments: {
              observations: [{ entityName, contents: [reflection] }]
            }
          });
        } else {
          throw err;
        }
      }
    } catch (err) {
      this.logger?.warn(`Failed to store reflection in MCP: ${err.message}`);
    }
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
      const mcpMemory = await this.fetchMemoryFromMCP(avatar);
      let lastNarrative = '';
      try {
        lastNarrative = (await this.promptService.getLastNarrative(avatar, this.databaseService.getDatabase()))?.content || '';
      } catch {}

      const reflectionPrompt = `Based on this conversation:\n${context}\n\nLatest narrative:\n${lastNarrative}\n\nAnd your current memory:\n${mcpMemory}\nYou are about to respond to the message: "${messageToRespondTo}". Reflect in detail on the context, think carefully about the conversation and analyze its meaning.`;

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
      await this.storeReflectionInMCP(avatar, reflection);

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