
import { Client, GatewayIntentBits, Partials } from 'discord.js';
import { config } from 'dotenv';
import { createLogger } from '../utils/logger.mjs';

config();

const logger = createLogger('DiscordService');

export class DiscordService {
  constructor(db) {
    this.db = db;
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages
      ],
      partials: [Partials.Channel]
    });

    this.client.on('ready', () => {
      logger.info(`✅ Logged into Discord successfully`);
    });

    this.client.on('error', (error) => {
      logger.error(`Discord client error: ${error.message}`);
    });

    // Setup guild connection tracking
    this.client.on('guildCreate', (guild) => {
      this.trackGuild(guild);
    });
  }

  async initialize() {
    try {
      await this.client.login(process.env.DISCORD_TOKEN);
      return this.client;
    } catch (error) {
      logger.error(`Failed to login to Discord: ${error.message}`);
      throw error;
    }
  }

  async trackGuild(guild) {
    try {
      // Check if guild already exists in database
      const existingGuild = await this.db.collection('guildConfigs').findOne({ guildId: guild.id });
      
      if (!existingGuild) {
        // Add new guild to database
        await this.db.collection('guildConfigs').insertOne({
          guildId: guild.id,
          name: guild.name,
          icon: guild.iconURL(),
          joinedAt: new Date(),
          isWhitelisted: false, // Default to not whitelisted
          memberCount: guild.memberCount,
          owner: {
            id: guild.ownerId,
            username: (await guild.fetchOwner()).user.username
          }
        });
        
        logger.info(`Added new guild to database: ${guild.name} (${guild.id})`);
      }
    } catch (error) {
      logger.error(`Error tracking guild ${guild.id}: ${error.message}`);
    }
  }

  async getAllGuilds() {
    try {
      if (!this.client || !this.client.guilds) {
        throw new Error('Discord client not initialized');
      }
      
      const guilds = [];
      this.client.guilds.cache.forEach(guild => {
        guilds.push({
          id: guild.id,
          name: guild.name,
          icon: guild.iconURL(),
          memberCount: guild.memberCount
        });
      });
      
      return guilds;
    } catch (error) {
      logger.error(`Error fetching guilds: ${error.message}`);
      return [];
    }
  }

  async checkGuildWhitelisted(guildId) {
    try {
      const guildConfig = await this.db.collection('guildConfigs').findOne({ guildId });
      if (!guildConfig) {
        return false;
      }
      console.log(`Retrieved guild config for ${guildId}: whitelisted=${guildConfig.isWhitelisted}`);
      return guildConfig.isWhitelisted === true;
    } catch (error) {
      logger.error(`Error checking whitelist status: ${error.message}`);
      return false;
    }
  }
}
