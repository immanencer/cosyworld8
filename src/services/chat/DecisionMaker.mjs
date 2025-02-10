const DECISION_MODEL = 'meta-llama/llama-3.2-3b-instruct';
const BASE_RESPONSE_CHANCE = 0.25;

export class DecisionMaker {
  constructor(aiService, logger) {
    this.aiService = aiService;
    this.logger = logger;

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
    this.RECENT_SUMMON_WINDOW = 10 * 60 * 1000; // 10 minute window for recent summons
    this.RECENT_SUMMON_COOLDOWN = 30 * 1000; // 30 second cooldown for recent summons

    // Store attention state in a Map => avatarId -> { level, lastResponseTime, lastMentionTime, lastCheckTime }
    this.avatarAttentionMap = new Map();
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
    this._decayAttention(avatar._id);

    // Check avatar cooldown
    const { lastResponseTime } = this._getAttentionState(avatar._id);
    if (Date.now() - lastResponseTime < effectiveCooldown) {
      return false;
    }

    // Boost recently summoned avatars
    if (isRecentlySummoned) {
      this._adjustAttention(avatar._id, +20);
    }

    const messages = await channel.messages.fetch({ limit: 8 });
    if (!messages.size) return false;

    const lastMessage = messages.first();
    const isBotMessage = lastMessage.author.bot;

    // Direct mention handling (bot or human)
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

    // Attention threshold check
    if (state.level < this.MIN_ATTENTION) return false;

    // AI decision making
    return this._evaluateContextualResponse(avatar, messages, isBotMessage);
  }

  async _evaluateContextualResponse(avatar, messages, isBotInteraction) {
    if (isBotInteraction) {
      return true; // Always respond to bot interactions
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
          content: `As ${avatar.name}, ` +
            `should you respond? Consider:\n` +
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
        this._updateAttention(avatar.id, -10);
      }

      return decision;
    } catch (error) {
      this.logger.error(`Decision error: ${error.message}`);
      return false;
    }
  }
}