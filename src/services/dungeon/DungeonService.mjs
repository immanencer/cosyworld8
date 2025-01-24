import { MongoClient, ObjectId } from 'mongodb';
import { OpenRouterService } from '../openrouterService.mjs';

import { DungeonLog } from './DungeonLog.mjs';
import { AttackTool } from './tools/AttackTool.mjs';
import { DefendTool } from './tools/DefendTool.mjs';
import { MoveTool } from './tools/MoveTool.mjs';
import { RememberTool } from './tools/RememberTool.mjs';
import { CreationTool } from './tools/CreationTool.mjs';
import { XPostTool } from './tools/XPostTool.mjs';


export class DungeonService {
  constructor(client, logger, avatarService = null) {
    this.client = client;
    this.logger = logger;
    this.avatarService = avatarService;
    this.locations = new Map(); // locationId -> {areas: Map<threadId, areaData>}
    this.avatarPositions = new Map(); // avatarId -> {locationId, areaId}
    this.avatarStats = new Map(); // avatarId -> {hp, attack, defense}
    this.dungeonLog = new DungeonLog(logger);
    this.tools = new Map();
    this.registerTools();
    this.aiService = new OpenRouterService(); // Add AIService initialization
    this.creationTool = new CreationTool(this);
    this.defaultStats = {
      hp: 100,
      attack: 10,
      defense: 5
    };

    // Listen for avatar movements to update attention
    this.client.on('avatarMoved', ({ avatarId, newChannelId, temporary }) => {
      console.log(`Avatar ${avatarId} moved to ${newChannelId}`);
    });
  }

  getAvatarStats(avatarId) {
    return this.avatarStats.get(avatarId) || this.defaultStats;
  }

  extractToolCommands(text) {
    if (!text) return { commands: [], cleanText: '', commandLines: [] };

    const commands = [];
    const lines = text.split('\n');
    const commandLines = [];
    const otherLines = [];

    for (const line of lines) {
      // Look for !command pattern anywhere in the line
      const commandMatch = line.match(/!(\w+)(\s+[^!]*)?/g);
      // Look for !command pattern at the start of the line
      //const commandMatch = line.match(/^!(\w+)(\s+[^!]*)?/g);

      if (commandMatch) {
        // Store the full line containing commands
        commandLines.push(line);

        // Process each command found in the line
        for (const match of commandMatch) {
          const [command, ...params] = match.slice(1).trim().split(/\s+/);
          if (this.tools.has(command)) {
            commands.push({ command, params });
          }
        }
      } else {
        otherLines.push(line);
      }
    }

    // Trim any empty lines from the start and end
    const cleanText = otherLines.join('\n').trim();

    return {
      commands,
      cleanText,
      commandLines
    };
  }

  async initializeDatabase() {
    const client = new MongoClient(process.env.MONGO_URI);
    await client.connect();
    const db = client.db(process.env.MONGO_DB_NAME);

    // Create collections if they don't exist
    await db.createCollection('dungeon_locations');
    await db.createCollection('dungeon_positions');
    await db.createCollection('dungeon_stats');

    // Create indexes
    await db.collection('dungeon_positions').createIndex({ avatarId: 1 }, { unique: true });
    await db.collection('dungeon_stats').createIndex({ avatarId: 1 }, { unique: true });

    await client.close();
  }

  getCommandsDescription() {
    return Array.from(this.tools.entries())
      .map(([name, tool]) => `${tool.getSyntax()}\n${tool.getDescription()}`)
      .join('\n');
  }

  async processAction(message, command, params, avatar) {
    const tool = this.tools.get(command);
    if (!tool) {
      // Handle unknown command with CreationTool
      try {
        const result = await this.creationTool.execute(message, params, avatar);
        await this.dungeonLog.logAction({
          channelId: message.channel.id,
          action: command,
          actor: message.author.id,
          actorName: message.author.username,
          target: params[0],
          result,
          isCustom: true
        });
        return result;
      } catch (error) {
        this.logger.error(`Error handling custom command ${command}: ${error.message}`);
        return `The mysterious power of ${command} fades away...`;
      }
    }

    try {
      const result = await tool.execute(message, params, avatar);
      await this.dungeonLog.logAction({
        channelId: message.channel.id,
        action: command,
        actorId: message.author.id,
        actorName: message.author.username,
        displayName: `${tool.emoji || '🛠️'} ${message.author.username}`,
        target: params[0],
        result,
        memory: command === 'remember' ? result.replace('[🧠 Memory generated: "', '').replace('"]', '') : null,
        tool: command,
        emoji: tool.emoji,
        isCustom: false
      });
      return result;
    } catch (error) {
      this.logger.error(`Error executing command ${command}: ${error.message}`);
      return `Failed to execute ${command}: ${error.message}`;
    }
  }

  registerTools() {
    this.tools.set('attack', new AttackTool(this));
    this.tools.set('defend', new DefendTool(this));
    this.tools.set('move', new MoveTool(this));
    this.tools.set('remember', new RememberTool(this));
    this.tools.set('xpost', new XPostTool(this));
  }

