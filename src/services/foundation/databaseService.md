# Database Service

## Overview
The DatabaseService provides centralized database connectivity, management, and operations for the entire system. It implements a singleton pattern to ensure only one database connection exists throughout the application lifecycle.

## Functionality
- **Connection Management**: Establishes and maintains MongoDB connections
- **Mock Database**: Provides a fallback in-memory database for development
- **Index Creation**: Creates and maintains database indexes for performance
- **Reconnection Logic**: Implements exponential backoff for failed connections
- **Development Mode Support**: Special handling for development environments

## Implementation
The service uses a singleton pattern to ensure only one database connection exists at any time. It provides graceful fallbacks for development environments and handles connection failures with reconnection logic.

```javascript
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
    this.dbName = process.env.MONGO_DB_NAME || 'moonstone';

    DatabaseService.instance = this;
  }

  // Additional methods...
}
```

### Key Methods

#### `connect()`
Establishes a connection to MongoDB using environment variables. If in development mode and connection fails, it falls back to an in-memory mock database.

#### `getDatabase()`
Returns the current database instance. If not connected, schedules a reconnection attempt without blocking.

#### `waitForConnection()`
Provides a promise-based way to wait for database connection with configurable retries and delays.

#### `createIndexes()`
Creates necessary database indexes for collections to ensure query performance.

#### `setupMockDatabase()`
Creates an in-memory mock database for development and testing purposes when a real MongoDB connection isn't available.

## Database Schema
The service automatically creates and maintains several key collections:

- `messages`: User and avatar messages with indexing on username, timestamp, etc.
- `avatars`: Avatar data with various indexes for quick lookup
- `dungeon_stats`: Character statistics for dungeon gameplay
- `narratives`: Avatar narrative history for memory and personality development
- `memories`: Long-term memory storage for avatars
- `dungeon_log`: Action log for dungeon events and interactions
- `x_auth`: Authentication data for Twitter/X integration
- `social_posts`: Social media posts created by avatars

## Dependencies
- MongoDB client
- Logger service for logging database operations and errors
- Environment variables for connection details