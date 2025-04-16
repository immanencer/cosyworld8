// Description: AvatarService class for managing avatars in the game.
import { BasicService } from '../foundation/basicService.mjs';

import Replicate from 'replicate';
import process from 'process';
import Fuse from 'fuse.js';
import { toObjectId } from '../utils/toObjectId.mjs';

export class AvatarService extends BasicService {
  constructor(services) {
    super(services);
    this.databaseService = services.databaseService;
    this.configService = services.configService;
    this.mapService = services.mapService;
    this.aiService = services.aiService;
    this.schedulingService = services.schedulingService;
    this.conversationManager = services.conversationManager;
    this.statService = services.statService;
    this.schemaService = services.schemaService;

    this.db = this.databaseService.getDatabase();
    this.channelAvatars = new Map(); // channelId -> Set of avatarIds
    this.avatarActivityCount = new Map(); // avatarId -> activity count

    const mongoConfig = this.configService.config.mongo;
    this.IMAGE_URL_COLLECTION = mongoConfig?.collections?.imageUrls || 'image_urls';
    this.AVATARS_COLLECTION = mongoConfig?.collections?.avatars || 'avatars';

    this.prompts = null;
    this.avatarCache = [];
  }

  async initializeServices() {
    this.logger.info('[AvatarService] Registering generateReflections periodic task');
    this.schedulingService.addTask(
      'generateReflections',
      async () => {
        try {
          await this.generateReflections();
        } catch (err) {
          this.logger.warn(`[AvatarService] Error in generateReflections task: ${err.message}`);
        }
      },
      5 * 60 * 1000 // every 5 minutes
    );

    this.generateReflections();
    this.logger.info('AvatarService initialized');
  }

  async generateReflections() {
    const avatars = (await this.getActiveAvatars()).slice(0, 3);
    if (avatars.length === 0) {
      this.logger.info('No active avatars found for reflection generation.');
      return;
    }

    await Promise.all(
      avatars.map(async (avatar) => {
        try {
          await this.conversationManager.generateNarrative(avatar);
        } catch (error) {
          this.logger.error(`Error generating reflection for avatar ${avatar.name}: ${error.message}`);
        }
      })
    );
    this.logger.info('Reflections generated for active avatars.');
  }

  initializeReplicate(aiConfig) {
    if (aiConfig && aiConfig.replicate && aiConfig.replicate.apiToken) {
      const replicate = new Replicate({ auth: aiConfig.replicate.apiToken });
      this.logger.info('Replicate service initialized successfully');
      return replicate;
    } else {
      this.logger.warn('Replicate configuration is missing or invalid. Image generation will be disabled.');
      return null;
    }
  }

  async initializeDatabase() {
    this.avatarsCollection = this.db.collection('avatars');
    this.messagesCollection = this.db.collection('messages');
    this.channelsCollection = this.db.collection('channels');
    await Promise.all([
      this.avatarsCollection.createIndex({ name: 1 }),
      this.avatarsCollection.createIndex({ channelId: 1 }),
      this.avatarsCollection.createIndex({ createdAt: -1 }),
      this.avatarsCollection.createIndex({ messageCount: -1 }),
      this.messagesCollection.createIndex({ timestamp: 1 }),
      this.channelsCollection.createIndex({ lastActive: 1 }),
    ]);
    this.logger.info('AvatarService database setup completed.');
  }
  // --- Avatar Management ---

  async getAvatarStats(avatarId) {
    const objectId = toObjectId(avatarId);
    const stats = await this.db.collection('dungeon_stats').findOne({ avatarId: objectId });
    return stats || { hp: 100, attack: 10, defense: 5, avatarId: objectId };
  }

  async updateAvatarStats(avatar, stats) {
    stats.avatarId = avatar._id;
    await this.db.collection('dungeon_stats').updateOne(
      { avatarId: avatar._id },
      { $set: stats },
      { upsert: true }
    );
    this.logger.debug(`Updated stats for avatar ${avatar._id} - ${avatar.name}: ${JSON.stringify(stats)}`);
  }

