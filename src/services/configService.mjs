import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONFIG_DIR = path.join(__dirname, '..', 'config');

class ConfigService {
  constructor() {
    this.config = {
      prompt: {
        introduction: 'You have been summoned to this realm. This is your one chance to impress me, and save yourself from Elimination. Good luck, and DONT fuck it up.',
        summon: 'Create a unique avatar with a special ability.',
      },
      discord: {
        clientId: process.env.DISCORD_CLIENT_ID,
        botToken: process.env.DISCORD_BOT_TOKEN,
        summonerRole: process.env.SUMMONER_ROLE || '🔮'
      },
      mongo: {
        uri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017',
        dbName: process.env.MONGO_DB_NAME || 'cosyworld8',
        collections: {
          imageUrls: process.env.IMAGE_URL_COLLECTION || 'imageUrls',
          avatars: process.env.AVATARS_COLLECTION || 'avatars'
        }
      },
      solana: {
        creatorWallet: process.env.CREATOR_SOLANA_WALLET
      },
      ai: {
        replicate: {
          apiToken: process.env.REPLICATE_API_TOKEN,
          model: process.env.REPLICATE_MODEL,
          loraTriggerWord: process.env.LORA_TRIGGER_WORD
        },
        openrouter: {
          apiToken: process.env.OPENROUTER_API_TOKEN,
          model: process.env.OPENROUTER_MODEL,
          metaModel: process.env.META_PROMPT_MODEL || 'anthropic/claude-3-haiku'
        },
        ollama: {
          model: process.env.OLLAMA_MODEL
        }
      },
      storage: {
        s3: {
          endpoint: process.env.S3_API_ENDPOINT,
          apiKey: process.env.S3_API_KEY,
          cloudfront: process.env.CLOUDFRONT_DOMAIN
        }
      },
      x: {
        callbackUrl: process.env.X_CALLBACK_URL,
        apiKey: process.env.X_API_KEY,
        apiSecret: process.env.X_API_SECRET,
        accessToken: process.env.X_ACCESS_TOKEN,
        accessTokenSecret: process.env.X_ACCESS_TOKEN_SECRET,
        clientId: process.env.X_CLIENT_ID,
        clientSecret: process.env.X_CLIENT_SECRET
      },
      guildDefaults: { // Added guildDefaults
        summonEmoji: '✨',
        prompts: {
          introduction: 'Welcome to this server!',
          summon: 'Create an avatar for this server!'
        },
        features: {
          feature1: true,
          feature2: false
        },
        toolEmojis: {
          tool1: '🛠️',
          tool2: '⚙️'
        },
        rateLimit: {
          perUser: 5,
          perMinute: 60
        }
      }
    };
    this.loadConfig();
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
    if (!db || !guildId) return this.config.guildDefaults;

    try {
      // Try to get guild-specific config from database
      const guildConfig = await db.collection('guild_configs').findOne({ guildId });

      if (guildConfig) {
        // Merge with defaults for any missing properties
        return {
          ...this.config.guildDefaults,
          ...guildConfig,
          features: {
            ...this.config.guildDefaults.features,
            ...(guildConfig.features || {})
          },
          toolEmojis: {
            ...this.config.guildDefaults.toolEmojis,
            ...(guildConfig.toolEmojis || {})
          },
          rateLimit: {
            ...this.config.guildDefaults.rateLimit,
            ...(guildConfig.rateLimit || {})
          }
        };
      }

      // If no config exists, return defaults
      return this.config.guildDefaults;
    } catch (error) {
      console.error(`Error getting guild config for ${guildId}:`, error);
      return this.config.guildDefaults;
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