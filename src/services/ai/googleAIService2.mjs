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
      topP: 0.95,
      topK: 40,
      frequencyPenalty: 0.2,
      presencePenalty: 0.3,
    };
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

    const modelId = options.model || this.model;
    const { model, ...rest } = options;

    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const result = await this.googleAI.getGenerativeModel({ model: modelId })
          .generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { ...this.defaultCompletionOptions, ...rest },
          });
        return result.response.text();
      } catch (err) {
        if (attempt < 2) {
          console.warn('Retrying Google completion:', err.message);
          await new Promise(res => setTimeout(res, 1000 * (attempt + 1)));
        } else {
          throw err;
        }
      }
    }
  }

  async chat(messages, options = {}) {
    if (!Array.isArray(messages)) throw new Error('messages must be an array');
    const normalized = messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : m.role,
      content: m.content
    }));

    const last = normalized[normalized.length - 1];
    if (!last || last.role !== 'user') throw new Error('Last message must be from user');

    const systemMessages = normalized.filter(m => m.role === 'system');
    const systemInstruction = systemMessages.map(m => m.content).join('\n');

    const chatHistory = normalized.slice(0, -1).filter(m => m.role !== 'system');

    const formattedHistory = chatHistory.map(m => ({
      role: m.role,
      parts: [{ text: m.content }]
    }));

    const modelId = options.model || this.model;
    const generativeModel = this.googleAI.getGenerativeModel({ model: modelId });

    const generationConfig = {
      ...this.defaultCompletionOptions,
      ...options,
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
        const result = await chatSession.sendMessage([{ text: last.content }]);
        return result.response.text();
      } catch (err) {
        if (attempt < 2) {
          console.warn('Retrying Google chat:', err.message);
          await new Promise(res => setTimeout(res, 1000 * (attempt + 1)));
        } else {
          throw err;
        }
      }
    }
  }
}