  async initializeAvatar(avatar, locationId) {
    const defaultStats = await this.getOrCreateStats(avatar);
    await this.updateAvatarStats(avatar, avatar.stats || defaultStats);
    if (locationId) await this.mapService.updateAvatarPosition(avatar, locationId);
    this.logger.info(`Initialized avatar ${avatar._id}${locationId ? ` at ${locationId}` : ''}`);
    this.updateAvatar(avatar);
    return avatar;
  }

  async getOrCreateStats(avatar) {
    let stats = avatar.stats || (await this.getAvatarStats(avatar._id));  
    if (!stats || !this.statService.validateStats(stats)) {
      stats = this.statService.generateStatsFromDate(avatar?.createdAt || new Date());
      await this.updateAvatarStats(avatar, stats);
      avatar.stats = stats;
      await this.updateAvatar(avatar);
    }
    return stats;
  }

  async getActiveAvatars() {
    const avatars = await this.getAllAvatars();
    return avatars
      .map((avatar) => ({
        ...avatar,
        id: avatar._id || avatar.id,
        name: avatar.name || null,
        active: avatar.active !== false,
      }))
      .filter((avatar) => avatar.id && avatar.name && avatar.active);
  }

  async getAvatarsInChannel(channelId) {
    return (await this.mapService.getLocationAndAvatars(channelId)).avatars;
  }

  async manageChannelAvatars(channelId, newAvatarId) {
    let avatars = this.channelAvatars.get(channelId) || new Set();
    if (newAvatarId && avatars.size >= 8) {
      let leastActive = [...avatars].reduce((min, id) => {
        const count = this.avatarActivityCount.get(id) || 0;
        return count < (this.avatarActivityCount.get(min) || 0) ? id : min;
      });
      avatars.delete(leastActive);
    }
    if (newAvatarId) {
      avatars.add(newAvatarId);
      this.avatarActivityCount.set(newAvatarId, (this.avatarActivityCount.get(newAvatarId) || 0) + 1);
    }
    this.channelAvatars.set(channelId, avatars);
    return avatars;
  }

  async getAvatars(avatarIds) {
    try {
      const avatars = await this.db.collection(this.AVATARS_COLLECTION).find({
        _id: { $in: avatarIds.map(id => new ObjectId(id)) }
      }).toArray();
      return avatars;
    } catch (error) {
      this.logger.error(`Failed to fetch avatars: ${error.message}`);
      return [];
    }
  }

  /**
   * Extracts avatars mentioned in the message content.
   * @param {string} content - The message content.
   * @param {Array} avatars - Array of all avatars.
   * @returns {Set} Set of mentioned avatars.
   */
  extractMentionedAvatars(content, avatars) {
    const mentionedAvatars = new Set();
    if (!content || !Array.isArray(avatars)) {
      this.logger.warn('Invalid input to extractMentionedAvatars', {
        content,
        avatarsLength: avatars?.length,
      });
      return mentionedAvatars;
    }

    // Exact match and emoji check
    for (const avatar of avatars) {
      try {
        if (!avatar || typeof avatar !== 'object') {
          this.logger.error('Invalid avatar object:', avatar);
          continue;
        }
        if (!avatar._id || !avatar.name) {
          this.logger.error('Avatar missing required fields:', {
            _id: avatar._id,
            name: avatar.name,
            objectKeys: Object.keys(avatar),
          });
          continue;
        }
        const nameMatch = avatar.name && content.toLowerCase().includes(avatar.name.toLowerCase());
        const emojiMatch = avatar.emoji && content.includes(avatar.emoji);

        if (nameMatch || emojiMatch) {
          this.logger.debug(`Found mention of avatar (exact): ${avatar.name} (${avatar._id})`);
          mentionedAvatars.add(avatar);
        }
      } catch (error) {
        this.logger.error(`Error processing avatar in extractMentionedAvatars: ${error.message}`, {
          avatar: JSON.stringify(avatar, null, 2),
        });
      }
    }

    // Fuzzy matching for avatars not already matched
    const avatarsToSearch = avatars.filter(avatar => !mentionedAvatars.has(avatar));
    if (avatarsToSearch.length > 0) {
      const fuseOptions = {
        keys: ['name'],
        threshold: 0.4
      };
      const fuse = new Fuse(avatarsToSearch, fuseOptions);
      // Search using the full content as query
      const fuzzyResults = fuse.search(content);
      fuzzyResults.forEach(result => {
        // Lower score implies a better match (score ranges from 0 to 1)
        if (result.score !== undefined && result.score < 0.5) {
          this.logger.debug(`Found fuzzy mention of avatar: ${result.item.name} (${result.item._id}) with score ${result.score}`);
          mentionedAvatars.add(result.item);
        }
      });
    }

    return mentionedAvatars;
  }

