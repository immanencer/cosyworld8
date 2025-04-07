import Ajv from 'ajv';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

export class RatiService {
  constructor() {
    this.ajv = new Ajv();
    this.ratiSchema = {
      $schema: "http://json-schema.org/draft-07/schema#",
      title: "RATiNFT",
      type: "object",
      properties: {
        tokenId: { type: "string", description: "A unique identifier for the NFT." },
        name: { type: "string", description: "The display name of the asset." },
        description: { type: "string", description: "A narrative describing the asset." },
        media: {
          type: "object",
          properties: {
            image: { type: "string", description: "URI for the asset's image." },
            video: { type: "string", description: "URI for any associated video content." }
          }
        },
        attributes: {
          type: "array",
          items: {
            type: "object",
            properties: {
              trait_type: { type: "string", description: "The category of the trait." },
              value: { type: "string", description: "The value of the trait." }
            }
          }
        },
        signature: { type: "string", description: "Cryptographic signature of the metadata." },
        storage: {
          type: "object",
          properties: {
            primary: { type: "string", description: "Primary storage URI." },
            backup: { type: "string", description: "Backup storage URI." }
          }
        },
        evolution: {
          type: "object",
          properties: {
            level: { type: "integer", description: "The current evolution level." },
            previous: { type: "array", items: { type: "string" } },
            timestamp: { type: "string", description: "ISO timestamp of the last evolution event." }
          }
        },
        memory: {
          type: "object",
          properties: {
            recent: { type: "string", description: "URI pointing to recent interactions." },
            archive: { type: "string", description: "URI pointing to the historical archive." }
          }
        }
      },
      required: ["tokenId", "name", "description", "attributes"]
    };
    this.validateRatiMetadata = this.ajv.compile(this.ratiSchema);
  }

  /**
   * Validates RATi metadata against the schema.
   * @param {Object} metadata - The metadata to validate.
   * @returns {Object} - Validation result.
   */
  validate(metadata) {
    const valid = this.validateRatiMetadata(metadata);
    return { valid, errors: this.validateRatiMetadata.errors };
  }

  /**
   * Generates Metaplex-compatible metadata linked to RATi metadata.
   * @param {Object} ratiMetadata - The RATi metadata.
   * @returns {Object} - Metaplex-compatible metadata.
   */
  generateMetaplexMetadata(ratiMetadata) {
    return {
      name: ratiMetadata.name,
      symbol: "RATi",
      description: ratiMetadata.description,
      image: ratiMetadata.media.image,
      attributes: ratiMetadata.attributes,
      properties: {
        files: [{ uri: ratiMetadata.media.image, type: "image/png" }],
        category: "image",
        creators: [{ address: "YourWalletAddress", share: 100 }]
      },
      external_url: ratiMetadata.storage.primary
    };
  }

  /**
   * Generates ERC-compatible metadata linked to RATi metadata.
   * @param {Object} ratiMetadata - The RATi metadata.
   * @returns {Object} - ERC-compatible metadata.
   */
  generateErcMetadata(ratiMetadata) {
    return {
      name: ratiMetadata.name,
      description: ratiMetadata.description,
      image: ratiMetadata.media.image,
      attributes: ratiMetadata.attributes,
      external_url: ratiMetadata.storage.primary
    };
  }

  /**
   * Generates RATi metadata from raw data.
   * @param {Object} rawData - The raw data from the database.
   * @param {Object} options - Additional options for metadata generation.
   * @returns {Object} - Transformed RATi metadata.
   */
  generateRatiMetadata(rawData, options = {}) {
    return {
      tokenId: rawData.tokenId,
      name: rawData.name || "Unnamed Asset",
      description: rawData.description || "No description available.",
      media: {
        image: rawData.imageUrl || "placeholder.png",
        video: rawData.videoUrl || null,
      },
      attributes: rawData.attributes || [],
      storage: {
        primary: rawData.storagePrimary || null,
        backup: rawData.storageBackup || null,
      },
      evolution: rawData.evolution || {},
      memory: rawData.memory || {},
      ...options, // Merge additional options into the metadata
    };
  }

