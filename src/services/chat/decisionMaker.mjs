import { BasicService } from '../basicService.mjs';

// Configuration constants (consider moving to a config file or env variables)
const DECISION_MODEL = 'google/gemma-3-4b-it:free';
const BASE_RESPONSE_CHANCE = 0.25;
const DAILY_RESPONSE_LIMIT = 100; // Max immediate responses per human per day
const DAILY_RESET_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours in ms

export class DecisionMaker extends BasicService {
  constructor(services, config = {}) {
    super(services, ['aiService', 'logger']);

    // Configurable constants with defaults
    this.config = {
      RECENT_WINDOW: 5 * 60 * 1000,             // 5 minutes
      BOT_MENTION_COOLDOWN: 30 * 1000,         // 30 seconds
      PER_AVATAR_COOLDOWN: 2 * 60 * 1000,      // 2 minutes
      RECENT_SUMMON_WINDOW: 10 * 60 * 1000,    // 10 minutes
      RECENT_SUMMON_COOLDOWN: 30 * 1000,       // 30 seconds
      MINIMUM_ATTENTION_THRESHOLD: 15,
      ATTENTION_DECAY_RATE: 0.95,              // Decay rate per minute
      TOP_N: 8,
      RANDOM_N: 5,
      ...config
    };

    // Mind modes for varying behavior
    this.mindModes = ["recursive", "quantum", "synthetic_intuition", "chaotic_analysis", "metacog_reflex"];
    this.currentMode = this.mindModes[Math.floor(Math.random() * this.mindModes.length)];

    // State tracking
    this.conversationState = new Map();       // channelId -> { participants: Set, lastActive: timestamp }
    this.botMentionDebounce = new Map();      // avatarId -> timestamp
    this.attentionStates = new Map();         // avatarId -> { level, lastResponse, lastMention }
    this.dailyHumanResponseCount = new Map(); // userId -> { count, lastReset }
  }

  /** Get or reset human response count for daily limits */
  _getHumanResponseCount(userId) {
    const now = Date.now();
    const record = this.dailyHumanResponseCount.get(userId) || { count: 0, lastReset: now };
    if (now - record.lastReset > DAILY_RESET_INTERVAL) {
      record.count = 0;
      record.lastReset = now;
    }
    this.dailyHumanResponseCount.set(userId, record);
    return record;
  }

  /** Get or initialize attention state for an avatar */
  _getAttentionState(avatarId) {
    if (!this.attentionStates.has(avatarId)) {
      this.attentionStates.set(avatarId, {
        level: 0,
        lastResponse: 0,
        lastMention: 0
      });
    }
    return this.attentionStates.get(avatarId);
  }

  /** Update attention level with bounds */
  _updateAttention(avatarId, delta) {
    const state = this._getAttentionState(avatarId);
    state.level = Math.max(0, state.level + delta);
  }

  /** Decay attention based on time since last response */
  _decayAttention(avatarId) {
    const state = this._getAttentionState(avatarId);
    const minutesSinceLast = (Date.now() - state.lastResponse) / 60000;
    state.level *= Math.pow(this.config.ATTENTION_DECAY_RATE, minutesSinceLast);
  }

  /** Update conversation state with participant activity */
  _updateConversation(channelId, avatarId) {
    const conversation = this.conversationState.get(channelId) || {
      participants: new Set(),
      lastActive: Date.now()
    };
    conversation.participants.add(avatarId);
    conversation.lastActive = Date.now();
    this.conversationState.set(channelId, conversation);
  }

