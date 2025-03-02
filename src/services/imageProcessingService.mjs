
// imageProcessingService.mjs
import fetch from 'node-fetch';

export class ImageProcessingService {
  constructor(logger, aiService) {
    this.logger = logger || console;
    this.aiService = aiService;
  }

  /**
   * Fetch an image from a URL and convert it to base64
   * @param {string} url - The URL of the image to fetch
   * @returns {Promise<{data: string, mimeType: string}>} - The base64 encoded image data and mime type
   */
  async fetchImageAsBase64(url) {
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.startsWith('image/')) {
        throw new Error(`URL doesn't point to an image: ${contentType}`);
      }
      
      const buffer = await response.arrayBuffer();
      return {
        data: Buffer.from(buffer).toString('base64'),
        mimeType: contentType
      };
    } catch (error) {
      this.logger.error(`Error fetching image from URL: ${error.message}`);
      throw error;
    }
  }

  /**
   * Process a Discord message and extract all image attachments and embeds
   * @param {Object} message - The Discord message
   * @returns {Promise<Array<{url: string, base64: string, mimeType: string}>>} - Array of image data
   */
  async extractImagesFromMessage(message) {
    const images = [];
    
    try {
      // Process attachments
      if (message.attachments && message.attachments.size > 0) {
        for (const [_, attachment] of message.attachments) {
          if (attachment.contentType && attachment.contentType.startsWith('image/')) {
            try {
              const imageData = await this.fetchImageAsBase64(attachment.url);
              images.push({
                url: attachment.url,
                base64: imageData.data,
                mimeType: imageData.mimeType
              });
            } catch (error) {
              this.logger.error(`Failed to process attachment: ${error.message}`);
            }
          }
        }
      }
      
      // Process embeds that may contain images
      if (message.embeds && message.embeds.length > 0) {
        for (const embed of message.embeds) {
          if (embed.image && embed.image.url) {
            try {
              const imageData = await this.fetchImageAsBase64(embed.image.url);
              images.push({
                url: embed.image.url,
                base64: imageData.data,
                mimeType: imageData.mimeType
              });
            } catch (error) {
              this.logger.error(`Failed to process embed image: ${error.message}`);
            }
          }
          
          if (embed.thumbnail && embed.thumbnail.url) {
            try {
              const imageData = await this.fetchImageAsBase64(embed.thumbnail.url);
              images.push({
                url: embed.thumbnail.url,
                base64: imageData.data,
                mimeType: imageData.mimeType
              });
            } catch (error) {
              this.logger.error(`Failed to process embed thumbnail: ${error.message}`);
            }
          }
        }
      }
      
      // Process URLs in message content that might be images
      const urlRegex = /(https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|webp))/gi;
      const matches = message.content.match(urlRegex);
      
      if (matches) {
        for (const url of matches) {
          try {
            const imageData = await this.fetchImageAsBase64(url);
            images.push({
              url: url,
              base64: imageData.data,
              mimeType: imageData.mimeType
            });
          } catch (error) {
            this.logger.error(`Failed to process URL as image: ${error.message}`);
          }
        }
      }
      
      return images;
    } catch (error) {
      this.logger.error(`Error extracting images from message: ${error.message}`);
      return [];
    }
  }
}
