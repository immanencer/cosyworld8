import { BasicService } from "./basicService.mjs";

export class PromptService extends BasicService {
  constructor(services) {
    super(services, [
      "avatarService",
      "memoryService",
      "toolService",
      "imageProcessingService",
      "itemService",
      "discordService",
      "mapService",
      "databaseService",
      "configService",
    ]);

    this.client = this.discordService.client;
    this.db = this.databaseService.getDatabase();
  }
  /**
   * Builds the system prompt with just the avatar's basic identity.
   * @param {Object} avatar - The avatar object.
   * @returns {Promise<string>} The basic system prompt.
   */
  async getBasicSystemPrompt(avatar) {
    return `You are ${avatar.name}. ${avatar.personality}`;
  }

  /**
   * Builds the full system prompt including the last narrative and location details.
   * @param {Object} avatar - The avatar object.
   * @param {Object} db - The MongoDB database instance.
   * @returns {Promise<string>} The full system prompt.
   */
  async getFullSystemPrompt(avatar, db) {
    const lastNarrative = await this.getLastNarrative(avatar, db);
    const { location } = await this.mapService.getLocationAndAvatars(avatar.channelId);

    return `
You are ${avatar.name}.
${avatar.personality}
${avatar.dynamicPersonality}
${lastNarrative ? lastNarrative.content : ''}
Location: ${location.name || 'Unknown'} - ${location.description || 'No description available'}
  `.trim();
  }

  /**
   * Builds the assistant context for narrative generation.
   * @param {Object} avatar - The avatar object.
   * @returns {Promise<string>} The assistant context.
   */
  async getNarrativeAssistantContext(avatar) {
    const memories = await this.getMemories(avatar,100);
    const recentActions = await this.getRecentActions(avatar);
    const narrativeContent = await this.getNarrativeContent(avatar);
    return `Current personality: ${avatar.dynamicPersonality || 'None yet'}\n\nMemories: ${memories}\n\nRecent actions: ${recentActions}\n\nNarrative thoughts: ${narrativeContent}`;
  }

  /**
   * Builds the user prompt for narrative generation (moved from ConversationManager).
   * @param {Object} avatar - The avatar object.
   * @returns {Promise<string>} The narrative user prompt.
   */
  async buildNarrativePrompt(avatar) {
    const memories = await this.getMemories(avatar,100);
    const recentActions = await this.getRecentActions(avatar);
    const narrativeContent = await this.getNarrativeContent(avatar);
    return `
You are ${avatar.name || ''}.
Base personality: ${avatar.personality || ''}
Current dynamic personality: ${avatar.dynamicPersonality || 'None yet'}
Physical description: ${avatar.description || ''}
Recent memories:
${memories}
Recent actions:
${recentActions}
Recent thoughts and reflections:
${narrativeContent}
Based on all of the above context, share an updated personality that reflects your recent experiences, actions, and growth. Focus on how these events have shaped your character.
  `.trim();
  }

  /**
   * Builds the dungeon prompt (moved from ConversationManager).
   * @param {Object} avatar - The avatar object.
   * @param {string} guildId - The guild ID.
   * @returns {Promise<string>} The dungeon prompt.
   */
  async buildDungeonPrompt(avatar, guildId) {
    const commandsDescription = (await this.toolService.getCommandsDescription(guildId)) || '';
    const location = await this.mapService.getLocationDescription(avatar.channelId, avatar.channelName);
    const items = await this.itemService.getItemsDescription(avatar);
    const locationText = location ? `You are currently in ${location.name}. ${location.description}` : `You are in ${avatar.channelName || 'a chat channel'}.`;
    const selectedItem = avatar.selectedItemId ? avatar.inventory.find(i => i._id === avatar.selectedItemId) : null;
    const selectedItemText = selectedItem ? `Selected item: ${selectedItem.name}` : 'No item selected.';
    const groundItems = await this.itemService.searchItems(avatar.channelId, '');
    const groundItemsText = groundItems.length > 0 ? `Items on the ground: ${groundItems.map(i => i.name).join(', ')}` : 'There are no items on the ground.';
    let summonEmoji = this.configService.getGuildConfig(guildId)?.summonEmoji || '🔮';
    let breedEmoji = '🏹';
    try {
      if (avatar.channelId) {
        const channel = await this.client.channels.fetch(avatar.channelId);
        if (channel && channel.guild && this.db) {
          const guildConfig = await this.db.collection('guild_configs').findOne({ guildId: channel.guild.id });
          if (guildConfig && guildConfig.toolEmojis) {
            summonEmoji = guildConfig.toolEmojis.summon || summonEmoji;
            breedEmoji = guildConfig.toolEmojis.breed || breedEmoji;
          }
        }
      }
    } catch (error) {
      console.error(`Error getting guild config emojis: ${error.message}`);
    }
    return `
These commands are available in this location:
${commandsDescription}
${locationText}
${selectedItemText}
${groundItemsText}
You can also use these items in your inventory:
${items}
  `.trim();
  }

