export class RiskManagerService {
  constructor({ logger, databaseService, aiService }) {
    this.logger = logger;
    this.databaseService = databaseService;
    this.aiService = aiService;
  }

  /**
   * Store a high-risk message with metadata.
   * @param {Object} data - Message metadata.
   */
  async storeHighRiskMessage(data) {
    try {
      this.db = await this.databaseService.getDatabase();
      await this.db.collection('high_risk_messages').updateOne(
        { messageId: data.messageId },
        { $set: { ...data, reviewed: false, timestamp: new Date() } },
        { upsert: true }
      );
    } catch (error) {
      this.logger.error(`Error storing high-risk message: ${error.message}`);
    }
  }

  /**
   * Update tags for a high-risk message.
   * @param {string} messageId - Discord message ID.
   * @param {string[]} tags - List of tags.
   */
  async updateMessageTags(messageId, tags) {
    try {
      this.db = await this.databaseService.getDatabase();
      await this.db.collection('high_risk_messages').updateOne(
        { messageId },
        { $set: { tags } }
      );
    } catch (error) {
      this.logger.error(`Error updating message tags: ${error.message}`);
    }
  }

  /**
   * Count unreviewed high-risk messages.
   * @returns {Promise<number>} Count of unreviewed high-risk messages.
   */
  async countUnreviewedHighRiskMessages() {
    try {
      this.db = await this.databaseService.getDatabase();
      return await this.db.collection('high_risk_messages').countDocuments({ reviewed: false });
    } catch (error) {
      this.logger.error(`Error counting unreviewed high-risk messages: ${error.message}`);
      return 0;
    }
  }

  /**
   * Analyze recent high-risk messages and propose or update a dynamic regex.
   * Called periodically or when backlog exceeds threshold.
   */
  async updateDynamicModerationRegex() {
    try {
      this.db = await this.databaseService.getDatabase();
      const unreviewedCount = await this.countUnreviewedHighRiskMessages();
      if (unreviewedCount < 100) return;

      const recentHighRisk = await this.db.collection('high_risk_messages')
        .find({ reviewed: false })
        .sort({ timestamp: -1 })
        .limit(100)
        .toArray();

      const contents = recentHighRisk.map(m => m.content).join('\n');
      const prompt = `Given the following high-risk messages, generate a single regex pattern that would match similar risky content.\n\nMessages:\n${contents}\n\nRespond ONLY with a valid JavaScript regex pattern string, no explanation.`;

      const regexPattern = await this.aiService.generateText(prompt);

      // Save the new dynamic regex
      await this.db.collection('moderation_config').updateOne(
        { key: 'dynamic_regex' },
        { $set: { pattern: regexPattern.trim(), updatedAt: new Date() } },
        { upsert: true }
      );

      this.logger.info('Updated dynamic moderation regex.');
    } catch (error) {
      this.logger.error(`Error updating dynamic moderation regex: ${error.message}`);
    }
  }

  /**
   * Load the current dynamic regex pattern.
   * @returns {Promise<string|null>} The regex pattern string or null.
   */
  async loadDynamicRegex() {
    try {
      this.db = await this.databaseService.getDatabase();
      const doc = await this.db.collection('moderation_config').findOne({ key: 'dynamic_regex' });
      return doc?.pattern || null;
    } catch (error) {
      this.logger.error(`Error loading dynamic regex: ${error.message}`);
      return null;
    }
  }
}