  /**
   * Selects a subset of avatars to consider for responding to a message.
   * @param {Array} avatars - List of all avatars in the channel.
   * @param {Object} message - The Discord message object.
   * @returns {Array} Subset of avatars to consider.
   */
  selectAvatarsToConsider(avatars, message) {
    // Filter avatars directly mentioned in the message
    const mentioned = avatars.filter(avatar => this._isMentioned(message, avatar));

    // Get remaining avatars (not mentioned)
    const remaining = avatars.filter(avatar => !mentioned.includes(avatar));

    // Sort remaining avatars by current attention level (descending)
    remaining.sort((a, b) => {
      const aLevel = this._getCurrentAttentionLevel(a.id);
      const bLevel = this._getCurrentAttentionLevel(b.id);
      return bLevel - aLevel;
    });

    // Select top N high-attention avatars (default N = 3)
    const topN = remaining.slice(0, this.config.TOP_N || 3);

    // Select M random avatars from the rest (default M = 2)
    const randomM = this._selectRandom(remaining.slice(this.config.TOP_N || 3), this.config.RANDOM_M || 2);

    // Combine into final subset
    return [...mentioned, ...topN, ...randomM];
  }

  /**
   * Calculates the current attention level with decay applied.
   * @param {string} avatarId - The ID of the avatar.
   * @returns {number} Current attention level.
   */
  _getCurrentAttentionLevel(avatarId) {
    const state = this._getAttentionState(avatarId);
    const minutesSinceLast = (Date.now() - state.lastResponse) / 60000;
    return state.level * Math.pow(this.config.ATTENTION_DECAY_RATE, minutesSinceLast);
  }

