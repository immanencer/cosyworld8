// services/avatar_generation_service.mjs

import { SchemaValidator } from './utils/schemaValidator.mjs';
import Replicate from 'replicate';
// import { OllamaService as AIService } from './ollamaService.mjs';
import { OpenRouterService as AIService } from './openrouterService.mjs';

import process from 'process';
import winston from 'winston';
import { extractJSON } from './utils.mjs';
import Fuse from 'fuse.js';

import { uploadImage } from './s3imageService/s3imageService.mjs';

import { ObjectId } from 'mongodb';

import fs from 'fs/promises';
import fetch from 'node-fetch';

export class AvatarGenerationService {
  constructor(db) {
    this.aiService = new AIService();
    this.replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });
    this.db = db; // Will be set when connecting to the database

    // Initialize Logger
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(
          ({ timestamp, level, message }) => `${timestamp} [${level.toUpperCase()}]: ${message}`
        )
      ),
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'avatarService.log' }),
      ],
    });

    this.IMAGE_URL_COLLECTION = process.env.IMAGE_URL_COLLECTION || 'image_urls';
    this.AVATARS_COLLECTION = process.env.AVATARS_COLLECTION || 'avatars';

    this.prompts = null;
  }

  async getAvatars(avatarIds) {
    try {
      const avatars = await this.db.collection(this.AVATARS_COLLECTION).find({
        _id: { $in: avatarIds }
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

    for (const avatar of avatars) {
      try {
        // Validate avatar object
        if (!avatar || typeof avatar !== 'object') {
          this.logger.error('Invalid avatar object:', avatar);
          continue;
        }

        // Ensure required fields exist
        if (!avatar._id || !avatar.name) {
          this.logger.error('Avatar missing required fields:', {
            _id: avatar._id,
            name: avatar.name,
            objectKeys: Object.keys(avatar),
          });
          continue;
        }

        // Check for mentions by name or by emoji
        const nameMatch = avatar.name && content.toLowerCase().includes(avatar.name.toLowerCase());
        const emojiMatch = avatar.emoji && content.includes(avatar.emoji);

        if (nameMatch || emojiMatch) {
          this.logger.debug(`Found mention of avatar: ${avatar.name} (${avatar._id})`);
          mentionedAvatars.add(avatar);
        }
      } catch (error) {
        this.logger.error(`Error processing avatar in extractMentionedAvatars:`, {
          error: error.message,
          avatar: JSON.stringify(avatar, null, 2),
        });
      }
    }

    return mentionedAvatars;
  }

  async getActiveAvatars() {
    try {
      const avatars = await this.db.collection(this.AVATARS_COLLECTION).find({
        active: true
      }).toArray();
      return avatars;
    } catch (error) {
      this.logger.error(`Failed to fetch active avatars: ${error.message}`);
      return [];
    }
  }

  /**
   * Get the last breeding date for an avatar
   * @param {string} avatarId - ID of avatar to check
   * @returns {Promise<Date|null>} Last breeding date or null if never bred
   */
  async getLastBredDate(avatarId) {
    try {
      // Find most recent avatar where this ID is in parents array
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
      const pipeline = [
        {
          $match: {
            authorId: process.env.DISCORD_BOT_ID ? process.env.DISCORD_BOT_ID : { $exists: true }
          }
        },
        {
          $group: {
            _id: '$authorUsername',
            count: { $sum: 1 }
          }
        },
        {
          $sort: { count: -1 }
        },
        {
          $limit: 1000
        }
      ];

      const messages = await collection.aggregate(pipeline).toArray();
      const topAuthors = messages.map(mention => mention._id).slice(0, 100);
      const avatars = await this.db.collection(this.AVATARS_COLLECTION).find({ name: { $in: topAuthors } }).toArray();
      return avatars.slice(0, limit);
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
      return await collection.findOne(query);
    } catch (error) {
      this.logger.error(`Error fetching avatar by name: ${error.message}`);
      return null;
    }
  }

  async fuzzyAvatarByName(query, includeStatus = 'alive') {
    try {
      const collection = this.db.collection(this.AVATARS_COLLECTION);

      // Build a filter; if we want only "alive" avatars, add a status filter.
      const filter = {};
      if (includeStatus === 'alive') {
        filter.status = { $ne: 'dead' };
      }

      // Load all candidate avatars
      const avatars = await collection.find(filter).toArray();

      // Set up Fuse.js options. Adjust threshold to be more or less forgiving.
      const fuseOptions = {
        keys: ['name'],   // Only consider the "name" field
        threshold: 0.4,   // Lower values require closer matches; tweak as needed
      };

      const fuse = new Fuse(avatars, fuseOptions);

      // Perform the fuzzy search against the provided query.
      // For example, if the query is "tom brown, to assist me with my washing",
      // Fuse.js may correctly score "tomorrow brown" as the best match.
      const results = fuse.search(query);

      if (results.length > 0) {
        // Return the best matching avatar.
        return results[0].item;
      }

      return null;
    } catch (error) {
      this.logger.error(`Error fetching avatar by name: ${error.message}`);
      return null;
    }
  }

  avatarCache = [];
  async getAllAvatars(includeStatus = 'alive') {
    try {
      const collection = this.db.collection(this.AVATARS_COLLECTION);
      const query = {
        name: { $exists: true, $ne: null },
      };
      if (includeStatus === 'alive') {
        query.status = { $ne: 'dead' };
      }
      const avatars = await collection.find(query).toArray();
      return avatars.map(avatar => ({ ...avatar }));
    } catch (error) {
      this.logger.error(`Error fetching avatars: ${error.message}`);
      return [];
    }
  }

  async getAvatarsInChannel(channelId) {
    try {
      const collection = this.db.collection(this.AVATARS_COLLECTION);
      const avatars = await collection
        .find({ channelId })
        .sort({ createdAt: -1 })
        .toArray();
      return avatars.map(avatar => ({ ...avatar }));
    } catch (error) {
      this.logger.error(`Error fetching avatars in channel: ${error.message}`);
      return [];
    }
  }

  /**
   * Fetches an avatar by its ID.
   * @param {ObjectId} id - The ID of the avatar to fetch.
   * @returns {Object} - The avatar object.
   * @throws {Error} - If the avatar is not found.
   */
  async getAvatarById(id) {
    const collection = this.db.collection(this.AVATARS_COLLECTION);
    const avatar = await collection.findOne({ _id: id });
    if (!avatar) {
      throw new Error(`Avatar with ID "${id}" not found.`);
    }
    return avatar;
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

  async getAvatar(name) {
    try {
      const collection = this.db.collection(this.AVATARS_COLLECTION);
      const avatar = await collection.findOne({ name });
      if (!avatar) {
        throw new Error(`Avatar with name "${name}" not found.`);
      }
      return avatar;
    } catch (error) {
      this.logger.error(`Error fetching avatar: ${error.message}`);
      return null;
    }
  }

  /**
   * Generates an avatar description using the AI service.
   * @param {string} userPrompt - The user-provided prompt.
   * @returns {Object|null} - The generated avatar details.
   */
  async generateAvatarDetails(userPrompt) {
    try {
      const maxRetries = 3;
      const baseDelay = 1000;
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          const prompt = `Provide a detailed visual description, an appropriate emoji, and a personality description for a character based on the following prompt

          "${userPrompt}".

          Please respond in the following JSON format. ONLY provide valid JSON as a response.
          If the prompt contains any non-English words, fill out ALL fields in the non-English language.
          Creatively fill in any details without comment, keep all responses to no more than four sentences. 
          {
            "name": "<name the character>",
            "emoji": "<insert an emoji 🤗, (be sure to use proper JSON notation), that best represents the character>",
            "description": "<insert a one paragraph detailed description of the character's profile picture>",
            "personality": "<generate a short unique personality description>"
          }`;
          const response = await this.aiService.chat([
            { role: 'system', content: 'You are a creative and unsettling character designer.' },
            { role: 'user', content: prompt },
          ], { 
            model: this.config.getAIConfig().openrouter.metaModel,
            format: "json" });
          if (!response) {
            throw new Error('Failed to generate avatar details.');
          }
          const avatarDetails = JSON.parse(extractJSON(response.trim()));
          const { name, description, emoji, personality } = avatarDetails;
          if (!name || !description || !personality) {
            throw new Error('Incomplete avatar details received.');
          }
          return { name, description, emoji: emoji || "🤗", personality };
        } catch (error) {
          this.logger.warn(`Avatar generation attempt ${attempt}/${maxRetries} failed: ${error.message}`);
          if (attempt === maxRetries) {
            throw new Error(`Failed to generate avatar after ${maxRetries} attempts: ${error.message}`);
          }
          const delay = baseDelay * Math.pow(2, attempt - 1);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
      return;
    } catch (error) {
      this.logger.error(`Error while generating avatar details: ${error.message}`);
      return null;
    }
  }

  /**
   * Checks if the daily limit for image generation has been reached.
   * @param {string} channelId - The Discord channel ID associated with the avatar.
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
          console.warn(`Image URL inaccessible: ${url} - ${error.message}`);
          resolve(false);
        });
        request.end();
      } catch (error) {
        console.warn(`Invalid URL: ${url} - ${error.message}`);
        resolve(false);
      }
    });
  }

  /**
   * Generates an avatar image using Replicate.
   * @param {string} prompt - The prompt for image generation.
   * @returns {string|null} - The local filename of the generated image.
   */
  async generateAvatarImage(prompt) {
    const trigger = process.env.LORA_TRIGGER_WORD || '';
    const [output] = await this.replicate.run(
      process.env.REPLICATE_MODEL ||
      "immanencer/mirquo:dac6bb69d1a52b01a48302cb155aa9510866c734bfba94aa4c771c0afb49079f",
      {
        input: {
          prompt: `${trigger} ${prompt} ${trigger}`,
          model: "dev",
          lora_scale: 1,
          num_outputs: 1,
          aspect_ratio: "1:1",
          output_format: "png",
          guidance_scale: 3.5,
          output_quality: 90,
          prompt_strength: 0.8,
          extra_lora_scale: 1,
          num_inference_steps: 28,
          disable_safety_checker: true,
        }
      }
    );
    const imageUrl = output.url ? output.url() : [output];
    this.logger.info('Generated image URL: ' + imageUrl.toString());
    const imageBuffer = await this.downloadImage(imageUrl.toString());
    const uuid = `avatar_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const filename = `./images/${uuid}.png`;
    await fs.mkdir('./images', { recursive: true });
    await fs.writeFile(filename, imageBuffer);
    return filename;
  }

  /**
   * Updates an avatar's details.
   * @param {object} avatar - The avatar object to update.
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
      if (typeof avatar._id === 'string') {
        throw new Error('Avatar ID must be an ObjectId.');
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
        this.logger.info(`Avatar ID ${avatar._id} updated successfully.`);
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
   * Downloads an image from a URL.
   * @param {string} url - The URL of the image.
   * @returns {Buffer|null} - The image buffer.
   */
  async downloadImage(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to get '${url}' (${response.status})`);
      }
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      return buffer;
    } catch (error) {
      throw new Error('Error downloading the image: ' + error.message);
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
    let prompt = data.prompt;
    let summoner = data.summoner;
    let systemPrompt;
    try {
      if (this.isArweaveUrl(prompt)) {
        const arweaveData = await this.fetchPrompt(prompt);
        systemPrompt = arweaveData.systemPrompt;
        prompt = arweaveData.prompt || prompt;
      }
      return await this._createAvatarWithPrompt(prompt, data);
    } catch (error) {
      throw new Error(`Avatar creation failed: ${error.message}`);
    }
  }

  async _createAvatarWithPrompt(prompt, data) {
    if (!this.db) {
      this.logger.error('Database is not connected. Cannot create avatar.');
      return null;
    }
    try {
      const underLimit = await this.checkDailyLimit(data.channelId);
      if (!underLimit) {
        this.logger.warn('Daily limit reached. Cannot create more avatars today.');
        return null;
      }
      const avatar = await this.generateAvatarDetails(prompt);
      if (!avatar) {
        this.logger.error('Avatar creation aborted: avatar generation failed.');
        return null;
      }
      if (!avatar.name) {
        avatar.name = `Avatar_${new ObjectId().toHexString()}`;
      }
      const imageFile = await this.generateAvatarImage(avatar.description);
      const s3url = await uploadImage(imageFile);
      this.logger.info('S3 URL: ' + s3url);
      await this.insertRequestIntoMongo(avatar.description, s3url, data.channelId);
      // Include the summoner field here (Discord user ID)
      const avatarDocument = {
        name: avatar.name,
        emoji: avatar.emoji,
        personality: avatar.personality,
        description: avatar.description,
        imageUrl: s3url,
        channelId: data.channelId,
        summoner: data.summoner,  // <-- New field for the user's Discord ID
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lives: 3,
        status: 'alive',
        version: '1.0'
      };
      const schemaValidator = new SchemaValidator();
      const validation = schemaValidator.validateAvatar(avatarDocument);
      if (!validation.valid) {
        this.logger.error('Avatar schema validation failed:', {
          errors: validation.errors,
          document: avatarDocument
        });
        throw new Error(`Avatar schema validation failed: ${JSON.stringify(validation.errors)}`);
      }
      const requiredFields = ['name', 'description', 'personality', 'imageUrl'];
      for (const field of requiredFields) {
        if (!avatarDocument[field] || typeof avatarDocument[field] !== 'string') {
          this.logger.error(`Missing or invalid required field: ${field}`, {
            field,
            value: avatarDocument[field]
          });
          throw new Error(`Missing or invalid required field: ${field}`);
        }
      }
      if (data.arweave_prompt) {
        avatarDocument.arweave_prompt = data.arweave_prompt;
        const syncedPrompt = await this.syncArweavePrompt(avatarDocument);
        if (syncedPrompt) {
          avatarDocument.prompt = syncedPrompt;
        }
      }
      const result = await this.db.collection(this.AVATARS_COLLECTION).insertOne(avatarDocument);
      if (result.acknowledged === true) {
        this.logger.info(`Avatar "${avatar.name} ${avatar.emoji}" created successfully with ID: ${result.insertedId}`);
        return { _id: result.insertedId, ...avatarDocument };
      } else {
        this.logger.error('Failed to insert avatar into the database.');
        return null;
      }
    } catch (error) {
      this.logger.error(`Error during avatar creation: ${error.message}`);
      return null;
    }
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
      const avatar = await this.db.collection(this.AVATARS_COLLECTION).findOne({ _id: avatarId });
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
        { _id: avatarId },
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
      console.error(`Error syncing Arweave prompt: ${error.message}`);
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
   * @param {string} prompt - The prompt to generate avatar details.
   * @param {string} channelId - The Discord channel ID.
   * @returns {Object|null} - The unique avatar document or null if creation failed.
   */
  async getOrCreateUniqueAvatarForUser(summonerId, prompt, channelId) {
    try {
      const collection = this.db.collection(this.AVATARS_COLLECTION);
      const existingAvatar = await collection.findOne({ summoner: summonerId, status: 'alive' });
      if (existingAvatar) {
        this.logger.info(`Unique avatar already exists for summoner ${summonerId}.`);
        return { avatar: existingAvatar, new: false };
      }
      this.logger.info(`No unique avatar found for summoner ${summonerId}, creating new one.`);
      const avatarData = { prompt, summoner: summonerId, channelId };
      const newAvatar = await this.createAvatar(avatarData);
      return { avatar: newAvatar, new: true };
    } catch (error) {
      this.logger.error(`Error in getOrCreateUniqueAvatarForUser: ${error.message}`);
      return null;
    }
  }
}