  async getLocationDescription(locationId, locationName) {
    const client = new MongoClient(process.env.MONGO_URI);
    try {
      await client.connect();
      const db = client.db(process.env.MONGO_DB_NAME);
      const location = await db.collection('locations').findOne({
        $or: [
          { channelId: locationId },
          { name: locationName }]
      });
      return location?.description;
    } finally {
      await client.close();
    }
  }

  async getAvatarLocation(avatarId) {
    const client = new MongoClient(process.env.MONGO_URI);
    try {
      await client.connect();
      const db = client.db(process.env.MONGO_DB_NAME);
      const position = await db.collection('dungeon_positions').findOne({ $or: [{ avatarId }, { avatarId: avatarId.toString() }] });
      if (!position) return null;

      // Get full location data
      const location = await db.collection('locations').findOne({ channelId: position.locationId });
      if (!location) return null;

      // Get the Discord channel for this location
      const guild = this.client.guilds.cache.first();
      const channel = await guild.channels.fetch(location.id);

      return {
        id: location.id,
        name: location.name,
        channel: channel,
        description: location.description,
        imageUrl: location.imageUrl
      };
    } finally {
      await client.close();
    }
  }

  async findAvatarInArea(avatarName, location) {
    const client = new MongoClient(process.env.MONGO_URI);
    try {
      await client.connect();
      const db = client.db(process.env.MONGO_DB_NAME);
      const avatar = await db.collection('avatars')
        .findOne({
          name: new RegExp(avatarName, 'i'),
          locationId: location?.locationId
        });
      return avatar;
    } finally {
      await client.close();
    }
  }

  async updateAvatarStats(avatarId, stats) {
    const client = new MongoClient(process.env.MONGO_URI);
    try {
      await client.connect();
      const db = client.db(process.env.MONGO_DB_NAME);

      if ('ObjectId' !== avatarId.__proto__.constructor.name) {
        console.warn('string format detected')
      }
      delete stats._id;
      await db.collection('dungeon_stats').updateOne(
        { avatarId },
        { $set: stats },
        { upsert: true }
      );
    } finally {
      await client.close();
    }
  }

  async findLocation(destination) {
    const client = new MongoClient(process.env.MONGO_URI);
    try {
      await client.connect();
      const db = client.db(process.env.MONGO_DB_NAME);
      return await db.collection('dungeon_locations').findOne({
        $or: [
          { id: destination },
          { name: { $regex: new RegExp(destination, 'i') } }
        ]
      });
    } finally {
      await client.close();
    }
  }

  async updateAvatarPosition(avatarId, newLocationId) {
    const client = new MongoClient(process.env.MONGO_URI);
    try {
      await client.connect();
      const db = client.db(process.env.MONGO_DB_NAME);

      // Update position
      await db.collection('dungeon_positions').updateOne(
        { avatarId: avatarId },
        {
          $set: {
            locationId: newLocationId,
            lastUpdated: new Date()
          }
        },
        { upsert: true }
      );

      // Emit event for tracking
      this.client.emit('avatarMoved', {
        avatarId,
        newChannelId: newLocationId,
        temporary: false
      });

    } finally {
      await client.close();
    }
  }

  async getAvatarStats(avatarId) {
    const client = new MongoClient(process.env.MONGO_URI);
    try {
      await client.connect();
      const db = client.db(process.env.MONGO_DB_NAME);
      const stats = await db.collection('dungeon_stats').findOne({ $or: [{ avatarId }, { avatarId: avatarId.toString() }] });
      return stats || { ...this.defaultStats, avatarId };
    } finally {
      await client.close();
    }
  }

  async getAvatar(avatarId) {
    const client = new MongoClient(process.env.MONGO_URI);
    try {
      await client.connect();
      const db = client.db(process.env.MONGO_DB_NAME);

      // If not found, try direct database lookup
      const avatar = await db.collection('avatars').findOne({ _id: avatarId });
      if (avatar) {
        return avatar;
      }

      // If still not found, check if we have any stats for this avatar
      const stats = await this.getAvatarStats(avatarId);
      if (stats) {
        // Create basic avatar data if we have stats
        const user = await this.client.users.fetch(avatarId).catch(() => null);
        return {
          id: avatarId,
          name: user?.username || 'Unknown Traveler',
          personality: 'mysterious traveler',
          stats: stats
        };
      }

      this.logger?.debug(`No avatar found for ID: ${avatarId}`);
      return null;

    } catch (error) {
      this.logger?.error(`Error getting avatar: ${error.message}`);
      throw error; // Re-throw to handle in MoveTool
    } finally {
      await client.close();
    }
  }

  // Update to accept locationId parameter
  async initializeAvatar(avatarId, locationId) {
    await this.updateAvatarStats(avatarId, this.defaultStats);
    if (locationId) {
      await this.updateAvatarPosition(avatarId, locationId);
    }
    return this.defaultStats;
  }
}