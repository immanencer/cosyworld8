import { sendAsWebhook } from "../discordService.mjs";

const DECISION_MODEL = 'meta-llama/llama-3.2-1b-instruct';
const MINIMUM_RESPONSE_PERCENTAGE = 0.05;

export class DecisionMaker {
  constructor(aiService, logger) {
    this.aiService = aiService;
    this.logger = logger;

    // Recent channel responses (for gating multiple bots)
    this.recentResponses = new Map(); // channelId -> Map<avatarId, timestamp>
    this.RECENT_WINDOW = 5 * 60 * 1000; // 5 minutes

    // Bot mention debounce
    this.botMentionDebounce = new Map(); // avatarId -> timestamp
    this.BOT_MENTION_COOLDOWN = 30000; // 30 seconds

    // -----------------------------
    // Per‐avatar cooldown & attention
    // -----------------------------
    this.PER_AVATAR_COOLDOWN = 2 * 60 * 1000; // e.g., 2 minutes
    this.MINIMUM_ATTENTION_THRESHOLD = 10;    // avatar must have at least 10 attention to respond
    this.ATTENTION_DECAY_INTERVAL = 60 * 1000; // degrade attention every 60 seconds (example)

    // Store attention state in a Map => avatarId -> { level, lastResponseTime, lastMentionTime, lastCheckTime }
    this.avatarAttentionMap = new Map();
  }

  /**
   * Get (or initialize) the attention object for a given avatarId.
   */
  _getAttentionState(avatarId) {
    if (!this.avatarAttentionMap.has(avatarId)) {
      this.avatarAttentionMap.set(avatarId, {
        level: 0,
        lastResponseTime: 0,
        lastMentionTime: 0,
        lastCheckTime: Date.now(),
      });
    }
    return this.avatarAttentionMap.get(avatarId);
  }

  /**
   * Increase or decrease attention safely, and track relevant timestamps.
   * Example usage:
   *   this._adjustAttention(avatar._id, +10) on mention
   *   this._adjustAttention(avatar._id, -5)  after responding
   */
  _adjustAttention(avatarId, delta) {
    const state = this._getAttentionState(avatarId);
    state.level = Math.max(0, state.level + delta);
    this.avatarAttentionMap.set(avatarId, state);
  }

  /**
   * Degrade the avatar's attention based on how long it's been since last check.
   * For instance, losing 1 point per minute.
   */
  _decayAttention(avatarId) {
    const now = Date.now();
    const state = this._getAttentionState(avatarId);

    const timeSinceLastCheck = now - state.lastCheckTime;
    if (timeSinceLastCheck > this.ATTENTION_DECAY_INTERVAL) {
      // For example, degrade 1 point per interval
      const intervals = Math.floor(timeSinceLastCheck / this.ATTENTION_DECAY_INTERVAL);
      state.level = Math.max(0, state.level - intervals);
      state.lastCheckTime = now;
    }

    this.avatarAttentionMap.set(avatarId, state);
  }

  /**
   * Mark an avatar as having responded, updating lastResponseTime and optionally reducing attention.
   */
  _markAvatarResponded(avatarId) {
    const state = this._getAttentionState(avatarId);
    state.lastResponseTime = Date.now();
    // Maybe reduce attention after responding so they don't spam
    this._adjustAttention(avatarId, -5);
  }

  // --------------------------------------------------------------------------

  trackResponse(channelId, avatarId) {
    if (!this.recentResponses.has(channelId)) {
      this.recentResponses.set(channelId, new Map());
    }
    this.recentResponses.get(channelId).set(avatarId, Date.now());
  }

  getRecentlyActiveAvatars(channelId) {
    const recent = this.recentResponses.get(channelId);
    if (!recent) return [];

    const now = Date.now();
    const activeAvatars = [];

    for (const [avatarId, timestamp] of recent) {
      if (now - timestamp < this.RECENT_WINDOW) {
        activeAvatars.push(avatarId);
      }
    }

    return activeAvatars;
  }

