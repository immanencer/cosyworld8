import fs from 'fs/promises';
import Replicate from 'replicate';
import { BasicService } from './basicService.mjs';
import { SchemaValidator } from './utils/schemaValidator.mjs';

export class CreationService extends BasicService {
  constructor(services) {
    super(services, [
      'aiService',
      'databaseService',
      'configService',
      's3Service',
    ]);
    this.db = this.databaseService.getDatabase();
    this.replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });
    this.schemaValidator = new SchemaValidator();
    this.rarityRanges = [
      { rarity: 'common', min: 1, max: 12 },
      { rarity: 'uncommon', min: 13, max: 17 },
      { rarity: 'rare', min: 18, max: 19 },
      { rarity: 'legendary', min: 20, max: 20 }
    ];
  }

  async generateImage(prompt, aspectRatio = '1:1') {
    try {
      const replicateConfig = this.configService.getAIConfig('replicate');
      const loraTrigger = replicateConfig.loraTriggerWord || '';
      const loraWeights = replicateConfig.lora_weights;

      const decoratedPrompt = `${loraTrigger} ${prompt} ${loraTrigger}`.trim();

      const [output] = await this.replicate.run(
        'black-forest-labs/flux-dev-lora',
        {
          input: {
            prompt: decoratedPrompt,
            go_fast: false,
            guidance: 3,
            lora_scale: 1,
            megapixels: '1',
            num_outputs: 1,
            aspect_ratio: aspectRatio,
            lora_weights: loraWeights,
            output_format: 'png',
            output_quality: 80,
            prompt_strength: 0.8,
            num_inference_steps: 28
          }
        }
      );

      const imageUrl = (output.url || output.toString)();
      const imageBuffer = await this.downloadImage(imageUrl);
      const localFilename = `./images/generated_${Date.now()}.webp`;
      await fs.mkdir('./images', { recursive: true });
      await fs.writeFile(localFilename, imageBuffer);
      return await this.s3Service.uploadImage(localFilename);
    } catch (error) {
      console.error('Error generating image:', error);
      throw error;
    }
  }

  async downloadImage(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to download image: ${response.status}`);
    return Buffer.from(await response.arrayBuffer());
  }

  determineRarity() {
    const roll = Math.floor(Math.random() * 20) + 1;
    return this.rarityRanges.find(range => roll >= range.min && roll <= range.max)?.rarity || 'common';
  }

  /**
   * Executes a structured prompting pipeline using Gemini-compatible structured output.
   * @param {Object} config - Configuration for the pipeline.
   * @param {string} config.prompt - The base prompt to use.
   * @param {Object} config.schema - The schema to validate the output against.
   * @param {Object} [config.options] - Additional options (e.g., temperature).
   * @returns {Promise<Object>} - The validated output.
   */
  async executePipeline({ prompt, schema, options = {} }) {
    if (!schema) throw new Error('Schema is required for structured prompting.');

    try {
      const result = await this.aiService.generateStructuredOutput({
        prompt,
        schema,
        options,
      });

      const actualSchema = schema?.schema || schema;
      this.validateAgainstSchema(result, actualSchema);

      return result;
    } catch (error) {
      const msg = error.message || '';
      const truncated = msg.length > 500 ? msg.slice(0, 500) + '... [truncated]' : msg;
      console.error('Error in structured prompting pipeline:', truncated);
      throw new Error(truncated);
    }
  }

  /**
   * Validates an object against a schema.
   * @param {Object} data - The object to validate.
   * @param {Object} schema - The schema to validate against.
   * @throws {Error} - If validation fails.
   */
  validateAgainstSchema(data, schema) {
    const validation = this.schemaValidator.validate(data, schema);
    if (!validation.valid) {
      throw new Error(`Validation failed: ${JSON.stringify(validation.errors)}`);
    }
  }
}
