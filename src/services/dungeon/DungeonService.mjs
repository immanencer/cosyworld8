import { ObjectId } from 'mongodb';
import { AIService } from "../aiService.mjs";
// import { AIService } from "../aiService.mjs";

import { DungeonLog } from './DungeonLog.mjs';
import { AttackTool } from './tools/AttackTool.mjs';
import { DefendTool } from './tools/DefendTool.mjs';
import { MoveTool } from './tools/MoveTool.mjs';
import { RememberTool } from './tools/RememberTool.mjs';
import { CreationTool } from './tools/CreationTool.mjs';
import { XPostTool } from './tools/XPostTool.mjs';
import { ItemTool } from './tools/ItemTool.mjs';
import { RespondTool } from './tools/RespondTool.mjs';
import { SummonTool } from './tools/SummonTool.mjs';
import { BreedTool } from './tools/BreedTool.mjs';
import configService from '../configService.mjs';

import { LocationService } from '../location/locationService.mjs';
import { ItemService } from '../item/itemService.mjs';

export class DungeonService {
  /**
   * Constructs a new DungeonService instance for managing dungeon game functionality.
   * @param {Object} client - The Discord client instance.
   * @param {Object} logger - Logging interface with methods like info, debug, warn, error.
   * @param {Object} [avatarService=null] - Service for avatar-related operations.
   * @param {import('mongodb').Db} [db] - MongoDB database connection.
   * @param {Object} [commands] - Command handlers for summon, breed, item, and respond actions.
   */
  constructor(client, logger, avatarService = null, db, commands = {
    summon: () => { },
    breed: () => { },
    item: () => { },
    respond: () => { },
  }) {
    this.db = db;
    this.client = client;
    this.logger = logger;
    this.avatarService = avatarService;
    this.handleSummonCommand = commands.summon;

    // Tools & Logging
    this.dungeonLog = new DungeonLog(logger);
    this.tools = new Map();
    this.toolEmojis = new Map();

    // Initialize tools
    const toolClasses = {
      summon: SummonTool,
      breed: BreedTool,
      attack: AttackTool,
      defend: DefendTool,
      move: MoveTool,
      remember: RememberTool,
      create: CreationTool,
      xpost: XPostTool,
      item: ItemTool,
      respond: RespondTool,
    };

    Object.entries(toolClasses).forEach(([name, ToolClass]) => {
      const tool = new ToolClass(this);
      this.tools.set(name, tool);
      if (tool.emoji) this.toolEmojis.set(tool.emoji, name);
    });

    // Load emoji mappings from config
    const configEmojis = configService.get('toolEmojis') || {};
    Object.entries(configEmojis).forEach(([emoji, toolName]) => {
      this.toolEmojis.set(emoji, toolName);
    });

    this.creationTool = new CreationTool(this);
    this.defaultStats = { hp: 100, attack: 10, defense: 5 };

    // Runtime caches
    this.locations = new Map();       // locationId -> { areas: Map<threadId, areaData> }
    this.avatarPositions = new Map(); // avatarId -> { locationId, areaId }

    // Service dependencies
    this.aiService = new AIService();
    this.locationService = new LocationService(this.client, this.aiService, this.db);
    this.itemService = new ItemService(this.client, this.aiService, this.db);
    this.registerTools();

    // Event listener for avatar movements
    this.client.on('avatarMoved', ({ avatarId, newChannelId, temporary }) => {
      this.logger.debug(`Avatar ${avatarId} moved to ${newChannelId}${temporary ? ' (temporary)' : ''}`);
    });
  }

  // --- Utility Methods ---

  /**
   * Ensures the database connection is available, throwing an error if not.
   * @returns {import('mongodb').Db} The MongoDB database instance.
   * @throws {Error} If the database is not connected.
   */
  ensureDb() {
    if (!this.db) throw new Error('Database connection unavailable');
    return this.db;
  }

