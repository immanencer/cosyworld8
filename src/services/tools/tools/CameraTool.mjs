import { BasicTool } from '../BasicTool.mjs';

export class CameraTool extends BasicTool {
  requiredServices = [
    'aiService',
    'imageProcessingService',
    'xService',
    'discordService',
    's3Service',
    'locationService',
    'avatarService',
    'itemService',
    'databaseService',
  ]
  constructor(services) {
    super(services);
    
    this.name = 'camera';
    this.emoji = '📸';
    this.description = 'Take a snapshot and post it to social media.';
    this.replyNotification = true;
    this.cooldownMs = 60 * 1000; // 1 minute cooldown
  }

  async execute(message, params, avatar) {
    try {
      const prompt = params.length ? params.join(' ') : `A snapshot of the avatar ${avatar.name} in the current scene.`;
      // Try to gather avatar, location, and item images as base64
      let images = [];
      // Avatar image
      if (avatar.imageUrl) {
        const buffer = await this.s3Service.downloadImage(avatar.imageUrl);
        images.push({ data: buffer.toString('base64'), mimeType: 'image/png', label: 'avatar' });
      }

      const location = this.locationService.getLocationByChannelId(message.channel.id);
      // Location image (if available)
      if (location && location.imageUrl) {
        const buffer = await this.s3Service.downloadImage(avatar.location.imageUrl);
        images.push({ data: buffer.toString('base64'), mimeType: 'image/png', label: 'location' });
      }
      // Item image (if avatar has a selected item with imageUrl)
      const item = avatar.inventory?.find(i => i.selected && i.imageUrl) || avatar.inventory?.[0];
      if (item && item.imageUrl) {
        const buffer = await this.s3Service.downloadImage(item.imageUrl);
        images.push({ data: buffer.toString('base64'), mimeType: 'image/png', label: 'item' });
      }

      let contextPrompt = '';
      if (avatar) {
        contextPrompt += `\nSubject: ${avatar.name || ''} ${avatar.emoji || ''}. Description: ${avatar.description || ''}`;
      }
      if (location) {
        contextPrompt += `\nLocation: ${location.name || ''}. Description: ${location.description || ''}`;
      }
      if (item) {
        contextPrompt += `\nItem held: ${item.name || ''}. Description: ${item.description || ''}`;
      }


      let imageUrl;
      if (images.length >= 1 && this.aiService?.composeImageWithGemini) {
        // Compose a scene using Gemini's image editing
        const scenePrompt = `
        You are a master photographer.
        Take a casual polaroid snapshot in a hazy cyberpunk 80s world, and write a cryptic note on it:
        
        Some context on the subjects:

        ${contextPrompt}

        The scene is a snapshot of the following elements:

        Your image should emotionally convey the following:
        
        ${prompt} 
        `;
        console.log(scenePrompt);
        const composedBase64 = await this.aiService.composeImageWithGemini(images, scenePrompt);
        if (composedBase64) {
          // Optionally upload to your image host, or use as data URL
          imageUrl = composedBase64;
        }
      }
      // Fallback to previous logic if composition not possible
      if (!imageUrl) {
        // if (this.imageProcessingService) {
        //   imageUrl = await this.imageProcessingService.generateImage(prompt, avatar);
        // } else 
        if (this.aiService) {
          imageUrl = await this.aiService.generateImage(prompt, avatar);
        } else {
          return '-# [ ❌ Error: No image generation service available. ]';
        }
      }
      if (!imageUrl) return `-# [ ❌ Error: Failed to generate image. ]`;

      let postedToX = false;
      let xResult = '';
      const isXAuthorized = await this.xService.isXAuthorized(avatar._id.toString());
      if (isXAuthorized) {
        xResult = await this.xService.postImageToX(avatar, imageUrl, prompt);
        postedToX = true;
      }
      return postedToX ? xResult : `-# [ 📸 [Snapshot taken.](${imageUrl}) ]`;
    } catch (error) {
      this.logger?.error('Error in CameraTool:', error);
      return `-# [ ❌ Error: Failed to take snapshot: ${error.message} ]`;
    }
  }

  getDescription() {
    return 'Take a snapshot and post it to social media (X or simulated feed).';
  }

  async getSyntax() {
    return `${this.emoji} [description of scene]`;
  }
}
