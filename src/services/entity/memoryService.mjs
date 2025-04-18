import { BasicService } from '../foundation/basicService.mjs';

export class MemoryService extends BasicService {
  static requiredServices = ['logger', 'schemaService', 'databaseService', 'discordService'];
  constructor() {
    super();
    this.lastEntitySync = new Map();
  }

  async addMemory(avatarId, memory) {
    try {
      this.db = await this.databaseService.getDatabase();
      await this.db.collection('memories').insertOne({
        avatarId,
        memory,
        timestamp: Date.now()
      });
    } catch (error) {
      this.logger.error(`Error storing memory for avatar ${avatarId}: ${error.message}`);
      throw error;
    }
  }

  async getMemories(avatarId, limit = 10, skipEntitySync = false) {
    try {
      this.db = await this.databaseService.getDatabase();
      const memories = await this.db.collection('memories')
        .find({ $or: [ { avatarId }, { avatarId: avatarId.toString() }] })
        .sort({ timestamp: -1 })
        .limit(limit)
        .toArray();

      const narratives = await this.db.collection('narratives');
      const recentNarratives = await narratives.find({ avatarId }).sort({ timestamp: -1 }).limit(3).toArray();
      recentNarratives.forEach(narrative => {
        memories.push(narrative);
      });
      memories.sort((a, b) => b.timestamp - a.timestamp);
      return memories || [];
    } catch (error) {
      this.logger.error(`Error fetching memories for avatar ${avatarId}: ${error.message}`);
      throw error;
    }
  }

  async storeNarrative(avatarId, content) {
    try {
      this.db = await this.databaseService.getDatabase();
      await this.db.collection('narratives').insertOne({
        avatarId,
        content,
        timestamp: Date.now()
      });
    } catch (error) {
      this.logger.error(`Error storing narrative for avatar ${avatarId}: ${error.message}`);
    }
  }

  async getLastNarrative(avatarId) {
    try {
      this.db = await this.databaseService.getDatabase();
      return await this.db.collection('narratives').findOne(
        { $or: [{ avatarId }, { avatarId: avatarId.toString() }] },
        { sort: { timestamp: -1 } }
      );
    } catch (error) {
      this.logger.error(`Error fetching last narrative for avatar ${avatarId}: ${error.message}`);
      return null;
    }
  }

  async updateNarrativeHistory(avatar, content) {
    const guildName = process.env.GUILD_NAME || 'The Guild';
    const narrativeData = { timestamp: Date.now(), content, guildName };
    avatar.narrativeHistory = avatar.narrativeHistory || [];
    avatar.narrativeHistory.unshift(narrativeData);
    avatar.narrativeHistory = avatar.narrativeHistory.slice(0, 5);
    return avatar;
  }
}
