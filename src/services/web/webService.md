# Web Service

## Overview
The WebService provides HTTP-based access to the system's functionality through a RESTful API and web interface. It serves as the bridge between external web clients and the internal service ecosystem.

## Functionality
- **API Endpoints**: Exposes RESTful interfaces for system functionality
- **Web Interface**: Serves the user-facing web application
- **Authentication**: Manages user authentication and authorization
- **WebSocket Support**: Provides real-time updates and notifications
- **Documentation**: Serves API documentation and developer resources

## Implementation
The WebService extends BasicService and uses Express.js to create an HTTP server. It registers routes from multiple domains and applies middleware for security, logging, and request processing.

```javascript
export class WebService extends BasicService {
  constructor(container) {
    super(container, [
      'configService',
      'logger',
      'databaseService',
      'avatarService',
      'locationService',
    ]);
    
    this.app = express();
    this.server = null;
    this.port = process.env.WEB_PORT || 3000;
    
    this.setupMiddleware();
    this.setupRoutes();
  }
  
  async start() {
    return new Promise((resolve, reject) => {
      this.server = this.app.listen(this.port, () => {
        this.logger.info(`Web server listening on port ${this.port}`);
        resolve();
      });
    });
  }
  
  // Methods...
}
```

### Key Methods

#### `setupMiddleware()`
Configures Express middleware for request processing:
- CORS configuration
- Body parsing
- Authentication verification
- Request logging
- Error handling

#### `setupRoutes()`
Registers route handlers for different API domains:
- Avatar management
- Location interaction
- Item operations
- User authentication
- Administrative functions

#### `start()` and `stop()`
Methods to start and gracefully shut down the HTTP server.

#### `loadModule(modulePath)`
Dynamically loads API route modules to keep the codebase modular.

## API Structure
The service organizes endpoints into logical domains:
- `/api/avatars/*` - Avatar-related operations
- `/api/locations/*` - Location management
- `/api/items/*` - Item interactions
- `/api/auth/*` - Authentication and user management
- `/api/admin/*` - Administrative functions
- `/api/social/*` - Social integrations

## Security Features
- JWT-based authentication
- Role-based access control
- Rate limiting to prevent abuse
- Input validation and sanitization
- HTTPS enforcement in production

## Client Integration
The service serves a web client application that provides a user interface for:
- Avatar management and viewing
- Location exploration
- Item interaction
- Social features
- Administrative dashboard

## Dependencies
- Express.js for HTTP server
- Various service modules for business logic
- Authentication middleware
- Database access for persistence