  /**
   * Generates random packs with avatars, items, and locations.
   * Ensures that there are enough unassigned avatars, items, and locations to generate the requested number of packs.
   * Tracks assignments within the service to keep it self-contained.
   * @param {number} count - Number of packs to generate.
   * @returns {Array} - Array of generated packs or a partial list if resources are insufficient.
   */
  async generateRandomPacks(count) {
    // Fetch unassigned resources from respective services
    const unassignedAvatars = await avatarService.getUnassignedAvatars();
    const unassignedItems = await itemService.getUnassignedItems();
    const unassignedLocations = await locationService.getUnassignedLocations();

    // Calculate the maximum number of packs that can be generated
    const maxPacks = Math.min(
      Math.floor(unassignedAvatars.length),
      Math.floor(unassignedItems.length),
      Math.floor(unassignedLocations.length)
    );

    if (maxPacks < count) {
      console.warn(`Insufficient resources to generate ${count} packs. Only ${maxPacks} packs can be generated.`);
    }

    const packsToGenerate = Math.min(count, maxPacks);
    const packs = [];
    const assignedResources = {
      avatars: [],
      items: [],
      locations: []
    };

    for (let i = 0; i < packsToGenerate; i++) {
      const avatar = unassignedAvatars.pop();
      const item = unassignedItems.pop();
      const location = unassignedLocations.pop();

      packs.push({
        packId: Date.now() + i,
        content: [
          { name: avatar.name, type: "Avatar" },
          { name: item.name, type: "Item" },
          { name: location.name, type: "Location" },
        ],
        opened: false,
        createdAt: new Date(),
      });

      // Track assigned resources
      assignedResources.avatars.push(avatar.name);
      assignedResources.items.push(item.name);
      assignedResources.locations.push(location.name);
    }

    // Update the services to mark the used resources as assigned
    await avatarService.markAsAssigned(assignedResources.avatars);
    await itemService.markAsAssigned(assignedResources.items);
    await locationService.markAsAssigned(assignedResources.locations);

    // Store assigned resources within the service for tracking
    this.assignedResources = this.assignedResources || { avatars: [], items: [], locations: [] };
    this.assignedResources.avatars.push(...assignedResources.avatars);
    this.assignedResources.items.push(...assignedResources.items);
    this.assignedResources.locations.push(...assignedResources.locations);

    return packs;
  }

  /**
   * Generates a unique encryption key (GUID).
   * @returns {string} - A new UUID.
   */
  generateEncryptionKey() {
    return uuidv4();
  }

  /**
   * Encrypts data with a given key and encodes to base64.
   * @param {Object} data - The data to encrypt.
   * @param {string} key - Encryption key.
   * @returns {string} - Base64 encoded encrypted data.
   */
  encryptData(data, key) {
    try {
      // Create a deterministic IV from the key
      const hash = crypto.createHash('sha256');
      hash.update(key);
      const iv = hash.digest().slice(0, 16);

      // Create cipher using key and IV
      const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key.repeat(2).slice(0, 32)), iv);
      
