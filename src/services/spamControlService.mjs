import e from "express";
import { BasicService } from "./basicService.mjs";

export class SpamControlService extends BasicService {
  /**
   * @param {Db} db - The connected MongoDB database instance.
   * @param {Object} logger - Your logger instance.
   * @param {Object} [options] - Optional configuration overrides.
   * @param {number} [options.spamThreshold=5] - Max messages allowed in the time window.
   * @param {number} [options.spamTimeWindow=10000] - Time window in ms (default 10 seconds).
   * @param {number} [options.basePenalty=10000] - Base penalty in ms (default 10 seconds).
   */
  constructor(services, options = {}) {
    super(services, ["databaseService", "logger"]);
    this.spamThreshold = options.spamThreshold || 5;
    this.spamTimeWindow = options.spamTimeWindow || 10 * 1000;
    this.basePenalty = options.basePenalty || 10 * 1000;
    // In-memory tracker for recent message timestamps per user
    this.spamTracker = new Map();
    const db = this.databaseService.getDatabase();
    // MongoDB collection for persistent penalty records
    this.spamPenaltyCollection = db.collection('user_spam_penalties');

    this.logger.info(
      `SpamControlService initialized with spamThreshold=${this.spamThreshold}, spamTimeWindow=${this.spamTimeWindow}ms, basePenalty=${this.basePenalty}ms.`
    );
  }

  /**
   * Retrieves the penalty record for a given user.
   * @param {string} userId
   * @returns {Promise<Object|null>}
   */
  async getUserPenalty(userId) {
    try {
      this.logger.debug(`Fetching penalty record for user ${userId}.`);
      const record = await this.spamPenaltyCollection.findOne({ userId });
      if (record) {
        this.logger.debug(`Penalty record for user ${userId}: ${JSON.stringify(record)}`);
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
   * Records a spam strike for the user, increasing the penalty exponentially.
   * Permanently blacklists the user after 3 strikes.
   *
   * @param {string} userId
   * @param {string} serverId - Server identifier (default 'DM').
   * @returns {Promise<void>}
   */
  async recordSpamStrike(userId, serverId = 'DM') {
    const now = Date.now();
    let record = await this.getUserPenalty(userId);
    const newStrike = record ? record.strikeCount + 1 : 1;

    this.logger.info(
      `Recording spam strike for user ${userId} in server ${serverId}. Previous strikes: ${record ? record.strikeCount : 0}, new strike: ${newStrike}.`
    );

    // Permanently blacklist after 3 strikes
    if (newStrike >= 3) {
      this.logger.warn(`User ${userId} reached ${newStrike} strikes and will be permanently blacklisted in server ${serverId}.`);
      try {
        await this.spamPenaltyCollection.updateOne(
          { userId },
          {
            $set: {
              strikeCount: newStrike,
              permanentlyBlacklisted: true,
              blacklistedAt: now,
              server: serverId,
              penaltyExpires: new Date(8640000000000000) // Use max date for permanent penalty
            }
          },
          { upsert: true }
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
        `User ${userId} recorded spam strike #${newStrike}. Penalty: ${penaltyDuration}ms, expires at ${penaltyExpires.toISOString()}.`
      );
    } catch (error) {
      this.logger.error(`Error recording spam strike for user ${userId}: ${error.message}`);
    }
  }

  /**
   * Updates the in-memory record of message timestamps for a user.
   * Removes timestamps older than the spam time window.
   *
   * @param {string} userId
   * @returns {number} The current count of messages within the time window.
   */
  updateUserTimestamps(userId) {
    const now = Date.now();
    let timestamps = this.spamTracker.get(userId) || [];
    // Keep only timestamps within the allowed time window
    timestamps = timestamps.filter(ts => now - ts < this.spamTimeWindow);
    timestamps.push(now);
    this.spamTracker.set(userId, timestamps);
    this.logger.debug(`User ${userId} now has ${timestamps.length} message(s) in the last ${this.spamTimeWindow}ms.`);
    return timestamps.length;
  }

  /**
   * Determines whether a message should be processed based on spam behavior.
   * This check includes:
   *  - Skipping bot and non-guild messages.
   *  - Checking for an active penalty.
   *  - Counting recent messages to detect spam.
   *
   * @param {Message} message - The Discord message object.
   * @returns {Promise<boolean>} True if the message should be processed; false otherwise.
   */
  async shouldProcessMessage(message) {
    // Always process bot messages and non-guild messages
    if (message.author.bot || !message.guild) {
      this.logger.debug(`Bypassing spam check for bot or non-guild message from user ${message.author.id}.`);
      return true;
    }

    const userId = message.author.id;
    const now = Date.now();

    // Check for penalty
    let penaltyRecord;
    try {
      penaltyRecord = await this.getUserPenalty(userId);
    } catch (error) {
      this.logger.error(`Error retrieving penalty for user ${userId}: ${error.message}`);
      return false;
    }
    if (penaltyRecord?.permanentlyBlacklisted) {
      this.logger.warn(`User ${message.author.username} (${userId}) is permanently blacklisted.`);
      return false;
    }
    if (penaltyRecord && new Date(penaltyRecord.penaltyExpires) > now) {
      this.logger.warn(`User ${message.author.username} (${userId}) is under penalty until ${new Date(penaltyRecord.penaltyExpires).toISOString()}.`);
      return false;
    }

    // Update in-memory timestamps and check spam threshold
    const count = this.updateUserTimestamps(userId);
    if (count > this.spamThreshold) {
      this.logger.warn(`User ${message.author.username} (${userId}) exceeded spam threshold with ${count} messages.`);
      await this.recordSpamStrike(userId, message.guild.id);
      return false;
    }

    return true;
  }
}
