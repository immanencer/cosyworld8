import { BasicService } from '../foundation/basicService.mjs';
import { GoogleGenerativeAI } from '@google/generative-ai';
import modelsConfig from './models.google.config.mjs';
import stringSimilarity from 'string-similarity';
import { aiModelService } from './aiModelService.mjs';
import fs from 'fs/promises';
import path from 'path';

export class GoogleAIService extends BasicService {
  requiredServices = [
    'configService',
    's3Service',
  ];
  constructor(services) {
    super(services)
    
    this.configService = services.configService;
    this.s3Service = services.s3Service;
    
    const config = this.configService.config.ai.google;
    this.apiKey = config.apiKey || process.env.GOOGLE_API_KEY;

    if (!this.apiKey) {
      console.error(`[${new Date().toISOString()}] [FATAL] Google API Key is missing. Please configure GOOGLE_API_KEY.`);
      this.googleAI = null;
      return;
    }

    this.googleAI = new GoogleGenerativeAI(this.apiKey);
    this.model = config.defaultModel || 'gemini-2.0-flash-001';
    this.structured_model = config.structuredModel || this.model;
    this.rawModels = modelsConfig.rawModels;

    // Default options for chat and completion
    this.defaultCompletionOptions = {
      temperature: 0.9,
      maxOutputTokens: 1000,
      topP: 0.95,
      topK: 40,
      frequencyPenalty: 0.2,
      presencePenalty: 0.3,
    };

    this.defaultChatOptions = {
      model: this.model,
      temperature: 0.7,
      maxOutputTokens: 1000,
      topP: 0.95,
      topK: 40,
      frequencyPenalty: 0.2,
      presencePenalty: 0.3,
    };

    this.defaultVisionOptions = {
      model: 'gemini-1.5-vision',
      temperature: 0.5,
      maxOutputTokens: 200,
    };

    console.log(`[${new Date().toISOString()}] Initialized GoogleAIService with default model: ${this.model}`);
  }

  async registerSupportedModels() {
    if (!this.rawModels || this.rawModels.length === 0) {
      console.warn('[GoogleAIService] No raw models available to register.');
      return;
    }

    const supportedModels = this.rawModels.filter(model => {
      const methods = model.supportedGenerationMethods || [];
      return methods.includes('generateContent') || methods.includes('bidiGenerateContent');
    }).map(model => ({
      model: model.name.replace('models/', ''),
      rarity: this.assignRarity(model.name),
      capabilities: model.supportedGenerationMethods,
    }));

    if (supportedModels.length === 0) {
      console.warn('[GoogleAIService] No models with required capabilities found.');
      return;
    }

    aiModelService.registerModels('googleAI', supportedModels);

    console.info(`[GoogleAIService] Registered ${supportedModels.length} models with aiModelService.`);
  }

  assignRarity(modelName) {
    if (modelName.includes('pro')) return 'legendary';
    if (modelName.includes('flash')) return 'uncommon';
    return 'common';
  }

  async initialize() {
    await this.registerSupportedModels();
  }

  schemaToPromptInstructions(schema) {
    const props = schema.properties || {};
    const required = new Set(schema.required || []);
  
    const fields = Object.entries(props).map(([key, def]) => {
      const type = def.type || 'string';
      const req = required.has(key) ? '(required)' : '(optional)';
      const enumValues = def.enum ? ` Possible values: ${def.enum.join(', ')}.` : '';
      return `- ${key}: ${type} ${req}.${enumValues}`;
    }).join('\n');
  
    const jsonExample = JSON.stringify(
      Object.fromEntries(
        Object.keys(props).map(k => [k, '...'])
      ),
      null,
      2
    );
  
    return `
  Respond only with a valid JSON object (no commentary).
  The object must match this structure:
  
  ${jsonExample}
  
  Field definitions:
  ${fields}
    `.trim();
  }

