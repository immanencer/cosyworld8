class ConfigService {
  constructor() {
    this.config = {
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
          model: process.env.OPENROUTER_MODEL
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
      }
    };
  }

  get(path) {
    return path.split('.').reduce((obj, key) => obj?.[key], this.config);
  }

  getDiscordConfig() {
    return this.config.discord;
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
