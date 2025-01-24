import { MongoClient } from 'mongodb';

export class DungeonLog {
  constructor(logger) {
    this.logger = logger;
  }

  async logAction(action) {
    const client = new MongoClient(process.env.MONGO_URI);
    try {
      await client.connect();
      const db = client.db(process.env.MONGO_DB_NAME);

      // Structure the action log entry
      const logEntry = {
        channelId: action.channelId,
        action: action.action,
        actorId: action.actorId,
        actorName: action.actorName,
        displayName: action.displayName || action.actorName,
        target: action.target,
        result: action.result,
        memory: action.memory, // Added memory field
        metadata: {
          tool: action.tool || null,
          emoji: action.emoji || null,
          isCustom: action.isCustom || false
        },
        timestamp: Date.now()
      };

      await db.collection('dungeon_log').insertOne(logEntry);
    } catch (error) {
      this.logger.error(`Error logging dungeon action: ${error.message}`);
    } finally {
      await client.close();
    }
  }

  async getRecentActions(channelId, limit = 5) {
    const client = new MongoClient(process.env.MONGO_URI);
    try {
      await client.connect();
      const db = client.db(process.env.MONGO_DB_NAME);
      return await db.collection('dungeon_log')
        .find({ channelId })
        .sort({ timestamp: -1 })
        .limit(limit)
        .toArray();
    } finally {
      await client.close();
    }
  }
}