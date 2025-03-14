const DECISION_MODEL = 'meta-llama/llama-3.2-3b-instruct';
const BASE_RESPONSE_CHANCE = 0.25;

const DAILY_RESPONSE_LIMIT = 100 // Max immediate responses per human per day
const DAILY_RESET_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours in ms

export class DecisionMaker {
  constructor(aiService, logger) {
    this.aiService = aiService;
    this.logger = logger;

    // Mind modes for decision making
    this.mindModes = ["recursive", "quantum", "synthetic_intuition", "chaotic_analysis", "metacog_reflex"];
    this.currentMode = this.mindModes[Math.floor(Math.random() * this.mindModes.length)];

    // Conversation state tracking
    this.conversationState = new Map(); // channelId -> { participants: Set<avatarId>, lastActive: timestamp }
    this.RECENT_WINDOW = 5 * 60 * 1000;

    // Bot mention debounce
    this.botMentionDebounce = new Map(); // avatarId -> timestamp
    this.BOT_MENTION_COOLDOWN = 30000; // 30 seconds

    // -----------------------------
    // Per‐avatar cooldown & attention
    // -----------------------------
    this.PER_AVATAR_COOLDOWN = 2 * 60 * 1000; // e.g., 2 minutes
    this.MINIMUM_ATTENTION_THRESHOLD = 15;    // increased threshold for ambient responses
    this.ATTENTION_DECAY_INTERVAL = 45 * 1000; // faster decay for regular avatars
    this.ATTENTION_DECAY_RATE = 0.95;          // decay rate per minute
    this.RECENT_SUMMON_WINDOW = 10 * 60 * 1000;  // 10 minute window for recent summons
    this.RECENT_SUMMON_COOLDOWN = 30 * 1000;     // 30 second cooldown for recent summons

    // Store attention state in a Map => avatarId -> { level, lastResponse, lastMention, cooldown }
    this.attentionStates = new Map();
    // Track how many times each human user has been responded to
    this.dailyHumanResponseCount = new Map(); // userId -> { count, lastReset }
  }

  _getHumanResponseCount(userId) {
    const now = Date.now();
    let record = this.dailyHumanResponseCount.get(userId);

    if (!record || now - record.lastReset > DAILY_RESET_INTERVAL) {
      record = { count: 0, lastReset: now };
      this.dailyHumanResponseCount.set(userId, record);
    }
    return record;
  }

  
  // Unified state management
  _getState(avatarId) {
    if (!this.attentionStates.has(avatarId)) {
      this.attentionStates.set(avatarId, {
        level: 0,
        lastResponse: 0,
        lastMention: 0,
        cooldown: 30000
      });
    }
    return this.attentionStates.get(avatarId);
  }

  _updateAttention(avatarId, delta) {
    const state = this._getState(avatarId);
    state.level = Math.max(0, state.level + delta);
    this.attentionStates.set(avatarId, state);
  }

  _decayAttention(avatarId) {
    const state = this._getState(avatarId);
    const minutesSinceLast = (Date.now() - state.lastResponse) / 60000;
    state.level *= Math.pow(this.ATTENTION_DECAY_RATE, minutesSinceLast);
    this.attentionStates.set(avatarId, state);
  }

  // Conversation tracking
  _updateConversation(channelId, avatarId) {
    if (!this.conversationState.has(channelId)) {
      this.conversationState.set(channelId, {
        participants: new Set(),
        lastActive: Date.now()
      });
    }
    const conversation = this.conversationState.get(channelId);
    conversation.participants.add(avatarId);
    conversation.lastActive = Date.now();
  }

  async shouldRespond(channel, avatar, client) {
    if (!channel?.id || !avatar?.id) return false;

    // Check if recently summoned
    const isRecentlySummoned = Date.now() - (avatar.summonedAt || 0) < this.RECENT_SUMMON_WINDOW;

    // Use different cooldown for recent summons
    const effectiveCooldown = isRecentlySummoned ?
      this.RECENT_SUMMON_COOLDOWN :
      this.PER_AVATAR_COOLDOWN;

    // Decay attention first
    this._decayAttention(avatar.id);

    // Check avatar cooldown using the stored lastResponse timestamp
    const { lastResponse } = this._getState(avatar.id);
    if (Date.now() - lastResponse < effectiveCooldown) {
      return false;
    }

    // Boost attention for recently summoned avatars
    if (isRecentlySummoned) {
      this._updateAttention(avatar.id, + 50);
    }

    const messages = await channel.messages.fetch({ limit: 8 });
    if (!messages.size) return false;

    const lastMessage = messages.first();
    const isBotMessage = lastMessage.author.bot;
    const isHuman = !lastMessage.author.bot;

    // Direct mention handling (either bot or human mention)
    const mentioned = lastMessage.content.toLowerCase().includes(avatar.name.toLowerCase()) ||
      (avatar.emoji && lastMessage.content.includes(avatar.emoji));

    if (mentioned) {
      this._updateAttention(avatar.id, isBotMessage ? 20 : 30);
      this._updateConversation(channel.id, avatar.id);
      return true;
    }

    // Bot interaction dynamics
    if (isBotMessage) {
      const conversation = this.conversationState.get(channel.id);
      const activeParticipants = conversation?.participants.size || 0;

      // Dynamic response chance based on conversation activity
      const responseChance = Math.min(0.8, BASE_RESPONSE_CHANCE * (activeParticipants + 1));
      if (Math.random() > responseChance) return false;
    }

    // Enforce daily limit for human responses
    if (isHuman) {
      const record = this._getHumanResponseCount(lastMessage.author.id);
      if (record.count >= DAILY_RESPONSE_LIMIT) {
        return false; // Skip response if limit is reached
      }
      
      // For human messages, calculate time since message was sent
      const timeSinceHumanMessage = Date.now() - lastMessage.createdTimestamp;
      
      // Prioritize responses to human messages within 30 seconds
      // Increase likelihood of response if we're within the 30-second window
      if (timeSinceHumanMessage < 30000) {
        // Very high chance to respond to humans in the first 30 seconds
        this._updateAttention(avatar.id, 30); // Boost attention
        
        // Skip the usual attention threshold check for human messages within 30 seconds
        // But still maintain a small random chance of not responding
        if (Math.random() < 0.8) {
          this.logger.debug(`Prioritizing response to human message within 30s window`);
          
          // Skip cooldown check for quick human responses
          const state = this._getState(avatar.id);
          state.lastResponse = Date.now() - this.PER_AVATAR_COOLDOWN + 1000;
          
          return true;
        }
      }
    }

    // Attention threshold check
    const state = this._getState(avatar.id);
    if (state.level < this.MINIMUM_ATTENTION_THRESHOLD) return false;

    // AI decision making: further evaluate based on contextual conversation
    const shouldReply = await this._evaluateContextualResponse(avatar, messages, lastMessage.author.bot);

    if (shouldReply && isHuman) {
      const record = this._getHumanResponseCount(lastMessage.author.id);
      record.count += 1;
      this.dailyHumanResponseCount.set(lastMessage.author.id, record);
    }

    return shouldReply;
  }

