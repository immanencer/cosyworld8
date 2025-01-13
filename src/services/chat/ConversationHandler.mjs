import { MongoClient } from 'mongodb';

import { sendAsWebhook } from '../discordService.mjs';
import { MemoryService } from '../memoryService.mjs';

const GUILD_NAME = process.env.GUILD_NAME || 'The Guild';

export class ConversationHandler {
  constructor(client, aiService, logger, avatarService, dungeonService) {
    this.client = client;
    this.aiService = aiService;
    this.logger = logger;
    this.channelCooldowns = new Map();
    this.COOLDOWN_TIME = 6 * 60 * 60 * 1000; // 6 hours
    this.SUMMARY_LIMIT = 5;
    this.IDLE_TIME = 60 * 60 * 1000; // 1 hour
    this.lastUpdate = Date.now();
    this.avatarService = avatarService;
    this.dungeonService = dungeonService;
    this.memoryService = new MemoryService(this.logger);

    // Update cooldown times
    this.HUMAN_RESPONSE_COOLDOWN = 5000;  // 5 seconds for human messages
    this.BOT_RESPONSE_COOLDOWN = 300000;  // 5 minutes for bot messages
    this.INITIAL_RESPONSE_COOLDOWN = 10000; // 10 seconds after joining channel
    this.requiredPermissions = [
      'ViewChannel',
      'SendMessages',
      'ReadMessageHistory',
      'ManageWebhooks'
    ];
  }
  async checkChannelPermissions(channel) {
    try {
      // Get bot member in guild
      const member = channel.guild.members.cache.get(this.client.user.id);
      if (!member) return false;

      // Check required permissions
      const permissions = channel.permissionsFor(member);
      const missingPermissions = this.requiredPermissions.filter(perm =>
        !permissions.has(perm)
      );

      if (missingPermissions.length > 0) {
        this.logger.warn(`Missing permissions in channel ${channel.id}: ${missingPermissions.join(', ')}`);
        return false;
      }

      return true;

    } catch (error) {
      this.logger.error(`Permission check error for ${channel.id}: ${error.message}`);
      return false;
    }
  }


  /**
   * Unified method to generate a narrative for reflection or inner monologue.
   */
  async generateNarrative(avatar) {

    try {
      const lastNarrative = await this.getLastNarrative(avatar._id);
      if (lastNarrative && Date.now() - lastNarrative.timestamp < this.COOLDOWN_TIME) {
        this.logger.info(`Narrative cooldown active for ${avatar.name}`);
        return;
      }

      if (!avatar.model) {
        avatar.model = await this.aiService.selectRandomModel();
        await this.avatarService.updateAvatar(avatar);
      }
      const memories = (await this.memoryService.getMemories(avatar._id)).map(m => m.memory).join('\n');
      const prompt = await this.buildNarrativePrompt(avatar, [...memories]);

      const narrative = await this.aiService.chat([
        { role: 'system', content: avatar.prompt || `You are ${avatar.name}. ${avatar.personality}` },
        { role: 'assistant', content: `I remember: ${memories}` },
        { role: 'user', content: prompt }
      ], { model: avatar.model });

      // Store the narrative in the database and update the avatar
      await this.storeNarrative(avatar._id, narrative);
      this.updateNarrativeHistory(avatar, narrative);

      // generate a new dynamic prompt for the avatar based on their system prompt and the generated narrative
      avatar.prompt = await this.buildSystemPrompt(avatar);
      await this.avatarService.updateAvatar(avatar);


      return narrative;
    } catch (error) {
      this.logger.error(`Error generating narrative for ${avatar.name}: ${error.message}`);
      throw error;
    }
  }

  buildNarrativePrompt(avatar, memories) {
    const memoryPrompt = memories.map(m => (m.content || m.memory)).join('\n');
    return `I am ${avatar.name || ''}.
    
    ${avatar.personality || ''}
    
    ${avatar.description || ''}
    
    ${memoryPrompt}`;
  }

  async storeNarrative(avatarId, content) {
    try {
      const client = new MongoClient(process.env.MONGO_URI);
      await client.connect();
      const db = client.db(process.env.MONGO_DB_NAME);
      await db.collection('narratives').insertOne({
        avatarId,
        content,
        timestamp: Date.now()
      });
      await client.close();
    } catch (error) {
      this.logger.error(`Error storing narrative for avatar ${avatarId}: ${error.message}`);
      throw error;
    }
  }

  async getLastNarrative(avatarId) {
    try {
      const client = new MongoClient(process.env.MONGO_URI);
      await client.connect();
      const db = client.db(process.env.MONGO_DB_NAME);
      const lastNarrative = await db.collection('narratives')
        .findOne({ $or: [{ avatarId }, { avatarId: avatarId.toString() }, { avatarId: { $exists: false } }] }, { sort: { timestamp: -1 } });
      await client.close();
      return lastNarrative;
    } catch (error) {
      this.logger.error(`Error fetching last narrative for avatar ${avatarId}: ${error.message}`);
      throw error;
    }
  }

