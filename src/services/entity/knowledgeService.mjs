import { BasicService } from '../foundation/basicService.mjs';

export class KnowledgeService extends BasicService {
  constructor(services) {
    super(services);
    this.logger = services.logger;
    this.databaseService = services.databaseService;
    this.schemaService = services.schemaService;
    
    this.db = this.databaseService.getDatabase();
  }

  async addKnowledgeTriple(avatarId, relation, knowledge) {
    try {
      await this.db.collection('knowledge_graph').insertOne({
        avatarId,
        relation,
        knowledge,
        timestamp: Date.now(),
      });
    } catch (error) {
      this.logger.error(`Error storing knowledge triple for avatar ${avatarId}: ${error.message}`);
      throw error;
    }
  }

  async queryKnowledgeGraph(avatarId) {
    try {
      const triples = await this.db.collection('knowledge_graph')
        .find({ avatarId })
        .sort({ timestamp: -1 })
        .limit(20)
        .toArray();
      return triples.map(t => `${t.relation} ${t.knowledge}`);
    } catch (error) {
      this.logger.error(`Error querying knowledge graph for avatar ${avatarId}: ${error.message}`);
      return [];
    }
  }

  async updateKnowledgeGraph(avatarId, narrative) {
    try {
      const schema = {
        name: 'KnowledgeExtraction',
        description: 'Extract key knowledge points from a narrative',
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

      const prompt = `Extract a concise list of key knowledge points or facts from the following narrative. Each should be a standalone fact or insight.\n\nNarrative:\n${narrative}`;

      const result = await this.schemaService.executePipeline({ prompt, schema });
      if (result?.knowledge?.length) {
        for (const knowledge of result.knowledge) {
          await this.addKnowledgeTriple(avatarId, 'knows', knowledge);
        }
      }
    } catch (error) {
      this.logger.error(`Error updating knowledge graph for avatar ${avatarId}: ${error.message}`);
    }
  }
}
