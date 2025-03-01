
import OpenAI from 'openai';

export class GoogleAIService {
  constructor(apiKey) {
    this.openai = new OpenAI({
      apiKey: apiKey || process.env.GOOGLE_AI_API_KEY,
      baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
    });
    
    // Default model - can be overridden
    this.model = process.env.GOOGLE_AI_MODEL || 'gemini-2.0-flash';
    
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
  }

  /**
   * Fetches the available models from the Google API
   * @returns {Promise<Array>} List of available models
   */
  async fetchModels() {
    try {
      const now = Date.now();
      // Only fetch new models if enough time has passed
      if (now - this.lastModelFetchTime > this.modelRefreshInterval || this.modelConfig.length === 0) {
        console.log('Fetching models from Google AI API');
        const models = await this.openai.models.list();
        
        // Reset model config
        this.modelConfig = [];
        
        // Categorize models based on naming patterns
        for (const model of models) {
          const modelId = model.id;
          let rarity = 'common';
          
          // Determine rarity based on model name patterns
          if (modelId.includes('gemini-2.0') || modelId.includes('imagen-3.0')) {
            rarity = 'uncommon';
          }
          
          // Detect premium models - these would typically be more powerful
          if (modelId.includes('pro') || modelId.includes('flash-001') || modelId.includes('gemini-1.5-pro')) {
            rarity = 'rare';
          }
          
          // The most capable models would be legendary
          if (modelId.includes('ultra') || modelId.includes('2.0-pro') || modelId.includes('vision')) {
            rarity = 'legendary';
          }
          
          this.modelConfig.push({
            model: modelId,
            rarity: rarity
          });
        }
        
        this.lastModelFetchTime = now;
        console.log(`Retrieved ${this.modelConfig.length} models from Google AI API`);
      }
      
      return this.modelConfig;
    } catch (error) {
      console.error('Error fetching Google AI models:', error);
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
      this.fetchModels().then(() => {
        return this.modelConfig.some(m => m.model === model);
      });
    }
    
    return this.modelConfig.some(m => m.model === model);
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

  async chat(messages, options = {}, retries = 3) {
    // Ensure models are loaded
    if (this.modelConfig.length === 0) {
      await this.fetchModels();
    }
    
    // Merge our default chat options with any caller options, preserving structure
    const mergedOptions = {
      ...this.defaultChatOptions,
      ...options,
      // Preserve any special response format instructions
      response_format: options.response_format || this.defaultChatOptions.response_format,
      functions: options.functions,
      function_call: options.function_call,
      tools: options.tools,
      tool_choice: options.tool_choice,
    };

    // Ensure that only messages with content are passed.
    mergedOptions.messages = messages.filter(m => m.content);

    // Verify that the chosen model is available. If not, fall back.
    if (!this.modelIsAvailable(mergedOptions.model)) {
      console.error('Invalid model provided to chat:', mergedOptions.model);
      mergedOptions.model = this.model;
    }

    try {
      const response = await this.openai.chat.completions.create(mergedOptions);
      if (!response || !response.choices || response.choices.length === 0) {
        console.error('Invalid response from Google AI during chat.');
        return null;
      }
      const result = response.choices[0].message;
      
      // If response is meant to be structured JSON, preserve it
      if (mergedOptions.response_format?.type === 'json_object') {
        return result.content;
      }
      
      // Handle function/tool calls if present
      if (result.function_call || result.tool_calls) {
        return result;
      }
      
      return result.content.trim() || '...';
    } catch (error) {
      console.error('Error while chatting with Google AI:', error);
      // Retry if the error is a rate limit error
      if (error.response && error.response.status === 429 && retries > 0) {
        console.error('Retrying chat with Google AI in 5 seconds...');
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
