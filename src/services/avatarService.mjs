// services/avatar_generation_service.mjs

import { SchemaValidator } from './utils/schemaValidator.mjs';
import Replicate from 'replicate';
// import { OllamaService as AIService } from './ollamaService.mjs';
import { OpenRouterService as AIService } from './openrouterService.mjs';

import process from 'process';
import winston from 'winston';
import { extractJSON } from './utils.mjs';

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
      const avatars = await this.avatarsCollection.find({
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
      logger.warn('Invalid input to extractMentionedAvatars', {
        content,
        avatarsLength: avatars?.length,
      });
      return mentionedAvatars;
    }

    for (const avatar of avatars) {
      try {
        // Validate avatar object
        if (!avatar || typeof avatar !== 'object') {
          logger.error('Invalid avatar object:', avatar);
          continue;
        }

        // Ensure required fields exist
        if (!avatar._id || !avatar.name) {
          logger.error('Avatar missing required fields:', {
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
      const avatars = await this.avatarsCollection.find({
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
      const db = this.db;

      // Find most recent avatar where this ID is in parents array
      const lastOffspring = await db.collection('avatars')
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
      // get 1000 most recent messages
      const collection = this.db.collection('messages');
      // get the authorUsername ranked by count
      const pipeline = [
        {
          $match: {
            authorId: process.env.DISCORD_BOT_ID ? process.env.DISCORD_BOT_ID : { $exists: true }
          }
        },
        {
          $group: {
            _id: '$authorUsername',  // Assuming you want to group by author's username
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
      // get the top 10 authors 
      const topAuthors = messages.map(mention => mention._id).slice(0, 100);
      // get the avatars of the top 10 authors
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
        name: { $regex: new RegExp(`^${name}$`, 'i') } // Case-insensitive exact match
      };

      // Only include alive avatars by default
      if (includeStatus === 'alive') {
        query.status = { $ne: 'dead' };
      }

      return await collection.findOne(query);

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
        name: { $exists: true },
        name: { $ne: null },
      };

      // Only include alive avatars by default
      if (includeStatus === 'alive') {
        query.status = { $ne: 'dead' };
      }

      const avatars = await collection.find(query).toArray();

      return avatars.map(avatar => ({
        ...avatar
      }));

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

      return avatars.map(avatar => ({
        ...avatar,
      }));
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
   * 
   **/
  async getAvatarById(id) {
    const collection = this.db.collection(this.AVATARS_COLLECTION);
    const avatar = await collection
      .findOne({ _id: id });

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
        const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
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
   * Generates an avatar description using Ollama.
   * @param {string} name - The name of the avatar.
   * @param {string} emoji - The emoji representing the avatar.
   * @param {string} traits - Traits describing the avatar.
   * @returns {string|null} - The generated description or null if failed.
   */
  async generateAvatarDetails(userPrompt) {
    try {
      const maxRetries = 3;
      const baseDelay = 1000; // Start with 1 second delay

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
            "description": "<insert a one paragraph detailed description of the characters profile picture>",
            "personality": "<generate a short unique personality description>'}"
          }`;

          const response = await this.aiService.chat([
            { role: 'system', content: 'You are a creative and unsettling character designer.' },
            { role: 'user', content: prompt },
          ], { format: "json" });

          // Check if the response is valid
          if (!response) {
            throw new Error('Failed to generate avatar details.');
          }
          const avatarDetails = JSON.parse(extractJSON(response.trim()));

          // Destructure the necessary fields from the parsed JSON
          const { name, description, emoji, personality } = avatarDetails;

          // Validate that all required fields are present
          if (!name || !description || !personality) {
            throw new Error('Incomplete avatar details received.');
          }

          // Return the structured avatar details
          return { name, description, emoji: emoji || "🤗", personality };
        } catch (error) {
          this.logger.warn(`Avatar generation attempt ${attempt}/${maxRetries} failed: ${error.message}`);

          if (attempt === maxRetries) {
            throw new Error(`Failed to generate avatar after ${maxRetries} attempts: ${error.message}`);
          }

          // Exponential backoff: 1s, 2s, 4s
          const delay = baseDelay * Math.pow(2, attempt - 1);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }

      return
    } catch (error) {
      // Log any unexpected errors
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
      today.setHours(0, 0, 0, 0); // Start of the day

      const count = await collection.countDocuments({
        channelId,
        date: { $gte: today },
      });

      this.logger.info(`Daily request count for channel ${channelId}: ${count}`);
      return count < 100; // Set your daily limit here
    } catch (error) {
      this.logger.error(`Error checking daily limit: ${error.message}`);
      return false;
    }
  }

  /**
   * Inserts a new request record into MongoDB.
   * @param {string} prompt - The prompt used for image generation.
   * @param {string} imageUrl - The URL of the image.
   * @param {string} channelId - The Discord channel ID associated with the avatar.
   */
  async insertRequestIntoMongo(prompt, imageUrl, channelId) {
    try {
      const collection = this.db.collection(this.IMAGE_URL_COLLECTION);
      const now = new Date();

      const record = {
        prompt,
        imageUrl: imageUrl,
        channelId,
        date: now,
      };

      const result = await collection.insertOne(record);
      this.logger.info('Record inserted into MongoDB successfully.');
    } catch (error) {
      this.logger.error(`Error inserting into MongoDB: ${error.message}`);
    }
  }

  /**
   * Checks if an image URL is accessible.
   * @param {string} url - The URL of the image to check.
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
   * Generates an avatar image using Replicate with polling.
   * @param {string} prompt - The prompt for image generation.
   * @returns {string|null} - The URL of the generated image or null if failed.
   */
  async generateAvatarImage(prompt) {
    const trigger = process.env.LORA_TRIGGER_WORD || '';
    // Step 1: Initiate the image generation request using Replicate API
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
    // Get the temporary URL from Replicate

    const imageUrl = output.url ? output.url() : [output];

    console.log('Generated image URL:', imageUrl.toString());
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
 **/
  async updateAvatar(avatar) {
    if (!this.db) {
      this.logger.error('Database is not connected. Cannot update avatar.');
      return null;
    }

    try {
      // Sync Arweave prompt if it exists
      if (avatar.arweave_prompt) {
        await this.syncArweavePrompt(avatar);
      }

      if (typeof avatar._id === 'string') {
        throw new Error('Avatar ID must be an ObjectId.');
      }

      // Prepare the update document
      const updateDoc = {
        $set: {
          ...avatar,
          updatedAt: new Date(),
        },
      };

      // Update the avatar in the 'avatars' collection
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
        this.logger.info(JSON.stringify({
          name: avatar.name,
          description: avatar.description,
          personality: avatar.personality,
          emoji: avatar.emoji,
          _id: avatar._id,
          keys: Object.keys(avatar),
        }));
        // Fetch the updated document correctly using ObjectId
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
   * Downloads an image from a given URL and returns it as a buffer.
   * @param {string} url - The URL of the image to download.
   * @returns {Buffer|null} - The image buffer or null if failed.
   */
  // Function to download image
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
   * Creates a new avatar by generating its description and image, then saving it to the database.
   * @param {Object} avatarData - The data for the new avatar.
   * @param {string} avatarData.name - The name of the avatar.
   * @param {string} avatarData.emoji - The emoji representing the avatar.
   * @param {string} [avatarData.personality='kind and wise'] - Traits describing the avatar.
   * @param {string} [avatarData.channelId] - The Discord channel ID associated with the avatar.
   * @returns {Object|null} - The created avatar document or null if creation failed.
   */
  async createAvatar(data) {
    let prompt = data.prompt;
    let systemPrompt;

    try {
      if (this.isArweaveUrl(prompt)) {
        // Load prompt from Arweave
        const arweaveData = await this.fetchPrompt(prompt);
        systemPrompt = arweaveData.systemPrompt;
        prompt = arweaveData.prompt || prompt;
      }

      // Proceed with avatar creation using either Arweave data or original prompt
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
      // Step 1: Check Daily Limit
      const underLimit = await this.checkDailyLimit(data.channelId);
      if (!underLimit) {
        this.logger.warn('Daily limit reached. Cannot create more avatars today.');
        return null;
      }

      // Step 2: Generate Avatar Description
      const avatar = await this.generateAvatarDetails(prompt);
      if (!avatar) {
        this.logger.error('Avatar creation aborted: avatar generation failed.');
        return null;
      }

      // Ensure the name is set; default if not provided
      if (!avatar.name) {
        avatar.name = `Avatar_${new ObjectId().toHexString()}`;
      }

      // Step 4: Download the Image as Buffer
      const imageFile = await this.generateAvatarImage(avatar.description);

      // Step 5: Upload the Image to S3
      const s3url = await uploadImage(imageFile);
      console.log('S3 URL:', s3url);

      // Step 6: Insert the Prompt and Result into MongoDB
      await this.insertRequestIntoMongo(avatar.description, s3url, data.channelId);

      // Step 7: Create Avatar Document
      const avatarDocument = {
        name: avatar.name,
        emoji: avatar.emoji,
        personality: avatar.personality,
        description: avatar.description,
        imageUrl: s3url,
        channelId: data.channelId,
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
      
      // Ensure required fields are present and have correct types
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

      // Check for Arweave prompt before generating
      if (data.arweave_prompt) {
        avatarDocument.arweave_prompt = data.arweave_prompt;
        const syncedPrompt = await this.syncArweavePrompt(avatarDocument);
        if (syncedPrompt) {
          avatarDocument.prompt = syncedPrompt;
        }
      }

      // Step 8: Insert Avatar into the 'avatars' Collection
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
   * @param {string} avatarId - The ID of the avatar to check and regenerate.
   * @returns {boolean} - True if regeneration was successful, false otherwise.
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

      // Step 1: Check if the current image URL is accessible
      const isAccessible = await this.isImageAccessible(avatar.imageUrl);
      if (isAccessible) {
        this.logger.info(`Avatar image for ID ${avatarId} is accessible. No regeneration needed.`);
        return true;
      }

      this.logger.warn(`Avatar image for ID ${avatarId} is defunct. Regenerating...`);

      // Step 3: Download the new image
      const imageFile = await this.generateAvatarImage(avatar.description)
      if (!imageFile) {
        this.logger.error('Regeneration aborted: Image download failed.');
        return false;
      }

      const s3Url = await uploadImage(imageFile);

      // Step 5: Update the avatar document with the new image URL
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

      // Update the avatar's prompt
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
}
