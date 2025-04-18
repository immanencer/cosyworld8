import { BasicTool } from '../BasicTool.mjs';

export class CreationTool extends BasicTool {
  /**
   * List of services required by this tool.
   * @type {string[]}
   */
  static requiredServices = [
    'aiService'
  ];

  /**
   * Constructs a new CreationTool.
   **/
  constructor() {
    super();
    this.cache = new Map(); // Cache for generated descriptions
  }

  async execute(message, params, command) {
    try {
      const cacheKey = `${command}_${params.join('_')}`;
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey);
      }
      const prompt = this.buildPrompt(message, command, params);
      const narrative = await this.generateNarrative(prompt);
      this.cache.set(cacheKey, narrative);
      return narrative;
    } catch (error) {
      this.logger?.error('Error in CreationTool:', error);
      return `-# [ ❌ Error: Failed to generate narrative: ${error.message} ]`;
    }
  }

  buildPrompt(message, command, params) {
    return `In a fantasy RPG setting, describe the effects of a character named ${message.author.username} 
    using a special ability called "${command}" ${params.length ? `targeting ${params.join(' ')}` : ''}.
    Keep the response under 100 words and focus on narrative impact.
    Include some chance of failure or partial success.
    Make it feel like part of a larger adventure story.`;
  }

  async generateNarrative(prompt) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: process.env.STRUCTURED_MODEL,
          messages: [
            { role: "system", content: "You are a creative fantasy RPG narrator." },
            { role: "user", content: prompt }
          ],
          temperature: 0.7
        })
      });

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      this.logger?.error(`Error generating narrative: ${error.message}`);
      return "The mysterious power fizzles unexpectedly...";
    }
  }

  getDescription() {
    return 'Handle custom abilities and actions';
  }

  async getSyntax() {
    return `${this.emoji || ''} [target]`;
  }
}