  /**
   * Get the last breeding date for an avatar.
   * @param {string} avatarId - ID of avatar to check.
   * @returns {Promise<Date|null>} Last breeding date or null if never bred.
   */
  async getLastBredDate(avatarId) {
    try {
      const lastOffspring = await this.db.collection(this.AVATARS_COLLECTION)
        .findOne(
          { parents: { $in: [avatarId] } },
          {
            sort: { createdAt: -1 },
            projection: { createdAt: 1 }
          }
        );

      if (!lastOffspring) {
        return null;
      }
      return new Date(lastOffspring.createdAt);
    } catch (error) {
      this.logger.error(`Error getting last bred date for ${avatarId}: ${error.message}`);
      throw error;
    }
  }

  async getAvatarsWithRecentMessages(limit = 100) {
    try {
      const collection = this.db.collection('messages');
      const avatarsCollection = this.db.collection(this.AVATARS_COLLECTION);

      // Use a conditional query based on DISCORD_BOT_ID existence
      const matchQuery = process.env.DISCORD_BOT_ID
        ? { authorId: process.env.DISCORD_BOT_ID }
        : { authorId: { $exists: true } };

      const pipeline = [
        { $match: matchQuery },
        {
          $group: {
            _id: '$authorUsername',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 1000 } // Fetch a larger pool of authors
      ];

      const messages = await collection.aggregate(pipeline).toArray();
      const topAuthors = messages.map(mention => mention._id);

      // Fetch avatars for the top authors
      const avatars = await avatarsCollection
        .aggregate([
          { $match: { name: { $in: topAuthors } } },
          { $sample: { size: limit } } // Randomize selection for variety
        ])
        .toArray();

      return avatars;
    } catch (error) {
      this.logger.error(`Error fetching avatars with recent messages: ${error.message}`);
      return [];
    }
  }

  async getAvatarByName(name, includeStatus = 'alive') {
    try {
      const collection = this.db.collection(this.AVATARS_COLLECTION);
      const query = {
        name: { $regex: new RegExp(`^${name}$`, 'i') }
      };
      if (includeStatus === 'alive') {
        query.status = { $ne: 'dead' };
      }
      const avatar = await collection.findOne(query);
      if (!avatar) {
        this.logger.warn(`Avatar with name "${name}" not found.`);
        return null;
      }
      this.logger.info(`Avatar found: ${avatar.name} (${avatar._id})`);
      // Ensure stats are valid
      avatar.stats = await this.getOrCreateStats(avatar);
      return avatar;
    } catch (error) {
      this.logger.error(`Error fetching avatar by name: ${error.message}`);
      return null;
    }
  }

  async fuzzyAvatarByName(query, includeStatus = 'alive', limit = 10) {
    try {
      const collection = this.db.collection(this.AVATARS_COLLECTION);
      const filter = {};
      if (includeStatus === 'alive') {
        filter.status = { $ne: 'dead' };
      }

      const avatars = await collection.find(filter).toArray();
      const fuseOptions = {
        keys: ['name'],
        threshold: 0.4,
      };

      const fuse = new Fuse(avatars, fuseOptions);
      const results = fuse.search(query);

      // Return a limited number of results for variety
      return results.slice(0, limit).map(result => result.item);
    } catch (error) {
      this.logger.error(`Error fetching avatar by name: ${error.message}`);
      return [];
    }
  }

  async getAllAvatars(includeStatus = 'alive', limit = 100) {
    try {
      const collection = this.db.collection(this.AVATARS_COLLECTION);
      const query = { name: { $exists: true, $ne: null } };
      if (includeStatus === 'alive') {
        query.status = { $ne: 'dead' };
      }

      // Fetch a larger pool of avatars and randomize the selection
      const avatars = await collection
        .aggregate([
          { $match: query },
          { $sample: { size: limit } } // Randomize selection for variety
        ])
        .toArray();

      return avatars.map(avatar => ({ ...avatar }));
    } catch (error) {
      this.logger.error(`Error fetching avatars: ${error.message}`);
      return [];
    }
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

  async retryOperation(operation, maxAttempts = 3) {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        if (attempt === maxAttempts) throw error;
        const delay = Math.pow(2, attempt) * 1000;
        this.logger.warn(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  getRandomAlignment() {
    const alignments = ['neutral', 'good', 'evil'];
    const randomIndex = Math.floor(Math.random() * alignments.length);
    const alignment = alignments[randomIndex];

    const chaotic = ['chaotic', 'neutral', 'lawful'];
    const randomIndex2 = Math.floor(Math.random() * chaotic.length);
    const chaoticAlignment = chaotic[randomIndex2];

    return `${chaoticAlignment} ${alignment}`;
  }

  /**
   * Generates an avatar description using the AI service.
   * @param {string} userPrompt - The user-provided prompt.
   * @returns {Object} - The generated avatar details.
   */
  async generateAvatarDetails(userPrompt, guildId = null) {
    const prompt = `Generate a unique and creative character for a role-playing game based on this description: "${userPrompt}". Include fields: name, description, personality, and emoji, and model if specified, otherwise "none".`;
    const schema = {
      name: 'rati-avatar',
      strict: true,
      schema: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          personality: { type: 'string' },
          emoji: { type: 'string' },
          model: { type: 'string' },
        },
        required: ['name', 'description', 'personality', 'emoji', 'model'],
        additionalProperties: false,
      }
    };

    return await this.schemaService.executePipeline({ prompt, schema });
  }

  /**
   * Generates an avatar image using Replicate.
   * @param {string} prompt - The prompt for image generation.
   * @returns {string|null} - The local filename of the generated image.
   */
  async generateAvatarImage(prompt) {
    return await this.schemaService.generateImage(prompt, '1:1'); // Use SchemaService for image generation
  }


  /**
   * Updates an avatar's details.
   * @param {object} avatar - The avatar object to update.
   * @returns {Object|null} - The updated avatar or null on failure.
   */
  async updateAvatar(avatar) {
    if (!this.db) {
      this.logger.error('Database is not connected. Cannot update avatar.');
      return null;
    }
    try {
      if (avatar.arweave_prompt) {
        await this.syncArweavePrompt(avatar);
      }
      // Allow conversion if avatar._id is a string.
      if (typeof avatar._id === 'string') {
        avatar._id = new ObjectId(avatar._id);
      }
      const updateDoc = {
        $set: {
          ...avatar,
          updatedAt: new Date(),
        },
      };
      const updateResult = await this.db.collection(this.AVATARS_COLLECTION).updateOne(
        { _id: avatar._id },
        updateDoc
      );
      if (updateResult.matchedCount === 0) {
        this.logger.error(`Avatar with ID ${avatar._id} not found.`);
        return null;
      }
      if (updateResult.modifiedCount === 1) {
        this.avatarCache = [];
        this.logger.info(`${avatar.emoji} (${avatar.name}) Avatar ID ${avatar._id} updated successfully.`);
        const updatedAvatar = await this.db.collection(this.AVATARS_COLLECTION).findOne({ _id: avatar._id });
        return updatedAvatar;
      } else {
        this.logger.error(`Failed to update avatar with ID ${avatar._id}.`);
        return null;
      }
    } catch (error) {
      this.logger.error(`Error during avatar update: ${error.message}`);
      return null;
    }
  }

  /**
   * Creates a new avatar by generating its details and image, then saving it.
   * @param {Object} data - Data for the new avatar.
   * @param {string} data.prompt - The prompt for generating avatar details.
   * @param {string} [data.summoner] - The Discord user ID of the summoner.
   * @param {string} [data.channelId] - The Discord channel ID.
   * @returns {Object|null} - The created avatar document.
   */
  async createAvatar(data) {
    const avatarDetails = await this.generateAvatarDetails(data.prompt, data.guildId);
    // Validate avatarDetails
    if (!avatarDetails || !avatarDetails.name || !avatarDetails.description || !avatarDetails.personality || !avatarDetails.emoji || !avatarDetails.model) {
      this.logger.error('createAvatar: Invalid avatarDetails generated:', avatarDetails);
      return null;
    }
    // Check if an avatar with the same name already exists, if it does, return it.
    const existingAvatar = await this.getAvatarByName(avatarDetails.name);
    if (existingAvatar) {
      this.logger.info(`Avatar with name "${avatarDetails.name}" already exists. Returning existing avatar.`);
      return existingAvatar;
    }
    
    const imageUrl = await this.generateAvatarImage(avatarDetails.description);


      // Set avatar properties
    const model = await this.aiService.getModel(avatarDetails.model);

    const avatarDocument = {
      ...avatarDetails,
      imageUrl,
      model,
      channelId: data.channelId,
      summoner: data.summoner,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lives: 3,
      status: 'alive',
    };
      
    const result = await this.db.collection('avatars').insertOne(avatarDocument);
    return { ...avatarDocument, _id: result.insertedId };
  }

  /**
   * Checks if the daily limit for image generation has been reached.
   * @param {string} channelId - The Discord channel ID.
   * @returns {boolean} - True if under the limit, false otherwise.
   */
  async checkDailyLimit(channelId) {
    try {
      const collection = this.db.collection(this.IMAGE_URL_COLLECTION);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const count = await collection.countDocuments({
        channelId,
        date: { $gte: today },
      });
      this.logger.info(`Daily request count for channel ${channelId}: ${count}`);
      return count < 100;
    } catch (error) {
      this.logger.error(`Error checking daily limit: ${error.message}`);
      return false;
    }
  }

  async getAvatarFromMessage(message) {
    if (!message || !message.author) {
      this.logger.error('Invalid message or author data');
      return null;
    }
    const { author } = message;
    if (message.rati?.avatarId) {
      const result = await this.getAvatarById(message.rati.avatarId);
      if (result) {
        return result.avatar;
      }
    }
    return null;
  }

  /**
   * Inserts a new request record into MongoDB.
   * @param {string} prompt - The prompt used for image generation.
   * @param {string} imageUrl - The URL of the image.
   * @param {string} channelId - The Discord channel ID.
   */
  async insertRequestIntoMongo(prompt, imageUrl, channelId) {
    try {
      const collection = this.db.collection(this.IMAGE_URL_COLLECTION);
      const now = new Date();
      const record = { prompt, imageUrl, channelId, date: now };
      await collection.insertOne(record);
      this.logger.info('Record inserted into MongoDB successfully.');
    } catch (error) {
      this.logger.error(`Error inserting into MongoDB: ${error.message}`);
    }
  }

  /**
   * Checks if an image URL is accessible.
   * @param {string} url - The URL of the image.
   * @returns {Promise<boolean>} - True if accessible, false otherwise.
   */
  async isImageAccessible(url) {
    return new Promise(async (resolve) => {
      try {
        const { protocol } = new URL(url);
        const httpModule = protocol === 'https:' ? await import('https') : await import('http');
        const request = httpModule.request(url, { method: 'HEAD' }, (response) => {
          resolve(response.statusCode === 200);
        });
        request.on('error', (error) => {
          this.logger.warn(`Image URL inaccessible: ${url} - ${error.message}`);
          resolve(false);
        });
        request.end();
      } catch (error) {
        this.logger.warn(`Invalid URL: ${url} - ${error.message}`);
        resolve(false);
      }
    });
  }

  /**
   * Regenerates an avatar image if the current image URL is defunct.
   * @param {string} avatarId - The ID of the avatar.
   * @returns {boolean} - True if successful, false otherwise.
   */
  async regenerateAvatarImage(avatarId) {
    if (!this.db) {
      this.logger.error('Database is not connected. Cannot regenerate avatar image.');
      return false;
    }
    try {
      const avatar = await this.db.collection(this.AVATARS_COLLECTION).findOne({ _id: new ObjectId(avatarId) });
      if (!avatar) {
        this.logger.error(`Avatar with ID ${avatarId} not found.`);
        return false;
      }
      const isAccessible = await this.isImageAccessible(avatar.imageUrl);
      if (isAccessible) {
        this.logger.info(`Avatar image for ID ${avatarId} is accessible. No regeneration needed.`);
        return true;
      }
      this.logger.warn(`Avatar image for ID ${avatarId} is defunct. Regenerating...`);
      const imageFile = await this.generateAvatarImage(avatar.description);
      if (!imageFile) {
        this.logger.error('Regeneration aborted: Image download failed.');
        return false;
      }
      const s3Url = await uploadImage(imageFile);
      const updateResult = await this.db.collection(this.AVATARS_COLLECTION).updateOne(
        { _id: new ObjectId(avatarId) },
        { $set: { imageUrl: s3Url, updatedAt: new Date() } }
      );
      if (updateResult.modifiedCount === 1) {
        this.logger.info(`Avatar ID ${avatarId} image regenerated successfully.`);
        return true;
      } else {
        this.logger.error(`Failed to update avatar ID ${avatarId} with the new image URL.`);
        return false;
      }
    } catch (error) {
      this.logger.error(`Error during avatar image regeneration: ${error.message}`);
      return false;
    }
  }

  async syncArweavePrompt(avatar) {
    if (!avatar.arweave_prompt || !this.isValidUrl(avatar.arweave_prompt)) {
      return null;
    }
    try {
      const response = await fetch(avatar.arweave_prompt);
      if (!response.ok) {
        throw new Error(`Failed to fetch Arweave prompt: ${response.statusText}`);
      }
      const prompt = await response.text();
      const avatarsCollection = this.db.collection(this.AVATARS_COLLECTION);
      await avatarsCollection.updateOne(
        { _id: avatar._id },
        { $set: { prompt: prompt.trim() } }
      );
      return prompt.trim();
    } catch (error) {
      this.logger.error(`Error syncing Arweave prompt: ${error.message}`);
      return null;
    }
  }

  isValidUrl(string) {
    try {
      new URL(string);
      return true;
    } catch (err) {
      return false;
    }
  }

  async fetchPrompt(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch prompt from Arweave: ${response.statusText}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(`Error fetching prompt from Arweave: ${error.message}`);
    }
  }

  isArweaveUrl(url) {
    return url.startsWith('https://arweave.net/');
  }

  async updateAllArweavePrompts() {
    if (!this.db) {
      this.logger.error('Database is not connected. Cannot update Arweave prompts.');
      return;
    }
    try {
      const avatarsCollection = this.db.collection(this.AVATARS_COLLECTION);
      const avatarsWithArweave = await avatarsCollection.find({
        arweave_prompt: { $exists: true, $ne: null }
      }).toArray();
      this.logger.info(`Found ${avatarsWithArweave.length} avatars with Arweave prompts to update`);
      for (const avatar of avatarsWithArweave) {
        try {
          const syncedPrompt = await this.syncArweavePrompt(avatar);
          if (syncedPrompt) {
            this.logger.info(`Updated Arweave prompt for avatar: ${avatar.name}`);
          }
        } catch (error) {
          this.logger.error(`Failed to update Arweave prompt for avatar ${avatar.name}: ${error.message}`);
        }
      }
    } catch (error) {
      this.logger.error(`Error updating Arweave prompts: ${error.message}`);
    }
  }

  /**
   * Ensures a unique avatar is generated for each summoner (Discord user).
   * If an "alive" avatar already exists for the given summoner, it returns that avatar.
   * Otherwise, it creates a new avatar with the provided prompt and channel ID.
   *
   * @param {string} summonerId - The Discord user ID of the summoner.
   * @param {string} summonPrompt - The prompt to generate avatar details.
   * @param {string} channelId - The Discord channel ID.
   * @returns {Object|null} - The unique avatar document or null if creation failed.
   */
  async getOrCreateUniqueAvatarForUser(summonerId, summonPrompt, channelId) {
    try {
      const collection = this.db.collection(this.AVATARS_COLLECTION);
      const existingAvatar = await collection.findOne({ summoner: summonerId, status: 'alive' });
      if (existingAvatar) {
        this.logger.info(`Unique avatar already exists for summoner ${summonerId}.`);
        return { avatar: existingAvatar, new: false };
      }
      this.logger.info(`No unique avatar found for summoner ${summonerId}, creating new one.`);
      
      // Generate stats for the avatar
      const creationDate = new Date();
      const stats = this.statService.generateStatsFromDate(creationDate);

      // Prepare avatar creation data
      const prompt = `Stats: ${JSON.stringify(stats)}\n\n${summonPrompt}`;
      const avatarData = { prompt, summoner: summonerId, channelId };
      // Create new avatar
      const newAvatar = await this.createAvatar(avatarData);
      newAvatar.stats = stats;
      newAvatar.createdAt = creationDate.toISOString();
      return { avatar: newAvatar, new: true };
    } catch (error) {
      this.logger.error(`Error in getOrCreateUniqueAvatarForUser: ${error.message}`);
      return null;
    }
  }

  /**
   * Gets or summons a user's avatar to the current channel.
   * If the user doesn't have an avatar, it will create one.
   * If the avatar is not in the current channel, it will move it there.
   * 
   * @param {Object} message - Discord message object
   * @param {string} [customPrompt] - Optional custom prompt to use for avatar creation
   * @returns {Promise<Object>} The avatar object
   */
  async summonUserAvatar(message, customPrompt = null) {
    try {
      if (!message || !message.author) {
        this.logger.error('Invalid message object provided to summonUserAvatar');
        return null;
      }

      const userId = message.author.id;
      const userName = message.author.username;
      const channelId = message.channel.id;

      this.logger.info(`Summoning avatar for user ${userName}(${userId}) in channel ${channelId}`);

      // Use the existing method to get or create the avatar
      const result = await this.getOrCreateUniqueAvatarForUser(userId,
        customPrompt || `Create an avatar that represents ${userName}. Make it creative, unique, and memorable.`,
        channelId);

      if (!result) {
        this.logger.error(`getOrCreateUniqueAvatarForUser returned null for user ${userName}`);
        throw new Error(`Failed to get or create avatar for user ${userName}`);
      }

      if (!result.avatar) {
        this.logger.error(`No avatar found in result for user ${userName}: ${JSON.stringify(result)}`);
        throw new Error(`Failed to get or create avatar for user ${userName}`);
      }

      // Verify the avatar has all required properties
      if (!result.avatar._id || !result.avatar.name) {
        this.logger.error(`Incomplete avatar data for user ${userName}: ${JSON.stringify(result.avatar)}`);
        throw new Error(`Incomplete avatar data for user ${userName}`);
      }

      let userAvatar = result.avatar;

      // If avatar is not in this channel, move it
      if (userAvatar.channelId !== channelId) {
        this.logger.info(`Moving avatar ${userAvatar.name} to channel ${channelId}`);
        await this.mapService.updateAvatarPosition(userAvatar, channelId, userAvatar.channelId);
      }

      return {
        avatar: userAvatar,
        isNewAvatar: result.new
      };
    } catch (error) {
      this.logger.error(`Error summoning user avatar: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generates RATi-compatible metadata for an avatar.
   * @param {Object} avatar - The avatar object.
   * @param {Object} storageUris - URIs for metadata storage (e.g., { primary: 'ar://...', backup: 'ipfs://...' }).
   * @returns {Object} - The RATi-compatible metadata.
   */
  generateRatiMetadata(avatar, storageUris) {
    return {
      tokenId: avatar._id.toString(),
      name: avatar.name,
      description: avatar.description,
      media: {
        image: avatar.imageUrl,
        video: avatar.videoUrl || null
      },
      attributes: [
        { trait_type: "Personality", value: avatar.personality },
        { trait_type: "Status", value: avatar.status },
        { trait_type: "Lives", value: avatar.lives.toString() }
      ],
      signature: null, // To be signed by the RATi node.
      storage: storageUris,
      evolution: {
        level: avatar.evolutionLevel || 1,
        previous: avatar.previousTokenIds || [],
        timestamp: avatar.updatedAt
      },
      memory: {
        recent: avatar.memoryRecent || null,
        archive: avatar.memoryArchive || null
      }
    };
  }

  /**
   * Fetches the full item documents for an avatar's inventory item IDs.
   * @param {object} avatar - The avatar object.
   * @returns {Promise<Array>} - Array of item documents.
   */
  async getInventoryItems(avatar) {
    if (!avatar || (!avatar.selectedItemId && !avatar.storedItemId)) return [];
    const itemIds = [avatar.selectedItemId, avatar.storedItemId].filter(Boolean);
    if (itemIds.length === 0) return [];
    const db = this.db;
    const items = await db.collection('items').find({ _id: { $in: itemIds.map(id => typeof id === 'string' ? toObjectId(id) : id) } }).toArray();
    return items;
  }
}