      // Encrypt the data
      let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'base64');
      encrypted += cipher.final('base64');
      
      return encrypted;
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Decrypts base64 encoded data with a given key.
   * @param {string} encryptedData - Base64 encoded encrypted data.
   * @param {string} key - Decryption key.
   * @returns {Object} - The decrypted data.
   */
  decryptData(encryptedData, key) {
    try {
      // Create a deterministic IV from the key (same as in encryption)
      const hash = crypto.createHash('sha256');
      hash.update(key);
      const iv = hash.digest().slice(0, 16);

      // Create decipher using key and IV
      const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key.repeat(2).slice(0, 32)), iv);
      
      // Decrypt the data
      let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
      decrypted += decipher.final('utf8');
      
      return JSON.parse(decrypted);
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt data or invalid key');
    }
  }

  /**
   * Generates a collection of encrypted packs with unique keys.
   * @param {number} count - Number of packs to generate.
   * @returns {Array} - Array of pack objects with encrypted content and keys.
   */
  async generatePackCollection(count) {
    // Generate packs (await the async call)
    const rawPacks = await this.generateRandomPacks(count);
    
    // Group packs into collections of 4 (or less for the last group)
    const packCollections = [];
    for (let i = 0; i < rawPacks.length; i += 4) {
      packCollections.push(rawPacks.slice(i, i + 4));
    }
    
    // Shuffle the collections
    this.shuffleArray(packCollections);
    
    // Generate encryption keys and encrypt each collection
    const encryptedCollections = packCollections.map(collection => {
      const key = this.generateEncryptionKey();
      return {
        key,
        encryptedContent: this.encryptData(collection, key),
        redeemed: false,
        createdAt: new Date()
      };
    });
    
    return encryptedCollections;
  }

  /**
   * Shuffles an array in-place using Fisher-Yates algorithm.
   * @param {Array} array - The array to shuffle.
   */
  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  /**
   * Generates RATi-compatible metadata for a pack.
   * @param {Object} pack - The pack object.
   * @param {Object} storageUris - URIs for metadata storage (e.g., { primary: 'ar://...', backup: 'ipfs://...' }).
   * @returns {Object} - The RATi-compatible metadata.
   */
  generateRatiMetadataForPack(pack, storageUris) {
    return {
      tokenId: pack.packId.toString(),
      name: `Pack #${pack.packId}`,
      description: `A collection of items, avatars, and locations.`,
      media: {
        image: pack.imageUrl || null,
        video: null
      },
      attributes: pack.content.map((item, index) => ({
        trait_type: `Item ${index + 1}`,
        value: item.name || "Unknown"
      })),
      signature: null, // To be signed by the RATi node.
      storage: storageUris,
      evolution: {
        level: pack.evolutionLevel || 1,
        previous: pack.previousTokenIds || [],
        timestamp: pack.createdAt
      },
      memory: {
        recent: pack.memoryRecent || null,
        archive: pack.memoryArchive || null
      }
    };
  }

  /**
   * Initializes pack collections on startup if needed.
   * @param {Object} db - MongoDB database instance
   * @returns {Promise<void>}
   */
  async initializePackCollections(db) {
    try {
      if (!db) {
        throw new Error('Database instance required for pack initialization');
      }
      
      // Fetch all ObjectId's from the database
      const avatarIds = await db.collection('avatars')
      .find({}, { projection: { _id: 1 } }).toArray();

      const itemIds = await db.collection('items')
      .find({}, { projection: { _id: 1 } }).toArray();

      const locationIds = await db.collection('locations')
      .find({}, { projection: { _id: 1 } }).toArray();

      // combine all the ids into one array
      const cards = avatarIds.concat(itemIds, locationIds);
      //shuffle the array
      this.shuffleArray(cards);

      // Assign each card to a pack
      const packs = [];
      for (let i = 0; i < cards.length; i += 4) {
        packs.push(cards.slice(i, i + 4));
      }

      // Generate encryption keys for each pack
      const packCollections = packs.map(pack => {
        const key = this.generateEncryptionKey();
        return {
          key,
          encryptedContent: this.encryptData(pack, key),
          redeemed: false,
          createdAt: new Date()
        };
      });

      // Save to database
      await db.collection('packCollections').insertMany(packCollections);

      // save the keys to the file system
      await this.savePackKeys({ keys: packCollections.map(p => ({ key: p.key, createdAt: p.createdAt.toISOString() })) });

      console.log('Pack collections initialized:', packCollections.length);
      
    } catch (error) {
      console.error('Failed to initialize pack collections:', error);
    }
  }

  /**
   * Saves pack keys to secure storage
   * @param {Object} keyData - The key data to save
   */
  async savePackKeys(keyData) {
    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      
      const keyStoragePath = path.join(process.cwd(), 'rati', 'packKeysAndData.json');
      const keysPath = path.join(process.cwd(), 'rati', 'keys');
      
      // Read existing data
      let existingData = { packs: [] };
      try {
        const fileContent = await fs.readFile(keyStoragePath, 'utf8');
        existingData = JSON.parse(fileContent);
      } catch (err) {
        // File doesn't exist or is invalid, use default empty data
      }

      // Add new keys
      existingData.packs.push(...keyData.keys);

      // Ensure directories exist
      await fs.mkdir(path.dirname(keyStoragePath), { recursive: true });
      await fs.mkdir(keysPath, { recursive: true });
      
      // Save updated data to main JSON file
      await fs.writeFile(
        keyStoragePath,
        JSON.stringify(existingData, null, 2),
        'utf8'
      );
      
      // Always write individual key files
      for (const keyInfo of keyData.keys) {
        const keyFileName = `key-${keyInfo.createdAt.replace(/[:.]/g, '-')}.txt`;
        await fs.writeFile(
          path.join(keysPath, keyFileName),
          `Key: ${keyInfo.key}\nCreated: ${keyInfo.createdAt}\n`,
          'utf8'
        );
      }

      // Write a summary file
      await fs.writeFile(
        path.join(keysPath, '_summary.txt'),
        `Generated on: ${new Date().toISOString()}\n` +
        `Total keys: ${keyData.keys.length}\n\n` +
        keyData.keys.map(k => `${k.key} (${k.createdAt})`).join('\n'),
        'utf8'
      );
      
    } catch (error) {
      console.error('Failed to save pack keys:', error);
    }
  }
}

// Modified export to initialize packs
export const ratiService = new RatiService();

export default ratiService;
