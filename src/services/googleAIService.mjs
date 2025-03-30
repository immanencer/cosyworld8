import { GoogleGenerativeAI } from '@google/generative-ai';
import defaultModels from '../models.google.config.mjs';
import { response } from 'express';

export class GoogleAIService {
  constructor(config = {}, services) {
    this.modelConfig = [];
    this.model = config.defaultModel || 'gemini-1.5-flash';
    this.apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!this.apiKey) {
      throw new Error('GOOGLE_AI_API_KEY environment variable is not set');
    }
    this.googleAI = new GoogleGenerativeAI(this.apiKey);
    this.services = services; // Store services
    this.lastModelFetchTime = 0;
    this.modelRefreshInterval = 3600000; // 1 hour in milliseconds
    this.defaultChatOptions = {}; // Added missing property
    console.log(`Initialized GoogleAIService with default model: ${this.model}`);

    // Initialize models immediately
    this.fetchModels().then(() => {
      if (!this.modelIsAvailable(this.model)) {
        const availableModel = this.modelConfig.find(m => m.model.startsWith('gemini-'));
        if (availableModel) {
          console.log(`Default model ${this.model} not available, switching to ${availableModel.model}`);
          this.model = availableModel.model;
        }
      }
    }).catch(error => {
      console.error('Failed to initialize models:', error);
    });
  }

  async fetchModels() {
    try {
      const now = Date.now();
      if (now - this.lastModelFetchTime > this.modelRefreshInterval || this.modelConfig.length === 0) {
        console.log('Loading models from local configuration');
        this.modelConfig = defaultModels || [];
        this.lastModelFetchTime = now;
        console.log(`Loaded ${this.modelConfig.length} models from configuration`);
      }
      return this.modelConfig;
    } catch (error) {
      console.error('Error loading model configuration:', error);
      return [];
    }
  }

  async selectRandomModel() {
    if (this.modelConfig.length === 0) {
      await this.fetchModels();
    }

    const rarityRanges = [
      { rarity: 'common', min: 1, max: 12 },
      { rarity: 'uncommon', min: 13, max: 17 },
      { rarity: 'rare', min: 18, max: 19 },
      { rarity: 'legendary', min: 20, max: 20 },
    ];

    const roll = Math.ceil(Math.random() * 20);
    const selectedRarity = rarityRanges.find(range => roll >= range.min && roll <= range.max)?.rarity;
    const availableModels = this.modelConfig.filter(model => model.rarity === selectedRarity);

    return availableModels.length > 0
      ? availableModels[Math.floor(Math.random() * availableModels.length)].model
      : this.model;
  }

  async modelIsAvailable(model) {
    try {
      if (!this.modelConfig?.length) {
        await this.fetchModels();
      }

      const modelExists = this.modelConfig.some(m => m.model === model);
      if (!modelExists) {
        console.log(`Model ${model} not found in configuration`);
        return false;
      }

      // Additional check: try to fetch the model capabilities to ensure it's actually available
      try {
        const generativeModel = this.googleAI.getGenerativeModel({ model });
        // We don't need to do anything with the model, just see if we can create it
        return true;
      } catch (modelError) {
        // If there's an error creating the model, it's likely not available
        console.log(`Model ${model} exists in configuration but is not accessible: ${modelError.message}`);
        return false;
      }
    } catch (error) {
      console.error(`Error checking model availability: ${error.message}`);
      return false;
    }
  }

  toResponseSchema(formatObject, schemaName = "character") {
    return {
      type: "json_schema",
      json_schema: {
        name: schemaName,
        strict: true,
        schema: {
          type: "object",
          properties: Object.fromEntries(
            Object.entries(formatObject.properties).map(([key, value]) => ({
              [key]: {
                type: value.type.toLowerCase(),
                description: value.description || ""
              }
            }))
          ),
          required: formatObject.required,
          additionalProperties: false
        }
      }
    };
  }
  

  async chat(messages, options = {}) {
    try {
      // Extract system instruction if present
      let systemInstruction;
      if (messages[0]?.role === 'system') {
        systemInstruction = messages[0].content;
        messages = messages.slice(1);
      }
      
      // Use a non-constant variable for model selection
      let selectedModel = options.model || this.model;

      // Map messages to Google's format, supporting both text and images
      const contents = messages
        .filter(msg => msg.content)
        .map(msg => {
          const role = msg.role === 'assistant' ? 'model' : msg.role;
          if (role !== 'user' && role !== 'model') {
            throw new Error(`Invalid role: ${msg.role}`);
          }
          const parts = Array.isArray(msg.content)
            ? msg.content.map(part => {
                if (part.text) return { text: part.text };
                if (part.inlineData) return { inlineData: part.inlineData };
                return part; // Fallback for unexpected part formats
              })
            : [{ text: msg.content }];
          return { role, parts };
        });

      // Model availability check and fallback
      if (!await this.modelIsAvailable(selectedModel)) {
        console.warn(`Model ${selectedModel} unavailable, using default: ${this.model}`);
        selectedModel = this.model;
      }

      // Initialize generative model with system instruction
      const generativeModel = this.googleAI.getGenerativeModel({
        model: selectedModel,
        systemInstruction
      });

      // Configure generation options
      const generationConfig = {
        temperature: options.temperature || 0.7,
        maxOutputTokens: options.max_tokens || 1024,
        topP: options.top_p || 0.95,
        topK: options.top_k || 40,
        responseSchema: options.responseSchema || (options.response_format ? this.toResponseSchema(options.response_format) : undefined),
      };

      // Generate response
      const result = await generativeModel.generateContent({
        contents,
        generationConfig
      });

      // Extract and return the response text
      const candidates = result.response.candidates;
      if (candidates && candidates.length > 0) {
        return candidates[0].content.parts[0].text;
      }
      throw new Error('No candidates returned');
    } catch (error) {
      console.error('Chat error:', error);
      throw error;
    }
  }

  async analyzeImage(imageBase64, mimeType, prompt, options = {}) {
    try {
      const model = options.model || this.model;
      const generativeModel = this.googleAI.getGenerativeAI({ model });

      const generationConfig = {
        temperature: options.temperature || 0.7,
        maxOutputTokens: options.maxOutputTokens || 1024,
        topP: options.topP || 0.95,
        topK: options.topK || 40,
        ...(options.responseSchema ? { responseSchema: options.responseSchema } : {})
      };

      const parts = [
        { inlineData: { data: imageBase64, mimeType } },
        { text: prompt }
      ];

      const result = await generativeModel.generateContent({
        contents: [{ role: 'user', parts }],
        generationConfig
      });

      return result.response.text();
    } catch (error) {
      console.error('Image analysis error:', error);
      throw error;
    }
  }

  async speakAsItem(item, channelId) {
    const prompt = `
      You are a mystical item called "${item.name}" located in a dungeon channel (ID: ${channelId}).
      Your description is: ${item.description}.
      Respond with only your speech as if you are the item coming to life in this channel.
    `;
    try {
      const response = await this.chat(null, prompt);
      return response || `The ${item.name} remains silent.`;
    } catch (error) {
      return `The ${item.name} remains silent.`;
    }
  }

  // Example usage for item creation
  async createItem(itemName, description) {
    const prompt = `Generate a JSON object for an item with the following details:
Name: "${itemName}"
Description: "${description}"
Include fields: name, description, type, rarity, properties.`;

    const schema = {
      type: 'object',
      properties: {
        name: { type: 'string' },
        description: { type: 'string' },
        type: { type: 'string' },
        rarity: { type: 'string' },
        properties: { type: 'object' },
      },
      required: ['name', 'description', 'type', 'rarity', 'properties'],
    };

    return await this.generateStructuredOutput({ prompt, schema });
  }
}