// itemService.mjs

import fs from 'fs/promises';
import Replicate from 'replicate';
import { uploadImage } from '../s3/s3imageService.mjs';
import { SchemaValidator } from '../utils/schemaValidator.mjs';

export class ItemService {
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
    this.schemaValidator = new SchemaValidator();
    this.CURRENT_SCHEMA_VERSION = '1.0.0';
  }

  ensureDbConnection() {
    if (!this.db) {
      throw new Error('Database not connected');
    }
    return this.db;
  }

  cleanItemName(name) {
    return name.replace(/['"]/g, '');
  }

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

  async generateItemImage(itemName, description) {
    this.ensureDbConnection();
    const trigger = process.env.REPLICATE_LORA_TRIGGER || '';

    try {
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

  async determineItemType(itemName, description) {
    const typePrompt = `Determine the type of item based on its name and description: Name: "${itemName}", Description: "${description}". Return only the item type (e.g., "weapon", "armor", "consumable", "quest", "key", "artifact").`;
    let type = await this.aiService.chat([
      { role: 'system', content: 'You are an expert in classifying fantasy items.' },
      { role: 'user', content: typePrompt }
    ]);
    type = type.trim();
    return this.normalizeItemType(type);
  }

  async determineItemRarity(itemName, description) {
    const rarityPrompt = `Determine the rarity of an item based on its name and description: Name: "${itemName}", Description: "${description}". Return only the item rarity (e.g., "common", "uncommon", "rare", "legendary", "mythic").`;
    let rarity = await this.aiService.chat([
      { role: 'system', content: 'You are an expert in evaluating the rarity of fantasy items.' },
      { role: 'user', content: rarityPrompt }
    ]);
    rarity = rarity.trim();
    return this.normalizeItemRarity(rarity);
  }

  /**
   * Attempts to extract a valid JSON object from the given string.
   * @param {string} text - The text containing a JSON object.
   * @returns {Object|null} The parsed JSON object or null if extraction fails.
   */
  extractJson(text) {
    // Look for a substring starting at the first '{' and ending at the last '}'
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      const jsonString = text.substring(firstBrace, lastBrace + 1);
      try {
        return JSON.parse(jsonString);
      } catch (err) {
        console.error('Error parsing extracted JSON:', err);
        return null;
      }
    }
    return null;
  }

  async generateItemProperties(itemName, description) {
    try {
      const propertiesPrompt = `Generate properties for an item based on its name and description: Name: "${itemName}", Description: "${description}". Return ONLY a valid JSON object like this example: {"attack": 10, "defense": 5, "effect": "healing"}. Do not include any explanatory text.`;

      const responseSchema = {
        type: "OBJECT",
        properties: {
          attack: { type: "NUMBER", description: "Attack value of the item" },
          defense: { type: "NUMBER", description: "Defense value of the item" },
          effect: { type: "STRING", description: "Special effect of the item" }
        },
        required: ["attack", "defense"]
      };

      const propertiesResponse = await this.aiService.chat(
        [
          { role: 'system', content: 'You are a master craftsman. Only respond with valid JSON objects containing item properties.' },
          { role: 'user', content: propertiesPrompt }
        ],
        { responseSchema }
      );

      if (propertiesResponse && typeof propertiesResponse === 'object') {
        return propertiesResponse;
      } else {
        console.warn(`Invalid response for ${itemName}:`, propertiesResponse);
        return { attack: 5, defense: 5 }; // Fallback default properties
      }
    } catch (error) {
      console.error(`Failed to generate properties for ${itemName}:`, error);
      return { attack: 5, defense: 5 }; // Fallback default properties
    }
  }

  /**
   * Normalizes the item type to one of the allowed values.
   * @param {string} type - The type returned by the AI.
   * @returns {string} One of: "weapon", "armor", "consumable", "quest", "key", "artifact".
   */
  normalizeItemType(type) {
    const allowedTypes = ["weapon", "armor", "consumable", "quest", "key", "artifact"];
    let normalized = type.toLowerCase().trim().replace(/[^a-z]/g, '');
    if (allowedTypes.includes(normalized)) return normalized;
    // If not exact, check if any allowed type is contained within the string.
    for (const allowed of allowedTypes) {
      if (normalized.includes(allowed)) return allowed;
    }
    return 'artifact';
  }

  /**
   * Normalizes the item rarity to one of the allowed values.
   * @param {string} rarity - The rarity returned by the AI.
   * @returns {string} One of: "common", "uncommon", "rare", "legendary", "mythic".
   */
  normalizeItemRarity(rarity) {
    const allowedRarities = ["common", "uncommon", "rare", "legendary", "mythic"];
    let normalized = rarity.toLowerCase().trim().replace(/[^a-z]/g, '');
    if (allowedRarities.includes(normalized)) return normalized;
    // Map common synonyms if needed (e.g., "epic" -> "legendary")
    if (normalized === 'epic') return 'legendary';
    for (const allowed of allowedRarities) {
      if (normalized.includes(allowed)) return allowed;
    }
    return 'common';
  }

  async findOrCreateItem(itemName, locationId) {
    const key = itemName.toLowerCase();
    const itemsCollection = this.db.collection('items');

    let item = await itemsCollection.findOne({ key });
    if (item) {
      return item;
    }

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const itemsCreatedToday = await itemsCollection.countDocuments({
      createdAt: { $gte: startOfToday }
    });
    if (itemsCreatedToday >= this.itemCreationLimit) {
      return null;
    }

    // --- Refine the item name ---
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
    refinedItemName = this.cleanItemName(refinedItemName);

    // --- Generate item description ---
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

    // Generate the item image.
    const imageUrl = await this.generateItemImage(refinedItemName, description);

    // Create the new item document.
    const newItem = {
      key: refinedItemName.toLowerCase(),
      name: refinedItemName,
      description,
      type: await this.determineItemType(refinedItemName, description),
      rarity: await this.determineItemRarity(refinedItemName, description),
      properties: await this.generateItemProperties(refinedItemName, description),
      imageUrl,
      creator: '', // Set to empty string to meet schema requirement.
      owner: null,
      locationId,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      version: this.CURRENT_SCHEMA_VERSION
    };

    // Validate the item.
    const validation = this.validateItem(newItem);
    if (!validation.valid) {
      console.error('Item validation failed:', {
        itemName: refinedItemName,
        errors: validation.errors
      });
      // Fix common issues:
      if (!newItem.type || !['weapon', 'armor', 'consumable', 'quest', 'key', 'artifact'].includes(newItem.type)) {
        newItem.type = 'artifact';
      }
      if (!newItem.rarity || !['common', 'uncommon', 'rare', 'legendary', 'mythic'].includes(newItem.rarity)) {
        newItem.rarity = 'common';
      }
      // Ensure dates and creator are strings.
      newItem.createdAt = newItem.createdAt.toString();
      newItem.updatedAt = newItem.updatedAt.toString();
      newItem.creator = newItem.creator || '';

      // Revalidate after fixes.
      const revalidation = this.validateItem(newItem);
      if (!revalidation.valid) {
        throw new Error('Failed to create item: Invalid properties');
      }
    }

    const result = await itemsCollection.insertOne(newItem);
    if (result.insertedId) {
      newItem._id = result.insertedId;
      return newItem;
    }
    return null;
  }

  async assignItemToAvatar(avatarId, item) {
    const itemsCollection = this.db.collection('items');
    const now = new Date();
    const result = await itemsCollection.updateOne(
      { _id: item._id },
      { $set: { owner: avatarId, locationId: null, updatedAt: new Date().toISOString() } }
    );
    return result.modifiedCount > 0;
  }

  async dropItem(avatar, item, locationId) {
    const itemsCollection = this.db.collection('items');
    const now = new Date();
    const result = await itemsCollection.updateOne(
      { _id: item._id },
      { $set: { owner: null, locationId, updatedAt: new Date().toISOString() } }
    );
    return result.modifiedCount > 0;
  }

  async takeItem(avatar, itemName, locationId) {
    const itemsCollection = this.db.collection('items');
    const key = itemName.toLowerCase();

    const item = await itemsCollection.findOne({ key, locationId, owner: null });
    if (!item) {
      return null;
    }
    const success = await this.assignItemToAvatar(avatar._id, item);
    if (success) {
      return await itemsCollection.findOne({ _id: item._id });
    }
    return null;
  }

  async useItem(avatar, item, channelId) {
    if (!this.aiService || typeof this.aiService.speakAsItem !== 'function') {
      return `The ${item.name} remains inert, its power dormant.`;
    }
    const response = await this.aiService.speakAsItem(item, channelId);
    return response;
  }

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

  validateItem(item) {
    return this.schemaValidator.validateItem(item);
  }

  /**
   * Generates RATi-compatible metadata for an item.
   * @param {Object} item - The item object.
   * @param {Object} storageUris - URIs for metadata storage (e.g., { primary: 'ar://...', backup: 'ipfs://...' }).
   * @returns {Object} - The RATi-compatible metadata.
   */
  generateRatiMetadata(item, storageUris) {
    return {
      tokenId: item._id.toString(),
      name: item.name,
      description: item.description,
      media: {
        image: item.imageUrl,
        video: item.videoUrl || null
      },
      attributes: [
        { trait_type: "Type", value: item.type },
        { trait_type: "Rarity", value: item.rarity },
        { trait_type: "Effect", value: item.properties.effect || "None" }
      ],
      signature: null, // To be signed by the RATi node.
      storage: storageUris,
      evolution: {
        level: item.evolutionLevel || 1,
        previous: item.previousTokenIds || [],
        timestamp: item.updatedAt
      },
      memory: {
        recent: item.memoryRecent || null,
        archive: item.memoryArchive || null
      }
    };
  }

  // itemService.mjs (add this method to the existing class)

  async createCraftedItem(inputItems, creatorId) {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const itemsCreatedToday = await this.db.collection('items').countDocuments({
      createdAt: { $gte: startOfToday.toISOString() }
    });
    if (itemsCreatedToday >= this.itemCreationLimit) {
      return null;
    }

    // Generate prompt with input item names
    const inputNames = inputItems.map(i => i.name).join(', ');
    const craftPrompt = `Combine the following items into a new unique item: ${inputNames}. Provide a JSON object with 'name' and 'description' for the new item.`;
    const responseSchema = {
      type: "OBJECT",
      properties: {
        name: { type: "STRING", description: "The name of the new item" },
        description: { type: "STRING", description: "The description of the new item" }
      },
      required: ["name", "description"]
    };

    let newItemData;
    try {
      newItemData = await this.aiService.chat(
        [
          { role: 'system', content: 'You are a master craftsman creating a new item.' },
          { role: 'user', content: craftPrompt }
        ],
        { responseSchema }
      );
    } catch (error) {
      console.error('Error generating crafted item data:', error);
      return null;
    }

    if (!newItemData || !newItemData.name || !newItemData.description) {
      return null;
    }

    const refinedItemName = this.cleanItemName(newItemData.name.trim().slice(0, 50));
    const description = newItemData.description.trim();
    const imageUrl = await this.generateItemImage(refinedItemName, description);
    const type = await this.determineItemType(refinedItemName, description);
    const rarity = await this.determineItemRarity(refinedItemName, description);
    const properties = await this.generateItemProperties(refinedItemName, description);

    const newItem = {
      key: refinedItemName.toLowerCase(),
      name: refinedItemName,
      description,
      type,
      rarity,
      properties,
      imageUrl,
      creator: creatorId,
      owner: creatorId,
      locationId: null,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      version: this.CURRENT_SCHEMA_VERSION
    };

    const validation = this.validateItem(newItem);
    if (!validation.valid) {
      console.error('Crafted item validation failed:', validation.errors);
      return null;
    }

    const result = await this.db.collection('items').insertOne(newItem);
    if (result.insertedId) {
      newItem._id = result.insertedId;
      return newItem;
    }
    return null;
  }

  getItemsDescription(avatar) {
    return (avatar.items || []).map((item) => item.name).join(', ');
  }
}
