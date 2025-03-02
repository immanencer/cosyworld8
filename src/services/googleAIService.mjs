import { GoogleGenerativeAI } from '@google/generative-ai';
import defaultModels from '../models.config.mjs';

export class GoogleAIService {
  constructor(config = {}) {
    this.modelConfig = [];
    this.model = config.defaultModel || 'gemini-1.5-flash';
    this.apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!this.apiKey) {
      throw new Error('GOOGLE_AI_API_KEY environment variable is not set');
    }
    this.googleAI = new GoogleGenerativeAI(this.apiKey);
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
      return true; // Simplified since API check was unreliable
    } catch (error) {
      console.error(`Error checking model availability: ${error.message}`);
      return false;
    }
  }

  async chat(systemPrompt, userPrompt, options = {}) {
    try {
      const model = options.model || this.model;
      if (!await this.modelIsAvailable(model)) {
        throw new Error(`Model ${model} is not available`);
      }

      const generativeModel = this.googleAI.getGenerativeModel({
        model,
        systemInstruction: typeof systemPrompt === 'string' ? systemPrompt : undefined
      });

      const generationConfig = {
        temperature: options.temperature || 0.7,
        maxOutputTokens: options.maxOutputTokens || 1024,
        topP: options.topP || 0.95,
        topK: options.topK || 40,
        ...(options.responseSchema ? {
          responseMimeType: "application/json",
          responseSchema: options.responseSchema
        } : {})
      };

      const processPrompt = async (prompt) => {
        // Handle case where prompt is undefined or null
        if (!prompt) {
          return [{ text: "Please provide a prompt" }];
        }

        if (typeof prompt === 'string') {
          return prompt.trim() ? [{ text: prompt.trim() }] : [{ text: "No content provided" }];
        }

        if (!Array.isArray(prompt)) {
          return [{ text: typeof prompt === 'object' ? JSON.stringify(prompt) : String(prompt) }];
        }

        const parts = [];
        for (const part of prompt) {
          if (typeof part === 'string') {
            parts.push({ text: part.trim() || "Empty string" });
          } else if (part?.text) {
            parts.push({ text: part.text.trim() || "Empty text" });
          } else if (part?.inlineData?.data && part.inlineData.mimeType) {
            // parts.push({
            //   inlineData: {
            //     data: part.inlineData.data,
            //     mimeType: part.inlineData.mimeType
            //   }
            // });
          } else if (part?.type === 'image_url' && part.image_url) {
            // try {
            //   const response = await fetch(part.image_url);
            //   if (!response.ok) throw new Error('Failed to fetch image');
            //   const blob = await response.blob();
            //   const base64 = await new Promise((resolve) => {
            //     const reader = new FileReader();
            //     reader.onloadend = () => resolve(reader.result.split(',')[1]);
            //     reader.readAsDataURL(blob);
            //   });
            //   parts.push({
            //     inlineData: {
            //       data: base64,
            //       mimeType: blob.type
            //     }
            //   });
            // } catch (error) {
            //   console.error('Error processing image:', error);
            //   parts.push({ text: '[Image unavailable]' });
            // }
          } else {
            // Handle any unexpected part format
            parts.push({ text: '[Invalid content part]' });
          }
        }

        // Ensure we always have at least one valid part
        return parts.length > 0 ? parts : [{ text: "No valid content provided" }];
      };

      const userParts = await processPrompt(userPrompt);
      const contents = [{ role: 'user', parts: userParts }];

      // Validate contents before sending
      if (!contents[0].parts.every(part =>
        (part.text && typeof part.text === 'string') ||
        (part.inlineData?.data && part.inlineData?.mimeType)
      )) {
        throw new Error('Invalid content parts structure');
      }

      const result = await generativeModel.generateContent({
        contents,
        generationConfig
      });

      return result.response.text();
    } catch (error) {
      console.error('Chat error:', error);
      if (options.fallbackOnError && options.fallbackResponse) {
        return options.fallbackResponse;
      }
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
}