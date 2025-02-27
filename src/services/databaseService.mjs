
import { MongoClient } from 'mongodb';

export class DatabaseService {
  static instance = null;

  constructor(logger) {
    if (DatabaseService.instance) {
      return DatabaseService.instance;
    }

    this.logger = logger;
    this.dbClient = null;
    this.db = null;
    this.connected = false;
    this.reconnectDelay = 5000;
    this.dbName = process.env.MONGO_DB_NAME;

    DatabaseService.instance = this;
  }

  async connect() {
    if (!process.env.MONGO_URI) {
      this.logger.error('MongoDB URI not provided in environment variables.');
      return;
    }

    try {
      this.logger.info('Connecting to MongoDB...');
      this.dbClient = new MongoClient(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 10000,
      });
      await this.dbClient.connect();
      this.db = this.dbClient.db(this.dbName);
      this.connected = true;
      this.logger.info(`Connected to MongoDB: ${this.dbName}`);
      return this.db;
    } catch (error) {
      this.connected = false;
      this.logger.error(`MongoDB connection failed: ${error.message}`);
      if (this.dbClient) {
        await this.dbClient.close();
      }
      setTimeout(() => this.connect(), this.reconnectDelay);
      return null;
    }
  }

  getDatabase() {
    if (!this.connected || !this.db) {
      this.logger.warn('Database is not connected. Retrying connection...');
      this.connect();
      return null;
    }
    return this.db;
  }

  async createIndexes() {
    const db = this.getDatabase();
    if (!db) return;

    try {
      await Promise.all([
        db.collection('messages').createIndexes([
          { key: { authorUsername: 1 }, background: true },
          { key: { timestamp: -1 }, background: true },
          { key: { avatarId: 1 }, background: true },
        ]),
        db.collection('avatars').createIndexes([
          { key: { name: 1, createdAt: -1 }, background: true },
          { key: { model: 1 }, background: true },
          { key: { emoji: 1 }, background: true },
          { key: { parents: 1 }, background: true },
          { key: { createdAt: -1 }, background: true },
          { key: { name: 'text', description: 'text' }, background: true },
        ]),
        db.collection('dungeon_stats').createIndex(
          { avatarId: 1 },
          { unique: true, background: true }
        ),
        db.collection('narratives').createIndex(
          { avatarId: 1, timestamp: -1 },
          { background: true }
        ),
        db.collection('memories').createIndex(
          { avatarId: 1, timestamp: -1 },
          { background: true }
        ),
        db.collection('dungeon_log').createIndexes([
          { key: { timestamp: -1 }, background: true },
          { key: { actor: 1 }, background: true },
          { key: { target: 1 }, background: true },
        ])
      ]);
      this.logger.info('Database indexes created successfully');
    } catch (error) {
      this.logger.error(`Error creating indexes: ${error.message}`);
    }
  }

  async close() {
    if (this.dbClient) {
      await this.dbClient.close();
      this.connected = false;
      this.db = null;
      this.logger.info('MongoDB connection closed');
    }
  }
}
