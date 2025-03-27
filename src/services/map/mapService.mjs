import { ObjectId } from 'mongodb';
import { BasicService } from '../BasicService.mjs';

export class MapService extends BasicService {
  /**
   * Constructs a new MapService instance for managing dungeon state.
   * @param {Object} client - The Discord client instance.
   * @param {Object} logger - Logging interface.
   * @param {Object} avatarService - Service for avatar operations.
   * @param {import('mongodb').Db} db - MongoDB database connection.
   */
  constructor(services) {
    super(services, [
      'discordService',
      'avatarService',
      'databaseService',
    ]);
    this.client = this.discordService.client;
    this.db = this.databaseService.getDatabase();
  }

  // --- Utility Methods ---

  ensureDb() {
    if (!this.db) throw new Error('Database connection unavailable');
    return this.db;
  }

  toObjectId(id) {
    if (id instanceof ObjectId) return id;
    try {
      return new ObjectId(id);
    } catch (error) {
      this.logger.error(`Invalid ID format: ${id}`);
      throw new Error(`Invalid ID: ${id}`);
    }
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
    const objectId = this.toObjectId(avatarId);
    const position = await db.collection('dungeon_positions').findOne({ avatarId: objectId });
    if (!position) return null;

    const location = await db.collection('locations').findOne({ channelId: position.locationId });
    if (!location) return {
      id: position.locationId,
      name: 'Unknown',
      description: 'An unknown location',
      imageUrl: null,
    };

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

  async updateAvatarPosition(avatarId, newLocationId, previousLocationId = null, sendProfile = false) {
    const objectId = this.toObjectId(avatarId);
    const db = this.ensureDb();
    const session = await this.db.client.startSession();

    try {
      const currentAvatar = await this.avatarService?.getAvatarById(objectId);
      if (!currentAvatar) throw new Error(`Avatar not found: ${objectId}`);
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

      const updatedAvatar = await this.avatarService?.getAvatarById(objectId);
      if (!updatedAvatar) throw new Error(`Failed to retrieve updated avatar ${avatarId}`);

      if (actualPreviousLocationId && actualPreviousLocationId !== newLocationId) {
        await this.discordService.sendAsWebhook(
          actualPreviousLocationId,
          `*${updatedAvatar.name} has departed to <#${newLocationId}>*`,
          updatedAvatar
        );
      }

      if (sendProfile) {
        await this.discordService.sendAvatarProfileEmbedFromObject(updatedAvatar, newLocationId);
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
}