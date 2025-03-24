import Ajv from 'ajv';

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
}

export const ratiService = new RatiService();
export default ratiService;
