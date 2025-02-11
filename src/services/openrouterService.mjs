import OpenAI from 'openai';
import models from '../models.config.mjs';

export class OpenRouterService {
  constructor(apiKey) {
    this.model = process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.2-3b-instruct';
    this.openai = new OpenAI({
      apiKey: (apiKey || process.env.OPENROUTER_API_TOKEN),
      baseURL: 'https://openrouter.ai/api/v1',
      defaultHeaders: {
        'HTTP-Referer': 'https://ratimics.com', // Optional, for including your app on openrouter.ai rankings.
        'X-Title': 'rativerse',      // Optional. Shows in rankings on openrouter.ai.
      },
    });
    this.modelConfig = models;
  }

  async selectRandomModel() {
    const rarityRanges = [
      { rarity: 'common', min: 1, max: 12 },        // Common: 1-12 (60%)
      { rarity: 'uncommon', min: 13, max: 17 },    // Uncommon: 13-17 (25%)
      { rarity: 'rare', min: 18, max: 19 },        // Rare: 18-19 (10%)
      { rarity: 'legendary', min: 20, max: 20 },   // Legendary: 20 (5%)
    ];

    // Roll a d20
    const roll = Math.ceil(Math.random() * 20);

    // Determine rarity based on the roll
    const selectedRarity = rarityRanges.find(range => roll >= range.min && roll <= range.max)?.rarity;

    // Filter models by the selected rarity
    const availableModels = this.modelConfig.filter(model => model.rarity === selectedRarity);

    // Return a random model from the selected rarity group or fallback to default
    if (availableModels.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableModels.length);
      return availableModels[randomIndex].model;
    }

    // Fallback to default if no models are found
    return this.model;
  }


  modelIsAvailable(model) {
    return this.modelConfig.some(m => m.model === model);
  }

  // Method to generate a completion from OpenRouter
  async generateCompletion(prompt, options = {}) {
    try {
      const response = await this.openai.completions.create({
        model: this.model,
        prompt,
        ...options,
      });
      if (!response || !response.choices || response.choices.length === 0) {
        console.error('Invalid response from OpenRouter during completion generation.');
        return null;
      }
      return response.choices[0].text.trim();
    } catch (error) {
      console.error('Error while generating completion from OpenRouter:', error);
      return null;
    }
  }

  // Method to have a chat with OpenRouter
  async chat(messages, options = { model: 'meta-llama/llama-3.2-1b-instruct' }, retries = 3) {
    try {
      // verify that the model is available
      let model = options.model || this.model;
      if (!this.modelIsAvailable(model)) {
        console.error('Invalid model provided to chat:', model);
        model = this.model;
      }

      const response = await this.openai.chat
        .completions.create({
          model,
          messages: messages.filter(T => T.content),
          ...options,
        });
      if (!response || !response.choices || response.choices.length === 0) {
        console.error('Invalid response from OpenRouter during chat.');
        return null;
      }
      return response.choices[0].message.content.trim() || '...';
    } catch (error) {
      console.error('Error while chatting with OpenRouter:', error);
      if (retries > 0) {
        console.error('Retrying chat with OpenRouter in 5 seconds...');
        await new Promise(resolve => setTimeout(resolve, 5000));
        return this.chat(messages, options, retries - 1);
      }
      return null;
    }
  }

    /**
     * Generates a spoken response as the item within the current channel context.
     *
     * @param {Object} item - The item object (must include at least "name" and "description").
     * @param {string} channelId - The channel ID providing context for the response.
     * @returns {Promise<string>} - The spoken text as the item.
     */
    async speakAsItem(item, channelId) {
      const prompt = `
  You are a mystical item called "${item.name}" located in a dungeon channel (ID: ${channelId}).
  Your description is: ${item.description}.
  Respond with only your speech as if you are the item coming to life in this channel.
      `;
      const completion = await this.generateCompletion(prompt);
      if (!completion) {
        return `The ${item.name} remains silent.`;
      }
      return completion;
    }
}
