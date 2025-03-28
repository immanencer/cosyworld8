import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

import { BasicService } from './basicService.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CONFIG_DIR = path.resolve(__dirname, '../config');

export class ConfigService extends BasicService {
  constructor(services) {
    super(services, [ 'databaseService' ]);
    this.db = this.databaseService.getDatabase();
    // Initialize global configuration with defaults from environment variables
    this.config = {
      prompt: {
        summon: process.env.SUMMON_PROMPT || "Create a twisted avatar, a servant of dark V.A.L.I.S.",
        introduction: process.env.INTRODUCTION_PROMPT || "You've just arrived. Introduce yourself."
      },
      ai: {
        replicate: {
          apiToken: process.env.REPLICATE_API_TOKEN,
          model: process.env.REPLICATE_MODEL,
          lora_weights: process.env.REPLICATE_LORA_WEIGHTS,
          loraTriggerWord: process.env.REPLICATE_LORA_TRIGGER,
          style: "Cyberpunk, Manga, Anime, Watercolor, Experimental."
        },
        aiProvider: {
          apiKey: process.env.GOOGLE_API_KEY,
          metaModel: process.env.META_PROMPT_MODEL,
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
      }
    };
  }

  // Merge database guild config with defaults
  mergeWithDefaults(guildConfig, guildId) {
    const defaults = this.getDefaultGuildConfig(guildId);
    return {
      ...defaults,
      ...guildConfig,
      prompts: {
        summon: guildConfig?.prompts?.summon || defaults.prompts.summon,
        introduction: guildConfig?.prompts?.introduction || defaults.prompts.introduction
      }
    };
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
