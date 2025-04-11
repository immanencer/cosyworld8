// UserProfileService: manages user profiles, social handles, and summaries of past interactions

export class UserProfileService {
  constructor(services) {
    this.databaseService = services.databaseService;
  }

  // Get or create a user profile
  async getOrCreateProfile(userId) {
    const db = this.databaseService.getDatabase();
    let profile = await db.collection('user_profiles').findOne({ userId });
    if (!profile) {
      profile = { userId, handles: {}, summary: '', updatedAt: new Date() };
      await db.collection('user_profiles').insertOne(profile);
    }
    return profile;
  }

  // Update social media handles for a user
  async setSocialHandle(userId, platform, handle) {
    const db = this.databaseService.getDatabase();
    await db.collection('user_profiles').updateOne(
      { userId },
      { $set: { [`handles.${platform}`]: handle, updatedAt: new Date() } },
      { upsert: true }
    );
  }

  // Get social handles for a user
  async getSocialHandles(userId) {
    const profile = await this.getOrCreateProfile(userId);
    return profile.handles || {};
  }

  // Update the summary of past interactions
  async updateSummary(userId, summary) {
    const db = this.databaseService.getDatabase();
    await db.collection('user_profiles').updateOne(
      { userId },
      { $set: { summary, updatedAt: new Date() } },
      { upsert: true }
    );
  }

  // Get the summary of past interactions
  async getSummary(userId) {
    const profile = await this.getOrCreateProfile(userId);
    return profile.summary || '';
  }

  // Add a record of an interaction (for future summarization)
  async logInteraction(userId, interaction) {
    const db = this.databaseService.getDatabase();
    await db.collection('user_interactions').insertOne({ userId, ...interaction, timestamp: new Date() });
  }

  // Summarize interactions if needed (e.g., >50 or >100 new)
  async summarizeInteractionsIfNeeded(userId, threshold = 50, updateEvery = 100) {
    const db = this.databaseService.getDatabase();
    const profile = await this.getOrCreateProfile(userId);
    const count = await db.collection('user_interactions').countDocuments({ userId });
    if (count < threshold) return profile.summary || '';
    if (profile.lastSummaryCount && (count - profile.lastSummaryCount) < updateEvery) return profile.summary || '';
    // Fetch recent interactions
    const interactions = await db.collection('user_interactions').find({ userId }).sort({ timestamp: -1 }).limit(200).toArray();
    const text = interactions.map(i => i.text || i.type || JSON.stringify(i)).join('\n');
    // Simple summary (replace with LLM call if available)
    const summary = `Summary for user ${userId} based on last ${interactions.length} interactions:\n` + text.slice(0, 1000) + (text.length > 1000 ? '... [truncated]' : '');
    await db.collection('user_profiles').updateOne(
      { userId },
      { $set: { summary, lastSummaryCount: count, updatedAt: new Date() } },
      { upsert: true }
    );
    return summary;
  }
}
