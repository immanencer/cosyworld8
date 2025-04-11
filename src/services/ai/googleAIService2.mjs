import { BaseAIService } from './baseAIService.mjs';
import { GoogleGenerativeAI } from '@google/generative-ai';
import models from './models.google.config.mjs';
import stringSimilarity from 'string-similarity';

export class GoogleAIService2 extends BaseAIService {
  constructor(services) {
    super(services);

    const config = this.configService?.config?.ai?.google || {};
    this.apiKey = config.apiKey || process.env.GOOGLE_API_KEY;

    if (!this.apiKey) {
      console.error('Google API Key missing');
      this.googleAI = null;
      return;
    }

    this.googleAI = new GoogleGenerativeAI(this.apiKey);
    this.model = config.defaultModel || 'gemini-2.0-flash-001';
    this.structured_model = config.structuredModel || this.model;
    this.modelConfig = models;

    this.defaultCompletionOptions = {
      temperature: 0.9,
      maxOutputTokens: 1000,
      // topP: 0.95,
      // topK: 40,
      // frequencyPenalty: 0.2,
      // presencePenalty: 0.3,
    };
  }

  static mergeOptions(defaults, user) {
    return { ...defaults, ...(user || {}) };
  }

  transformSchema(schema) {
    if (!schema || typeof schema !== 'object') return schema;

    const clone = Array.isArray(schema) ? [] : {};
    for (const key in schema) {
      if (key === 'additionalProperties' || key === 'const') continue;
      const value = schema[key];
      clone[key] = typeof value === 'object' && value !== null ? this.transformSchema(value) : value;
    }

    if (Array.isArray(schema.type) && schema.type.includes('null')) {
      const nonNull = schema.type.filter(t => t !== 'null');
      clone.type = nonNull[0] || 'string';
      clone.nullable = true;
    }

    if (clone.type === 'object' && clone.properties && !clone.propertyOrdering) {
      clone.propertyOrdering = Object.keys(clone.properties);
    }

    if (clone.properties) {
      for (const key of Object.keys(clone.properties)) {
        clone.properties[key] = this.transformSchema(clone.properties[key]);
      }
    }

    if (clone.items) {
      clone.items = this.transformSchema(clone.items);
    }

    return clone;
  }

  schemaToPromptInstructions(schema) {
    const props = schema.properties || {};
    const required = new Set(schema.required || []);
    const fields = Object.entries(props).map(([k, def]) => {
      const type = def.type || 'string';
      const req = required.has(k) ? '(required)' : '(optional)';
      const enums = def.enum ? ` Possible values: ${def.enum.join(', ')}.` : '';
      return `- ${k}: ${type} ${req}.${enums}`;
    }).join('\n');

    const jsonExample = JSON.stringify(Object.fromEntries(Object.keys(props).map(k => [k, '...'])), null, 2);

    return `Respond only with a valid JSON object matching this structure:\n\n${jsonExample}\n\nField definitions:\n${fields}`;
  }

