import { BasicService } from '../foundation/basicService.mjs';

export class KnowledgeService extends BasicService {
  static requiredServices = [
    'logger',
    'schemaService',
    'databaseService',
  ];
  
  constructor() {
    super();
  }

  async addKnowledgeTriple(avatarId, relation, knowledge) {
    try {
      this.db = await this.databaseService.getDatabase();
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
      this.db = await this.databaseService.getDatabase();
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
            knowledge_points: {
              type: 'array',
              items: { type: 'string' },
              description: 'List of knowledge or facts learned'
            }
          },
          required: ['knowledge_points'],
          additionalProperties: false
        }
      };

      const prompt = `Extract a concise list of key knowledge from the following narrative. 
      Each should be a standalone fact or insight.
      
      Narrative:
      ${narrative}

      Please respond with a JSON object containing a list of knowledge points.
      Example response:
      {
        "knowledge_points": [
          "Fact 1",
          "Fact 2",
          ...
        ]
      }
      `;

      const result = await this.schemaService.executePipeline({ prompt, schema });
      result.knowledge = result.knowledge || result.knowledge_points || [];
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
