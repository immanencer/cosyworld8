// services/avatar_generation_service.mjs
import { SchemaValidator } from './utils/schemaValidator.mjs';

// Fallback validator in case the import fails
class FallbackValidator {
  validateAvatar(avatar) {
    // Basic validation
    const requiredFields = ['name', 'description', 'personality', 'imageUrl'];
    const errors = [];
    
    for (const field of requiredFields) {
      if (!avatar[field] || typeof avatar[field] !== 'string') {
        errors.push(`Missing or invalid required field: ${field}`);
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
}
import Replicate from 'replicate';
import { AIService } from "./aiService.mjs";
import process from 'process';
import winston from 'winston';

import Fuse from 'fuse.js';
import { uploadImage } from './s3imageService/s3imageService.mjs';
import { ObjectId } from 'mongodb';
import fs from 'fs/promises';
import fetch from 'node-fetch';

export class AvatarGenerationService {
  constructor(db, config) {
    this.config = config;
    this.aiService = new AIService();
    this.db = db;
    this.logger = this.initializeLogger();

    try {
      const aiConfig = this.config.getAIConfig();
      this.replicate = this.initializeReplicate(aiConfig);

      const mongoConfig = this.config.getMongoConfig();
      this.IMAGE_URL_COLLECTION = mongoConfig?.collections?.imageUrls || 'image_urls';
      this.AVATARS_COLLECTION = mongoConfig?.collections?.avatars || 'avatars';
    } catch (error) {
      this.logger.error(`Error initializing services: ${error.message}`);
      this.replicate = null;
      this.IMAGE_URL_COLLECTION = 'image_urls';
      this.AVATARS_COLLECTION = 'avatars';
    }

    this.prompts = null;
    this.avatarCache = [];
  }

  initializeLogger() {
    const logger = winston.createLogger({
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
    return logger;
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
        this.logger.error(`Error processing avatar in extractMentionedAvatars: ${error.message}`, {
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
        { $limit: 1000 }
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

      if (results.length > 0) {
        return results[0].item;
      }

      return null;
    } catch (error) {
      this.logger.error(`Error fetching avatar by name: ${error.message}`);
      return null;
    }
  }

  async getAllAvatars(includeStatus = 'alive') {
    try {
      const collection = this.db.collection(this.AVATARS_COLLECTION);
      const query = { name: { $exists: true, $ne: null } };
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
  async generateAvatarDetails(userPrompt, guildId = null, retries = 3) {
    try {
      if (!userPrompt || typeof userPrompt !== 'string' || userPrompt.trim().length === 0) {
        throw new Error('Invalid or empty prompt provided');
      }

      // Enhanced prompt for diversity
      const prompt = `Generate a unique and creative character for a role-playing game based directly on this description: "${userPrompt}". 
      Think of something unexpected and distinct from typical archetypes. 
      Create an avatar with a detailed personality, appearance, special ability, and an appropriate emoji.
      Respond with a JSON object containing name, description, personality, and emoji fields.
      Example format:
      {
        "name": "Character Name",
        "description": "Detailed physical description of the character",
        "personality": "Description of the character's personality traits and background",
        "emoji": "🔮"
      }`;

      // Fetch guild-specific system prompt if guildId is provided
      let systemPrompt = null;
      if (guildId) {
        try {
          const guildPrompts = await this.config.getGuildPrompts(this.db, guildId);
          systemPrompt = guildPrompts.summon;
        } catch (error) {
          this.logger.error(`Failed to fetch guild prompts for guild ${guildId}: ${error.message}`);
        }
      }

      const responseSchema = {
        type: "OBJECT",
        properties: {
          name: { type: "STRING", description: "The character's name" },
          description: { type: "STRING", description: "A detailed physical description of the character" },
          personality: { type: "STRING", description: "A description of the character's personality, traits, and background" },
          emoji: { type: "STRING", description: "A single emoji that represents the character" }
        },
        required: ["name", "description", "personality"]
      };

      const aiResponse = await this.aiService.chat(
        [{ role: 'system', content: systemPrompt },
         { role: 'user', content: prompt }],
        {
          model: process.env.META_PROMPT_MODEL,
          maxOutputTokens: 2048,
          temperature: 1.0,
          topP: 0.95,
          topK: 40,
          responseSchema: responseSchema
        }
      );

      console.log(aiResponse);

      try {
        let responseJson;
        if (typeof aiResponse === 'object' && aiResponse !== null) {
          if (aiResponse.name && aiResponse.description && aiResponse.personality) {
            responseJson = aiResponse;
            this.logger.info(`Successfully received structured JSON response`);
          } else if (aiResponse.text || aiResponse.response) {
            const responseText = aiResponse.text || aiResponse.response;
            try {
              responseJson = JSON.parse(responseText);
              this.logger.info(`Successfully parsed JSON from response text`);
            } catch (e) {
              const jsonMatch = responseText.match(/\{[\s\S]*\}/);
              if (jsonMatch) {
                responseJson = JSON.parse(jsonMatch[0]);
                this.logger.info(`Successfully extracted JSON from response text`);
              } else {
                throw new Error('Extracted string is not valid JSON.');
              }
            }
          } else {
            throw new Error('Structured response missing expected fields');
          }
        } else if (typeof aiResponse === 'string') {
          this.logger.info(`Received string response, attempting to extract JSON`);
          const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            responseJson = JSON.parse(jsonMatch[0]);
            this.logger.info(`Successfully extracted JSON from string response`);
          } else {
            throw new Error('Extracted string is not valid JSON.');
          }
        } else {
          throw new Error('Unexpected response type from AI service');
        }

        if (!responseJson.name || !responseJson.description || !responseJson.personality) {
          throw new Error('Required avatar fields are missing from AI response.');
        }

        if (!responseJson.emoji) {
          responseJson.emoji = "🧙";
        }

        return responseJson;
      } catch (error) {
        this.logger.warn(`Avatar generation attempt ${4 - retries}/3 failed: ${error.message}`);
        if (retries > 1) {
          this.logger.info(`Retrying avatar generation, ${retries - 1} attempts remaining`);
          return this.generateAvatarDetails(userPrompt, guildId, retries - 1);
        }
        throw new Error('Failed to generate avatar after 3 attempts: ' + error.message);
      }
    } catch (error) {
      this.logger.error(`Error while generating avatar details: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generates an avatar image using Replicate.
   * @param {string} prompt - The prompt for image generation.
   * @returns {string|null} - The local filename of the generated image.
   */
  async generateAvatarImage(prompt) {
    if (!this.replicate) {
      this.logger.error('Replicate service not available. Cannot generate avatar image.');
      return null;
    }

    try {
      const aiConfig = this.config.getAIConfig() || {};
      const replicateConfig = aiConfig.replicate || {};
      const trigger = replicateConfig.loraTriggerWord || '';
      const model = replicateConfig.model;
      const style = replicateConfig.style;

      if (!model) {
        this.logger.error('Replicate model not configured');
        return null;
      }

      const [output] = await this.replicate.run(
        model,
        {
          input: {
            prompt: `${trigger} ${prompt} ${trigger}\n\n${style}`,
            "go_fast": true,
            "guidance": 3,
            "lora_scale": 1,
            "megapixels": "1",
            "num_outputs": 1,
            "aspect_ratio": "1:1",
            "lora_weights": replicateConfig.lora_weights,
            "output_format": "webp",
            "output_quality": 80,
            "prompt_strength": 0.8,
            "num_inference_steps": 28
          }
        }
      );

      let imageUrl;
      if (output && typeof output === 'object' && output.url) {
        imageUrl = output.url();
      } else if (typeof output === 'string') {
        imageUrl = output;
      } else if (Array.isArray(output) && output.length > 0) {
        imageUrl = output[0];
      } else {
        this.logger.error('No valid output generated from Replicate');
        return null;
      }

      this.logger.info('Generated image URL: ' + imageUrl.toString());
      const imageBuffer = await this.downloadImage(imageUrl.toString());
      const uuid = `avatar_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      const filename = `./images/${uuid}.png`;
      await fs.mkdir('./images', { recursive: true });
      await fs.writeFile(filename, imageBuffer);
      return filename;
    } catch (error) {
      this.logger.error(`Error generating avatar image: ${error.message}`);
      return null;
    }
  }

  /**
   * Downloads an image from a URL.
   * @param {string} url - The URL of the image.
   * @returns {Buffer} - The image buffer.
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
   * Creates a new avatar by generating its details and image, then saving it.
   * @param {Object} data - Data for the new avatar.
   * @param {string} data.prompt - The prompt for generating avatar details.
   * @param {string} [data.summoner] - The Discord user ID of the summoner.
   * @param {string} [data.channelId] - The Discord channel ID.
   * @returns {Object|null} - The created avatar document.
   */
  async createAvatar(data) {
    let prompt = data.prompt;
    let guildId = null;

    // Fetch guild ID from channel ID if available
    if (data.channelId && this.config.client) {
      try {
        const channel = await this.config.client.channels.fetch(data.channelId);
        guildId = channel.guild.id;
      } catch (error) {
        this.logger.error(`Failed to fetch guild ID for channel ${data.channelId}: ${error.message}`);
      }
    }

    try {
      this.logger.info(`Creating avatar with prompt: ${prompt && prompt.substring(0, 100)}...`);
      
      if (this.isArweaveUrl(prompt)) {
        try {
          const arweaveData = await this.fetchPrompt(prompt);
          prompt = arweaveData.prompt || prompt;
          this.logger.info(`Fetched Arweave prompt: ${prompt && prompt.substring(0, 100)}...`);
        } catch (arweaveError) {
          this.logger.error(`Failed to fetch Arweave prompt: ${arweaveError.message}`);
          // Continue with original prompt if Arweave fetch fails
        }
      }
      
      const avatar = await this._createAvatarWithPrompt(prompt, data, guildId);
      if (!avatar) {
        this.logger.error(`_createAvatarWithPrompt returned null for prompt: ${prompt && prompt.substring(0, 100)}...`);
      }
      return avatar;
    } catch (error) {
      this.logger.error(`Avatar creation failed: ${error.message}`);
      this.logger.error(`Avatar creation stack trace: ${error.stack}`);
      throw new Error(`Avatar creation failed: ${error.message}`);
    }
  }

  async _createAvatarWithPrompt(prompt, data, guildId) {
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

      // Generate avatar details with improved error handling
      let avatar;
      try {
        avatar = await this.generateAvatarDetails(prompt, guildId);
        if (!avatar) {
          this.logger.error('Avatar generation failed to return a valid response');
          return null;
        }
      } catch (genError) {
        this.logger.error(`Error generating avatar details: ${genError.message}`);
        this.logger.error(`Generation error stack: ${genError.stack}`);
        return null;
      }

      if (!avatar.name) {
        this.logger.error('Avatar creation aborted: avatar name is missing.');
        this.logger.debug(`Avatar data received: ${JSON.stringify(avatar)}`);
        return null;
      }

      this.logger.info(`Generated avatar: ${JSON.stringify(avatar, null, 2)}`);

      // Check if the name matches an existing avatar
      const existingAvatar = await this.db.collection(this.AVATARS_COLLECTION).findOne({ name: avatar.name });
      if (existingAvatar) {
        this.logger.warn(`Avatar creation aborted: name '${avatar.name}' already exists.`);
        return existingAvatar;
      }

      // Generate avatar image with improved error handling
      let imageFile;
      let s3url;
      try {
        imageFile = await this.generateAvatarImage(avatar.description);
        if (!imageFile) {
          this.logger.error('Avatar image generation failed');
          return null;
        }
        
        s3url = await uploadImage(imageFile);
        if (!s3url) {
          this.logger.error('Failed to upload avatar image to S3');
          return null;
        }
        
        this.logger.info('S3 URL: ' + s3url);
      } catch (imageError) {
        this.logger.error(`Error generating/uploading avatar image: ${imageError.message}`);
        this.logger.error(`Image error stack: ${imageError.stack}`);
        return null;
      }

      try {
        await this.insertRequestIntoMongo(avatar.description, s3url, data.channelId);
      } catch (mongoError) {
        this.logger.error(`Failed to record image request in MongoDB: ${mongoError.message}`);
        // Continue even if request tracking fails
      }

      const avatarDocument = {
        name: avatar.name,
        emoji: avatar.emoji || "👤", // Default emoji if none provided
        personality: avatar.personality,
        description: avatar.description,
        imageUrl: s3url,
        channelId: data.channelId,
        summoner: data.summoner,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lives: 3,
        status: 'alive',
        version: '1.0'
      };

      // Validate avatar schema with try-catch and fallback
      try {
        let schemaValidator;
        try {
          schemaValidator = new SchemaValidator();
        } catch (schemaError) {
          this.logger.warn(`SchemaValidator not available: ${schemaError.message}. Using fallback validator.`);
          schemaValidator = new FallbackValidator();
        }
        
        const validation = schemaValidator.validateAvatar(avatarDocument);
        if (!validation.valid) {
          this.logger.error('Avatar schema validation failed:', {
            errors: validation.errors,
            document: avatarDocument
          });
          throw new Error(`Avatar schema validation failed: ${JSON.stringify(validation.errors)}`);
        }
      } catch (validationError) {
        this.logger.error(`Validation error: ${validationError.message}`);
        
        // Perform basic validation instead of failing
        const requiredFields = ['name', 'description', 'personality', 'imageUrl'];
        const missingFields = requiredFields.filter(field => 
          !avatarDocument[field] || typeof avatarDocument[field] !== 'string'
        );
        
        if (missingFields.length > 0) {
          this.logger.error(`Missing required fields: ${missingFields.join(', ')}`);
          return null;
        }
        
        // Continue if basic validation passes
        this.logger.info('Basic validation passed, continuing with avatar creation');
      }

      // Check required fields
      const requiredFields = ['name', 'description', 'personality', 'imageUrl'];
      for (const field of requiredFields) {
        if (!avatarDocument[field] || typeof avatarDocument[field] !== 'string') {
          this.logger.error(`Missing or invalid required field: ${field}`, {
            field,
            value: avatarDocument[field]
          });
          return null;
        }
      }

      // Handle Arweave prompts
      if (data.arweave_prompt) {
        avatarDocument.arweave_prompt = data.arweave_prompt;
        try {
          const syncedPrompt = await this.syncArweavePrompt(avatarDocument);
          if (syncedPrompt) {
            avatarDocument.prompt = syncedPrompt;
          }
        } catch (arweaveError) {
          this.logger.error(`Failed to sync Arweave prompt: ${arweaveError.message}`);
          // Continue even if Arweave sync fails
        }
      }

      // Insert avatar document into MongoDB
      try {
        const result = await this.db.collection(this.AVATARS_COLLECTION).insertOne(avatarDocument);
        if (result.acknowledged === true) {
          this.logger.info(`Avatar "${avatar.name} ${avatar.emoji}" created successfully with ID: ${result.insertedId}`);
          
          // Create a complete avatar object with the new ID
          const newAvatar = { 
            _id: result.insertedId, 
            ...avatarDocument 
          };
          
          // Validate the avatar object before returning
          if (!newAvatar._id || !newAvatar.name) {
            this.logger.error(`Created avatar is missing required fields: ${JSON.stringify(newAvatar)}`);
            // Try to retrieve the full document from the database
            const retrievedAvatar = await this.getAvatarById(result.insertedId);
            if (retrievedAvatar && retrievedAvatar._id && retrievedAvatar.name) {
              this.logger.info(`Retrieved complete avatar from database`);
              return retrievedAvatar;
            }
            this.logger.error(`Could not retrieve valid avatar, this is a critical error`);
          }
          
          return newAvatar;
        } else {
          this.logger.error('Failed to insert avatar into the database.');
          return null;
        }
      } catch (dbError) {
        this.logger.error(`Database error during avatar creation: ${dbError.message}`);
        this.logger.error(`Database error stack: ${dbError.stack}`);
        return null;
      }
    } catch (error) {
      this.logger.error(`Error during avatar creation: ${error.message}`);
      this.logger.error(`Error stack: ${error.stack}`);
      return null;
    }
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

  /**
   * Gets or summons a user's avatar to the current channel.
   * If the user doesn't have an avatar, it will create one.
   * If the avatar is not in the current channel, it will move it there.
   * 
   * @param {Object} message - Discord message object
   * @param {Object} services - Services object containing required services
   * @param {string} [customPrompt] - Optional custom prompt to use for avatar creation
   * @returns {Promise<Object>} The avatar object
   */
  async summonUserAvatar(message, services, customPrompt = null) {
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
        await services.dungeonService.updateAvatarPosition(userAvatar._id, channelId, userAvatar.channelId);
        userAvatar = await this.getAvatarById(userAvatar._id);
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
}