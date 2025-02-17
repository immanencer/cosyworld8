import { ObjectId } from 'mongodb';
import { OpenRouterService } from '../openrouterService.mjs';

import { DungeonLog } from './DungeonLog.mjs';
import { AttackTool } from './tools/AttackTool.mjs';
import { DefendTool } from './tools/DefendTool.mjs';
import { MoveTool } from './tools/MoveTool.mjs';
import { RememberTool } from './tools/RememberTool.mjs';
import { CreationTool } from './tools/CreationTool.mjs';
import { XPostTool } from './tools/XPostTool.mjs';
import { ItemTool } from './tools/ItemTool.mjs';
import { RespondTool } from './tools/RespondTool.mjs';

import { LocationService } from '../location/locationService.mjs';
import { ItemService } from '../item/itemService.mjs';

export class DungeonService {
  /**
   * Constructs a new DungeonService.
   * @param {Object} client - The Discord client.
   * @param {Object} logger - A logging interface.
   * @param {Object} [avatarService=null] - The avatar service.
   */
  constructor(client, logger, avatarService = null, db) {
    this.db = db;
    this.client = client;
    this.logger = logger;
    this.avatarService = avatarService;

    // Tools & Logging
    this.dungeonLog = new DungeonLog(logger);
    this.tools = new Map();
    this.creationTool = new CreationTool(this);
    this.defaultStats = { hp: 100, attack: 10, defense: 5 };

    // Caches (if needed for runtime state)
    this.locations = new Map();       // locationId -> { areas: Map<threadId, areaData> }
    this.avatarPositions = new Map(); // avatarId -> { locationId, areaId }

    // AI service initialization
    this.aiService = new OpenRouterService();
    this.locationService = new LocationService(this.client, this.aiService, this.db);
    this.itemService = new ItemService(this.client, this.aiService, this.db);
    this.registerTools();

    // Listen for avatar movements (for additional side effects if desired)
    this.client.on('avatarMoved', ({ avatarId, newChannelId, temporary }) => {
      console.log(`Avatar ${avatarId} moved to ${newChannelId}`);
    });
  }

  /**
   * Ensures that the database connection is available.
   * @returns {import('mongodb').Db}
   */
  ensureDb() {
    if (!this.db) {
      throw new Error('Database not connected');
    }
    return this.db;
  }

  /**
   * Parses a text message for any tool commands.
   * @param {string} text - The message text.
   * @returns {Object} - Contains an array of commands, the cleaned text, and the original command lines.
   */
  /**
   * Parses a text message for any tool commands.
   * This version is more resilient to commands appearing anywhere in the text.
   *
   * @param {string} text - The message text.
   * @returns {Object} - Contains:
   *   - commands: an array of { command, params } objects,
   *   - cleanText: the message text with commands removed,
   *   - commandLines: an array of lines that contained commands.
   */
  extractToolCommands(text) {
    if (!text) return { commands: [], cleanText: '', commandLines: [] };

    const commands = [];
    const commandLines = [];
    // This regex looks for commands that are preceded by either the start-of-line or whitespace.
    // It captures:
    //   Group 1: the full command (including the leading "!")
    //   Group 2: the command name (word characters)
    //   Group 3: any parameters following the command (up until the next "!" or end-of-line)
    const commandRegex = /(?:^|\s)(!(\w+)(?:\s+([^!]+))?)/g;

    // Use matchAll to scan the entire text for commands.
    for (const match of text.matchAll(commandRegex)) {
      const commandName = match[2]; // e.g., "item", "move", etc.
      const paramString = match[3] || '';
      // Only add the command if it matches one of the registered tools.
      if (this.tools.has(commandName)) {
        const params = paramString.trim() ? paramString.trim().split(/\s+/) : [];
        commands.push({ command: commandName, params });
      }
    }

    // Also, record which lines contain commands.
    const lines = text.split('\n');
    for (const line of lines) {
      if (line.match(commandRegex)) {
        commandLines.push(line);
      }
    }

    // Remove all the command snippets from the text to create a clean version.
    // We replace each command occurrence with a single space and then clean up extra spaces.
    const cleanText = text.replace(commandRegex, ' ').replace(/\s+/g, ' ').trim();

    return { commands, cleanText, commandLines };
  }