  async _evaluateContextualResponse(avatar, messages, isBotInteraction) {
    // Get last 5 messages
    const lastFiveMessages = Array.from(messages).slice(0, 5);
    
    // Get consecutive bot messages from the end
    let consecutiveBotMessages = 0;
    
    // Track if recent messages were from this same avatar
    let consecutiveSameAvatarMessages = 0;
    
    for (const msg of lastFiveMessages) {
      if (msg.author.bot) {
        consecutiveBotMessages++;
        
        // Check if the message is from the same avatar (matching name and emoji)
        const botName = msg.author.username;
        const botEmoji = msg.author.avatar; // Assuming emoji might be stored in avatar
        
        // Different ways to identify the same avatar
        const isSameAvatar = 
          (botName === avatar.name) || 
          (botName.includes(avatar.name) && botName.includes(avatar.emoji || '')) ||
          (msg.webhookId && botName.startsWith(avatar.name));
          
        if (isSameAvatar) {
          consecutiveSameAvatarMessages++;
        } else {
          break; // Stop counting if we encounter a different avatar
        }
      } else {
        break;
      }
    }

    // Skip if there are 2 or more consecutive bot messages
    if (consecutiveBotMessages >= 2) {
      this.logger.debug(`${consecutiveBotMessages} consecutive bot messages - skipping response`);
      return false;
    }
    
    // Skip if the last 3 or more messages were from this same avatar
    if (consecutiveSameAvatarMessages >= 3) {
      this.logger.debug(`${consecutiveSameAvatarMessages} consecutive messages from ${avatar.name} - preventing self-conversation`);
      return false;
    }

    // Reduce base response chance for bot messages
    if (lastFiveMessages.length > 0 && lastFiveMessages[0].author.bot) {
      this.logger.debug('Last message was from bot - reducing response chance');
      return Math.random() > 0.9; // Only 10% chance to respond to bot messages
    }

    if (isBotInteraction) {
      return Math.random() > 0.5; // 50% chance to respond to direct bot interactions
    }

    try {
      const context = messages.reverse().map(m => ({
        role: m.author.bot ? 'assistant' : 'user',
        content: `${m.author.username}: ${m.content}`
      }));

      const decisionPrompt = [
        ...context,
        {
          role: 'user',
          content: `As ${avatar.name}, should you respond? Consider:\n` +
            `- Conversation flow\n- Relevance to your role\n- Recent activity\n` +
            `Answer ONLY with YES or NO:`
        }
      ];

      const response = await this.aiService.chat(decisionPrompt, {
        model: DECISION_MODEL,
        temperature: isBotInteraction ? 0.7 : 0.5,
        max_tokens: 50
      });

      const decision = response.trim().toUpperCase().startsWith('YES');

      if (decision) {
        const state = this._getState(avatar.id);
        state.lastResponse = Date.now();
        state.cooldown = isBotInteraction ? 45000 : 60000;
        
        // Generate haiku based on current mind mode
        if (avatar.innerMonologueChannel) {
          const haiku = await this.aiService.chat([
            { role: 'system', content: `You are a haiku generator. Create a haiku that reflects the ${this.currentMode} mind mode.` },
            { role: 'user', content: 'Generate a single haiku.' }
          ], { model: DECISION_MODEL });
          
          // Post haiku to inner monologue
          const { sendAsWebhook } = await import('../discordService.mjs');
          sendAsWebhook(
            avatar.innerMonologueChannel,
            `🧠 [${this.currentMode}]\n${haiku}`,
            avatar
          );
        }
        
        // Reduce attention after responding
        this._updateAttention(avatar.id, -10);
        
        // Switch to new random mind mode
        this.currentMode = this.mindModes[Math.floor(Math.random() * this.mindModes.length)];
      }

      return decision;
    } catch (error) {
      this.logger.error(`Decision error: ${error.message}`);
      return false;
    }
  }
}
