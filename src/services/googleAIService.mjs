import { BasicService } from './basicService.mjs';
import { GoogleGenerativeAI } from '@google/generative-ai';
import models from '../models.google.config.mjs';
import stringSimilarity from 'string-similarity';

export class GoogleAIService extends BasicService {
  constructor(services) {
    super(services, ['configService']);
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
    this.modelConfig = models;

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
    return clone;
  }

  async tryParseGeminiJSONResponse(getRawResponse, retries = 2) {
    for (let i = 0; i <= retries; i++) {
      const raw = await getRawResponse();
      try {
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("No JSON found");
        return JSON.parse(jsonMatch[0]);
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

  async generateCompletion(prompt, options = {}) {
    if (!this.googleAI) throw new Error("Google AI client not initialized.");

    const modelId = options.model || this.model;

    // Remove 'model' from options before spreading into generationConfig
    const { model, ...restOptions } = options;

    const generativeModel = this.googleAI.getGenerativeModel({ model: modelId });

    const generationConfig = {
      ...this.defaultCompletionOptions,
      ...restOptions,
    };

    try {
      const result = await generativeModel.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig,
      });

      return result.response.text();
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Completion error:`, error.message);
      throw error;
    }
  }

  async chat(history, options = {}) {
    if (!this.googleAI) throw new Error("Google AI client not initialized.");
  
    if (!Array.isArray(history) || history.length === 0) {
      throw new Error("History must be a non-empty array.");
    }
  
    // Normalize roles: convert 'assistant' -> 'model'
    const normalizedHistory = history.map(msg => ({
      ...msg,
      role: msg.role === 'assistant' ? 'model' : msg.role
    }));
  
    // Extract the last message (user input)
    const lastMessage = normalizedHistory[normalizedHistory.length - 1];
    if (lastMessage.role !== 'user') {
      throw new Error("The last message in history must have the role 'user'.");
    }
  
    // Pull system instructions
    const systemMessages = normalizedHistory.filter(msg => msg.role === 'system');
    const systemInstruction = systemMessages.map(msg => msg.content).join('\n');
  
    // All but the last message, minus system messages
    let chatHistory = normalizedHistory
      .slice(0, -1)
      .filter(msg => msg.role !== 'system');
  
    // Inject dummy user message if history is empty or invalid
    if (chatHistory.length === 0 || chatHistory[0].role !== 'user') {
      console.warn("Inserting dummy user message to satisfy Google chat constraints.");
      chatHistory.unshift({
        role: 'user',
        content: 'Hi.'
      });
    }
  
    // Format messages for Gemini
    const formattedHistory = chatHistory.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.content }]
    }));
  
    // Select model
    let modelId = options.model || this.model;
    if (!this.modelIsAvailable(modelId)) {
      console.warn(`Model "${modelId}" not available, selecting fallback.`);
      modelId = await this.selectRandomModel();
    }
  
    const generativeModel = this.googleAI.getGenerativeModel({ model: modelId });
  
    // Generation config
    const generationConfig = {
      temperature: options.temperature ?? 0.7,
      maxOutputTokens: options.maxOutputTokens ?? 1500,
      topP: options.topP ?? 0.95,
      topK: options.topK ?? 40,
      responseMimeType: options.schema ? 'application/json' : 'text/plain',
        ...(options.schema && { responseSchema: options.schema }),
    };
  
    // Start chat session
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
  
    try {
      const result = await chatSession.sendMessage([
        { text: lastMessage.content }
      ]);
      return result.response.text();
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Chat error:`, error.message);
      throw error;
    }
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

  async speakAsItem(item, channelId) {
    if (!item || !item.name || !item.description) {
      console.warn("Invalid item:", item);
      return "The item glitches silently.";
    }

    const prompt = `
      You are a mystical item called "${item.name}".
      Description: ${item.description}.
      You're in a channel (ID: ${channelId}).
      Generate a short (10–30 words), immersive phrase of what the item would say or sound like.
      Do not use quotation marks or identify yourself explicitly.
    `;

    try {
      const response = await this.chat(null, prompt, { temperature: 0.8, maxOutputTokens: 60 });
      return response?.trim() || `The ${item.name} remains eerily silent.`;
    } catch {
      return `The ${item.name} remains unnervingly silent.`;
    }
  }

  async createItem(itemName, description) {
    const prompt = `Create a fantasy RPG item.
  Name: "${itemName}"
  Description: "${description}"`;
  
    const schema = {
      type: "OBJECT",
      properties: {
        name: { type: "STRING" },
        description: { type: "STRING" },
        type: { type: "STRING" },
        rarity: { type: "STRING", enum: ["common", "uncommon", "rare", "legendary"] },
        properties: { type: "OBJECT" },
      },
      required: ['name', 'description', 'type', 'rarity', 'properties']
    };
  
    try {
      return await this.generateStructuredOutput({ prompt, schema });
    } catch (error) {
      console.error(`Failed to generate item "${itemName}":`, error.message);
      return null;
    }
  }
  
}