  /**
   * Creates necessary collections and indexes in MongoDB.
   */
  async initializeDatabase() {
    const db = this.ensureDb();
    // Create collections if they don't exist.
    // (MongoDB will create collections on the fly, but you can enforce schema or indexes here)
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);

    if (!collectionNames.includes('dungeon_locations')) {
      await db.createCollection('dungeon_locations');
    }
    if (!collectionNames.includes('dungeon_positions')) {
      await db.createCollection('dungeon_positions');
      await db.collection('dungeon_positions').createIndex({ avatarId: 1 }, { unique: true });
    }
    if (!collectionNames.includes('dungeon_stats')) {
      await db.createCollection('dungeon_stats');
      await db.collection('dungeon_stats').createIndex({ avatarId: 1 }, { unique: true });
    }
  }

  /**
   * Returns a description of all registered commands.
   * @returns {string}
   */
  getCommandsDescription() {
    const commands = [];
    for (const [name, tool] of this.tools.entries()) {
      // Use fallback values if the tool does not implement getSyntax or getDescription.
      const syntax = (typeof tool.getSyntax === 'function')
        ? tool.getSyntax()
        : `!${name}`;
      const description = (typeof tool.getDescription === 'function')
        ? tool.getDescription()
        : 'No description available.';

      // Format the output. Adjust formatting as desired.
      commands.push(`**!${name}**\nSyntax: ${syntax}\nDescription: ${description}`);
    }
    return commands.join('\n\n');
  }


  /**
   * Processes an action command by delegating to the appropriate tool.
   * If the command is unknown, falls back to the CreationTool.
   * @param {Object} message - The original Discord message.
   * @param {string} command - The command keyword.
   * @param {string[]} params - The command parameters.
   * @param {Object} avatar - The avatar object.
   * @returns {Promise<string>} - The result message.
   */
  async processAction(message, command, params, avatar) {
    const tool = this.tools.get(command);
    if (!tool) {
      // Unknown commands are handled by the CreationTool.
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
        memory: command === 'remember'
          ? result.replace(/^\[🧠 Memory generated: "(.*)"\]$/, '$1')
          : null,
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

  /**
   * Registers all available tools.
   */
  registerTools() {
    this.tools.set('attack', new AttackTool(this));
    this.tools.set('defend', new DefendTool(this));
    this.tools.set('move', new MoveTool(this));
    this.tools.set('remember', new RememberTool(this));
    this.tools.set('xpost', new XPostTool(this));
    this.tools.set('item', new ItemTool(this));
    this.tools.set('respond', new RespondTool(this));
  }

  /**
   * Returns a location’s evocative description from the database.
   * @param {string} locationId
   * @param {string} locationName
   * @returns {Promise<string|null>}
   */
  async getLocationDescription(locationId, locationName) {
    const db = this.ensureDb();
    const location = await db.collection('locations').findOne({
      $or: [{ channelId: locationId }, { name: locationName }]
    });
    return location?.description || null;
  }

  async getItemsDescription(avatar) {
    const db = this.ensureDb();
    const items = await db.collection('items').find({
      owner: avatar._id
    }).toArray();
    return items.map(item => item.description).join('\n');
  }


  /**
   * Retrieves the full location information for an avatar from the database.
   * @param {string} avatarId
   * @returns {Promise<Object|null>} - The location object or null if not found.
   */
  async getAvatarLocation(avatarId) {
    const db = this.ensureDb();
    const position = await db.collection('dungeon_positions').findOne({
      $or: [{ avatarId }, { avatarId: avatarId.toString() }]
    });
    if (!position) return null;

    const location = await db.collection('locations').findOne({ channelId: position.locationId });
    if (!location) return null;

    const guild = this.client.guilds.cache.first();
    const channel = await guild.channels.fetch(location.id);

    return {
      id: location.id,
      name: location.name,
      channel,
      description: location.description,
      imageUrl: location.imageUrl
    };
  }

  /**
   * Finds an avatar in a given area (location) by name.
   * @param {string} avatarName
   * @param {Object} location - The location data.
   * @returns {Promise<Object|null>}
   */
  async findAvatarInArea(avatarName, location) {
    const db = this.ensureDb();
    const avatar = await db.collection('avatars').findOne({
      name: new RegExp(avatarName, 'i'),
      locationId: location?.locationId
    });
    return avatar;
  }

  /**
   * Updates an avatar’s stats in the database.
   * @param {string|ObjectId} avatarId
   * @param {Object} stats
   */
  async updateAvatarStats(avatarId, stats) {
    const db = this.ensureDb();
    // Ensure avatarId is in a consistent format
    if (!(avatarId instanceof ObjectId)) {
      try {
        avatarId = new ObjectId(avatarId);
      } catch (err) {
        this.logger.warn('Avatar ID conversion failed; using original value.');
      }
    }
    // Remove any _id field from stats
    delete stats._id;
    await db.collection('dungeon_stats').updateOne(
      { avatarId },
      { $set: stats },
      { upsert: true }
    );
  }

  /**
   * Finds a location (by ID or name) from the dungeon_locations collection.
   * @param {string} destination
   * @returns {Promise<Object|null>}
   */
  async findLocation(destination) {
    const db = this.ensureDb();
    return await db.collection('dungeon_locations').findOne({
      $or: [
        { id: destination },
        { name: { $regex: new RegExp(destination, 'i') } }
      ]
    });
  }

  /**
   * Updates an avatar’s position in the dungeon.
   * @param {string} avatarId
   * @param {string} newLocationId
   */
  async updateAvatarPosition(avatarId, newLocationId) {
    const db = this.ensureDb();
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
    // Emit an event so that other parts of the system can react.
    this.client.emit('avatarMoved', {
      avatarId,
      newChannelId: newLocationId,
      temporary: false
    });
  }

  /**
   * Retrieves an avatar’s stats from the database, or returns the default stats.
   * @param {string} avatarId
   * @returns {Promise<Object>}
   */
  async getAvatarStats(avatarId) {
    const db = this.ensureDb();
    const stats = await db.collection('dungeon_stats').findOne({
      $or: [{ avatarId }, { avatarId: avatarId.toString() }]
    });
    return stats || { ...this.defaultStats, avatarId };
  }

  /**
   * Retrieves full avatar information, either from the avatars collection or via Discord.
   * @param {string} avatarId
   * @returns {Promise<Object|null>}
   */
  async getAvatar(avatarId) {
    const db = this.ensureDb();
    let avatar = await db.collection('avatars').findOne({ _id: avatarId });
    if (avatar) {
      return avatar;
    }
    // If not found, try fetching stats and supplement with Discord user info.
    const stats = await this.getAvatarStats(avatarId);
    if (stats) {
      const user = await this.client.users.fetch(avatarId).catch(() => null);
      return {
        id: avatarId,
        name: user?.username || 'Unknown Traveler',
        personality: 'mysterious traveler',
        stats: stats
      };
    }
    this.logger.debug(`No avatar found for ID: ${avatarId}`);
    return null;
  }

  /**
   * Initializes an avatar by setting default stats and position.
   * @param {string} avatarId
   * @param {string} locationId
   * @returns {Promise<Object>} - The default stats.
   */
  async initializeAvatar(avatarId, locationId) {
    await this.updateAvatarStats(avatarId, this.defaultStats);
    if (locationId) {
      await this.updateAvatarPosition(avatarId, locationId);
    }
    return this.defaultStats;
  }
}
