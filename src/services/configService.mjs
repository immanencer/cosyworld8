import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CONFIG_DIR = path.resolve(__dirname, '../config');

let clientInstance = null;

class ConfigService {
  constructor() {
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
          imageUrls: 'image_urls'
        }
      },
      webhooks: {} // Initialize webhooks to an empty object
    };
    this.loaded = false;
    this.client = null;
    this.guildConfigCache = new Map(); // Initialize cache for guild configs
  }

  setClient(client) {
    this.client = client;
    clientInstance = client;
  }

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
        // If user config doesn't exist, create it with default values
        await fs.writeFile(
          path.join(CONFIG_DIR, 'user.config.json'),
          JSON.stringify(this.config, null, 2)
        );
        userConfig = this.config;
      }

      // Merge configs with user config taking precedence
      this.config = {
        ...this.config,
        ...defaultConfig,
        ...userConfig
      };
      this.loaded = true;
    } catch (error) {
      console.error('Error loading config:', error);
    }
  }

  async saveUserConfig(updates) {
    try {
      const userConfigPath = path.join(CONFIG_DIR, 'user.config.json');
      const currentConfig = await this.getUserConfig();
      const updatedConfig = { ...currentConfig, ...updates };

      await fs.writeFile(
        userConfigPath,
        JSON.stringify(updatedConfig, null, 2)
      );

      await this.loadConfig(); // Reload configs
      return true;
    } catch (error) {
      console.error('Error saving user config:', error);
      return false;
    }
  }


  async getUserConfig() {
    try {
      return JSON.parse(
        await fs.readFile(path.join(CONFIG_DIR, 'user.config.json'), 'utf8')
      );
    } catch (error) {
      return {};
    }
  }

  async get(key) {
    if (key.includes('mongo')) {
      return this.config.mongo;
    }
    return this.config[key];
  }

  getDiscordConfig() {
    // Check if environment variables are present
    if (!process.env.DISCORD_BOT_TOKEN) {
      console.warn('Warning: DISCORD_BOT_TOKEN not found in environment variables');
    }

    return {
      botToken: process.env.DISCORD_BOT_TOKEN,
      clientId: process.env.DISCORD_CLIENT_ID,
      webhooks: this.config.webhooks || {}
    };
  }

  async getGuildConfig(db, guildId, forceRefresh = false) {
    try {
      // First, check if we have a valid guild ID
      if (!guildId) {
        console.warn(`Invalid guild ID provided to getGuildConfig: ${guildId}`);
        return { guildId: null, whitelisted: false, summonerRole: "🔮", summonEmoji: "🔮" };
      }

      // Check first if we have a cached version of the whitelist (in memory)
      if (!forceRefresh && this.client && this.client.guildWhitelist && this.client.guildWhitelist.has(guildId)) {
        const whitelisted = this.client.guildWhitelist.get(guildId);
        console.debug(`Retrieved guild config for ${guildId} from memory cache: whitelisted=${whitelisted}`);
        // Note: This only returns whitelist status from cache, might need a more complete cache solution
        return { guildId, whitelisted, summonerRole: "🔮", summonEmoji: "🔮" };
      }

      // Try to get a database connection, with multiple fallbacks
      let dbToUse = null;

      // Option 1: Use the provided DB
      if (db) {
        dbToUse = db;
      } 
      // Option 2: Try to get from client
      else if (this.client && this.client.db) {
        dbToUse = this.client.db;
      } 
      // Option 3: Try to get from global database service
      else if (global.databaseService) {
        // First check if already connected
        dbToUse = global.databaseService.getDatabase();

        // If not connected yet, try to connect but don't wait too long
        if (!dbToUse) {
          try {
            // Attempt to get a connection with a short timeout
            const timeoutPromise = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Database connection timeout')), 500));

            // Race between a connection attempt and timeout
            dbToUse = await Promise.race([
              global.databaseService.waitForConnection(1, 300),
              timeoutPromise
            ]);
          } catch (connErr) {
            console.warn(`Could not establish database connection in time: ${connErr.message}`);
          }
        }
      }

      // If we still don't have a database connection, return default
      if (!dbToUse) {
        console.warn(`No database connection available to fetch guild config for guild ${guildId}, using default`);
        return { guildId, whitelisted: false };
      }

      // Now try to fetch from database
      try {
        const collection = dbToUse.collection('guild_configs');
        if (!collection) {
          throw new Error('guild_configs collection not available');
        }

        const guildConfig = await collection.findOne({ guildId });

        // Return the found config or a default with guildId and whitelisted property
        const result = guildConfig || { guildId, whitelisted: false };
        console.debug(`Retrieved guild config for ${guildId} from database: whitelisted=${result.whitelisted}`);

        // Cache this result for future use
        if (this.client) {
          if (!this.client.guildWhitelist) this.client.guildWhitelist = new Map();
          this.client.guildWhitelist.set(guildId, result.whitelisted);
        }

        return result;
      } catch (dbErr) {
        console.error(`Error accessing guild_configs collection: ${dbErr.message}`);
        return { guildId, whitelisted: false };
      }
    } catch (error) {
      console.error(`Error fetching guild config for guild ${guildId}:`, error);
      // Return a default config with whitelisted explicitly set to false
      return { guildId, whitelisted: false };
    }
  }

  async updateGuildConfig(db, guildId, updates) {
    if (!db || !guildId) throw new Error('Database and guildId are required');

    try {
      const updatedConfig = {
        ...updates,
        guildId,
        updatedAt: new Date()
      };

      // Upsert the guild config
      const result = await db.collection('guild_configs').updateOne(
        { guildId },
        { $set: updatedConfig },
        { upsert: true }
      );

      return result;
    } catch (error) {
      console.error(`Error updating guild config for ${guildId}:`, error);
      throw error;
    }
  }

  async getAllGuildConfigs(db) {
    if (!db) throw new Error('Database is required');

    try {
      return await db.collection('guild_configs').find({}).toArray();
    } catch (error) {
      console.error('Error getting all guild configs:', error);
      throw error;
    }
  }

  getMongoConfig() {
    return this.config.mongo;
  }

  getAIConfig() {
    return this.config.ai;
  }

  getStorageConfig() {
    return this.config.storage;
  }

  getXConfig() {
    return this.config.x;
  }

  getSolanaConfig() {
    return this.config.solana;
  }

  // Add method to get guild-specific prompts
  async getGuildPrompts(db, guildId) {
    if (!guildId) return this.config.prompt;

    const guildConfig = await this.getGuildConfig(db, guildId);
    return {
      summon: guildConfig?.prompts?.summon || this.config.prompt.summon,
      introduction: guildConfig?.prompts?.introduction || this.config.prompt.introduction
    };
  }

  // Add method to update guild-specific prompts
  async updateGuildPrompts(db, guildId, promptType, value) {
    if (!db || !guildId) throw new Error('Database and guildId are required');
    if (!['summon', 'introduction'].includes(promptType)) throw new Error('Invalid prompt type');

    const updates = {
      prompts: {
        [promptType]: value
      }
    };

    return await this.updateGuildConfig(db, guildId, updates);
  }

  // Modify existing getPromptConfig to be guild-aware
  async getPromptConfig(db, guildId) {
    if (!guildId) return this.config.prompt;
    return await this.getGuildPrompts(db, guildId);
  }

  validate() {
    // Basic validation to ensure critical configs exist
    if (!this.config.mongo.uri) {
      console.warn('MongoDB URI is not configured. Database functionality will be limited.');
    }

    // Log warning but don't fail if Replicate isn't configured
    if (!this.config.ai.replicate.apiToken) {
      console.warn('Replicate API token is not configured. Image generation will be disabled.');
    }

    return true;
  }
}

export const configService = new ConfigService();
export default configService;