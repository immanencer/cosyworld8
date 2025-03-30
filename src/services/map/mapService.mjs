import { BasicService } from '../basicService.mjs';

import { toObjectId } from '../utils/toObjectId.mjs';

export class MapService extends BasicService {
  /**
   * Constructs a new MapService instance for managing dungeon state.
   * @param {Object} services - Service instances to manage.
   **/
  constructor(services) {
    super(services, [
      'discordService',
      'databaseService',
      'configService',
    ]);
    this.client = this.discordService.client;
    this.db = this.databaseService.getDatabase();
    const mongoConfig = this.configService.config.mongo;

    this.AVATARS_COLLECTION = mongoConfig.collections.avatars || 'avatars';
    this.LOCATIONS_COLLECTION = mongoConfig.collections.locations || 'locations';
    this.DUNGEON_POSITIONS_COLLECTION = mongoConfig.collections.dungeonPositions || 'dungeon_positions';
    this.DUNGEON_STATS_COLLECTION = mongoConfig.collections.dungeonStats || 'dungeon_stats';
  }

  // --- Utility Methods ---

  ensureDb() {
    if (!this.db) throw new Error('Database connection unavailable');
    return this.db;
  }

  // --- Database Initialization ---

  async initializeDatabase() {
    const db = this.ensureDb();
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);

    if (!collectionNames.includes('locations')) {
      await db.createCollection('locations');
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

  // --- Location Management ---

  async getLocationDescription(locationId, locationName) {
    const db = this.ensureDb();
    const location = await db.collection('locations').findOne({
      $or: [{ channelId: locationId }, { name: locationName }],
    });
    return location?.description || null;
  }

  async findLocation(destination) {
    const db = this.ensureDb();
    return await db.collection('locations').findOne({
      $or: [{ id: destination }, { name: { $regex: new RegExp(destination, 'i') } }],
    });
  }

  async getAvatarLocation(avatarId) {
    const db = this.ensureDb();
    const objectId = toObjectId(avatarId);
    const position = await db.collection('dungeon_positions').findOne({ avatarId: objectId });
    if (!position) return null;

    const location = await db.collection('locations').findOne({ channelId: position.locationId });
    if (!location) return {
      id: position.locationId,
      name: 'Unknown',
      description: 'An unknown location',
      imageUrl: null,
    };

    return {
      id: location.channelId,
      name: location.name,
      description: location.description,
      imageUrl: location.imageUrl,
    };
  }

  /**
   * Fetches an avatar by its ID.
   * @param {ObjectId|string} id - The ID of the avatar to fetch.
   * @returns {Object} - The avatar object.
   * @throws {Error} - If the avatar is not found.
   */
  async getAvatarById(id) {
    try {
      const collection = this.db.collection(this.AVATARS_COLLECTION);
      // Allow string IDs by converting to ObjectId if necessary
      const avatar = await collection.findOne({ _id: typeof id === 'string' ? new ObjectId(id) : id });
      if (!avatar) {
        throw new Error(`Avatar with ID "${id}" not found.`);
      }
      return avatar;
    } catch (error) {
      this.logger.error(`Error fetching avatar by ID: ${error.message}`);
      throw error;
    }
  }

  async updateAvatarPosition(avatarId, newLocationId, previousLocationId = null, sendProfile = false) {
    const db = this.ensureDb();
    const session = await this.db.client.startSession();

    try {
      const currentAvatar = await this.getAvatarById(avatarId);
      const objectId = toObjectId(avatarId);
      if (!currentAvatar) throw new Error(`Avatar not found: ${avatarId}`);
      const actualPreviousLocationId = previousLocationId || currentAvatar?.channelId;

      if (actualPreviousLocationId === newLocationId) return currentAvatar;

      this.logger.info(`Moving avatar ${avatarId} from ${actualPreviousLocationId || 'unknown'} to ${newLocationId}`);
      await session.withTransaction(async () => {
        await db.collection('dungeon_positions').updateOne(
          { avatarId: objectId },
          { $set: { locationId: newLocationId, lastMoved: new Date() } },
          { upsert: true, session }
        );
        await db.collection('avatars').updateOne(
          { _id: objectId },
          { $set: { channelId: newLocationId } },
          { session }
        );
      });

      // Allow string IDs by converting to ObjectId if necessary
      const updatedAvatar = await this.getAvatarById(avatarId);
      if (!updatedAvatar) throw new Error(`Failed to retrieve updated avatar ${avatarId}`);

      if (actualPreviousLocationId && actualPreviousLocationId !== newLocationId) {
        await this.discordService.sendAsWebhook(
          actualPreviousLocationId,
          `*${updatedAvatar.name} has departed to <#${newLocationId}>*`,
          updatedAvatar
        );
      }

      if (sendProfile) {
        await this.discordService.sendAvatarEmbed(updatedAvatar, newLocationId);
      }

      this.client.emit('avatarMoved', {
        avatarId: objectId,
        previousChannelId: actualPreviousLocationId,
        newChannelId: newLocationId,
        temporary: false,
      });

      return updatedAvatar;
    } catch (error) {
      this.logger.error(`Update failed: ${error.message}`);
      throw error;
    } finally {
      await session.endSession();
    }
  }

  /**
   * Retrieves the location information and avatars present in the location.
   * @param {string} locationId - The ID of the location.
   * @returns {Promise<Object>} - An object containing location details and avatars.
   */
  async getLocationAndAvatars(locationId) {
    const db = this.ensureDb();

    // Fetch location details
    const location = await db.collection(this.LOCATIONS_COLLECTION).findOne({ channelId: locationId });
    if (!location) {
      throw new Error(`Location with ID ${locationId} not found.`);
    }

    // Fetch avatars in the location
    const avatarPositions = await db.collection(this.DUNGEON_POSITIONS_COLLECTION).find({ locationId }).toArray();
    const avatarIds = avatarPositions.map(pos => pos.avatarId);
    const avatars = await db.collection(this.AVATARS_COLLECTION).find({ _id: { $in: avatarIds } }).toArray();

    return {
      location,
      avatars,
    };
  }
}