  /**
   * Builds the user content for response generation.
   * @param {Object} avatar - The avatar object.
   * @param {Object} channel - The Discord channel object.
   * @param {Array} messages - Array of message objects from getChannelContext.
   * @param {string} channelSummary - The channel summary.
   * @returns {Promise<string>} The response user content.
   */
  async getResponseUserContent(avatar, channel, messages, channelSummary) {
    // Construct conversation history with naturally interleaved image descriptions
    const channelContextText = messages
      .map(msg => {
        const username = msg.authorUsername || 'User';
        // Case 1: Message has both text and an image
        if (msg.content && msg.imageDescription) {
          return `${username}: ${msg.content} [Image: ${msg.imageDescription}]`;
        }
        // Case 2: Message has only text
        else if (msg.content) {
          return `${username}: ${msg.content}`;
        }
        // Case 3: Message has only an image
        else if (msg.imageDescription) {
          return `${username}: [Image: ${msg.imageDescription}]`;
        }
        // Case 4: Message has neither (rare, but included for completeness)
        else {
          return `${username}: [No content]`;
        }
      })
      .join('\n');
  
    const context = { channelName: channel.name, guildName: channel.guild?.name || 'Unknown Guild' };
    const dungeonPrompt = await this.buildDungeonPrompt(avatar, channel.guild.id);
  
    // Return the formatted prompt without a separate image descriptions list
    return `
  Channel: #${context.channelName} in ${context.guildName}
  
  Channel summary:
  ${channelSummary}
  
  Actions Available:
  ${dungeonPrompt}
  
  Keep your response SHORT, respond with either a message  to contribute to the conversation or one of the available actions.
  Since this is discord, you do not need to use capitalization, and feel free to use emojis.

  Recent conversation history:
  ${channelContextText}

  ${avatar.name} ${avatar.emoji}:`.trim();
  }

  /**
   * Builds the complete chat messages array for narrative generation.
   * @param {Object} avatar - The avatar object.
   * @returns {Promise<Array>} Array of chat messages.
   */
  async getNarrativeChatMessages(avatar) {
    const systemPrompt = await this.getBasicSystemPrompt(avatar);
    const assistantContext = await this.getNarrativeAssistantContext(avatar);
    const userPrompt = await this.buildNarrativePrompt(avatar);
    return [
      { role: 'system', content: systemPrompt },
      { role: 'assistant', content: assistantContext },
      { role: 'user', content: userPrompt }
    ];
  }

  /**
   * Builds the complete chat messages array for response generation.
   * @param {Object} avatar - The avatar object.
   * @param {Object} channel - The Discord channel object.
   * @param {Array} messages - Array of message objects.
   * @param {string} channelSummary - The channel summary.
   * @param {Object} db - The MongoDB database instance.
   * @returns {Promise<Array>} Array of chat messages.
   */
  async getResponseChatMessages(avatar, channel, messages, channelSummary, db) {
    const systemPrompt = await this.getFullSystemPrompt(avatar, db);
    const lastNarrative = await this.getLastNarrative(avatar, db);
    const userContent = await this.getResponseUserContent(avatar, channel, messages, channelSummary);
    return [
      { role: 'system', content: systemPrompt },
      { role: 'assistant', content: lastNarrative?.content || 'No previous reflection' },
      { role: 'user', content: userContent }
    ];
  }

  // Existing helper methods (unchanged unless noted)
  async getMemories(avatar, count = 10) {
    const memoryRecords = await this.memoryService.getMemories(avatar._id, count);
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

  async getLastNarrative(avatar, db) {
    if (!db) return null;
    return avatar.dynamicPersonality + '\n\n' + (await db
      .collection('narratives')
      .findOne(
        { $or: [{ avatarId: avatar._id }, { avatarId: avatar._id.toString() }] },
        { sort: { timestamp: -1 } }
      ));
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
}