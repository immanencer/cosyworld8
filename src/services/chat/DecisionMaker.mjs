import { sendAsWebhook } from "../discordService.mjs";

const DECISION_MODEL = 'meta-llama/llama-3.2-1b-instruct';
const MINIMUM_RESPONSE_PERCENTAGE = 0.05;

export class DecisionMaker {
  constructor(aiService, logger) {
    this.aiService = aiService;
    this.logger = logger;
    this.recentResponses = new Map(); // channelId -> Map<avatarId, timestamp>
    this.RECENT_WINDOW = 5 * 60 * 1000; // 5 minutes
    this.botMentionDebounce = new Map(); // avatarId -> timestamp
    this.BOT_MENTION_COOLDOWN = 30000; // 30 seconds
  }

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

  async shouldRespond(channel, avatar, client) {
    // Validate channel and avatar
    if (!channel || !channel.id || typeof channel.id !== 'string') {
      this.logger.error('Invalid channel provided to shouldRespond:', channel);
      return false;
    }

    // get the latest few messages in the channel
    const messages = await channel.messages.fetch({ limit: 8 });
    // calculate the percentage of messages that are from .bot
    const botMessageCount = messages.filter(m => m.author.bot).size;
    const botMessagePercentage = ( botMessageCount / messages.size) - MINIMUM_RESPONSE_PERCENTAGE;

    const lastMessage = messages.first();

    // if the author username is the same as the avatar name, don't respond
    if (lastMessage.author.username.toLowerCase() === avatar.name.toLowerCase()) {
      return false;
    }
    const isAvatarMentioned = lastMessage.content.toLowerCase().includes(avatar.name.toLowerCase()) ||
      (avatar.emoji && lastMessage.content.includes(avatar.emoji));
    if (isAvatarMentioned) {
      return !lastMessage.author.bot || Math.random() > botMessagePercentage;
    }

    if (!avatar._id || !avatar.name) {
      this.logger.error('DecisionMaker received avatar with missing id or name:', JSON.stringify(avatar, null, 2));
      return false;
    }

    try {
      // Get recent messages for context
      if (!lastMessage) {
        return false;
      }
      if (lastMessage.author.bot && lastMessage.author.username.toLowerCase() === avatar.name.toLowerCase()) {
        return false;
      }
      const context = messages.reverse().map(m => ({
        role: m.author.bot ? 'assistant' : 'user',
        content: `${m.author.username}: ${m.content}`
      }));

      const decision = await this.makeDecision(avatar, context, client);
      return decision.decision === 'YES';

    } catch (error) {
      this.logger.error(`Error in shouldRespond: ${error.message}`);
      return false;
    }
  }

  avatarLastCheck = {};
  async makeDecision(avatar, context, client) {

    this.avatarLastCheck[avatar._id] = this.avatarLastCheck[avatar._id] || {
      decision: 'NO',
      timestamp: Date.now()
    }


    // if the last message was from the avatar, don't respond
    if (context.length && context[context.length - 1].role === 'assistant' && `${context[context.length - 1].content}`.startsWith(avatar.name + ':')) {
      return { decision: 'NO', reason: 'Last message was from the avatar.' };
    }

    // if the last message mentioned the avatar, respond
    if (context.length && `${context[context.length - 1].content}`.toLowerCase().includes(avatar.name.toLowerCase())) {
      return { decision: 'YES', reason: 'Last message mentioned the avatar.' };
    }

    // if the last message mentioned the avatars emoji, respond
    if (context.length && `${context[context.length - 1].content}`.includes(avatar.emoji)) {
      return { decision: 'YES', reason: 'Last message mentioned the avatar emoji.' };
    }

    // if the last decision was made less than 5 minutes ago, return the same decision
    if (Date.now() - this.avatarLastCheck[avatar._id].timestamp < 5 * 60 * 1000) {
      return this.avatarLastCheck[avatar._id];
    }



    try {

      const decisionPrompt = [
        ...context, { role: 'user', content: `As ${avatar.name}, analyze the conversation with a haiku.
        Then, on a new line, respond with "YES" if it indicates you should respond. Or "NO" to remain silent.` }
      ];
      const aiResponse = await this.aiService.chat(decisionPrompt, { model: DECISION_MODEL });

      console.log(`${avatar.name} thinks: `, aiResponse);
      const aiLines = aiResponse.split('\n').map(l => l.trim());
      const decision = (aiLines[aiLines.length - 1].toUpperCase().indexOf('YES') !== -1) ? { decision: 'NO' } : { decision: 'YES' };
      decision.reason = aiLines.slice(0, -1).join('\n').trim();

      // Post the haiku to the avatars inner monologue
      if (avatar.innerMonologueChannel) {
        sendAsWebhook(
          avatar.innerMonologueChannel,
          aiLines.slice(0, -1).join('\n').trim(),
          avatar.name, avatar.imageUrl
        );
      }

      if (!decision.decision || !decision.reason) {
        this.logger.warn(`Invalid decision format from AI for avatar ${avatar.id}`);
        return { decision: 'NO', reason: 'Invalid decision format.' };
      }

      return decision;
    } catch (error) {
      this.logger.error(`Error making decision for avatar ${avatar.id}: ${error.message}`);
      return { decision: 'NO', reason: 'Error processing decision.' };
    }
  }
}