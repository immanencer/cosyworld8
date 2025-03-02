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
        summon: process.env.SUMMON_PROMPT || "Create a twisted avatar, a servant of darkness.",
        introduction: process.env.INTRODUCTION_PROMPT || "You've just arrived. Introduce yourself."
      },
      ai: {
        replicate: {
          apiToken: process.env.REPLICATE_API_TOKEN,
          model: process.env.REPLICATE_MODEL,
          loraTriggerWord: process.env.REPLICATE_LORA_TRIGGER
        },
        google: {
          apiKey: process.env.GOOGLE_API_KEY
        }
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

  async getGuildConfig(db, guildId) {
    try {
      if (!guildId) {
        console.warn(`Invalid guild ID provided to getGuildConfig: ${guildId}`);
        return { guildId: null, whitelisted: false };
      }
      
      // Use the provided DB or get from global client (assuming this.client exists and has a db property)
      const dbToUse = db || (this.client && this.client.db) || (global.databaseService && global.databaseService.getDatabase());
      if (!dbToUse) {
        console.error(`No database connection available to fetch guild config for guild ${guildId}`);
        return { guildId, whitelisted: false };
      }

      const collection = dbToUse.collection('guild_configs');
      const guildConfig = await collection.findOne({ guildId });

      // Return the found config or a default with guildId and whitelisted property
      const result = guildConfig || { guildId, whitelisted: false };
      console.debug(`Retrieved guild config for ${guildId}: whitelisted=${result.whitelisted}`);
      return result;
    } catch (error) {
      console.error(`Error fetching guild config for guild ${guildId} from database:`, error);
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

  getPromptConfig() {
    return this.config.prompts;
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