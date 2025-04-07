import { BasicService } from '../foundation/basicService.mjs';

export class ModerationService extends BasicService {
  constructor(services) {
    super(services);
    this.services = services;
    this.logger = services.logger;
    this.aiService = services.aiService;
    this.databaseService = services.databaseService;
    this.toolService = services.toolService;
    this.riskManagerService = services.riskManagerService;

    this.staticModerationRegexes = [
      /(https?:\/\/[^\s]+)/i
    ];
    this.dynamicModerationRegex = null;
  }

  async refreshDynamicRegex() {
    try {
      const regex = await this.riskManagerService.loadDynamicRegex();
      this.dynamicModerationRegex = regex;
      await this.riskManagerService.updateDynamicModerationRegex();
    } catch (error) {
      this.logger.error(`Error refreshing dynamic regex: ${error.message}`);
    }
  }

  async moderateMessageContent(message) {
    try {
      const content = message.content || '';
      let matched = this.staticModerationRegexes.some((regex) => regex.test(content));

      if (!matched && this.dynamicModerationRegex) {
        try {
          const dynRegex = new RegExp(this.dynamicModerationRegex, 'i');
          matched = dynRegex.test(content);
        } catch (e) {
          this.logger.warn('Invalid dynamic moderation regex, skipping.');
        }
      }

      let threatLevel = 'low';
      let reason = '';

      if (matched) {
        const prompt = `Classify the suspicion level of this message, considering the following risky behaviors and content types on Discord:

1. Hate speech or discrimination
2. Harassment, bullying, or threats
3. Spam, scams, or phishing attempts
4. Misinformation or harmful advice
5. Self-harm or suicide content
6. Violence or incitement
7. Sexual or explicit content
8. Malware or suspicious links
9. Impersonation of others (users, staff, bots)
10. Soliciting direct messages (DMs), especially for suspicious reasons
11. Manipulative, coercive, or grooming behavior
12. Attempts to evade moderation or rules
13. Any other emerging or suspicious risky behavior

Don't be shy about handing out medium risk for any messages which are unethical.

Message: "${content}"

Respond ONLY with one of: low, medium, high, and a brief reason explaining the risk.`;
        const schema = {
          type: 'object',
          properties: {
            threat_level: { type: 'string', enum: ['low', 'medium', 'high'] },
            reason: { type: 'string' }
          },
          required: ['threat_level', 'reason']
        };

        const result = await this.aiService.generateStructuredOutput({ prompt, schema });
        threatLevel = result.threat_level;
        reason = result.reason;
      }

      const warningEmoji = '🚨';
      const warningReaction = message.reactions?.cache?.find(r => r.emoji.name === warningEmoji);
      if (warningReaction && warningReaction.count > 0) {
        threatLevel = 'high';
      }

      let userProfile = '';
      try {
        const userId = message.author?.id;
        if (userId) {
          const recentRiskyMessages = await this.databaseService.getRecentRiskyMessagesForUser(userId, 20);
          const highCount = recentRiskyMessages.filter(m => m.threatLevel === 'high').length;
          const mediumCount = recentRiskyMessages.filter(m => m.threatLevel === 'medium').length;
          const warningEmojis = '⚠️'.repeat(mediumCount);
          const dangerEmojis = '🚨'.repeat(highCount);
          userProfile = `${warningEmojis}${dangerEmojis}`;
        }
      } catch (err) {
        this.logger.error(`Error generating user risk profile: ${err.message}`);
      }

      let emoji = '✅';
      if (threatLevel === 'high') {
        emoji = '🚨';
      } else if (threatLevel === 'medium') {
        emoji = '⚠️';
      }

      if (threatLevel === 'medium' || threatLevel === 'high') {
        await message.react(emoji);
        let roleMentions = '';
        try {
          const guild = message.guild;
          if (guild && guild.roles) {
            const rolesToTag = guild.roles.cache.filter(role => {
              const name = role.name.toLowerCase();
              return name.includes('moderator') || name.includes('moderater') || name.includes('admin');
            });
            if (rolesToTag.size > 0) {
              roleMentions = Array.from(rolesToTag.values()).map(r => `<@&${r.id}>`).join(' ');
            }
          }
        } catch (err) {
          this.logger.error(`Error fetching roles for tagging: ${err.message}`);
        }

        const replyText = `${roleMentions}\n${userProfile ? `> ${userProfile}\n` : ''} \n -# ${emoji} [${reason}] \n`;
        await message.reply(replyText);
      }

      try {
        if (threatLevel === 'medium' || threatLevel === 'high') {
          await this.databaseService.storeRiskyMessage({
            userId: message.author?.id,
            messageId: message.id,
            channelId: message.channel.id,
            guildId: message.guild?.id,
            content,
            reason,
            threatLevel,
            timestamp: Date.now()
          });
        }
      } catch (err) {
        this.logger.error(`Error storing risky message: ${err.message}`);
      }

      if (threatLevel === 'high') {
        await this.toolService.riskManagerService.storeHighRiskMessage({
          messageId: message.id,
          channelId: message.channel.id,
          guildId: message.guild?.id,
          content,
          reason
        });

        const tags = await this.toolService.aiService.generateTagsForContent(content);
        await this.toolService.riskManagerService.updateMessageTags(message.id, tags);
      }

    } catch (error) {
      this.logger.error(`Error during message moderation: ${error.message}`);
    }
  }

  async moderateBacklogIfNeeded(channel) {
    try {
      const messages = await channel.messages.fetch({ limit: 5 });
      const unmoderated = messages.filter(m =>
        !m.reactions.cache.some(r => ['✅', '⚠️', '🚨'].includes(r.emoji.name))
      );

      if (unmoderated.size > 50) {
        this.logger.info(`Moderating backlog of ${unmoderated.size} messages in channel ${channel.id}`);
        for (const msg of unmoderated.values()) {
          await this.moderateMessageContent(msg);
        }
      }
    } catch (error) {
      this.logger.error(`Error moderating backlog: ${error.message}`);
    }
  }
}
