import { BasicService } from '../foundation/basicService.mjs';
import { aiModelService } from './aiModelService.mjs';

import OpenAI from 'openai';
import models from './models.openrouter.config.mjs';

export class OpenRouterAIService extends BasicService {
  constructor(services) {
    super(services);
    this.configService = services.configService;

    
    this.model = this.configService.config.ai.openrouter.defaultModel || 'openai/gpt-4o-mini';
    this.structured_model = this.configService.config.ai.openrouter.structured_model || 'openai/gpt-4o';
    this.openai = new OpenAI({
      apiKey: this.configService.config.ai.openrouter.apiKey,
      baseURL: 'https://openrouter.ai/api/v1',
      defaultHeaders: {
        'HTTP-Referer': 'https://ratimics.com', // Optional, for including your app on openrouter.ai rankings.
        'X-Title': 'rativerse', // Optional. Shows in rankings on openrouter.ai.
      },
    });
    this.modelConfig = models;

    // Register models with aiModelService
    aiModelService.registerModels('openrouter', models);

    // Default options that will be used if not overridden by the caller.
    this.defaultCompletionOptions = {
      max_tokens: 1000,
      temperature: 0.9,        // More randomness for creative output
      top_p: 0.95,             // Broader token selection for diversity
      frequency_penalty: 0.2,  // Moderate penalty to avoid repetitive loops
      presence_penalty: 0.3,   // Push for new ideas and concepts
    };

    // Note: Chat defaults differ from completions. They can be adjusted as needed.
    this.defaultChatOptions = {
      model: 'meta-llama/llama-3.2-1b-instruct',
      temperature: 0.7,
      max_tokens: 1000,
      temperature: 0.9,        // More randomness for creative output
      top_p: 0.95,             // Broader token selection for diversity
      frequency_penalty: 0.2,  // Moderate penalty to avoid repetitive loops
      presence_penalty: 0.3,   // Push for new ideas and concepts
    };

    this.defaultVisionOptions = {
      model: '"x-ai/grok-2-vision-1212"',
      temperature: 0.5,
      max_tokens: 200,
    };
  }

  async selectRandomModel() {
    return aiModelService.getRandomModel('openrouter');
  }

  modelIsAvailable(model) {
    return aiModelService.modelIsAvailable('openrouter', model);
  }

  /**
 * Generates structured output using OpenRouter-compatible models and OpenAI-style schema.
 * @param {Object} config
 * @param {string} config.prompt - The user prompt to send.
 * @param {Object} config.schema - A JSON schema describing the expected structure.
 * @param {Object} config.options - Additional chat options (e.g., model, temperature).
 * @returns {Promise<Object>} - The parsed and validated JSON object from the model.
 */
  async generateStructuredOutput({ prompt, schema, options = {} }) {
    const messages = [
      { role: 'user', content: prompt }
    ];

    const structuredOptions = {
      model: options.model || this.structured_model,
      schema,
      response_format: {
        type: 'json_schema',
        json_schema: schema
      },
      ...options
    };

    const response = await this.chat(messages, structuredOptions);

    try {
      return typeof response === 'string' ? JSON.parse(response) : response;
    } catch (err) {
      this.logger.error('Failed to parse structured output from OpenRouter:', err);
      throw new Error('Structured output was not valid JSON.');
    }
  }


  async generateCompletion(prompt, options = {}) {
    // Merge our defaults with caller-supplied options.
    const mergedOptions = {
      model: this.model,
      transforms: ["middle-out"],
      prompt,
      ...this.defaultCompletionOptions,
      ...options,
    };

    try {
      const response = await this.openai.completions.create(mergedOptions);
      if (!response || !response.choices || response.choices.length === 0) {
        this.logger.error('Invalid response from OpenRouter during completion generation.');
        return null;
      }
      return response.choices[0].text.trim();
    } catch (error) {
      this.logger.error('Error while generating completion from OpenRouter:', error);
      return null;
    }
  }

