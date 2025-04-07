import { SchemaValidator } from '../utils/schemaValidator.mjs';
import { BasicService } from '../foundation/basicService.mjs'; // Assuming BasicService is imported

export class ItemService extends BasicService {
  constructor(services) {
    super(services);
    this.configService = services.configService;
    this.databaseService = services.databaseService;
    this.discordService = services.discordService;

    this.client = this.discordService.client;
    this.db = this.databaseService.getDatabase();
    
    
    this.itemCreationLimit = 8; // Hardcoded as 'options' was undefined
    this.schemaValidator = new SchemaValidator();
    this.CURRENT_SCHEMA_VERSION = '1.0.0';
  }

  /** Ensures the database connection is active. */
  ensureDbConnection() {
    if (!this.db) throw new Error('Database not connected');
    return this.db;
  }

  /** Removes single and double quotes from an item name. */
  cleanItemName(name) {
    return name.replace(/['"]/g, '');
  }

  /** Downloads an image from a URL and returns it as a Buffer. */
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

  /** Generates an item image using CreationService. */
  async generateItemImage(itemName, description) {
    return await this.creationService.generateImage(`${itemName}: ${description}`, '1:1');
  }

  /** Generates detailed item data using CreationService's pipeline. */
  async generateItemDetails(itemName, description) {
    const prompt = `Generate a JSON object for an item with the following details:
Name: "${itemName}"
Description: "${description}"
Include fields: name, description, type, rarity, properties.`;
    const schema = {
      name: 'rati-item',
      strict: true,
      schema: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          type: { type: 'string' },
          rarity: { type: 'string' },
          properties: { type: 'object' }
        },
        required: ['name', 'description', 'type', 'rarity', 'properties'],
        additionalProperties: false,
      }
    };
    return await this.creationService.executePipeline({ prompt, schema });
  }

  /** Determines item rarity using CreationService. */
  async determineItemRarity() {
    return this.creationService.determineRarity();
  }

  /** Normalizes item type to an allowed value. */
  normalizeItemType(type) {
    const allowedTypes = ['weapon', 'armor', 'consumable', 'quest', 'key', 'artifact'];
    let normalized = type.toLowerCase().trim().replace(/[^a-z]/g, '');
    return allowedTypes.includes(normalized) ? normalized : 'artifact';
  }

  /** Finds an existing item or creates a new one. */
  async findOrCreateItem(itemName, locationId) {
    const itemsCollection = this.ensureDbConnection().collection('items');
    const key = itemName.toLowerCase();
    let item = await itemsCollection.findOne({ key });
    if (item) return item;

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const itemsCreatedToday = await itemsCollection.countDocuments({
      createdAt: { $gte: startOfToday }
    });
    if (itemsCreatedToday >= this.itemCreationLimit) return null;

    const prompt = `Generate a complete item for a fantasy game based on the name "${itemName}". Include:
- A refined name that is evocative and fitting for a mystical fantasy dungeon.
- A captivating and mysterious description (2-3 sentences) describing its magical properties and ancient origins.
- The item type, choosing from: weapon, armor, consumable, quest, key, artifact.
- The rarity, choosing from: common, uncommon, rare, epic, legendary.
- Special properties or effects the item might have.
Return a JSON object with keys: name, description, type, rarity, properties.`;

    const itemSchema = {
      name: 'rati-item',
      strict: true,
      schema: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          type: { type: 'string', enum: ['weapon', 'armor', 'consumable', 'quest', 'key', 'artifact'] },
          rarity: { type: 'string', enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'] },
          properties: { type: 'object' }
        },
        required: ['name', 'description', 'type', 'rarity', 'properties'],

        additionalProperties: false,
      }
    };

    let itemData;
    try {
      itemData = await this.creationService.executePipeline({ prompt, schema: itemSchema });
    } catch (error) {
      console.error('Error generating item data:', error);
      return null;
    }

    const refinedItemName = this.cleanItemName(itemData.name.trim().slice(0, 50));
    const description = itemData.description.trim();
    const imageUrl = await this.generateItemImage(refinedItemName, description);

    const newItem = {
      key: refinedItemName.toLowerCase(),
      name: refinedItemName,
      description,
      type: itemData.type,
      rarity: itemData.rarity,
      properties: itemData.properties,
      imageUrl,
      creator: '',
      owner: null,
      locationId,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      version: this.CURRENT_SCHEMA_VERSION
    };

