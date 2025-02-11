import Fuse from 'fuse.js';
import { OpenRouterService } from '../openrouterService.mjs';
import { uploadImage } from '../s3imageService/s3imageService.mjs';
import { MongoClient, ObjectId } from 'mongodb';
import Replicate from 'replicate';
import fs from 'fs/promises';

const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'openai/gpt-4o';

export class ItemService {
  /**
   * Constructs a new ItemService.
   * @param {Object} discordClient - The Discord client (required).
   * @param {Object} [aiService=null] - Optional AI service (defaults to OpenRouterService if not provided).
   */
  constructor(discordClient, aiService = null) {
    if (!discordClient) {
      throw new Error('Discord client is required for ItemService');
    }
    this.client = discordClient;
    this.aiService = aiService || new OpenRouterService();

    // Fuzzy-search config
    this.fuseOptions = {
      threshold: 0.4,
      keys: ['name']
    };

    // For image generation
    this.replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN
    });

    // Database Setup
    /** @type {import('mongodb').Db|null} */
    this.db = null;
    this.initDatabase().catch((err) =>
      console.error('ItemService DB init failed:', err)
    );
  }

  /**
   * Connects to MongoDB and stores the DB instance.
   */
  async initDatabase() {
    try {
      const mongoUri = process.env.MONGO_URI;
      const mongoDbName = process.env.MONGO_DB_NAME;
      if (!mongoUri || !mongoDbName) {
        throw new Error('MONGO_URI and MONGO_DB_NAME must be set in environment');
      }
      const client = await MongoClient.connect(mongoUri);
      this.db = client.db(mongoDbName);
      console.log(`ItemService connected to MongoDB: ${mongoDbName}`);
    } catch (error) {
      console.error('Failed to connect to MongoDB:', error);
    }
  }

  /**
   * Ensures that the database connection is available.
   * @private
   */
  ensureDbConnection() {
    if (!this.db) {
      throw new Error('Database not connected');
    }
    return this.db;
  }

  /**
   * Downloads an image from a URL and returns its Buffer.
   * @param {string} url - The URL to download the image from.
   * @returns {Promise<Buffer>}
   */
  async downloadImage(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch image from ${url} (status: ${response.status})`);
      }
      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch (error) {
      console.error('Error downloading image:', error);
      throw error;
    }
  }

  /**
   * Generates an image for an item using Replicate and uploads it to S3.
   * @param {string} itemName - The item name used in the prompt.
   * @param {string} description - Additional descriptive text for the prompt.
   * @returns {Promise<string>} - The URL of the uploaded image.
   */
  async generateItemImage(itemName, description) {
    this.ensureDbConnection();

    // Optional trigger word for stylistic influence
    const trigger = process.env.LORA_TRIGGER_WORD || '';

    try {
      // Generate the image using Replicate
      const [output] = await this.replicate.run(
        process.env.REPLICATE_MODEL ||
          'immanencer/mirquo:dac6bb69d1a52b01a48302cb155aa9510866c734bfba94aa4c771c0afb49079f',
        {
          input: {
            prompt: `${trigger} ${itemName} ${trigger} ${description} ${trigger}`,
            model: 'dev',
            lora_scale: 1,
            num_outputs: 1,
            aspect_ratio: '1:1',
            output_format: 'png',
            guidance_scale: 3.5,
            output_quality: 90,
            prompt_strength: 0.8,
            extra_lora_scale: 1,
            num_inference_steps: 28,
            disable_safety_checker: true
          }
        }
      );

      // Retrieve and download the image
      const imageUrl = output.url ? output.url() : [output];
      const finalUrl = imageUrl.toString();
      const imageBuffer = await this.downloadImage(finalUrl);
      const localFilename = `./images/item_${Date.now()}.png`;
      await fs.mkdir('./images', { recursive: true });
      await fs.writeFile(localFilename, imageBuffer);

      // Upload the image to S3 and return the URL
      const uploadedUrl = await uploadImage(localFilename);
      return uploadedUrl;
    } catch (error) {
      console.error('Error generating item image:', error);
      throw error;
    }
  }

  /**
   * Generates a short 2-3 sentence description for an item.
   * @param {string} itemName - The name of the item.
   * @returns {Promise<string>}
   */
  async generateItemDescription(itemName) {
    try {
      const prompt = `
        You are a master storyteller describing a mystical item.
        In 2-3 sentences, detail the unique properties, history, and magical aura of ${itemName}.
      `;
      const response = await this.aiService.chat(
        [
          {
            role: 'system',
            content: 'You are an expert item narrator with a flair for the fantastical.'
          },
          { role: 'user', content: prompt }
        ],
        { model: OPENROUTER_MODEL }
      );
      return response;
    } catch (error) {
      console.error('Error generating item description:', error);
      return `An enigmatic aura surrounds ${itemName}, its secrets known only to the wise.`;
    }
  }

  /**
   * Finds an existing item by fuzzy matching or creates a new one.
   * @param {string} rawItemName - The raw item name provided by the user.
   * @returns {Promise<Object>} - The item object { id, name, description, imageUrl }.
   */
  async findOrCreateItem(rawItemName) {
    try {
      this.ensureDbConnection();

      // Use AI to refine the item name
      let cleanItemName = await this.aiService.chat(
        [
          { role: 'system', content: 'You are an expert editor.' },
          {
            role: 'user',
            content: `The adventurer seeks this item: "${rawItemName}". Return ONLY a single refined item name, less than 80 characters, suitable for a fantasy setting.`
          }
        ],
        { model: OPENROUTER_MODEL }
      );

      if (!cleanItemName) {
        cleanItemName = rawItemName.slice(0, 80);
      } else {
        cleanItemName = cleanItemName.trim().slice(0, 80);
      }

      // Retrieve all items from the database for fuzzy matching
      const db = this.ensureDbConnection();
      const items = await db.collection('items').find({}).toArray();
      const fuse = new Fuse(items, this.fuseOptions);
      const [bestMatch] = fuse.search(cleanItemName, { limit: 1 });
      if (bestMatch && bestMatch.item) {
        return bestMatch.item;
      }

      // Generate the description and image for the new item
      const itemDescription = await this.generateItemDescription(cleanItemName);
      const itemImage = await this.generateItemImage(cleanItemName, itemDescription);

      // Save the new item record in the database
      const newItem = {
        name: cleanItemName,
        description: itemDescription,
        imageUrl: itemImage,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const result = await db.collection('items').insertOne(newItem);
      newItem.id = result.insertedId.toString();
      return newItem;
    } catch (error) {
      console.error('Error in findOrCreateItem:', error);
      throw error;
    }
  }

  /**
   * Assigns an item to an avatar's inventory.
   * @param {string} avatarId - The ID of the avatar.
   * @param {Object} item - The item object.
   * @returns {Promise<void>}
   */
  async assignItemToAvatar(avatarId, item) {
    try {
      this.ensureDbConnection();
      const db = this.db;
      await db.collection('avatars').updateOne(
        { _id: new ObjectId(avatarId) },
        { $addToSet: { inventory: item } }
      );
    } catch (error) {
      console.error('Error assigning item to avatar:', error);
      throw error;
    }
  }
}
