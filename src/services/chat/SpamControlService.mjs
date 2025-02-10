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
  constructor(db, logger, options = {}) {
    this.logger = logger;
    this.spamThreshold = options.spamThreshold || 5;
    this.spamTimeWindow = options.spamTimeWindow || 10 * 1000;
    this.basePenalty = options.basePenalty || 10 * 1000;
    // In-memory tracker for recent message timestamps per user
    this.spamTracker = new Map();
    // MongoDB collection for persistent penalty records
    this.spamPenaltyCollection = db.collection('user_spam_penalties');
  }

  /**
   * Retrieves the penalty record for a given user from the database.
   * @param {string} userId
   * @returns {Promise<Object|null>}
   */
  async getUserPenalty(userId) {
    return await this.spamPenaltyCollection.findOne({ userId });
  }

  /**
   * Records a spam strike for the user, exponentially increasing the penalty.
   * @param {string} userId
   * @returns {Promise<void>}
   */
  async recordSpamStrike(userId) {
    const now = Date.now();
    let record = await this.getUserPenalty(userId);
    const newStrike = record ? record.strikeCount + 1 : 1;
    // Calculate penalty duration exponentially
    const penaltyDuration = this.basePenalty * Math.pow(2, newStrike - 1);
    const penaltyExpires = new Date(now + penaltyDuration);

    await this.spamPenaltyCollection.updateOne(
      { userId },
      { $set: { strikeCount: newStrike, penaltyExpires } },
      { upsert: true }
    );

    this.logger.warn(
      `User ${userId} recorded spam strike #${newStrike}. Penalty until ${penaltyExpires}.`
    );
  }

  /**
   * Updates the in-memory message timestamps for a user.
   * @param {string} userId
   * @returns {number} The current count of messages within the time window.
   */
  updateUserTimestamps(userId) {
    const now = Date.now();
    let timestamps = this.spamTracker.get(userId) || [];
    // Remove timestamps older than the allowed time window
    timestamps = timestamps.filter(ts => now - ts < this.spamTimeWindow);
    timestamps.push(now);
    this.spamTracker.set(userId, timestamps);
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
    // Always process bot messages normally
    if (message.author.bot) {
      return true;
    }

    const userId = message.author.id;
    const now = Date.now();

    // 1. Check if the user is under an active penalty
    const penaltyRecord = await this.getUserPenalty(userId);
    if (penaltyRecord && new Date(penaltyRecord.penaltyExpires) > now) {
      this.logger.warn(
        `User ${message.author.username} (${userId}) is under penalty until ${penaltyRecord.penaltyExpires}. Ignoring message.`
      );
      return false;
    }

    // 2. Update in-memory timestamps and check if the user is spamming
    const count = this.updateUserTimestamps(userId);
    if (count > this.spamThreshold) {
      await this.recordSpamStrike(userId);
      return false;
    }

    return true;
  }
}