  /**
   * Extracts tool commands from text based on emoji triggers at the start.
   * @param {string} text - The input text to parse.
   * @returns {{ commands: Array<{ command: string, params: string[] }>, cleanText: string, commandLines: string[] }}
   */
  extractToolCommands(text) {
    if (!text) return { commands: [], cleanText: '', commandLines: [] };

    const commands = [];
    let cleanText = text.trim();

    for (const [emoji, toolName] of this.toolEmojis.entries()) {
      if (cleanText.startsWith(emoji)) {
        const rest = cleanText.slice(emoji.length).trim();
        const params = rest ? rest.split(/\s+/) : [];
        commands.push({ command: toolName, params });
        cleanText = rest;
        break; // Only one command per message for simplicity
      }
    }

    cleanText = cleanText.replace(/\s+/g, ' ').trim();
    return { commands, cleanText, commandLines: [] };
  }

  // --- Database Initialization ---

  /**
   * Initializes database collections and indexes for dungeon data.
   * @returns {Promise<void>}
   */
  async initializeDatabase() {
    const db = this.ensureDb();
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
    this.logger.info('Dungeon database initialized');
  }

  // --- Command Processing ---

  /**
   * Generates a formatted description of all registered commands.
   * @returns {string} A string listing commands with their triggers and descriptions.
   */
  getCommandsDescription() {
    const commands = [];
    for (const [name, tool] of this.tools.entries()) {
      const syntax = tool.getSyntax?.() || `${tool.emoji || name}`;
      const description = tool.getDescription?.() || 'No description available.';
      commands.push(`**${name}**\nTrigger: ${tool.emoji || 'N/A'}\nSyntax: ${syntax}\n${description}`);
    }
    return commands.join('\n\n');
  }