  /**
   * Selects a random subset of items from an array.
   * @param {Array} array - The array to select from.
   * @param {number} count - Number of items to select.
   * @returns {Array} Randomly selected items.
   */
  _selectRandom(array, count) {
    const shuffled = array.slice().sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  /** Main decision logic for whether to respond */
  async shouldRespond(channel, avatar) {
    if (!channel?.id) return false;
    if (!avatar?.id) {
      avatar.id = `${avatar._id.toString()}`;
    }

    const state = this._getAttentionState(avatar.id);
    const isRecentlySummoned = Date.now() - (avatar.summonedAt || 0) < this.config.RECENT_SUMMON_WINDOW;
    const effectiveCooldown = isRecentlySummoned ? this.config.RECENT_SUMMON_COOLDOWN : this.config.PER_AVATAR_COOLDOWN;

    // Decay attention and check cooldown
    this._decayAttention(avatar.id);
    if (Date.now() - state.lastResponse < effectiveCooldown) return false;

    // Boost attention for recent summons
    if (isRecentlySummoned) this._updateAttention(avatar.id, 50);

    // Fetch recent messages
    const messages = await channel.messages.fetch({ limit: 8 });
    if (!messages.size) return false;

    const lastMessage = messages.first();
    const isBot = lastMessage.author.bot;
    const isHuman = !isBot;

    // Check for direct mentions
    const mentioned = this._isMentioned(lastMessage, avatar);
    if (mentioned) {
      this._updateAttention(avatar.id, isBot ? 20 : 30);
      this._updateConversation(channel.id, avatar.id);
      return true;
    }

    // Handle bot interactions
    if (isBot) {
      const participants = this.conversationState.get(channel.id)?.participants.size || 0;
      const responseChance = Math.min(0.8, BASE_RESPONSE_CHANCE * (participants + 1));
      if (Math.random() > responseChance) return false;
    }

    // Handle human interactions with daily limits and quick response boost
    if (isHuman) {
      const record = this._getHumanResponseCount(lastMessage.author.id);
      if (record.count >= DAILY_RESPONSE_LIMIT) return false;

      const timeSinceMessage = Date.now() - lastMessage.createdTimestamp;
      if (timeSinceMessage < 30000) {
        this._updateAttention(avatar.id, 30);
        if (Math.random() < 0.8) {
          this.logger.debug(`Quick response to human message within 30s`);
          state.lastResponse = Date.now() - this.config.PER_AVATAR_COOLDOWN + 1000;
          return true;
        }
      }
    }

    // Check attention threshold
    if (state.level < this.config.MINIMUM_ATTENTION_THRESHOLD) return false;

    // Use AI for contextual decision
    const shouldReply = await this._evaluateContextualResponse(avatar, messages, isBot);
    if (shouldReply && isHuman) {
      const record = this._getHumanResponseCount(lastMessage.author.id);
      record.count += 1;
    }

    return shouldReply;
  }

  /** Check if the avatar is mentioned in the message */
  _isMentioned(message, avatar) {
    const content = message.content.toLowerCase();
    return content.includes(avatar.name.toLowerCase()) || (avatar.emoji && content.includes(avatar.emoji));
  }

  /** Evaluate response necessity using AI and conversation context */
  async _evaluateContextualResponse(avatar, messages, isBotInteraction) {
    const recentMessages = Array.from(messages).slice(0, 5);
    const { consecutiveBots, consecutiveSelf } = this._countConsecutiveMessages(recentMessages, avatar);

    if (this._isMentioned(recentMessages[0][1], avatar)) {
      return true;
    }

    // Prevent bot flooding or self-conversation
    if (consecutiveBots >= 2) {
      this.logger.debug(`${consecutiveBots} consecutive bot messages - skipping`);
      return false;
    }
    if (consecutiveSelf >= 3) {
      this.logger.debug(`${consecutiveSelf} consecutive self messages - skipping`);
      return false;
    }

    // Adjust response probability for bot messages
    if (recentMessages[0]?.[1].author.bot) {
      this.logger.debug('Reducing response chance for bot message');
      return Math.random() < 0.1; // 10% chance
    }

    if (isBotInteraction) return Math.random() < 0.2; // 50% chance

    // AI-based decision
    try {
      const context = messages.reverse().map(m => ({
        role: m.author.bot ? 'assistant' : 'user',
        content: `${m.author.username}: ${m.content}`
      }));
      const prompt = [
        ...context,
        {
          role: 'user',
          content: `As ${avatar.name}, should you respond? Consider conversation flow, relevance, and activity. Answer YES if the avatar should reply:`
        }
      ];

      const response = await this.aiService.chat(prompt, {
        model: DECISION_MODEL,
        temperature: 0.5,
        max_tokens: 32
      });
      console.log(response);
      const decision = response.trim().toUpperCase().indexOf('YES') !== -1;

      if (decision) {
        this._finalizeResponse(avatar);
      }

      return decision;
    } catch (error) {
      this.logger.error(`AI decision error: ${error.message}`);
      return false;
    }
  }

  /** Count consecutive bot and self messages */
  _countConsecutiveMessages(messages, avatar) {
    let consecutiveBots = 0;
    let consecutiveSelf = 0;

    for (const [, msg] of messages) {
      if (!msg.author.bot) break;
      consecutiveBots++;

      const isSelf = msg.author.username === avatar.name ||
        (msg.author.username.includes(avatar.name) && (!avatar.emoji || msg.author.username.includes(avatar.emoji)));
      if (isSelf) consecutiveSelf++;
      else break;
    }

    return { consecutiveBots, consecutiveSelf };
  }

  /** Finalize response actions (state updates, haiku, mode switch) */
  async _finalizeResponse(avatar) {
    const state = this._getAttentionState(avatar.id);
    state.lastResponse = Date.now();
    this._updateAttention(avatar.id, -10);

    if (avatar.innerMonologueChannel) {
      try {
        const haiku = await this.aiService.chat([
          { role: 'system', content: `Generate a haiku reflecting the ${this.currentMode} mind mode.` },
          { role: 'user', content: 'Create a single haiku.' }
        ], { model: DECISION_MODEL });

        const { sendAsWebhook } = await import('../discordService.mjs');
        await this.services.discordService.sendAsWebhook(avatar.innerMonologueChannel, `🧠 [${this.currentMode}]\n${haiku}`, avatar);
      } catch (error) {
        this.logger.error(`Haiku generation error: ${error.message}`);
      }
    }

    this.currentMode = this.mindModes[Math.floor(Math.random() * this.mindModes.length)];
  }
}