  /**
   * Main entry point: determine if the given avatar should respond in the channel.
   */
  async shouldRespond(channel, avatar, client) {
    // Validate channel and avatar
    if (!channel || !channel.id) {
      this.logger.error('Invalid channel provided to shouldRespond:', channel);
      return false;
    }
    if (!avatar || !avatar._id || !avatar.name) {
      this.logger.error('Invalid avatar provided to shouldRespond:', avatar);
      return false;
    }

    // Decay the avatar's attention each time we check
    this._decayAttention(avatar._id);

    // Check if avatar is on a cooldown
    const { lastResponseTime } = this._getAttentionState(avatar._id);
    const now = Date.now();
    if (now - lastResponseTime < this.PER_AVATAR_COOLDOWN) {
      // avatar is still on cooldown
      return false;
    }

    // Get the latest messages in the channel
    const messages = await channel.messages.fetch({ limit: 8 });
    if (!messages.size) return false;

    // Calculate the ratio of bot messages vs total
    const botMessageCount = messages.filter(m => m.author.bot).size;
    const botMessagePercentage = botMessageCount / messages.size - MINIMUM_RESPONSE_PERCENTAGE;

    const lastMessage = messages.first();
    if (!lastMessage) return false;

    // If the last message was from this same avatar, skip
    if (lastMessage.author.username.toLowerCase() === avatar.name.toLowerCase()) {
      return false;
    }

    // Check for mention of avatar name or emoji
    const isAvatarMentioned = lastMessage.content.toLowerCase().includes(avatar.name.toLowerCase()) ||
      (avatar.emoji && lastMessage.content.includes(avatar.emoji));
    if (isAvatarMentioned) {
      // Increase attention significantly when specifically mentioned
      this._adjustAttention(avatar._id, +15);

      // Only respond if not from a bot or if random chance passes for bot mention
      if (!lastMessage.author.bot || Math.random() > botMessagePercentage) {
        return await this._evaluateAIResponse(avatar, messages, client);
      }
      return false;
    }

    // If the avatar's attention is below threshold, skip
    const { level } = this._getAttentionState(avatar._id);
    if (level < this.MINIMUM_ATTENTION_THRESHOLD) {
      // Not enough attention to respond
      return false;
    }

    // Fallback: use AI logic to see if there's general context to respond
    return await this._evaluateAIResponse(avatar, messages, client);
  }

  /**
   * Helper to run the AI "decision" step.
   */
  async _evaluateAIResponse(avatar, messages, client) {
    try {
      // Reverse so oldest -> newest
      const context = messages
        .reverse()
        .map(m => ({
          role: m.author.bot ? 'assistant' : 'user',
          content: `${m.author.username}: ${m.content}`
        }));

      const decision = await this.makeDecision(avatar, context, client);
      if (decision.decision === 'YES') {
        // Mark avatar responded => sets cooldown and reduces attention
        this._markAvatarResponded(avatar._id);
        return true;
      }

      return false;
    } catch (error) {
      this.logger.error(`Error in _evaluateAIResponse for avatar ${avatar.name}: ${error.message}`);
      return false;
    }
  }

  // ------------------------------------------------------------------------------
  // Existing logic from here downward — keep or adjust as needed
  // ------------------------------------------------------------------------------

  avatarLastCheck = {};

  async makeDecision(avatar, context, client) {
    this.avatarLastCheck[avatar._id] = this.avatarLastCheck[avatar._id] || {
      decision: 'NO',
      timestamp: Date.now()
    };

    // If the last message was from the avatar, don't respond
    if (
      context.length &&
      context[context.length - 1].role === 'assistant' &&
      `${context[context.length - 1].content}`.startsWith(avatar.name + ':')
    ) {
      return { decision: 'NO', reason: 'Last message was from the avatar.' };
    }

    // If the last message explicitly mentioned the avatar or emoji
    if (context.length) {
      const lastLine = context[context.length - 1].content.toLowerCase();
      if (lastLine.includes(avatar.name.toLowerCase())) {
        return { decision: 'YES', reason: 'Last message mentioned the avatar name.' };
      }
      if (avatar.emoji && lastLine.includes(avatar.emoji)) {
        return { decision: 'YES', reason: 'Last message mentioned the avatar emoji.' };
      }
    }

    // If the last decision was made less than 5 minutes ago, reuse it
    if (Date.now() - this.avatarLastCheck[avatar._id].timestamp < 5 * 60 * 1000) {
      return this.avatarLastCheck[avatar._id];
    }

    try {
      const decisionPrompt = [
        ...context,
        {
          role: 'user',
          content: `
As ${avatar.name}, analyze the conversation with a haiku.
Then, on a new line, respond with "YES" if it indicates you should respond. 
Or "NO" to remain silent.
          `
        }
      ];

      const aiResponse = await this.aiService.chat(decisionPrompt, { model: DECISION_MODEL });
      this.logger.debug(`${avatar.name} thinks: ${aiResponse}`);

      const aiLines = aiResponse.split('\n').map(l => l.trim());
      // Quick check: if "YES" is found in the last line => respond, otherwise no
      const lastLine = aiLines[aiLines.length - 1].toUpperCase();
      const finalDecision = lastLine.includes('YES') ? 'YES' : 'NO';

      // Post the haiku to the avatar’s inner monologue (optional)
      if (avatar.innerMonologueChannel) {
        sendAsWebhook(
          avatar.innerMonologueChannel,
          aiLines.slice(0, -1).join('\n').trim(),  // everything except the final "YES"/"NO"
          avatar.name,
          avatar.imageUrl
        );
      }

      const decisionObj = {
        decision: finalDecision,
        reason: aiLines.slice(0, -1).join('\n').trim(),
        timestamp: Date.now()
      };
      this.avatarLastCheck[avatar._id] = decisionObj;
      return decisionObj;

    } catch (error) {
      this.logger.error(`Error making decision for avatar ${avatar._id}: ${error.message}`);
      return { decision: 'NO', reason: 'Error processing AI decision.' };
    }
  }
}
