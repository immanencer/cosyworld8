import { GoogleGenerativeAI } from '@google/generative-ai';
import defaultModels from '../models.google.config.mjs';
import { response } from 'express';

export class GoogleAIService {
  constructor(services) {
    const config = services.configService.config.ai.google;
    this.modelConfig = [];
    this.model = config.defaultModel || 'gemini-2.0-flash';
    this.structured_model = config.structured_model || 'gemini-2.0-flash';
    this.apiKey = config.apiKey || process.env.GOOGLE_API_KEY;
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

  async generateStructuredOutput({ prompt, schema, options = {} }) {
    try {
      const generativeModel = this.googleAI.getGenerativeModel({ model: this.structured_model });

      const generationConfig = {
        temperature: options.temperature || 0.7,
        maxOutputTokens: options.maxOutputTokens || 1024,
        topP: options.topP || 0.95,
        topK: options.topK || 40,
        responseSchema: schema
      };

      const result = await generativeModel.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig
      });

      return result.response.json();
    } catch (error) {
      console.error('Error generating structured output:', error);
      throw error;
    }
  }

  async analyzeImage(imageBase64, mimeType, prompt, options = {}) {
    try {
      const generativeModel = this.googleAI.getGenerativeModel({ model: this.model });

      const generationConfig = {
        temperature: options.temperature || 0.7,
        maxOutputTokens: options.maxOutputTokens || 1024,
        topP: options.topP || 0.95,
        topK: options.topK || 40
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
      additionalProperties: false,
    };

    return await this.generateStructuredOutput({ prompt, schema });
  }
}