  /**
   * Processes an action by delegating to the appropriate tool or falling back to CreationTool.
   * @param {Object} message - The Discord message object.
   * @param {string} command - The command name.
   * @param {string[]} params - Command parameters.
   * @param {Object} avatar - The avatar executing the command.
   * @returns {Promise<string>} Result message from the tool execution.
   * @throws {Error} If tool execution fails critically.
   */
  async processAction(message, command, params, avatar) {
    this.logger.info(`Processing command '${command}' by ${avatar.name} (ID: ${avatar.id})`);
    const tool = this.tools.get(command);

    if (!tool) {
      this.logger.debug(`Unknown command '${command}', using CreationTool`);
      try {
        const result = await this.creationTool.execute(message, params, avatar);
        await this.dungeonLog.logAction({
          channelId: message.channel.id,
          action: command,
          actorId: message.author.id,
          actorName: message.author.username,
          target: params[0],
          result,
          isCustom: true,
        });
        return result;
      } catch (error) {
        this.logger.error(`CreationTool failed for '${command}': ${error.message}`);
        return `The command '${command}' fizzled out mysteriously...`;
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
        memory: command === 'remember' ? result.replace(/^\[🧠 Memory generated: "(.*)"\]$/, '$1') : null,
        tool: command,
        emoji: tool.emoji,
        isCustom: false,
      });
      return result;
    } catch (error) {
      this.logger.error(`Tool '${command}' execution failed: ${error.message}`);
      return `Oops! '${command}' failed: ${error.message}. Try again or ask for help!`;
    }
  }

  /**
   * Registers tools into the tools map (can be extended for dynamic registration).
   * @private
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

  // --- Location and Item Management ---

  /**
   * Retrieves a location's description from the database.
   * @param {string} locationId - The channel ID of the location.
   * @param {string} locationName - The name of the location.
   * @returns {Promise<string|null>} The description or null if not found.
   */
  async getLocationDescription(locationId, locationName) {
    const db = this.ensureDb();
    const location = await db.collection('locations').findOne({
      $or: [{ channelId: locationId }, { name: locationName }],
    });
    return location?.description || null;
  }

  /**
   * Retrieves descriptions of all items owned by an avatar.
   * @param {Object} avatar - The avatar object with an _id field.
   * @returns {Promise<string>} A newline-separated string of item descriptions.
   */
  async getItemsDescription(avatar) {
    const db = this.ensureDb();
    const items = await db.collection('items').find({ owner: avatar._id }).toArray();
    return items.map(item => item.description).join('\n') || 'No items found.';
  }

  /**
   * Gets an avatar's current location details.
   * @param {string|ObjectId} avatarId - The avatar's ID.
   * @returns {Promise<Object|null>} Location details or null if not found.
   */
  async getAvatarLocation(avatarId) {
    const db = this.ensureDb();
    const objectId = this.toObjectId(avatarId);
    const position = await db.collection('dungeon_positions').findOne({ avatarId: objectId });
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
      imageUrl: location.imageUrl,
    };
  }

  /**
   * Finds an avatar in a location by name.
   * @param {string} avatarName - The name to search for.
   * @param {Object} location - The location object with a locationId.
   * @returns {Promise<Object|null>} The avatar object or null if not found.
   */
  async findAvatarInArea(avatarName, location) {
    const db = this.ensureDb();
    return await db.collection('avatars').findOne({
      name: new RegExp(avatarName, 'i'),
      locationId: location?.locationId,
    });
  }

  /**
   * Finds a location by ID or name (case-insensitive).
   * @param {string} destination - The ID or name to search for.
   * @returns {Promise<Object|null>} The location object or null if not found.
   */
  async findLocation(destination) {
    const db = this.ensureDb();
    return await db.collection('dungeon_locations').findOne({
      $or: [{ id: destination }, { name: { $regex: new RegExp(destination, 'i') } }],
    });
  }

  // --- Avatar Management ---

  /**
   * Updates an avatar's stats in the database.
   * @param {string|ObjectId} avatarId - The avatar's ID.
   * @param {Object} stats - The stats to update.
   * @returns {Promise<void>}
   */
  async updateAvatarStats(avatarId, stats) {
    const db = this.ensureDb();
    const objectId = this.toObjectId(avatarId);
    delete stats._id; // Prevent overwriting _id
    await db.collection('dungeon_stats').updateOne(
      { avatarId: objectId },
      { $set: stats },
      { upsert: true }
    );
    this.logger.debug(`Updated stats for avatar ${avatarId}`);
  }

  /**
   * Updates an avatar's position using a transaction for atomicity.
   * @param {string|ObjectId} avatarId - The avatar's ID.
   * @param {string} newLocationId - The new location's channel ID.
   * @param {string} [previousLocationId] - The previous location ID for departure messages.
   * @param {boolean} [sendProfile=false] - Whether to send the avatar's profile to the new location.
   * @returns {Promise<Object>} The updated avatar object.
   * @throws {Error} If the update fails.
   */
  async updateAvatarPosition(avatarId, newLocationId, previousLocationId = null, sendProfile = false) {
    this.logger.debug(`Starting updateAvatarPosition: avatarId=${avatarId}, newLocationId=${newLocationId}`);
    const objectId = this.toObjectId(avatarId);
    if (!objectId || !newLocationId) {
      this.logger.error(`Invalid parameters: avatarId=${avatarId}, newLocationId=${newLocationId}`);
      throw new Error(`Invalid parameters: avatarId=${avatarId}, newLocationId=${newLocationId}`);
    }

    const db = this.ensureDb();
    this.logger.debug('Database connection ensured');
    const session = await this.db.client.startSession();
    this.logger.debug('Session started');

    try {
      this.logger.debug(`Fetching avatar ${objectId}`);
      const currentAvatar = await this.avatarService?.getAvatarById(objectId);
      if (!currentAvatar) {
        this.logger.error(`Avatar not found: ${objectId}`);
        throw new Error(`Avatar not found: ${objectId}`);
      }
      const actualPreviousLocationId = previousLocationId || currentAvatar?.channelId;
      this.logger.debug(`Previous: ${actualPreviousLocationId}, New: ${newLocationId}`);

      if (actualPreviousLocationId === newLocationId) {
        this.logger.debug(`Avatar already at ${newLocationId}, skipping`);
        return currentAvatar;
      }

      this.logger.info(`Moving avatar ${avatarId} from ${actualPreviousLocationId || 'unknown'} to ${newLocationId}`);
      await session.withTransaction(async () => {
        this.logger.debug('Starting transaction');
        await db.collection('dungeon_positions').updateOne(
          { avatarId: objectId },
          { $set: { locationId: newLocationId, lastMoved: new Date() } },
          { upsert: true, session }
        );
        this.logger.debug('Updated dungeon_positions');

        await db.collection('avatars').updateOne(
          { _id: objectId },
          { $set: { channelId: newLocationId } },
          { session }
        );
        this.logger.debug('Updated avatars');

        await this.dungeonLog.logAction({
          action: 'move',
          actorId: objectId,
          locationId: newLocationId,
          timestamp: new Date(),
          description: `moved to <#${newLocationId}>`,
        }, session);
        this.logger.debug('Logged action');
      });
      this.logger.debug('Transaction completed');

      this.logger.debug(`Fetching updated avatar ${objectId}`);
      const updatedAvatar = await this.avatarService?.getAvatarById(objectId);
      if (!updatedAvatar) {
        this.logger.error(`Updated avatar not found: ${objectId}`);
        throw new Error(`Failed to retrieve updated avatar ${avatarId}`);
      }

      if (actualPreviousLocationId && actualPreviousLocationId !== newLocationId) {
        try {
          const { sendAsWebhook } = await import('../../services/discordService.mjs');
          await sendAsWebhook(
            actualPreviousLocationId,
            `*${updatedAvatar.name} has departed to <#${newLocationId}>*`,
            updatedAvatar
          );
          this.logger.debug('Sent departure message');
        } catch (error) {
          this.logger.warn(`Departure message failed: ${error.message}`);
        }
      }

      if (sendProfile) {
        try {
          const { sendAvatarProfileEmbedFromObject } = await import('../../services/discordService.mjs');
          await sendAvatarProfileEmbedFromObject(updatedAvatar, newLocationId);
          this.logger.debug(`Sent profile to ${newLocationId}`);
        } catch (error) {
          this.logger.warn(`Profile send failed: ${error.message}`);
        }
      }

      this.client.emit('avatarMoved', {
        avatarId: objectId,
        previousChannelId: actualPreviousLocationId,
        newChannelId: newLocationId,
        temporary: false,
      });
      this.logger.debug('Emitted avatarMoved');

      return updatedAvatar;
    } catch (error) {
      this.logger.error(`Update failed: ${error.message}`);
      throw error;
    } finally {
      await session.endSession();
      this.logger.debug('Session ended');
    }
  }

  /**
   * Retrieves an avatar's stats, falling back to defaults if not found.
   * @param {string|ObjectId} avatarId - The avatar's ID.
   * @returns {Promise<Object>} The avatar's stats.
   */
  async getAvatarStats(avatarId) {
    const db = this.ensureDb();
    const objectId = this.toObjectId(avatarId);
    const stats = await db.collection('dungeon_stats').findOne({ avatarId: objectId });
    return stats || { ...this.defaultStats, avatarId: objectId };
  }

  /**
   * Initializes a new avatar with default stats and an optional starting position.
   * @param {string|ObjectId} avatarId - The avatar's ID.
   * @param {string} [locationId] - The initial location ID.
   * @returns {Promise<Object>} The initialized stats.
   */
  async initializeAvatar(avatarId, locationId) {
    const objectId = this.toObjectId(avatarId);
    await this.updateAvatarStats(objectId, this.defaultStats);
    if (locationId) await this.updateAvatarPosition(objectId, locationId);
    this.logger.info(`Initialized avatar ${avatarId}${locationId ? ` at ${locationId}` : ''}`);
    return { ...this.defaultStats, avatarId: objectId };
  }

  // --- Helper Methods ---

  /**
   * Converts a string or ObjectId to an ObjectId, throwing an error if invalid.
   * @param {string|ObjectId} id - The ID to convert.
   * @returns {ObjectId} The converted ObjectId.
   * @throws {Error} If the ID is invalid.
   */
  toObjectId(id) {
    if (id instanceof ObjectId) return id;
    try {
      return new ObjectId(id);
    } catch (error) {
      this.logger.error(`Invalid ID format: ${id}`);
      throw new Error(`Invalid ID: ${id}`);
    }
  }
}