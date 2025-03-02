import OpenAI from 'openai';
import defaultModels from '../models.config.mjs';

export class GoogleAIService {
  constructor(apiKey) {
    this.openai = new OpenAI({
      apiKey: apiKey || process.env.GOOGLE_AI_API_KEY,
      baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
    });

    // Default model - can be overridden
    this.model = process.env.GOOGLE_AI_MODEL || 'gemini-1.5-flash';
    console.log(`Initialized GoogleAIService with default model: ${this.model}`);

    // Initialize model list
    this.modelConfig = [];
    this.lastModelFetchTime = 0;
    this.modelRefreshInterval = 1000 * 60 * 60; // Refresh every hour

    // Default options
    this.defaultChatOptions = {
      model: this.model,
      temperature: 0.7,
      max_tokens: 1000,
      top_p: 1.0,
      frequency_penalty: 0,
      presence_penalty: 0,
    };
        // Placeholder for Google AI client.  Replace with actual implementation.
    this.googleAI = {
      chat: (model) => ({
        sendMessage: async (chatParams) => {
          // Replace with actual API call to Google AI
          console.log("Placeholder Google AI API call:", model, chatParams);
          return { response: { text: "This is a placeholder response from Google AI." } };
        }
      })
    };
  }

  /**
   * Fetches the available models from the local configuration
   * @returns {Promise<Array>} List of available models
   */
  async fetchModels() {
    try {
      const now = Date.now();
      // Only initialize models if enough time has passed or not loaded yet
      if (now - this.lastModelFetchTime > this.modelRefreshInterval || this.modelConfig.length === 0) {
        console.log('Loading models from local configuration');

        // Use default models from configuration
        this.modelConfig = defaultModels || [];

        this.lastModelFetchTime = now;
        console.log(`Loaded ${this.modelConfig.length} models from configuration`);
      }

      return this.modelConfig;
    } catch (error) {
      console.error('Error loading model configuration:', error);
      // Return empty array if there's an error
      return [];
    }
  }

  async selectRandomModel() {
    // Ensure models are loaded
    if (this.modelConfig.length === 0) {
      await this.fetchModels();
    }

    const rarityRanges = [
      { rarity: 'common', min: 1, max: 12 },        // Common: 1-12 (60%)
      { rarity: 'uncommon', min: 13, max: 17 },     // Uncommon: 13-17 (25%)
      { rarity: 'rare', min: 18, max: 19 },         // Rare: 18-19 (10%)
      { rarity: 'legendary', min: 20, max: 20 },    // Legendary: 20 (5%)
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
    return this.model;
  }

  modelIsAvailable(model) {
    // If models haven't been loaded yet, we need to load them first
    if (this.modelConfig.length === 0) {
      console.log(`Fetching models before checking availability of ${model}`);
      return this.fetchModels().then(() => {
        const isAvailable = this.modelConfig.some(m => m.model === model);
        console.log(`Model ${model} availability check: ${isAvailable}`);
        return isAvailable;
      });
    }

    const isAvailable = this.modelConfig.some(m => m.model === model);
    console.log(`Model ${model} availability check with loaded models: ${isAvailable}`);
    return isAvailable;
  }

  async generateCompletion(prompt, options = {}) {
    // Ensure models are loaded
    if (this.modelConfig.length === 0) {
      await this.fetchModels();
    }

    // Merge our defaults with caller-supplied options.
    const mergedOptions = {
      model: this.model,
      prompt,
      ...this.defaultChatOptions,
      ...options,
    };

    try {
      const response = await this.openai.completions.create(mergedOptions);
      if (!response || !response.choices || response.choices.length === 0) {
        console.error('Invalid response from Google AI during completion generation.');
        return null;
      }
      return response.choices[0].text.trim();
    } catch (error) {
      console.error('Error while generating completion from Google AI:', error);
      return null;
    }
  }

  async chat(systemPrompt, userPrompt, options = {}) {
    try {
      const model = options.model || this.model; // Use this.model as default if no model is specified

      // Check if model is available before proceeding
      const isModelAvailable = await this.modelIsAvailable(model);
      if (!isModelAvailable) {
        console.log(`Model ${model} availability check: false`);
        throw new Error(`Model ${model} is not available.`);
      }

      console.log(`Model ${model} availability check: true`);

      // Direct implementation instead of calling a non-existent method
      const generationConfig = {
        temperature: options.temperature || 0.7,
        maxOutputTokens: options.maxOutputTokens || 1024,
        topP: options.topP || 0.95,
        topK: options.topK || 40
      };

      const chatParams = {
        contents: [
          { role: 'system', parts: [{ text: systemPrompt }] },
          { role: 'user', parts: [{ text: userPrompt }] }
        ],
        generationConfig
      };

      const result = await this.googleAI.chat(model).sendMessage(chatParams);
      return result.response.text();
    } catch (error) {
      console.log("Error while chatting with Google AI:", error);
      throw error;
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