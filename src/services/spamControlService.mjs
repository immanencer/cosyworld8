import configService from './configService.mjs';

// ./services/spamControlService.mjs
export class SpamControlService {
  /**
   * @param {Db} db - The connected MongoDB database instance.
   * @param {Object} logger - Your logger instance.
   * @param {Object} [options] - Optional configuration overrides.
   * @param {number} [options.spamThreshold=5] - Max messages allowed in the time window.
   * @param {number} [options.spamTimeWindow=10000] - Time window in ms (default 10 seconds).
   * @param {number} [options.basePenalty=10000] - Base penalty in ms (default 10 seconds).
   */
  constructor(db, logger, options = {}, client = null) {
    this.client = client;
    this.logger = logger;
    this.spamThreshold = options.spamThreshold || 5;
    this.spamTimeWindow = options.spamTimeWindow || 10 * 1000;
    this.basePenalty = options.basePenalty || 10 * 1000;
    // In-memory tracker for recent message timestamps per user
    this.spamTracker = new Map();
    // MongoDB collection for persistent penalty records
    this.spamPenaltyCollection = db.collection('user_spam_penalties');

    this.logger.info(
      `SpamControlService initialized with spamThreshold=${this.spamThreshold}, spamTimeWindow=${this.spamTimeWindow}ms, basePenalty=${this.basePenalty}ms.`
    );
  }

  /**
   * Retrieves the penalty record for a given user from the database.
   * @param {string} userId
   * @returns {Promise<Object|null>}
   */
  async getUserPenalty(userId) {
    try {
      this.logger.debug(`Fetching penalty record for user ${userId}.`);
      const record = await this.spamPenaltyCollection.findOne({ userId });
      if (record) {
        this.logger.debug(`Penalty record for user ${userId} found: ${JSON.stringify(record)}.`);
      } else {
        this.logger.debug(`No penalty record found for user ${userId}.`);
      }
      return record;
    } catch (error) {
      this.logger.error(`Error fetching penalty record for user ${userId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Records a spam strike for the user, exponentially increasing the penalty.
   * @param {string} userId
   * @param {string} serverId
   * @returns {Promise<void>}
   */
  async recordSpamStrike(userId, serverId) {
    const now = Date.now();
    let record = await this.getUserPenalty(userId);
    const newStrike = record ? record.strikeCount + 1 : 1;
    const server = serverId || 'DM';

    this.logger.info(
      `Recording spam strike for user ${userId} in server ${server}. Current strike count: ${record ? record.strikeCount : 0}, new strike count: ${newStrike}.`
    );

    // Check if user should be permanently blacklisted
    if (newStrike >= 3) {
      this.logger.warn(
        `User ${userId} reached strike count ${newStrike}. Permanently blacklisting user in server ${server}.`
      );
      try {
        await this.spamPenaltyCollection.updateOne(
          { userId },
          {
            $set: {
              strikeCount: newStrike,
              permanentlyBlacklisted: true,
              blacklistedAt: now,
              server: server,
              penaltyExpires: new Date(8640000000000000) // Max date
            }
          },
          { upsert: true }
        );
        this.logger.warn(
          `User ${userId} has been permanently blacklisted after ${newStrike} strikes in server ${server}.`
        );
      } catch (error) {
        this.logger.error(`Error permanently blacklisting user ${userId}: ${error.message}`);
      }
      return;
    }

    // Calculate penalty duration exponentially
    const penaltyDuration = this.basePenalty * Math.pow(2, newStrike - 1);
    const penaltyExpires = new Date(now + penaltyDuration);

    try {
      await this.spamPenaltyCollection.updateOne(
        { userId },
        { $set: { strikeCount: newStrike, penaltyExpires } },
        { upsert: true }
      );
      this.logger.warn(
        `User ${userId} recorded spam strike #${newStrike}. Applied penalty: ${penaltyDuration}ms, expires at ${penaltyExpires.toISOString()}.`
      );
    } catch (error) {
      this.logger.error(`Error recording spam strike for user ${userId}: ${error.message}`);
    }
  }