  async chat(messages, options = {}, retries = 3) {
    // Merge our default chat options with any caller options, preserving structure
    const mergedOptions = {
      model: this.model,
      transforms: ["middle-out"],
      messages: messages.filter(m => m.content),
      ...this.defaultChatOptions
      , ...options,
    };

    if (options.schema) {
      mergedOptions.response_format = {
        type: 'json_schema',
        json_schema: options.schema,
      };
    }

    // Verify that the chosen model is available. If not, fall back.
    let fallback = false;
    if (this.model != 'openrouter/auto' && !this.modelIsAvailable(mergedOptions.model)) {
      this.logger.error('Invalid model provided to chat:', mergedOptions.model);
      mergedOptions.model = 'openrouter/auto';
      this.logger.info('Falling back to random model:', mergedOptions.model);
      fallback = true;
    }

    this.logger.info(`Generating chat completion with model ${mergedOptions.model}...`);

    try {
      const response = await this.openai.chat.completions.create(mergedOptions);
      if (!response) {
        this.logger.error('Null response from OpenRouter during chat.');
        return null;
      }

      if (response.error) {
        this.logger.error('Error in OpenRouter response:', response.error);
        return null;
      }

      if (!response.choices || response.choices.length === 0) {
        this.logger.error('Unexpected response format from OpenRouter:', response);
        this.logger.info('Response:', JSON.stringify(response, null, 2));
        return null;
      }
      const result = response.choices[0].message;

      // If response is meant to be structured JSON, preserve it
      if (mergedOptions.response_format?.type === 'json_object') {
        return result.content;
      }

      // Handle function/tool calls if present
      if (result.tool_calls) {
        return result;
      }

      if (!result.content && !result.reasoning) {
        this.logger.error('Invalid response from OpenRouter during chat.');
        this.logger.info(JSON.stringify(result, null, 2));
        return '\n-# [⚠️ No response from OpenRouter]';
      }

      if (result.reasoning) { 
        result.content = '<think>' + result.reasoning + '</think>' + result.content;
      }

      return (result.content.trim() || '...') + (fallback ? `\n-# [⚠️ Fallback model (${mergedOptions.model}) used.]` : '');
    } catch (error) {
      this.logger.error('Error while chatting with OpenRouter:', error);
      // Retry if the error is a rate limit error
      if (error.response && error.response.status === 429 && retries > 0) {
        this.logger.error('Retrying chat with OpenRouter in 5 seconds...');
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
  async getModel(modelName) {
    if (!modelName) {
      console.warn('No model name provided for retrieval.');
      return await this.selectRandomModel();
    }
    // Normalize the model name by removing any suffixes (e.g., ":online")
    modelName = modelName.replace(/:online$/, '').trim();

    return aiModelService.findClosestModel('openrouter', modelName);
  }


  /**
   * Analyzes an image and returns a description using OpenRouter's API.
   * Supports both image URLs and base64/mimeType input.
   * @param {string|Buffer} imageInput - The URL of the image or base64 buffer.
   * @param {string} [mimeType] - The mime type if using base64.
   * @param {string} [prompt] - The prompt to use for image analysis.
   * @param {Object} [options] - Additional options for the API request.
   * @returns {Promise<string|null>} - The description of the image or null if analysis fails.
   */
  async analyzeImage(imageInput, mimeType, prompt = "Describe this image in detail.", options = {}) {
    try {
      let messages;
      if (typeof imageInput === 'string' && (!mimeType || imageInput.startsWith('http'))) {
        // imageInput is a URL
        messages = [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: imageInput } },
            ],
          },
        ];
      } else if (imageInput && mimeType) {
        // imageInput is base64 or buffer
        messages = [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: `data:${mimeType};base64,${imageInput}` } },
            ],
          },
        ];
      } else {
        this.logger.error('Invalid image input for analysis.');
        return null;
      }

      const response = await this.openai.chat.completions.create({
        ...this.defaultVisionOptions,
        messages,
        ...options,
      });

      if (!response || !response.choices || response.choices.length === 0) {
        this.logger.error('Invalid response from OpenRouter during image analysis.');
        return null;
      }

      const content = response.choices[0].message.content?.trim();
      if (!content) {
        this.logger.error('OpenRouter image analysis returned empty content.');
        return null;
      }
      return content;
    } catch (error) {
      this.logger.error('Error analyzing image with OpenRouter:', error);
      return null;
    }
  }
}