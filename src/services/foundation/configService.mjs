import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

import dotenv from 'dotenv';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CONFIG_DIR = path.resolve(__dirname, '../config');

export class ConfigService {
  constructor({ logger }) {
    this.logger = logger;

    // Initialize global configuration with defaults from environment variables
    this.config = {
      prompt: {
        summon: process.env.SUMMON_PROMPT || "Create a twisted avatar, a servant of dark V.A.L.I.S.",
        introduction: process.env.INTRODUCTION_PROMPT || "You've just arrived. Introduce yourself."
      },
      ai: {
        google: {
          apiKey: process.env.GOOGLE_API_KEY || process.env.GOOGLE_AI_API_KEY,
          model: process.env.GOOGLE_AI_MODEL || 'gemini-2.0-flash-001',
          decisionMakerModel: process.env.GOOGLE_AI_DECISION_MAKER_MODEL || 'gemini-2.0-flash-lite-001',
          structuredModel: process.env.GOOGLE_AI_STRUCTURED_MODEL || 'gemini-2.0-flash-001',
          chatModel: process.env.GOOGLE_AI_CHAT_MODEL || 'gemini-2.0-flash-001',
          visionModel: process.env.GOOGLE_AI_VISION_MODEL || 'gemini-2.0-flash-001',
          temperature: 0.7,
          maxTokens: 1000,
          topP: 1.0,
          frequencyPenalty: 0,
          presencePenalty: 0
        },
        openrouter: {
          apiKey: process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_TOKEN,
          model: process.env.STRUCTURED_MODEL || 'meta-llama/llama-3.2-3b-instruct',
          decisionMakerModel: process.env.GOOGLE_AI_DECISION_MAKER_MODEL || 'google/gemma-3-4b-it:free',
          structuredModel: process.env.OPENROUTER_STRUCTURED_MODEL || 'openai/gpt-4o',
          chatModel: process.env.OPENROUTER_CHAT_MODEL || 'meta-llama/llama-3.2-1b-instruct',
          visionModel: process.env.OPENROUTER_VISION_MODEL || '"x-ai/grok-2-vision-1212"',
          temperature: 0.8,
          maxTokens: 1000,
          topP: 1.0,
          frequencyPenalty: 0.5,
          presencePenalty: 0.3
        },
        replicate: {
          apiToken: process.env.REPLICATE_API_TOKEN,
          model: process.env.REPLICATE_MODEL,
          lora_weights: process.env.REPLICATE_LORA_WEIGHTS,
          loraTriggerWord: process.env.REPLICATE_LORA_TRIGGER,
          style: "Cyberpunk, Manga, Anime, Watercolor, Experimental."
        },
      },
      mongo: {
        uri: process.env.MONGO_URI,
        dbName: process.env.MONGO_DB_NAME || 'discord-bot',
        collections: {
          avatars: 'avatars',
          imageUrls: 'image_urls',
          guildConfigs: 'guild_configs'
        }
      },
      webhooks: {}
    };

    this.guildConfigCache = new Map(); // Cache for guild configurations
  }

  getAIConfig(service = null) {
    if (service) {
      return this.config.ai[service] || this.config.ai.openrouter;
    }
    if (!process.env.AI_SERVICE) {
      console.warn('AI_SERVICE not found in environment variables, using default: openrouter');
    }
    service = service || process.env.AI_SERVICE || 'openrouter';
    if (service === 'replicate') {
      return this.config.ai.replicate;
    }
    if (service === 'openrouter') {
      return this.config.ai.openrouter;
    }
    if (service === 'openai') {
      return this.config.ai.openai;
    }
    if (service === 'ollama') {
      return this.config.ai.ollama;
    }
    if (service === 'google') {
      return this.config.ai.google;
    }
    console.warn(`Unknown AI service: ${service}. Defaulting to openrouter.`);
    return this.config.ai.openrouter;
  }

  // Load global configuration from JSON files
  async loadConfig() {
    try {
      const defaultConfig = JSON.parse(
        await fs.readFile(path.join(CONFIG_DIR, 'default.config.json'), 'utf8')
      );
      let userConfig = {};
      try {
        userConfig = JSON.parse(
          await fs.readFile(path.join(CONFIG_DIR, 'user.config.json'), 'utf8')
        );
      } catch (error) {
        // If user config doesn't exist, create it with defaults
        await fs.writeFile(
          path.join(CONFIG_DIR, 'user.config.json'),
          JSON.stringify(this.config, null, 2)
        );
        userConfig = this.config;
      }

      // Merge configs, with user config taking precedence
      this.config = { ...this.config, ...defaultConfig, ...userConfig };
    } catch (error) {
      console.error('Error loading config:', error);
    }
  }

  // Get a specific global configuration key
  get(key) {
    return this.config[key];
  }

