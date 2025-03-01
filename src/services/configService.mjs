import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CONFIG_DIR = path.resolve(__dirname, '../config');

let clientInstance = null;

class ConfigService {
  constructor() {
    this.config = {};
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
          JSON.stringify(this.config, null, 2) // Use this.config instead of defaultConfig
        );
        userConfig = this.config;
      }

      // Merge configs with user config taking precedence
      this.config = {
        ...this.config,
        ...defaultConfig,
        ...userConfig
      };
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
    return this.config.discord;
  }

  async getGuildConfig(db, guildId) {
    try {
      // Use the provided DB or get from global client (assuming this.client exists and has a db property)
      const dbToUse = db || (this.client && this.client.db);
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
    const required = [
      'DISCORD_CLIENT_ID',
      'DISCORD_BOT_TOKEN',
      'MONGO_URI',
      'OPENROUTER_API_TOKEN'
    ];

    const missing = required.filter(key => !process.env[key]);

    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
  }
}

export const configService = new ConfigService();
export default configService;