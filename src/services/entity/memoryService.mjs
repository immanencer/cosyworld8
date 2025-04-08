import { BasicService } from '../foundation/basicService.mjs';

export class MemoryService extends BasicService {
  constructor(services) {
    super(services);
    this.logger = services.logger;
    this.mcpClientService = services.mcpClientService;
    this.creationService = services.creationService;
    this.databaseService = services.databaseService;
    this.discordService = services.discordService;
    this.db = this.databaseService.getDatabase();
    this.client = this.discordService.client;
    this.lastEntitySync = new Map();
  }

  async addMemory(avatarId, memory) {
    try {
      await this.db.collection('memories').insertOne({
        avatarId,
        memory,
        timestamp: Date.now()
      });
    } catch (error) {
      this.logger.error(`Error storing memory for avatar ${avatarId}: ${error.message}`);
      throw error;
    }
  }

  async getMemories(avatarId, limit = 10, skipEntitySync = false) {
    try {
      const now = Date.now();
      const lastSync = this.lastEntitySync.get(avatarId) || 0;
      if (!skipEntitySync && (now - lastSync > 24 * 60 * 60 * 1000)) {
        this.logger?.info(`Generating MCP entities for avatar ${avatarId}`);
        try {
          const recentMemories = await this.getMemories(avatarId, 50, true);
          const combinedText = recentMemories.map(m => m.memory || m.content || '').join('\n');
          const entityPrompt = `Extract a list of entities (people, organizations, events, places, concepts) from the following text. For each, provide:\n- name (unique identifier, no spaces)\n- entityType (person, organization, event, place, concept)\n- observations (list of facts or attributes)\nReturn as JSON array.`;

          const schema = {
            type: 'object',
            properties: {
              entities: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    entityType: { type: 'string' },
                    observations: {
                      type: 'array',
                      items: { type: 'string' }
                    }
                  },
                  required: ['name', 'entityType', 'observations']
                }
              }
            },
            required: ['entities']
          };

          const entitiesResult = await this.creationService.executePipeline({
            prompt: `${entityPrompt}\n\n${combinedText}`,
            schema
          });

          const entities = entitiesResult?.entities || [];
          const tools = this.mcpClientService.getTools('memory');
          if (tools.find(t => t.name === 'create_entities') && Array.isArray(entities) && entities.length > 0) {
            await this.mcpClientService.callTool('memory', {
              name: 'create_entities',
              arguments: { entities }
            });
            this.logger?.info(`Created/updated ${entities.length} MCP entities for avatar ${avatarId}`);
          }
          this.lastEntitySync.set(avatarId, now);
        } catch (err) {
          this.logger?.warn(`Failed MCP entity sync for avatar ${avatarId}: ${err.message}`);
        }
      }

      const memories = await this.db.collection('memories')
        .find({ $or: [ { avatarId }, { avatarId: avatarId.toString() }, { avatarId: { $exists: false } } ] })
        .sort({ timestamp: -1 })
        .limit(limit)
        .toArray();

      const narratives = await this.db.collection('narratives');
      const recentNarratives = await narratives.find({ avatarId }).sort({ timestamp: -1 }).limit(3).toArray();
      recentNarratives.forEach(narrative => {
        memories.push(narrative);
      });
      memories.sort((a, b) => b.timestamp - a.timestamp);
      return memories || [];
    } catch (error) {
      this.logger.error(`Error fetching memories for avatar ${avatarId}: ${error.message}`);
      throw error;
    }
  }

  async storeNarrative(avatarId, content) {
    try {
      await this.db.collection('narratives').insertOne({
        avatarId,
        content,
        timestamp: Date.now()
      });
    } catch (error) {
      this.logger.error(`Error storing narrative for avatar ${avatarId}: ${error.message}`);
    }
  }

  async getLastNarrative(avatarId) {
    try {
      return await this.db.collection('narratives').findOne(
        { $or: [{ avatarId }, { avatarId: avatarId.toString() }] },
        { sort: { timestamp: -1 } }
      );
    } catch (error) {
      this.logger.error(`Error fetching last narrative for avatar ${avatarId}: ${error.message}`);
      return null;
    }
  }

  async updateNarrativeHistory(avatar, content) {
    const guildName = process.env.GUILD_NAME || 'The Guild';
    const narrativeData = { timestamp: Date.now(), content, guildName };
    avatar.narrativeHistory = avatar.narrativeHistory || [];
    avatar.narrativeHistory.unshift(narrativeData);
    avatar.narrativeHistory = avatar.narrativeHistory.slice(0, 5);
    return avatar;
  }

  async queryKnowledgeGraph(avatarId) {
    try {
      const tools = this.mcpClientService.getTools('memory');
      if (!tools.find(t => t.name === 'query_observations')) return '';
      const response = await this.mcpClientService.callTool('memory', {
        name: 'query_observations',
        arguments: {
          entityName: avatarId.toString(),
          limit: 10
        }
      });
      if (!response || !Array.isArray(response.observations)) return '';
      return response.observations.map(o => o.contents).flat().join('\n');
    } catch (err) {
      this.logger?.warn(`Knowledge graph query failed: ${err.message}`);
      return '';
    }
  }

  async updateKnowledgeGraph(avatarId, text) {
    try {
      const entityPrompt = `Extract a list of entities (people, organizations, events, places, concepts) from the following text. For each, provide:\n- name (unique identifier, no spaces)\n- entityType (person, organization, event, place, concept)\n- observations (list of facts or attributes)\nReturn as JSON array.`;

      const schema = {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            entityType: { type: 'string' },
            observations: {
              type: 'array',
              items: { type: 'string' }
            }
          },
          required: ['name', 'entityType', 'observations']
        }
      };

      const entities = await this.creationService.executePipeline({
        prompt: `${entityPrompt}\n\n${text}`,
        schema
      });

      const tools = this.mcpClientService.getTools('memory');
      if (tools.find(t => t.name === 'create_entities') && Array.isArray(entities) && entities.length > 0) {
        await this.mcpClientService.callTool('memory', {
          name: 'create_entities',
          arguments: { entities }
        });
      }
    } catch (err) {
      this.logger?.warn(`Knowledge graph update failed: ${err.message}`);
    }
  }
}