  // Get Discord-specific configuration
  getDiscordConfig() {
    if (!process.env.DISCORD_BOT_TOKEN) {
      console.warn('DISCORD_BOT_TOKEN not found in environment variables');
    }
    return {
      botToken: process.env.DISCORD_BOT_TOKEN,
      clientId: process.env.DISCORD_CLIENT_ID,
      webhooks: this.config.webhooks || {}
    };
  }

  // Get default guild configuration
  getDefaultGuildConfig(guildId) {
    return {
      guildId,
      whitelisted: false,
      summonerRole: "🔮",
      summonEmoji: "🔮",
      prompts: {
        summon: this.config.prompt.summon,
        introduction: this.config.prompt.introduction
      },
      toolEmojis: {
        summon: '🔮',
        breed: '🏹',
        attack: '⚔️',
        defend: '🛡️'
      },
      features: {
        breeding: true,
        combat: true,
        itemCreation: true
      },
      viewDetailsEnabled: true
    };
  }

  // Merge database guild config with defaults
  mergeWithDefaults(guildConfig, guildId) {
    const defaults = this.getDefaultGuildConfig(guildId);
    const merged = {
      ...defaults,
      ...guildConfig,
      prompts: {
        summon: guildConfig?.prompts?.summon || defaults.prompts.summon,
        introduction: guildConfig?.prompts?.introduction || defaults.prompts.introduction
      },
      toolEmojis: {
        ...defaults.toolEmojis,
        ...(guildConfig?.toolEmojis || {})
      },
      features: {
        ...defaults.features,
        ...(guildConfig?.features || {})
      },
      viewDetailsEnabled: guildConfig?.viewDetailsEnabled !== undefined ? guildConfig.viewDetailsEnabled : defaults.viewDetailsEnabled
    };

    merged.summonEmoji = merged.toolEmojis.summon || '🔮';

    return merged;
  }

  // Get guild configuration with caching
  async getGuildConfig(guildId, forceRefresh = false) {
    if (!guildId) {
      console.warn(`Invalid guild ID: ${guildId}`);
      return this.getDefaultGuildConfig(guildId);
    }

    // Check cache first
    if (!forceRefresh && this.guildConfigCache.has(guildId)) {
      return this.guildConfigCache.get(guildId);
    }

    // Resolve database connection
    let db = this.db || (this.client?.db) || (global.databaseService ? await global.databaseService.getDatabase() : null);
    if (!db) {
      console.warn(`No database connection for guild ${guildId}`);
      return this.getDefaultGuildConfig(guildId);
    }

    try {
      const collection = db.collection(this.config.mongo.collections.guildConfigs);
      const guildConfig = await collection.findOne({ guildId });
      const mergedConfig = this.mergeWithDefaults(guildConfig, guildId);
      this.guildConfigCache.set(guildId, mergedConfig);
      return mergedConfig;
    } catch (error) {
      console.error(`Error fetching guild config for ${guildId}:`, error);
      return this.getDefaultGuildConfig(guildId);
    }
  }

  // Update guild configuration
  async updateGuildConfig(guildId, updates) {
    if (!guildId) throw new Error('guildId is required');

    // Resolve database connection
    let db = this.db || (this.client?.db) || (global.databaseService ? await global.databaseService.getDatabase() : null);
    if (!db) throw new Error('No database connection available');

    try {
      const collection = db.collection(this.config.mongo.collections.guildConfigs);
      const setUpdates = { ...updates, updatedAt: new Date() };
      const result = await collection.updateOne(
        { guildId },
        { $set: setUpdates },
        { upsert: true }
      );

      // Update cache with the latest config
      const newGuildConfig = await collection.findOne({ guildId });
      const mergedConfig = this.mergeWithDefaults(newGuildConfig, guildId);
      this.guildConfigCache.set(guildId, mergedConfig);
      return result;
    } catch (error) {
      console.error(`Error updating guild config for ${guildId}:`, error);
      throw error;
    }
  }

  // Get all guild configurations
  async getAllGuildConfigs(db) {
    db = db || this.db || (this.client?.db) || (global.databaseService ? await global.databaseService.getDatabase() : null);
    if (!db) throw new Error('No database connection available');

    try {
      const collection = db.collection(this.config.mongo.collections.guildConfigs);
      return await collection.find({}).toArray();
    } catch (error) {
      console.error('Error fetching all guild configs:', error);
      throw error;
    }
  }

  // Get guild-specific prompts
  async getGuildPrompts(guildId) {
    const guildConfig = await this.getGuildConfig(guildId);
    return guildConfig.prompts;
  }

  // Validate critical configurations
  validate() {
    if (!this.config.mongo.uri) {
      console.warn('MongoDB URI not configured. Database functionality will be limited.');
    }
    if (!this.config.ai.replicate.apiToken) {
      console.warn('Replicate API token not configured. Image generation will be disabled.');
    }
    return true;
  }
}