  updateNarrativeHistory(avatar, content) {

    if (avatar.innerMonologueChannel) {
      // Post the avatar's dynamic personality to the inner monologue channel 🌪️⚡
      sendAsWebhook(
        avatar.innerMonologueChannel,
        `🌪️ Dynamic Personality Update: ${avatar.dynamicPersonality}`,
        `${avatar.name} ${avatar.emoji}`, avatar.imageUrl
      );
    }

    const guildName = GUILD_NAME;
    const narrativeData = { timestamp: Date.now(), content, guildName };
    avatar.narrativeHistory = avatar.narrativeHistory || [];
    avatar.narrativeHistory.unshift(narrativeData);
    avatar.narrativeHistory = avatar.narrativeHistory.slice(0, this.SUMMARY_LIMIT);

    avatar.narrativesSummary = avatar.narrativeHistory
      .map(r => `[${new Date(r.timestamp).toLocaleDateString()}] ${r.guildName}: ${r.content}`)
      .join('\n\n');
  }

  async sendResponse(channel, avatar) {
    // Check permissions before attempting to send
    if (!await this.checkChannelPermissions(channel)) {
      this.logger.error(`Cannot send response - missing permissions in channel ${channelId}`);
      return null;
    }
    try {

      // Get recent channel messages
      const messages = await channel.messages.fetch({ limit: 18 });
      const messageHistory = messages.reverse().map(msg => ({
        author: msg.author.username,
        content: msg.content,
        timestamp: msg.createdTimestamp
      }));

      // if the last message was from this avatar, skip
      if (messageHistory[messageHistory.length - 1].author === avatar.name) {
        return;
      }

      // Get avatar's recent reflection
      const lastNarrative = await this.getLastNarrative(avatar._id);

      // Build context for response
      const context = {
        recentMessages: messageHistory,
        lastReflection: lastNarrative?.content || 'No previous reflection',
        channelName: channel.name,
        guildName: channel.guild.name
      };

      if (!avatar.model || typeof avatar.model !== 'string') {
        avatar.model = await this.aiService.selectRandomModel();
        await this.avatarService.updateAvatar(avatar);
      }

      avatar.channelName = channel.name;

      const systemPrompt = await this.buildSystemPrompt(avatar);
      // Generate response using AI service
      let response = await this.aiService.chat([
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `Channel: #${context.channelName} in ${context.guildName}
          Recent messages:
            ${context.recentMessages.map(m => `${m.author}: ${m.content}`).join('\n')}
          You are ${avatar.name}. Respond to the chat in character
           advancing your goals and keeping others engaged. 
          
          use emojis if u want
          capitalization spelling and punctuation are not important, just have fun
          relax any be yourself

          speak freely and have fun, no need to use capitals or proper spelling this is a 

          
          reply with a single short chatroom style sentence or *actions*, use emojis, 
          be silly, stay in character and ONLY provide a response as ${avatar.name} then stop.

          ${avatar.name}:`
        }
      ], {
        model: avatar.model,
        stop: '\n\n'
      });

      if (!response) {
        this.logger.error(`Empty response for ${avatar.name}`);
        return;
      }

      // if the response starts with the avatar name, remove it
      if (response.startsWith(avatar.name + ':')) {
        response = response.replace(avatar.name + ':', '').trim();
      }

      // if the response is more than 500 characters, truncate it at newlines.
      if (response.length > 2000) {
        console.warn(`✂️ Truncating response for ${avatar.name}`);
        response = response.substring(0, response.lastIndexOf('\n', 500));
      }

      // Extract and process tool commands using dungeonService
      const { commands, cleanText, commandLines } = this.dungeonService.extractToolCommands(response);

      let sentMessage;
      let commandResults = [];

      // Process commands first if any
      if (commands.length > 0) {
        this.logger.info(`Processing ${commands.length} commands for ${avatar.name}`);
        // Execute each command and collect results
        commandResults = await Promise.all(
          commands.map(cmd =>
            this.dungeonService.processAction(
              { channel, author: { id: avatar._id, username: avatar.name }, content: response },
              cmd.command,
              cmd.params,
              avatar
            )
          )
        );


        if (commandResults.length) {
          this.logger.info(`Command results for ${avatar.name}: ${commandResults.join(', ')}`);
          sentMessage = await sendAsWebhook(
            avatar.channelId,
            commandResults.join('\n'),
            '🛠️ ' + avatar.name,
            avatar.imageUrl
          );
        }

        // load the avatar again to get the updated state
        avatar = await this.avatarService.getAvatarById(avatar._id);
      }

      // Send the main response if there's clean text
      if (!commands.length || cleanText.trim()) {

        sentMessage = await sendAsWebhook(
          avatar.channelId,
          commands.length ? cleanText : response,
          avatar.name,
          avatar.imageUrl
        );
      }

      return response;

    } catch (error) {
      this.logger.error(`Error sending response for ${avatar.name}: ${error.message}`);
      throw error;
    }
  }

  async buildSystemPrompt(avatar) {
    // Get the most recent narrative for the avatar
    const lastNarrative = await this.getLastNarrative(avatar._id);

    const basePrompt = `You are ${avatar.name}.
    
    ${avatar.personality}

    ${lastNarrative ? `${lastNarrative.content}` : ''}
    `;
    const dungeonPrompt = `These commands are available in this location (you can also use breed and summon):
    
    ${this.dungeonService.getCommandsDescription(avatar)}
    
    You can use any of these commands on a new line at the end of your message.
  `;

    // Add location awareness to the prompt
    const location = await this.dungeonService.getLocationDescription(avatar.channelId, avatar.channelName);
    const locationPrompt = location ?
      `\n\nYou are currently in ${location.name}. ${location.description}` :
      `\n\nYou are in ${avatar.channelName || 'a chat channel'}.`;


    return basePrompt + locationPrompt + dungeonPrompt;
  }
}