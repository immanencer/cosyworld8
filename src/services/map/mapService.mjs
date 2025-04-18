import { BasicService } from '../foundation/basicService.mjs';

import { toObjectId } from '../utils/toObjectId.mjs';

export class MapService extends BasicService {
  static requiredServices = [
    "databaseService",
    "configService",
    "discordService",
    "locationService",
  ];
  constructor(services) {
    super();

    this.AVATARS_COLLECTION = 'avatars';
    this.LOCATIONS_COLLECTION = 'locations';
    this.DUNGEON_POSITIONS_COLLECTION = 'dungeon_positions';
    this.DUNGEON_STATS_COLLECTION = 'dungeon_stats';
  }


  // --- Database Initialization ---

  async initializeDatabase() {
    this.db = await this.databaseService.getDatabase();
    const collections = await this.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);

    if (!collectionNames.includes('locations')) {
      await this.db.createCollection('locations');
    }
    if (!collectionNames.includes('dungeon_positions')) {
      await this.db.createCollection('dungeon_positions');
      await this.db.collection('dungeon_positions').createIndex({ avatarId: 1 }, { unique: true });
    }
    if (!collectionNames.includes('dungeon_stats')) {
      await this.db.createCollection('dungeon_stats');
      await this.db.collection('dungeon_stats').createIndex({ avatarId: 1 }, { unique: true });
    }
    this.logger.info('Dungeon database initialized');
  }

  // --- Location Management ---

  async getLocationDescription(locationId, locationName) {
    this.db = await this.databaseService.getDatabase();
    const location = await this.db.collection('locations').findOne({
      $or: [{ channelId: locationId }, { name: locationName }],
    });
    return location?.description || null;
  }

  async findLocation(destination) {
    this.db = await this.databaseService.getDatabase();
    return await this.db.collection('locations').findOne({
      $or: [{ id: destination }, { name: { $regex: new RegExp(destination, 'i') } }],
    });
  }

  async getAvatarLocation(avatar) {
    this.db = await this.databaseService.getDatabase();
    const position = await this.db.collection('dungeon_positions').findOne({ $or: [
      { avatarId: avatar._id }, { avatarId: avatar._id.toString() }
    ]});
    if (position && position.locationId) {
      return await this.getLocationAndAvatars(position.locationId);
    }
    return { location: { name: 'Unknown Location', description: 'No description available.' } };
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
    
    this.db = await this.databaseService.getDatabase();
    const session = await this.db.client.startSession();
    
    if (!currentAvatar._id) {
      throw new Error('Current avatar has no ID');
    }

    try {    

      const positions = this.db.collection('dungeon_positions');

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
        await this.db.collection('avatars').updateOne(
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

      return updatedAvatar;
    } catch (error) {
      this.logger.error(`Update failed: ${error.message}`);
      throw error;
    } finally {
      await session.endSession();
    }
  }

  async getAvatarPosition(avatarId) {
    this.db = await this.databaseService.getDatabase();
    // First check if the avatar is in the cache
    let avatarPosition = this.client.avatarPositionsCache.get(avatarId);
    if (avatarPosition) {
      return avatarPosition;
    }
    // If not in cache, fetch from the database
      this.db = await this.databaseService.getDatabase();
    const objectId = toObjectId(avatarId);
    avatarPosition = await this.db.collection(this.DUNGEON_POSITIONS_COLLECTION).findOne({ avatarId: objectId });

    // if not in DUNGONE_POSITIONS_COLLECTION, check in AVATARS_COLLECTION[channelId]
    if (!avatarPosition) {
      const avatar = await this.db.collection(this.AVATARS_COLLECTION).findOne({ _id: objectId });
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
    this.db = await this.databaseService.getDatabase();

    // Fetch location details
    const location = await this.locationService.getLocationByChannelId(locationId);
    if (!location) {
      throw new Error(`Location with ID "${locationId}" not found.`);
    }

    // Fetch avatars in the location
    const avatarPositions = await this.db.collection(this.DUNGEON_POSITIONS_COLLECTION).find({ locationId }).toArray();
    const avatarIds = avatarPositions.map(pos => pos.avatarId);
    const avatars = await this.db.collection(this.AVATARS_COLLECTION).find({$or:[{channelId: locationId } , { _id: { $in: avatarIds } }]}).toArray();

    return {
      location,
      avatars,
    };
  }
}