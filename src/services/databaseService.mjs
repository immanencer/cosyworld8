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
    this.reconnectDelay = 5000; // 5 seconds

    this._connectToDatabase();

    // Graceful shutdown handling
    process.on('SIGINT', () => this._closeConnection());
    process.on('SIGTERM', () => this._closeConnection());

    DatabaseService.instance = this;
  }

  /**
   * Initializes the MongoDB connection and retries if it fails.
   */
  async _connectToDatabase() {
    if (!process.env.MONGO_URI || !process.env.MONGO_DB_NAME) {
      this.logger.error('MongoDB URI or Database Name not provided in environment variables.');
      return;
    }

    try {
      this.logger.info('Connecting to MongoDB...');
      this.dbClient = new MongoClient(process.env.MONGO_URI);
      await this.dbClient.connect();
      this.db = this.dbClient.db(process.env.MONGO_DB_NAME);
      this.connected = true;
      this.logger.info(`Connected to MongoDB: ${process.env.MONGO_DB_NAME}`);
    } catch (error) {
      this.connected = false;
      this.logger.error(`MongoDB connection failed: ${error.message}`);
      setTimeout(() => this._connectToDatabase(), this.reconnectDelay);
    }
  }

  /**
   * Returns the database instance if connected.
   */
  getDatabase() {
    if (!this.connected || !this.db) {
      this.logger.warn('Database is not connected. Retrying connection...');
      this._connectToDatabase();
      return null;
    }
    return this.db;
  }

  /**
   * Executes a MongoDB operation safely.
   * @param {Function} operation - A function that takes the database instance and performs an operation.
   */
  async execute(operation) {
    try {
      const db = this.getDatabase();
      if (!db) throw new Error('Database is not connected.');
      return await operation(db);
    } catch (error) {
      this.logger.error(`Database operation failed: ${error.message}`);
      return null;
    }
  }

  /**
   * Closes the MongoDB connection gracefully.
   */
  async _closeConnection() {
    if (this.dbClient) {
      this.logger.info('Closing MongoDB connection...');
      await this.dbClient.close();
      this.connected = false;
      this.logger.info('MongoDB connection closed.');
    }
    process.exit(0);
  }
}
