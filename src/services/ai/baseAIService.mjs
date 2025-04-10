import { extractJsonFuzzy } from '../utils/extractJsonFuzzy.mjs';

export class BaseAIService {
  constructor(services) {
    this.services = services;
    this.configService = services?.configService;
  }

  async chat(messages, options = {}) {
    throw new Error('chat() not implemented');
  }

  async generateCompletion(prompt, options = {}) {
    throw new Error('generateCompletion() not implemented');
  }

  async generateStructuredOutput({ prompt, schema, options = {} }) {
    const transformedSchema = this.transformSchema(schema);
    const schemaInstructions = this.schemaToPromptInstructions(transformedSchema);
    const fullPrompt = `${schemaInstructions}\n\n${prompt.trim()}`;

    const response = await this.generateCompletion(fullPrompt, options);
    try {
      return JSON.parse(response);
    } catch (err) {
      console.warn('Strict JSON parse failed, trying fuzzy extraction:', err.message);
      const fuzzy = this.parseJsonFuzzy(response);
      if (fuzzy !== null) return fuzzy;
      throw err;
    }
  }

  parseJsonFuzzy(text) {
    return extractJsonFuzzy(text);
  }

  transformSchema(schema) {
    return schema; // default: no transform
  }

  schemaToPromptInstructions(schema) {
    return '';
  }
}
