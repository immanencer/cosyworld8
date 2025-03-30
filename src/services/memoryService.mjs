import { BasicService } from './basicService.mjs';

export class MemoryService extends BasicService {
  constructor(services) {
    super(services, [
      'discordService',
      'databaseService',
      'configService',
    ]);
    this.logger = services.logger;
    this.db = this.databaseService.getDatabase();
    this.client = this.discordService.client;
  }

  async addMemory(avatarId, memory) {
    try {
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

  async getMemories(avatarId, limit = 10) {
    try {      
      const memories = await this.db.collection('memories')
        .find({ $or: [ { avatarId }, { avatarId: avatarId.toString() }, { avatarId: { $exists: false } } ] })
        .sort({ timestamp: -1 })
        .limit(limit)
        .toArray();

      const narratives = await this.db.collection('narratives');

      // get the three most recent narratives
      const recentNarratives = await narratives.find({ avatarId }).sort({ timestamp: -1 }).limit(3).toArray();  

      // add the narratives to the memories by timestamp
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
}