  async generateCompletion(prompt, options = {}) {
    if (!this.googleAI) throw new Error('Google AI client not initialized');
    if (!prompt || typeof prompt !== 'string') throw new Error('Prompt must be a non-empty string.');
    const modelId = options.model || this.model;
    const mergedOptions = GoogleAIService2.mergeOptions(this.defaultCompletionOptions, options);
    // Only include allowed fields in generationConfig
    const allowedConfigKeys = [
      'temperature', 'maxOutputTokens', 'topP', 'topK', 'frequencyPenalty', 'presencePenalty', 'responseMimeType', 'responseSchema'
    ];
    const generationConfig = Object.fromEntries(
      Object.entries(mergedOptions).filter(([key]) => allowedConfigKeys.includes(key))
    );
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const result = await this.googleAI.getGenerativeModel({ model: modelId })
          .generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig,
          });
        return result.response.text();
      } catch (err) {
        const retryInfo = this._parseRetryDelay(err);
        if (retryInfo.shouldRetry && attempt < 2) {
          console.warn(`[GoogleAIService2] Quota exceeded, retrying after ${retryInfo.delayMs}ms (attempt ${attempt + 1})`);
          await new Promise(res => setTimeout(res, retryInfo.delayMs));
          continue;
        }
        if (retryInfo.isQuotaError) {
          console.warn(`[GoogleAIService2] Quota exceeded during completion: ${err.message}`);
          return '-# [ Error: Google AI quota exceeded. Please try again later. ]';
        }
        console.error(`[GoogleAIService2] Google AI service error:`, err.message);
        return `-# [ Error: ${err.message} ]`;
      }
    }
  }

  modelIsAvailable(model) {
    if (!model) return false;
    return this.modelConfig.some(m => m.model === model.replace(':online', ''));
  }

  async selectRandomModel() {
    const rarityRanges = [
      { rarity: 'common', min: 1, max: 12 },
      { rarity: 'uncommon', min: 13, max: 17 },
      { rarity: 'rare', min: 18, max: 19 },
      { rarity: 'legendary', min: 20, max: 20 },
    ];
    const roll = Math.ceil(Math.random() * 20);
    const selectedRarity = rarityRanges.find(range => roll >= range.min && roll <= range.max)?.rarity;
    const availableModels = this.modelConfig.filter(model => model.rarity === selectedRarity);
    if (availableModels.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableModels.length);
      return availableModels[randomIndex].model;
    }
    return this.model;
  }

  _parseRetryDelay(error) {
    let retryDelaySec = 0;
    let isQuotaError = false;
    let shouldRetry = false;
    try {
      const match = error.message.match(/"retryDelay":"(\d+)(s|m)"/);
      if (match) {
        const value = parseInt(match[1], 10);
        const unit = match[2];
        retryDelaySec = unit === 'm' ? value * 60 : value;
        shouldRetry = true;
      }
      if (error.message.includes('429') && error.message.includes('quota')) {
        isQuotaError = true;
      }
    } catch {}
    return {
      delayMs: retryDelaySec * 1000 || 5000,
      isQuotaError,
      shouldRetry
    };
  }

  async chat(messages, options = {}) {
    if (!Array.isArray(messages) || messages.length === 0) throw new Error('messages must be a non-empty array');
    const normalized = messages.map(m => ({
      ...m,
      role: m.role === 'assistant' ? 'model' : m.role
    }));
    const last = normalized[normalized.length - 1];
    if (!last || last.role !== 'user') throw new Error("The last message in history must have the role 'user'.");
    const systemMessages = normalized.filter(m => m.role === 'system');
    const systemInstruction = systemMessages.map(m => m.content).join('\n');
    let chatHistory = normalized.slice(0, -1).filter(m => m.role !== 'system');
    if (chatHistory.length === 0 || chatHistory[0].role !== 'user') {
      console.warn('Inserting dummy user message to satisfy Google chat constraints.');
      chatHistory.unshift({ role: 'user', content: 'Hi.' });
    }
    const formattedHistory = chatHistory.map(m => ({
      role: m.role,
      parts: [{ text: m.content }]
    }));
    let modelId = options.model || this.model;
    if (!this.modelIsAvailable(modelId)) {
      console.warn(`Model "${modelId}" not available, selecting fallback.`);
      modelId = await this.selectRandomModel();
    }
    // Merge sensible defaults with options
    const mergedOptions = GoogleAIService2.mergeOptions(this.defaultCompletionOptions, options);
    // Only include allowed fields in generationConfig
    const allowedConfigKeys = [
      'temperature', 'maxOutputTokens', 'topP', 'topK', 'frequencyPenalty', 'presencePenalty', 'responseMimeType', 'responseSchema'
    ];
    const generationConfig = Object.fromEntries(
      Object.entries({
        ...mergedOptions,
        responseMimeType: options.schema ? 'application/json' : 'text/plain',
        ...(options.schema && { responseSchema: options.schema }),
      }).filter(([key]) => allowedConfigKeys.includes(key))
    );
    const chatSession = this.googleAI.getGenerativeModel({ model: modelId }).startChat({
      history: formattedHistory,
      generationConfig,
      ...(systemInstruction && {
        systemInstruction: {
          role: 'system',
          parts: [{ text: systemInstruction }]
        }
      })
    });
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const result = await chatSession.sendMessage([{ text: last.content }]);
        return result.response.text();
      } catch (err) {
        const retryInfo = this._parseRetryDelay(err);
        if (retryInfo.shouldRetry && attempt < 2) {
          console.warn(`[GoogleAIService2] Quota exceeded, retrying after ${retryInfo.delayMs}ms (attempt ${attempt + 1})`);
          await new Promise(res => setTimeout(res, retryInfo.delayMs));
          continue;
        }
        if (retryInfo.isQuotaError) {
          console.warn(`[GoogleAIService2] Quota exceeded during chat: ${err.message}`);
          return '-# [ Error: Google AI quota exceeded. Please try again later. ]';
        }
        console.error(`[GoogleAIService2] Google AI service error:`, err.message);
        return `-# [ Error: ${err.message} ]`;
      }
    }
  }


    async selectRandomModel() {
      const rarityRanges = [
        { rarity: 'common', min: 1, max: 12 },
        { rarity: 'uncommon', min: 13, max: 17 },
        { rarity: 'rare', min: 18, max: 19 },
        { rarity: 'legendary', min: 20, max: 20 },
      ];
  
      const roll = Math.ceil(Math.random() * 20);
      const selectedRarity = rarityRanges.find(range => roll >= range.min && roll <= range.max)?.rarity;
  
      const availableModels = this.modelConfig.filter(model => model.rarity === selectedRarity);
  
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
    
    async getModel(modelName) {
      if (!modelName) {
        console.warn('No model name provided for retrieval.');
        return await this.selectRandomModel();
      }
  
      modelName = modelName.replace(/:online$/, '').trim();
      const modelNames = this.modelConfig.map(model => model.model);
  
      if (modelNames.includes(modelName)) {
        return modelName;
      }
  
      const { bestMatch } = stringSimilarity.findBestMatch(modelName, modelNames);
  
      if (bestMatch.rating > 0.5) {
        console.info(`Fuzzy match found: "${modelName}" -> "${bestMatch.target}" (score: ${bestMatch.rating})`);
        return bestMatch.target;
      }
  
      console.warn(`No close match found for model: "${modelName}", defaulting to random model.`);
      return await this.selectRandomModel();
    }
}
