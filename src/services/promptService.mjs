import { loggers } from "winston";

export class PromptService {
  constructor(avatarService, memoryService, toolService, imageProcessingService, client) {
    this.avatarService = avatarService;
    this.memoryService = memoryService;
    this.toolService = toolService;
    this.imageProcessingService = imageProcessingService;
    this.client = client; // Discord client for fetching channel data
  }

  /**
   * Builds a prompt for narrative generation.
   * @param {Object} avatar - The avatar object.
   * @returns {Promise<string>} The assembled narrative prompt.
   */
  async buildNarrativePrompt(avatar) {
    const identity = this.getAvatarIdentity(avatar);
    const dynamicPersonality = this.getDynamicPersonality(avatar);
    const memories = await this.getMemories(avatar);
    const recentActions = await this.getRecentActions(avatar);
    const narrativeContent = await this.getNarrativeContent(avatar);

    return `
${identity}

Dynamic Personality: ${dynamicPersonality}

Memories:
${memories || 'No memories yet.'}

Recent Actions:
${recentActions || 'No recent actions.'}

Previous Narrative:
${narrativeContent || 'No previous narrative content.'}

Based on the above, reflect on your recent experiences and how they have shaped your character.
    `.trim();
  }

  /**
   * Builds a prompt for a conversation response.
   * @param {Object} avatar - The avatar object.
   * @param {Object} channel - The Discord channel object.
   * @param {Array} messages - Array of recent message objects.
   * @returns {Promise<string>} The assembled response prompt.
   */
  async buildResponsePrompt(avatar, channel, messages) {
    const identity = this.getAvatarIdentity(avatar);
    const dynamicPersonality = this.getDynamicPersonality(avatar);
    const conversationHistory = this.getConversationHistory(messages);
    const availableCommands = await this.getAvailableCommands(avatar, channel);
    const imageDescriptions = await this.getImageDescriptions(messages);
    const context = `You are in channel #${channel.name} in ${channel.guild?.name || 'Unknown Guild'}.`;

    const prompt = `
${identity}

Dynamic Personality: ${dynamicPersonality}

${context}

Recent Conversation:
${conversationHistory || 'No recent conversation.'}

${imageDescriptions.length > 0 ? 'Recent Images:\n' + imageDescriptions.join('\n') : ''}

Available Commands:
${availableCommands || 'No commands available.'}

Respond to the conversation in character with a single short message.
    `.trim();

    console.debug(`Prompt: ${prompt}`);
  }

  /**
   * Builds a system prompt for the AI model.
   * @param {Object} avatar - The avatar object.
   * @param {Object} db - The MongoDB database instance.
   * @returns {Promise<string>} The system prompt.
   */
  async buildSystemPrompt(avatar, db) {
    const lastNarrative = await this.getLastNarrative(avatar, db);
    return `
You are ${avatar.name}.

${avatar.personality}

${lastNarrative ? lastNarrative.content : 'No previous reflection.'}
    `.trim();
  }

  // Helper Methods

  getAvatarIdentity(avatar) {
    return `You are ${avatar.name || 'Unnamed Avatar'}. Base Personality: ${avatar.personality || 'No personality defined.'} Physical Description: ${avatar.description || 'No description.'}`;
  }

  getDynamicPersonality(avatar) {
    return avatar.dynamicPersonality || 'None yet';
  }

  async getMemories(avatar) {
    const memoryRecords = await this.memoryService.getMemories(avatar._id);
    return memoryRecords.map(m => m.memory).join('\n');
  }

  async getRecentActions(avatar) {
    const recentActions = await this.toolService.ActionLog.getRecentActions(avatar.channelId);
    return recentActions
      .filter(action => action.actorId === avatar._id.toString())
      .map(a => `${a.description || a.action}`)
      .join('\n');
  }

  async getNarrativeContent(avatar) {
    if (!avatar.innerMonologueChannel) return '';
    try {
      const channel = await this.client.channels.fetch(avatar.innerMonologueChannel);
      const messages = await channel.messages.fetch({ limit: 10 });
      return messages
        .filter(m => !m.content.startsWith('🌪️'))
        .map(m => m.content)
        .join('\n');
    } catch (error) {
      console.error(`Error fetching narrative content: ${error.message}`);
      return '';
    }
  }

  getConversationHistory(messages) {
    return messages.map(msg => `${msg.author.username || 'User'}: ${msg.content || '[No content]'}`).join('\n');
  }

  async getAvailableCommands(avatar, channel) {
    const commandsDescription = this.toolService.getCommandsDescription(avatar, channel.guild.id) || '';
    const location = await this.mapService.getLocationDescription(avatar.channelId, channel.name);
    const items = await this.toolService.getItemsDescription(avatar);
    const locationText = location
      ? `You are currently in ${location.name}. ${location.description}`
      : `You are in ${channel.name || 'a chat channel'}.`;

    return `
${commandsDescription}

${locationText}

Items in your inventory: ${items || 'None'}
    `.trim();
  }

  async getImageDescriptions(messages) {
    if (!this.imageProcessingService) return [];
    const imageMessages = messages.filter(msg =>
      msg.attachments.some(a => a.contentType?.startsWith('image/')) ||
      msg.embeds.some(e => e.image || e.thumbnail)
    );
    const descriptions = [];
    for (const msg of imageMessages) {
      const images = await this.imageProcessingService.extractImagesFromMessage(msg);
      if (images.length > 0) {
        descriptions.push(`[Image: ${images[0].description || 'Description not available'}]`);
      }
    }
    return descriptions;
  }

  async getLastNarrative(avatar, db) {
    if (!db) return null;
    return await db
      .collection('narratives')
      .findOne(
        { $or: [{ avatarId: avatar._id }, { avatarId: avatar._id.toString() }] },
        { sort: { timestamp: -1 } }
      );
  }
}