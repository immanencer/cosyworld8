import { BasicService } from '../foundation/basicService.mjs';

import { toObjectId } from '../utils/toObjectId.mjs';

export class MapService extends BasicService {
  constructor(services) {
    super(services);

    this.databaseService = services.databaseService;
    this.configService = services.configService;
    this.discordService = services.discordService;
    this.locationService = services.locationService;
    
    
    this.client = this.discordService?.client;
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

  async getAvatarLocation(avatar) {
    const db = this.ensureDb();
    const position = await db.collection('dungeon_positions').findOne({ avatarId: avatar._id });
    if (!position) return { location: { name: 'Unknown Location', description: 'No description available.' } };

    return await this.getLocationAndAvatars(position.locationId);
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

  async updateAvatarPosition(currentAvatar, newLocationId, previousLocationId = null, sendProfile = false) {
    
    const db = this.ensureDb();
    const session = await this.db.client.startSession();
    
    if (!currentAvatar._id) {
      throw new Error('Current avatar has no ID');
    }

    try {    

      const positions = db.collection('dungeon_positions');

      const actualPreviousLocationId = (await positions.findOne(
        { avatarId: currentAvatar._id },
        { projection: { locationId: 1 } }
      ));

      await session.withTransaction(async () => {
        await positions.updateOne(
          { avatarId: currentAvatar._id },
          { $set: { locationId: newLocationId, lastMoved: new Date() } },
          { upsert: true, session }
        );
        await db.collection('avatars').updateOne(
          { _id: currentAvatar._id },
          { $set: { channelId: newLocationId } },
          { session }
        );
      });

      const updatedAvatar = await this.getAvatarById(currentAvatar._id);
      if (!updatedAvatar) throw new Error(`Updated avatar not found: ${currentAvatar._id}`);


      if (sendProfile) {
        await this.discordService.sendAvatarEmbed(updatedAvatar, newLocationId, this.aiService);
      }

      this.client.emit('avatarMoved', {
        avatarId: updatedAvatar._id,
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

  async getAvatarPosition(avatarId) {
    // First check if the avatar is in the cache
    let avatarPosition = this.client.avatarPositionsCache.get(avatarId);
    if (avatarPosition) {
      return avatarPosition;
    }
    // If not in cache, fetch from the database
    const db = this.ensureDb();
    const objectId = toObjectId(avatarId);
    avatarPosition = await db.collection(this.DUNGEON_POSITIONS_COLLECTION).findOne({ avatarId: objectId });

    // if not in DUNGONE_POSITIONS_COLLECTION, check in AVATARS_COLLECTION[channelId]
    if (!avatarPosition) {
      const avatar = await db.collection(this.AVATARS_COLLECTION).findOne({ _id: objectId });
      if (avatar) {
        avatarPosition = {
          locationId: avatar.channelId,
          avatarId: objectId,
        };
      }
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
    const location = await this.locationService.getLocationByChannelId(locationId);
    if (!location) {
      throw new Error(`Location with ID "${locationId}" not found.`);
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