// itemService.mjs

import fs from 'fs/promises';
import Replicate from 'replicate';
import { uploadImage } from '../s3imageService/s3imageService.mjs';

export class ItemService {
  /**
   * Constructs a new ItemService.
   * @param {Object} client - The Discord client.
   * @param {Object} aiService - The AI service for LLM calls.
   * @param {import('mongodb').Db} db - The MongoDB database instance.
   * @param {Object} [options={}] - Optional configuration settings.
   * @param {number} [options.itemCreationLimit=1] - Maximum number of new items allowed per day globally.
   */
  constructor(client, aiService, db, options = {}) {
    if (!db) {
      throw new Error('MongoDB database instance is required for ItemService');
    }
    this.client = client;
    this.aiService = aiService;
    this.db = db;
    // Set the item creation limit (default is 8 per day globally)
    this.itemCreationLimit = options.itemCreationLimit ?? 8;
    // Instantiate Replicate for image generation
    this.replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN
    });
  }

  /**
   * Ensures that the DB connection exists.
   * @private
   */
  ensureDbConnection() {
    if (!this.db) {
      throw new Error('Database not connected');
    }
    return this.db;
  }

  /**
   * Removes all quotation marks (single and double) from a given string.
   * @param {string} name - The string from which to remove quotation marks.
   * @returns {string} The cleaned string.
   */
  cleanItemName(name) {
    return name.replace(/['"]/g, '');
  }

  /**
   * Downloads an image from a URL and returns a Buffer.
   * @param {string} url - The URL to download from.
   * @returns {Promise<Buffer>}
   */
  async downloadImage(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to download image from ${url} (status: ${response.status})`);
      }
      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch (error) {
      console.error('Error downloading the image:', error);
      throw error;
    }
  }

  /**
   * Generates an image for an item using Replicate and uploads it to S3.
   * The prompt is built using the item name, a generated description, and an optional trigger word.
   * @param {string} itemName - The (refined) item name used in the prompt.
   * @param {string} description - Descriptive text for the prompt.
   * @returns {Promise<string>} - The uploaded image URL.
   */
  async generateItemImage(itemName, description) {
    this.ensureDbConnection();
    const trigger = process.env.LORA_TRIGGER_WORD || '';

    try {
      // Use Replicate to generate an image for the item.
      // We use an aspect ratio of 1:1 to suit typical item icon dimensions.
      const [output] = await this.replicate.run(
        process.env.REPLICATE_ITEM_MODEL ||
        'immanencer/mirquo:dac6bb69d1a52b01a48302cb155aa9510866c734bfba94aa4c771c0afb49079f',
        {
          input: {
            prompt: `${trigger} ${itemName} ${trigger} ${description} ${trigger}`,
            model: 'dev',
            lora_scale: 1,
            num_outputs: 1,
            aspect_ratio: '1:1', // Square image for items
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

      // Extract the image URL from the replicate output.
      const imageUrl = output.url ? output.url() : [output];
      const finalUrl = imageUrl.toString();

      // Download the image locally.
      const imageBuffer = await this.downloadImage(finalUrl);
      const localFilename = `./images/item_${Date.now()}.png`;
      await fs.mkdir('./images', { recursive: true });
      await fs.writeFile(localFilename, imageBuffer);

      // Upload the image to S3 and return the URL.
      const uploadedUrl = await uploadImage(localFilename);
      return uploadedUrl;
    } catch (error) {
      console.error('Error generating item image:', error);
      throw error;
    }
  }

  /**
   * Finds an existing item by name or creates a new one if not found.
   * Creation is limited to a configurable number of new items per day globally.
   * This method now uses the LLM (via aiService) to refine the item name and generate a descriptive, evocative description.
   * @param {string} itemName - The name of the item as provided by the user.
   * @param {string} locationId - The current location (channel ID) where the item is being acquired.
   * @returns {Promise<Object|null>} The item object or null if the creation limit is reached.
   */
  async findOrCreateItem(itemName, locationId) {
    // Use the lowercase version of the original item name as the key.
    const key = itemName.toLowerCase();
    const itemsCollection = this.db.collection('items');

    // Check if an item with that key already exists.
    let item = await itemsCollection.findOne({ key });
    if (item) {
      return item;
    }

    // Enforce creation limit: allow only a limited number of new items per day globally.
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const itemsCreatedToday = await itemsCollection.countDocuments({
      createdAt: { $gte: startOfToday }
    });
    if (itemsCreatedToday >= this.itemCreationLimit) {
      // The creation limit for today has been reached.
      return null;
    }

    // --- Use the LLM to refine the item name ---
    let refinedItemName;
    try {
      const namePrompt = `Refine the following item name to be more evocative and fitting for a mystical fantasy dungeon: "${itemName}". Return ONLY the refined name, with a maximum of 50 characters.`;
      refinedItemName = await this.aiService.chat([
        { role: 'system', content: 'You are a creative fantasy item naming expert.' },
        { role: 'user', content: namePrompt }
      ]);
      refinedItemName = refinedItemName.trim().slice(0, 50);
      if (!refinedItemName) {
        refinedItemName = itemName;
      }
    } catch (error) {
      console.error('Error refining item name:', error);
      refinedItemName = itemName;
    }

    // Clean the refined name by removing quotation marks.
    refinedItemName = this.cleanItemName(refinedItemName);

    // --- Use the LLM to generate a captivating description ---
    let description;
    try {
      const descriptionPrompt = `Provide a captivating and mysterious description for an item named "${refinedItemName}". Describe its magical properties and ancient origins in 2-3 sentences.`;
      description = await this.aiService.chat([
        { role: 'system', content: 'You are an imaginative storyteller in a fantasy setting.' },
        { role: 'user', content: descriptionPrompt }
      ]);
      description = description.trim();
      if (!description) {
        description = `A mysterious ${refinedItemName} imbued with ancient magic.`;
      }
    } catch (error) {
      console.error('Error generating item description:', error);
      description = `A mysterious ${refinedItemName} imbued with ancient magic.`;
    }

    // Generate the item image using the refined name and generated description.
    const imageUrl = await this.generateItemImage(refinedItemName, description);

    // Create the new item document.
    const newItem = {
      key: refinedItemName.toLowerCase(),
      name: refinedItemName,
      description,
      imageUrl,
      createdAt: now,
      updatedAt: now,
      owner: null,          // Not yet assigned to any avatar.
      locationId: locationId // Initially, the item is at the given location.
    };

    const result = await itemsCollection.insertOne(newItem);
    if (result.insertedId) {
      newItem._id = result.insertedId;
      return newItem;
    }
    return null;
  }

  /**
   * Assigns an item to an avatar by updating its document in the database.
   * @param {string} avatarId - The avatar’s ID.
   * @param {Object} item - The item object.
   * @returns {Promise<boolean>} True if the assignment was successful.
   */
  async assignItemToAvatar(avatarId, item) {
    const itemsCollection = this.db.collection('items');
    const now = new Date();
    const result = await itemsCollection.updateOne(
      { _id: item._id },
      { $set: { owner: avatarId, locationId: null, updatedAt: now } }
    );
    return result.modifiedCount > 0;
  }

  /**
   * Drops an item from an avatar into the current location.
   * Updates the database to mark the item as unassigned and associated with a location.
   * @param {Object} avatar - The avatar object.
   * @param {Object} item - The item object.
   * @param {string} locationId - The channel/location ID where the item is dropped.
   * @returns {Promise<boolean>} True if the drop was successful.
   */
  async dropItem(avatar, item, locationId) {
    const itemsCollection = this.db.collection('items');
    const now = new Date();
    const result = await itemsCollection.updateOne(
      { _id: item._id },
      { $set: { owner: null, locationId, updatedAt: now } }
    );
    return result.modifiedCount > 0;
  }

  /**
   * Allows an avatar to take an item from the ground.
   * Searches for an unowned item in the given location matching the provided name.
   * @param {Object} avatar - The avatar object.
   * @param {string} itemName - The name of the item to take.
   * @param {string} locationId - The channel/location ID.
   * @returns {Promise<Object|null>} The item object if found and assigned; otherwise, null.
   */
  async takeItem(avatar, itemName, locationId) {
    const itemsCollection = this.db.collection('items');
    const key = itemName.toLowerCase();

    // Find an unowned item at the location.
    const item = await itemsCollection.findOne({ key, locationId, owner: null });
    if (!item) {
      return null;
    }
    // Assign the item to the avatar.
    const success = await this.assignItemToAvatar(avatar._id, item);
    if (success) {
      // Return the updated item.
      return await itemsCollection.findOne({ _id: item._id });
    }
    return null;
  }

  /**
   * Uses an item by triggering an AI call that makes the item "speak" in the current channel.
   * @param {Object} avatar - The avatar using the item.
   * @param {Object} item - The item object.
   * @param {string} channelId - The channel ID where the action occurs.
   * @returns {Promise<string>} The AI-generated response from the item.
   */
  async useItem(avatar, item, channelId) {
    if (!this.aiService || typeof this.aiService.speakAsItem !== 'function') {
      return `The ${item.name} remains inert, its power dormant.`;
    }
    // Call the AI service to generate a response as the item.
    const response = await this.aiService.speakAsItem(item, channelId);
    return response;
  }

  /**
   * Searches for items in the current location that match a query.
   * Only unassigned (dropped) items are considered.
   * @param {string} locationId - The channel/location ID.
   * @param {string} query - The search query.
   * @returns {Promise<Object[]>} An array of matching item objects.
   */
  async searchItems(locationId, query) {
    const itemsCollection = this.db.collection('items');
    const regex = new RegExp(query, 'i');
    const items = await itemsCollection
      .find({
        locationId,
        owner: null,
        $or: [{ name: regex }, { description: regex }]
      })
      .toArray();
    return items;
  }
}