  sanitizeSchema(schema) {
    if (!schema || typeof schema !== 'object') return schema;

    const clone = Array.isArray(schema) ? [] : {};
    for (const key in schema) {
      if (key === 'additionalProperties' || key === 'const') continue;

      const value = schema[key];
      if (typeof value === 'object' && value !== null) {
        clone[key] = this.sanitizeSchema(value);
      } else {
        clone[key] = value;
      }
    }

    // Determine if this is a schema definition (not a nested property)
    const isSchemaDef =
      ('properties' in schema || 'items' in schema || 'enum' in schema || 'anyOf' in schema || 'oneOf' in schema || Array.isArray(schema));

    if (!clone.type && isSchemaDef) {
      if (Array.isArray(clone)) clone.type = 'array';
      else clone.type = 'object';
    }

    // Convert OpenAI-style nullable types to Vertex AI compatible
    if (Array.isArray(schema.type) && schema.type.includes('null')) {
      const nonNullTypes = schema.type.filter(t => t !== 'null');
      if (nonNullTypes.length === 1) {
        clone.type = nonNullTypes[0];
        clone.nullable = true;
      } else if (nonNullTypes.length === 0) {
        clone.type = 'string';
        clone.nullable = true;
      } else {
        clone.type = nonNullTypes[0];
        clone.nullable = true;
      }
    }

    return clone;
  }

  async tryParseGeminiJSONResponse(getRawResponse, retries = 2) {
    for (let i = 0; i <= retries; i++) {
      const raw = await getRawResponse();
      try {
        // Extract the first JSON object or array, ignoring trailing characters
        const jsonRegex = /([\[{])[\s\S]*?([\]}])/m;
        const match = raw.match(jsonRegex);
        if (!match) throw new Error("No JSON found");

        // Find the full JSON substring from the first opening to its matching closing brace/bracket
        const startIdx = raw.indexOf(match[1]);
        let openChar = match[1];
        let closeChar = openChar === '{' ? '}' : ']';
        let depth = 0;
        let endIdx = -1;
        for (let j = startIdx; j < raw.length; j++) {
          if (raw[j] === openChar) depth++;
          else if (raw[j] === closeChar) depth--;
          if (depth === 0) {
            endIdx = j + 1;
            break;
          }
        }
        if (endIdx === -1) throw new Error("Unbalanced JSON braces");

        const jsonStr = raw.slice(startIdx, endIdx).trim();
        return JSON.parse(jsonStr);
      } catch (err) {
        console.warn(`JSON parse failed (attempt ${i + 1}):`, err.message);
        if (i === retries) throw new Error("Failed to parse JSON after retries");
      }
    }
  }
  
  async generateStructuredOutput({ prompt, schema, options = {} }) {
    const actualSchema = schema?.schema || schema;

    // Clone and sanitize schema
    const sanitizedSchema = this.sanitizeSchema(actualSchema);

    // Add propertyOrdering recursively if missing
    function addOrdering(obj) {
      if (obj && typeof obj === 'object') {
        if (obj.type === 'object' && obj.properties && !obj.propertyOrdering) {
          obj.propertyOrdering = Object.keys(obj.properties);
        }
        if (obj.properties) {
          for (const key of Object.keys(obj.properties)) {
            addOrdering(obj.properties[key]);
          }
        }
        if (obj.items) {
          addOrdering(obj.items);
        }
      }
    }
    addOrdering(sanitizedSchema);

    const schemaInstructions = this.schemaToPromptInstructions(actualSchema);
    const fullPrompt = `${schemaInstructions}\n\n${prompt.trim()}`;

    return await this.tryParseGeminiJSONResponse(() =>
      this.generateCompletion(fullPrompt, {
        ...this.defaultCompletionOptions,
        ...options,
        model: this.structured_model,
        responseMimeType: 'application/json',
        responseSchema: sanitizedSchema,
      })
    );
  }

