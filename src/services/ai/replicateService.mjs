import fetch from 'node-fetch';

export class ReplicateService {
  constructor({ configService, logger }) {
    this.configService = configService;
    this.logger = logger;
    this.apiToken = configService?.config?.ai?.replicate?.apiToken || process.env.REPLICATE_API_TOKEN;
    this.model = configService?.config?.ai?.replicate?.model || 'black-forest-labs/flux-dev-lora';
    this.lora_weights = configService?.config?.ai?.replicate?.lora_weights;
    this.loraTriggerWord = configService?.config?.ai?.replicate?.loraTriggerWord;
    this.style = configService?.config?.ai?.replicate?.style || '';
  }

  /**
   * Generate an image using Replicate's flux-dev-lora model.
   * @param {string} prompt - The prompt for image generation.
   * @param {string[]} [images] - Optional array of image URLs/base64. Only one is supported; if multiple, one is chosen at random.
   * @param {object} [options] - Additional options (aspect_ratio, etc).
   * @returns {Promise<string|null>} - The URL of the generated image, or null on failure.
   */
  async generateImage(prompt, images = [], options = {}) {
    if (!this.apiToken) {
      this.logger?.error?.('[ReplicateService] Missing API token');
      return null;
    }
    let image = null;
    if (Array.isArray(images) && images.length > 0) {
      image = images[Math.floor(Math.random() * images.length)];
    }
    const payload = {
      version: this.model,
      input: {
        prompt: this.loraTriggerWord ? `${this.loraTriggerWord} ${prompt}` : prompt,
        lora_weights: this.lora_weights,
        style: this.style,
        aspect_ratio: options.aspect_ratio || '1:1',
        num_outputs: 1,
        go_fast: true,
        output_format: 'webp',
      },
    };
    if (image) payload.input.image = image;
    try {
      const response = await fetch('https://api.replicate.com/v1/predictions', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${this.apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        this.logger?.error?.(`[ReplicateService] API error: ${response.status} ${await response.text()}`);
        return null;
      }
      const data = await response.json();
      // Poll for completion if needed
      let prediction = data;
      while (prediction.status === 'starting' || prediction.status === 'processing') {
        await new Promise(r => setTimeout(r, 1500));
        const pollRes = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
          headers: { 'Authorization': `Token ${this.apiToken}` },
        });
        prediction = await pollRes.json();
      }
      if (prediction.status === 'succeeded' && Array.isArray(prediction.output) && prediction.output.length > 0) {
        return prediction.output[0];
      }
      this.logger?.error?.(`[ReplicateService] Generation failed: ${prediction.status}`);
      return null;
    } catch (error) {
      this.logger?.error?.('[ReplicateService] Error:', error.message);
      return null;
    }
  }
}
