import { BaseTool } from './BaseTool.mjs';
import { AIService } from "../../aiService.mjs";

export class CreationTool extends BaseTool {
  constructor(services) {
    super();
    this.services = services;
    this.cache = new Map(); // Cache for generated descriptions
    this.aiService = services?.aiService || new AIService(); // Use service if available or create new
    this.logger = services?.logger;
  }

  async execute(message, params, command) {
    const cacheKey = `${command}_${params.join('_')}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const prompt = this.buildPrompt(message, command, params);
    const narrative = await this.generateNarrative(prompt);
    
    // Cache the result
    this.cache.set(cacheKey, narrative);
    
    return narrative;
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
          model: process.env.OPENROUTER_MODEL,
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

  getSyntax() {
    return '!<custom-action> [target]';
  }
}