  async generateCompletion(prompt, options = {}) {
    if (!this.googleAI) throw new Error("Google AI client not initialized.");

    const modelId = options.model || this.model;

    const { model, ...restOptions } = options;

    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const result = await this.googleAI.getGenerativeModel({ model: modelId })
          .generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
              ...this.defaultCompletionOptions,
              ...restOptions,
            },
          });
        return result.response.text();
      } catch (error) {
        const retryInfo = this._parseRetryDelay(error);
        if (retryInfo.shouldRetry && attempt < 2) {
          console.warn(`[GoogleAIService] Quota exceeded, retrying after ${retryInfo.delayMs}ms (attempt ${attempt + 1})`);
          await new Promise(res => setTimeout(res, retryInfo.delayMs));
          continue;
        }
        if (retryInfo.isQuotaError) {
          console.warn(`[GoogleAIService] Quota exceeded: ${error.message}`);
          return 'Error: Google AI quota exceeded. Please try again later.';
        }
        console.error(`[${new Date().toISOString()}] Completion error:`, error.message);
        throw error;
      }
    }
  }

  async chat(history, options = {}) {
    if (!this.googleAI) throw new Error("Google AI client not initialized.");
  
    if (!Array.isArray(history) || history.length === 0) {
      throw new Error("History must be a non-empty array.");
    }
  
    const normalizedHistory = history.map(msg => ({
      ...msg,
      role: msg.role === 'assistant' ? 'model' : msg.role
    }));
  
    const lastMessage = normalizedHistory[normalizedHistory.length - 1];
    if (lastMessage.role !== 'user') {
      throw new Error("The last message in history must have the role 'user'.");
    }
  
    const systemMessages = normalizedHistory.filter(msg => msg.role === 'system');
    const systemInstruction = systemMessages.map(msg => msg.content).join('\n');
  
    let chatHistory = normalizedHistory
      .slice(0, -1)
      .filter(msg => msg.role !== 'system');
  
    if (chatHistory.length === 0 || chatHistory[0].role !== 'user') {
      console.warn("Inserting dummy user message to satisfy Google chat constraints.");
      chatHistory.unshift({
        role: 'user',
        content: 'Hi.'
      });
    }
  
    const formattedHistory = chatHistory.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.content }]
    }));
  
    let modelId = options.model || this.model;
    if (!this.modelIsAvailable(modelId)) {
      console.warn(`Model "${modelId}" not available, selecting fallback.`);
      modelId = await this.selectRandomModel();
    }
  
    const generativeModel = this.googleAI.getGenerativeModel({ model: modelId });
  
    const generationConfig = {
      temperature: options.temperature ?? 0.7,
      maxOutputTokens: options.maxOutputTokens ?? 1500,
      topP: options.topP ?? 0.95,
      topK: options.topK ?? 40,
      responseMimeType: options.schema ? 'application/json' : 'text/plain',
      ...(options.schema && { responseSchema: options.schema }),
    };
  
    const chatSession = generativeModel.startChat({
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
        const result = await chatSession.sendMessage([
          { text: lastMessage.content }
        ]);
        return result.response.text();
      } catch (error) {
        const retryInfo = this._parseRetryDelay(error);
        if (retryInfo.shouldRetry && attempt < 2) {
          console.warn(`[GoogleAIService] Quota exceeded during chat, retrying after ${retryInfo.delayMs}ms (attempt ${attempt + 1})`);
          await new Promise(res => setTimeout(res, retryInfo.delayMs));
          continue;
        }
        if (retryInfo.isQuotaError) {
          console.warn(`[GoogleAIService] Quota exceeded during chat: ${error.message}`);
          return '-# [ Error: Google AI quota exceeded. Please try again later. ]';
        }
        console.error(`[${new Date().toISOString()}] Google AI service error:`, error.message);
        return `-# [ Error: ${error.message} ]`;
      }
    }
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
      delayMs: retryDelaySec * 1000 || 5000, // default 5s if not found
      isQuotaError,
      shouldRetry
    };
  }

  async selectRandomModel() {
    if (!this.rawModels || !Array.isArray(this.rawModels)) {
      console.warn('[GoogleAIService] rawModels is not initialized or is not an array.');
      return this.model; // Fallback to default model
    }

    const rarityRanges = [
      { rarity: 'common', min: 1, max: 12 },
      { rarity: 'uncommon', min: 13, max: 17 },
      { rarity: 'rare', min: 18, max: 19 },
      { rarity: 'legendary', min: 20, max: 20 },
    ];

    const roll = Math.ceil(Math.random() * 20);
    const selectedRarity = rarityRanges.find(range => roll >= range.min && roll <= range.max)?.rarity;

    const availableModels = this.rawModels.filter(model => model.rarity === selectedRarity);

    if (availableModels.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableModels.length);
      return availableModels[randomIndex].name;
    }

    console.warn('[GoogleAIService] No models found for selected rarity, falling back to default model.');
    return this.model;
  }

  modelIsAvailable(model) {
    if (!this.rawModels || !Array.isArray(this.rawModels)) {
      console.warn('[GoogleAIService] rawModels is not initialized or is not an array.');
      return false;
    }

    if (!model) return false;

    return this.rawModels.some(m => m.name === model.replace(':online', ''));
  }
  
  async getModel(modelName) {
    if (!modelName) {
      console.warn('No model name provided for retrieval.');
      return await this.selectRandomModel();
    }

    modelName = modelName.replace(/:online$/, '').trim();
    // Use this.rawModels to get model names
    const modelNames = (this.rawModels || []).map(model => model.name.replace('models/', ''));

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

  filterModelsByCapabilities(requiredCapabilities = ['text']) {
    return this.rawModels.filter(model => {
      const capabilities = model.supportedGenerationMethods || [];
      return requiredCapabilities.every(cap => capabilities.includes(cap));
    });
  }

  async getFilteredModel(requiredCapabilities = ['text']) {
    const filteredModels = this.filterModelsByCapabilities(requiredCapabilities);
    if (filteredModels.length > 0) {
      return filteredModels[0].name.replace('models/', '');
    }
    console.warn('No models found matching required capabilities. Falling back to default model.');
    return this.model;
  }

  /**
   * Main implementation for image generation (was generateImage).
   * @private
   */
  async _generateImageImpl(prompt, avatar = null, location = null, items = [], options = {}) {
    if (!this.googleAI) throw new Error("Google AI client not initialized.");
    if (!this.s3Service) throw new Error("s3Service not initialized.");

    // Remove aspectRatio from options and append to prompt if present
    let aspectRatio;
    if (options && options.aspectRatio) {
      aspectRatio = options.aspectRatio;
      delete options.aspectRatio;
    }

    let fullPrompt = prompt ? prompt.trim() : '';
    if (aspectRatio) {
      fullPrompt += `\nDesired aspect ratio: ${aspectRatio}`;
    }
    if (avatar) {
      fullPrompt += `\nSubject: ${avatar.name || ''} ${avatar.emoji || ''}. Description: ${avatar.description || ''}`;
    }
    if (location) {
      fullPrompt += `\nLocation: ${location.name || ''}. Description: ${location.description || ''}`;
    }
    if (items && items.length > 0) {
      const itemList = items.map(item => `${item.name || ''}: ${item.description || ''}`).join('; ');
      fullPrompt += `\nItems held: ${itemList}`;
    }

    // Retry logic: up to 3 attempts, making the prompt more explicit each time
    let lastError = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      let attemptPrompt = fullPrompt;
      if (attempt > 0) {
        attemptPrompt += `\nOnly respond with an image. Do not include any text. If you cannot generate an image, try again.`;
      } else {
        attemptPrompt += `\nOnly respond with an image.`;
      }
      try {
        const generativeModel = this.googleAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp-image-generation' });
        // Only include supported options for image generation
        const { temperature, maxOutputTokens, topP, topK, ...rest } = { ...this.defaultCompletionOptions, ...options };
        const generationConfig = { temperature, maxOutputTokens, topP, topK, ...options };
        // Remove penalty fields if present (always for image models)
        delete generationConfig.frequencyPenalty;
        delete generationConfig.presencePenalty;
        const response = await generativeModel.generateContent({
          contents: [{ role: 'user', parts: [{ text: attemptPrompt }] }],
          generationConfig: {
            ...generationConfig,
            responseModalities: ['text', 'image'],
          },
        });
        // Find the first image part
        for (const part of response.response.candidates?.[0]?.content?.parts || []) {
          if (part.inlineData) {
            // Save base64 image to temp file
            const buffer = Buffer.from(part.inlineData.data, 'base64');
            await fs.mkdir('./images', { recursive: true });
            const tempFile = `./images/gemini_${Date.now()}_${Math.floor(Math.random()*10000)}.png`;
            await fs.writeFile(tempFile, buffer);
            const s3url = await this.s3Service.uploadImage(tempFile);
            await fs.unlink(tempFile);
            return s3url;
          }
        }
        // If no image, try again
        lastError = new Error('No image generated');
      } catch (err) {
        lastError = err;
        this.logger?.warn(`[GoogleAIService] Gemini image generation attempt ${attempt+1} failed: ${err.message}`);
      }
    }
    this.logger?.error(`[GoogleAIService] Gemini image generation failed after retries: ${lastError?.message}`);
    throw lastError || new Error('Image generation failed');
  }

  /**
   * Overload to match SchemaService: generateImage(prompt, aspectRatio)
   * Calls the main implementation with aspectRatio mapped to options.
   * @param {string} prompt
   * @param {string} [aspectRatio]
   * @returns {Promise<string|Array<string>>}
   */
  async generateImage(prompt, aspectRatio) {
    // If aspectRatio is not provided, call the main method as usual
    if (aspectRatio === undefined) {
      return await this._generateImageImpl(prompt);
    }
    // Map aspectRatio to options and call the main method
    return await this._generateImageImpl(prompt, null, null, [], { aspectRatio });
  }

  /**
   * Full-featured generateImage for avatar/location/items/options.
   * @param {string} prompt
   * @param {object} [avatar]
   * @param {object} [location]
   * @param {Array<object>} [items]
   * @param {object} [options]
   * @returns {Promise<string|Array<string>>}
   */
  async generateImageFull(prompt, avatar = null, location = null, items = [], options = {}) {
    return await this._generateImageImpl(prompt, avatar, location, items, options);
  }

  /**
   * Generate a composed image from up to 3 images (avatar, location, item) using Gemini's image editing.
   * @param {object[]} images - Array of { data: base64, mimeType: string, label: string } (max 3).
   * @param {string} prompt - Text prompt describing the desired composition.
   * @param {object} [options] - Optional config (model, etc).
   * @returns {Promise<string|null>} - base64 image string or null.
   */
  async composeImageWithGemini(images, prompt, options = {}) {
    if (!this.googleAI) throw new Error("Google AI client not initialized.");
    if (!this.s3Service) throw new Error("s3Service not initialized.");
    if (!Array.isArray(images) || images.length === 0) throw new Error("At least one image is required");
    if (images.length > 3) throw new Error("Gemini supports up to 3 images for editing/composition");

    // Build a single content object with role 'user' and a parts array
    const parts = images.map(img => ({
      inline_data: {
        mime_type: img.mimeType || 'image/png',
        data: img.data,
      }
    }));
    parts.push({ text: `Generate a classic polaroid of the provided image subjects, based on the following prompt (return an image directly, do not respond with text): \n\n${prompt}` });
    const contents = [{ role: 'user', parts }];

    let lastError = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const generativeModel = this.googleAI.getGenerativeModel({ model: options.model || 'gemini-2.0-flash-exp-image-generation' });
        // Remove penalty fields if present (always for image models)
        const generationConfig = { ...this.defaultCompletionOptions, ...options, responseModalities: ['text', 'image'] };
        delete generationConfig.frequencyPenalty;
        delete generationConfig.presencePenalty;
        const response = await generativeModel.generateContent({
          contents: contents,
          generationConfig,
        });
        for (const part of response.response.candidates?.[0]?.content?.parts || []) {
          if (part.inlineData) {
            const buffer = Buffer.from(part.inlineData.data, 'base64');
            await fs.mkdir('./images', { recursive: true });
            const tempFile = `./images/gemini_compose_${Date.now()}_${Math.floor(Math.random()*10000)}.png`;
            await fs.writeFile(tempFile, buffer);
            const s3url = await this.s3Service.uploadImage(tempFile);
            await fs.unlink(tempFile);
            return s3url;
          }
        }
        lastError = new Error('No image generated');
      } catch (err) {
        lastError = err;
        this.logger?.warn(`[GoogleAIService] Gemini compose image attempt ${attempt+1} failed: ${err.message}`);
      }
    }
    this.logger?.error(`[GoogleAIService] Gemini compose image failed after retries: ${lastError?.message}`);
    throw lastError || new Error('Image composition failed');
  }
  
}