  /**
   * Updates the in-memory message timestamps for a user.
   * @param {string} userId
   * @returns {number} The current count of messages within the time window.
   */
  updateUserTimestamps(userId) {
    const now = Date.now();
    let timestamps = this.spamTracker.get(userId) || [];
    const originalCount = timestamps.length;
    // Remove timestamps older than the allowed time window
    timestamps = timestamps.filter(ts => now - ts < this.spamTimeWindow);
    const prunedCount = originalCount - timestamps.length;
    if (prunedCount > 0) {
      this.logger.debug(`Pruned ${prunedCount} outdated timestamp(s) for user ${userId}.`);
    }
    timestamps.push(now);
    this.spamTracker.set(userId, timestamps);
    this.logger.debug(
      `User ${userId} now has ${timestamps.length} message(s) within the time window (${this.spamTimeWindow}ms).`
    );
    return timestamps.length;
  }

  /**
   * Determines whether a given message should be processed or ignored.
   * If the user is under a penalty or is spamming, the message will be ignored.
   *
   * @param {Message} message - The Discord message object.
   * @returns {Promise<boolean>} True if the message is allowed; false if it should be ignored.
   */
  async shouldProcessMessage(message) {
    const userId = message.author.id;
    const serverId = message.guild?.id || 'DM';
    this.logger.debug(`Evaluating message from user ${message.author.username} (${userId}) in server ${serverId}.`);

    // Always process bot messages normally and verify guild
    if (message.author.bot || !message.guild) {
      this.logger.debug(`Bypassing spam check for bot or non-guild message from user ${userId}.`);
      return true;
    }

    // Check if guild is whitelisted (first check guild-specific config, then global whitelist)
    try {
      // Check guild-specific config
      const guildConfig = await configService.getGuildConfig(this.client.db, message.guild.id);
      if (guildConfig && guildConfig.whitelisted === true) {
        this.logger.debug(`Guild ${message.guild.name}(${message.guild.id}) is whitelisted via guild config.`);
        return true;
      } else {
        // Check global whitelist as fallback
        const globalConfig = await configService.get('whitelistedGuilds');
        const whitelistedGuilds = Array.isArray(globalConfig) ? globalConfig : [];

        if (!whitelistedGuilds.includes(message.guild.id)) {
          this.logger.warn(`Guild ${message.guild.name}(${message.guild.id}) is not whitelisted. Ignoring message from user ${userId} - ${message.author.username}.`);
          return false;
        }
        this.logger.debug(`Guild ${message.guild.name}(${message.guild.id}) is whitelisted via global config.`);
        return true;
      }
    } catch (error) {
      this.logger.error(`Error checking whitelist status: ${error.message}`);
      // In case of error fetching config, check if the client has this guild in its memory cache
      if (this.client && this.client.guildWhitelist && this.client.guildWhitelist.has(message.guild.id)) {
        this.logger.debug(`Guild ${message.guild.name}(${message.guild.id}) is whitelisted via client memory cache.`);
        return true;
      }
      // Default to ignoring the message for safety
      return false;
    }

    const now = Date.now();

    // 1. Check if the user is permanently blacklisted
    let penaltyRecord;
    try {
      penaltyRecord = await this.getUserPenalty(userId);
    } catch (error) {
      this.logger.error(`Error retrieving penalty record for user ${userId}: ${error.message}`);
      return false;
    }
    if (penaltyRecord?.permanentlyBlacklisted) {
      this.logger.warn(
        `Permanently blacklisted user ${message.author.username} (${userId}) attempted to send a message in server ${serverId}.`
      );
      return false;
    }

    // 2. Check if the user is under an active penalty
    if (penaltyRecord && new Date(penaltyRecord.penaltyExpires) > now) {
      this.logger.warn(
        `User ${message.author.username} (${userId}) is under penalty until ${new Date(
          penaltyRecord.penaltyExpires
        ).toISOString()}. Ignoring message in server ${serverId}.`
      );
      return false;
    }

    // 3. Update in-memory timestamps and check if the user is spamming
    const count = this.updateUserTimestamps(userId);
    if (count > this.spamThreshold) {
      this.logger.warn(
        `User ${message.author.username} (${userId}) exceeded spam threshold with ${count} messages in ${this.spamTimeWindow}ms in server ${serverId}.`
      );
      await this.recordSpamStrike(userId, serverId);
      return false;
    }

    this.logger.debug(`Message from user ${message.author.username} (${userId}) in server ${serverId} passed spam check.`);
    return true;
  }
}