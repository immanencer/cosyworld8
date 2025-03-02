
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
      return null;
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
      await this.createIndexes();
      return this.db;
    } catch (error) {
      this.connected = false;
      this.logger.error(`MongoDB connection failed: ${error.message}`);
      if (this.dbClient) {
        try {
          await this.dbClient.close();
        } catch (closeError) {
          this.logger.error(`Error closing MongoDB connection: ${closeError.message}`);
        }
      }
      
      // Set up reconnection with exponential backoff
      const reconnectDelay = Math.min(this.reconnectDelay * 1.5, 30000); // Maximum 30 seconds
      this.logger.info(`Will attempt to reconnect in ${reconnectDelay/1000} seconds...`);
      setTimeout(() => this.connect(), reconnectDelay);
      this.reconnectDelay = reconnectDelay;
      return null;
    }
  }

  getDatabase() {
    if (!this.connected || !this.db) {
      this.logger.warn('Database is not connected. Retrying connection...');
      this.connect().catch(err => {
        this.logger.error(`Failed to reconnect to database: ${err.message}`);
      });
      return null;
    }
    return this.db;
  }
  
  /**
   * Waits for database connection to be established
   * @param {number} maxRetries - Maximum number of retries
   * @param {number} delay - Delay between retries in milliseconds
   * @returns {Promise<Object|null>} - Returns database object or null
   */
  async waitForConnection(maxRetries = 5, delay = 1000) {
    let retries = 0;
    
    while (retries < maxRetries) {
      if (this.connected && this.db) {
        return this.db;
      }
      
      this.logger.info(`Waiting for database connection... (attempt ${retries + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
      retries++;
    }
    
    this.logger.error(`Failed to establish database connection after ${maxRetries} attempts`);
    return null;
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
