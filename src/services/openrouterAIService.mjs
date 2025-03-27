import OpenAI from 'openai';
import models from '../models.config.mjs';
import stringSimilarity from 'string-similarity';

export class OpenRouterAIService {
  constructor(apiKey) {
    this.model = process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.2-3b-instruct';
    this.openai = new OpenAI({
      apiKey: apiKey || process.env.OPENROUTER_API_TOKEN,
      baseURL: 'https://openrouter.ai/api/v1',
      defaultHeaders: {
        'HTTP-Referer': 'https://ratimics.com', // Optional, for including your app on openrouter.ai rankings.
        'X-Title': 'rativerse', // Optional. Shows in rankings on openrouter.ai.
      },
    });
    this.modelConfig = models;

    // Default options that will be used if not overridden by the caller.
    this.defaultCompletionOptions = {
      temperature: 0.7,
      max_tokens: 1000,
      top_p: 1.0,
      frequency_penalty: 0,
      presence_penalty: 0,
    };

    // Note: Chat defaults differ from completions. They can be adjusted as needed.
    this.defaultChatOptions = {
      model: 'meta-llama/llama-3.2-1b-instruct',
      temperature: 0.7,
      max_tokens: 1000,
      top_p: 1.0,
      frequency_penalty: 0,
      presence_penalty: 0,
    };

    this.defaultVisionOptions = {
      model: '"x-ai/grok-2-vision-1212"',
      temperature: 0.5,
      max_tokens: 200,
    };
  }

  async selectRandomModel() {
    const rarityRanges = [
      { rarity: 'common', min: 1, max: 12 },        // Common: 1-12 (60%)
      { rarity: 'uncommon', min: 13, max: 17 },       // Uncommon: 13-17 (25%)
      { rarity: 'rare', min: 18, max: 19 },           // Rare: 18-19 (10%)
      { rarity: 'legendary', min: 20, max: 20 },      // Legendary: 20 (5%)
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
    if (!model) return false;
    return this.modelConfig.some(m => m.model === model.replace(':online', ''));
  }

  async generateCompletion(prompt, options = {}) {
    // Merge our defaults with caller-supplied options.
    const mergedOptions = {
      model: this.model,
      prompt,
      ...this.defaultCompletionOptions,
      ...options,
    };

    try {
      const response = await this.openai.completions.create(mergedOptions);
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

  async chat(messages, options = {}, retries = 3) {
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
    let fallback = false;
    if (!this.modelIsAvailable(mergedOptions.model)) {
      console.error('Invalid model provided to chat:', mergedOptions.model);
      mergedOptions.model = 'deepseek/deepseek-chat-v3-0324:free';
      fallback = true;
    }

    console.log(`Generating chat completion with model ${mergedOptions.model}...`);

    try {
      const response = await this.openai.chat.completions.create(mergedOptions);
      if (!response || !response.choices || response.choices.length === 0) {
        console.error('Invalid response from OpenRouter during chat.');
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

      if (!result.content) {
        console.error('Invalid response from OpenRouter during chat.');
        console.log(JSON.stringify(result, null, 2));
        return '\n-# [⚠️ No response from OpenRouter]';
      }

      return (result.content.trim() || '...') + (fallback ? `\n-# [⚠️ Fallback model (${mergedOptions.model}) used.]` : '');
    } catch (error) {
      console.error('Error while chatting with OpenRouter:', error);
      // Retry if the error is a rate limit error
      if (error.response && error.response.status === 429 && retries > 0) {
        console.error('Retrying chat with OpenRouter in 5 seconds...');
        await new Promise(resolve => setTimeout(resolve, 5000));
        return this.chat(messages, options, retries - 1);
      }
      return null;
    }
  }

    /**
   * Retrieves a model by exact match or finds the closest match using fuzzy search.
   * @param {string} modelName - The name of the model to search for.
   * @returns {string|null} - The exact or closest matching model name, or null if no match is found.
   */
    getModel(modelName) {
      // Extract all model names from the configuration
      const modelNames = this.modelConfig.map(model => model.model);
  
      // Check for an exact match first
      if (modelNames.includes(modelName)) {
        return modelName;
      }
  
      // Perform fuzzy search to find the closest match
      const { bestMatch } = stringSimilarity.findBestMatch(modelName, modelNames);
  
      // Return the closest match if the similarity score is above a threshold (e.g., 0.5)
      if (bestMatch.rating > 0.5) {
        console.log(`Fuzzy match found: "${modelName}" -> "${bestMatch.target}" (score: ${bestMatch.rating})`);
        return bestMatch.target;
      }
  
      console.warn(`No close match found for model: "${modelName}"`);
      return null;
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

  /**
   * Analyzes an image and returns a description using Gemini Flash 2.0.
   * @param {string} imageUrl - The URL of the image to analyze.
   * @returns {Promise<string|null>} - The description of the image or null if analysis fails.
   */
  async analyzeImage(imageUrl) {
    try {
      const messages = [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Describe this image in detail.',
            },
            {
              type: 'image_url',
              image_url: imageUrl,
            },
          ],
        },
      ];

      const response = await this.openai.chat.completions.create({
        ...this.defaultVisionOptions,
        messages,
      });

      if (!response || !response.choices || response.choices.length === 0) {
        console.error('Invalid response from OpenRouter during image analysis.');
        return null;
      }

      console.log(response.choices[0].message.content);

      return response.choices[0].message.content.trim();
    } catch (error) {
      console.error('Error analyzing image with OpenRouter:', error);
      return null;
    }
  }
}