    const result = await itemsCollection.insertOne(newItem);
    if (result.insertedId) {
      newItem._id = result.insertedId;
      return newItem;
    }
    return null;
  }

  /** Assigns an item to an avatar. */
  async assignItemToAvatar(avatarId, item) {
    const itemsCollection = this.ensureDbConnection().collection('items');
    const result = await itemsCollection.updateOne(
      { _id: item._id },
      { $set: { owner: avatarId, locationId: null, updatedAt: new Date().toISOString() } }
    );
    return result.modifiedCount > 0;
  }

  /** Drops an item at a location. */
  async dropItem(avatar, item, locationId) {
    const itemsCollection = this.ensureDbConnection().collection('items');
    const result = await itemsCollection.updateOne(
      { _id: item._id },
      { $set: { owner: null, locationId, updatedAt: new Date().toISOString() } }
    );
    return result.modifiedCount > 0;
  }

  /** Allows an avatar to take an item. */
  async takeItem(avatar, itemName, locationId) {
    const itemsCollection = this.ensureDbConnection().collection('items');
    const key = itemName.toLowerCase();
    const item = await itemsCollection.findOne({ key, locationId, owner: null });
    if (!item) return null;
    const success = await this.assignItemToAvatar(avatar._id, item);
    return success ? await itemsCollection.findOne({ _id: item._id }) : null;
  }

  /** Uses an item, leveraging aiService if available. */
  async useItem(avatar, item, channelId) {
    if (!this.aiService || typeof this.aiService.speakAsItem !== 'function') {
      return `The ${item.name} remains inert, its power dormant.`;
    }
    return await this.aiService.speakAsItem(item, channelId);
  }

  /** Searches for items in a location matching a query. */
  async searchItems(locationId, query) {
    const itemsCollection = this.ensureDbConnection().collection('items');
    const regex = new RegExp(query, 'i');
    return await itemsCollection
      .find({
        locationId,
        owner: null,
        $or: [{ name: regex }, { description: regex }]
      })
      .toArray();
  }

  /** Returns the item schema for validation. */
  getItemSchema() {
    return {
      type: 'object',
      properties: {
        name: { type: 'string' },
        description: { type: 'string' },
        type: { type: 'string' },
        rarity: { type: 'string' },
        imageUrl: { type: 'string' }
      },
      required: ['name', 'description', 'type', 'rarity', 'imageUrl'],

      additionalProperties: false,
    };
  }

  /** Generates RATi-compatible metadata for an item. */
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
        { trait_type: 'Type', value: item.type },
        { trait_type: 'Rarity', value: item.rarity },
        { trait_type: 'Effect', value: item.properties.effect || 'None' }
      ],
      signature: null,
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

  /** Creates a crafted item by combining input items. */
  async createCraftedItem(inputItems, creatorId) {
    const itemsCollection = this.ensureDbConnection().collection('items');
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const itemsCreatedToday = await itemsCollection.countDocuments({
      createdAt: { $gte: startOfToday.toISOString() }
    });
    if (itemsCreatedToday >= this.itemCreationLimit) return null;

    // Enforce leveling: require two items of same level
    const levels = inputItems.map(i => i.evolutionLevel || 1);
    const baseLevel = levels[0];
    if (levels.some(l => l !== baseLevel)) {
      console.warn('Crafting failed: items not same level');
      return null;
    }

    // Roll d20 for rarity and special cases
    const roll = Math.ceil(Math.random() * 20);
    let rarity = 'common';
    if (roll === 1) {
      // On 1, randomly destroy one input item, no upgrade
      const unlucky = inputItems[Math.floor(Math.random() * inputItems.length)];
      await itemsCollection.deleteOne({ _id: unlucky._id });
      console.warn('Critical failure: destroyed one input item');
      return null;
    } else if (roll === 20) {
      rarity = 'legendary';
    } else if (roll >= 18) {
      rarity = 'rare';
    } else if (roll >= 13) {
      rarity = 'uncommon';
    }

    // Calculate next level
    const newLevel = baseLevel + 1;

    // Average DnD stats if present
    const stats = ['str','dex','con','int','wis','cha'];
    const avgStats = {};
    for(const stat of stats) {
      const vals = inputItems.map(i => i.properties?.stats?.[stat] || 10);
      avgStats[stat] = Math.round(vals.reduce((a,b)=>a+b,0)/vals.length);
    }

    const inputNames = inputItems.map(i => i.name).join(', ');
    const prompt = `Combine these items: ${inputNames}. Generate a new item with level ${newLevel}, rarity ${rarity}, and DnD stats.`;

    const itemSchema = {
      name: 'rati-avatar',
      strict: true,
      schema: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          type: { type: 'string', enum: ['weapon','armor','consumable','quest','key','artifact'] },
          rarity: { type: 'string', enum: ['common','uncommon','rare','epic','legendary'] },
          properties: { type: 'object' }
        },
        required: ['name','description','type','rarity','properties'],
        additionalProperties: false
      }
    };

    let itemData;
    try {
      itemData = await this.creationService.executePipeline({ prompt, schema: itemSchema });
    } catch (e) {
      console.error('Error generating crafted item data:', e);
      return null;
    }

    const refinedName = this.cleanItemName(itemData.name.trim().slice(0,50));
    const description = itemData.description.trim();
    const imageUrl = await this.generateItemImage(refinedName, description);

    const newItem = {
      key: refinedName.toLowerCase(),
      name: refinedName,
      description,
      type: itemData.type,
      rarity,
      properties: itemData.properties || {},
      imageUrl,
      creator: creatorId,
      owner: creatorId,
      locationId: null,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      version: this.CURRENT_SCHEMA_VERSION,
      evolutionLevel: newLevel,
      sourceItemIds: inputItems.map(i => i._id),
    };

    // Attach averaged stats
    newItem.properties.stats = avgStats;

    const result = await itemsCollection.insertOne(newItem);
    if (result.insertedId) {
      newItem._id = result.insertedId;
      // Burn source items
      await itemsCollection.deleteMany({ _id: { $in: inputItems.map(i => i._id) } });
      return newItem;
    }
    return null;
  }

  /** Returns a string of item names owned by an avatar. */
  getItemsDescription(avatar) {
    return (avatar.items || []).map(item => item.name).join(', ');
  }
}