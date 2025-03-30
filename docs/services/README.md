# CosyWorld Services Documentation

## Overview
This documentation provides a comprehensive overview of the service architecture in the CosyWorld system. Each service is documented with its purpose, functionality, implementation details, and dependencies.

## Architecture Report
The [Architecture Report](architecture-report.md) provides a high-level analysis of the system's design, strengths, challenges, and recommendations for improvement.

## Core Services
These services form the foundation of the system:

- [Basic Service](core/basicService.md) - Base class for dependency injection and service lifecycle
- [Database Service](core/databaseService.md) - Data persistence and MongoDB integration
- [AI Service](core/aiService.md) - AI model abstraction and provider management
- [Avatar Service](core/avatarService.md) - Avatar creation and management
- [Prompt Service](core/promptService.md) - AI prompt construction and optimization
- [Memory Service](core/memoryService.md) - Long-term memory for avatars

## Domain-Specific Services

### Chat Services
- [Conversation Manager](chat/conversationManager.md) - Manages message flow and responses

### Tool Services
- [Tool Service](tools/toolService.md) - Command processing and game mechanics

### Location Services
- [Location Service](location/locationService.md) - Spatial management and environment

### Item Services
- [Item Service](item/itemService.md) - Item creation and inventory management

### Quest Services
- [Quest Generator Service](quest/questGeneratorService.md) - Quest creation and management

### Storage Services
- [S3 Service](s3/s3Service.md) - File storage and retrieval

### Web Services
- [Web Service](web/webService.md) - HTTP API and web interface

## Service Interactions
The services interact in a layered architecture:

1. **Foundation Layer**: BasicService, DatabaseService, ConfigService
2. **Core Layer**: AIService, AvatarService, MemoryService, PromptService
3. **Domain Layer**: Location, Item, Quest, Tool services
4. **Integration Layer**: Discord, Web, S3, and external services

Services communicate through dependency injection, with dependencies explicitly declared and validated during initialization.

## Development Guidelines

### Adding a New Service
1. Create a new class that extends BasicService
2. Declare dependencies in the constructor
3. Implement required functionality
4. Register the service in initializeServices.mjs

### Modifying Existing Services
1. Ensure backward compatibility with existing consumers
2. Update dependencies as needed
3. Document changes and update unit tests
4. Follow the service lifecycle patterns

## Best Practices
- Use dependency injection consistently
- Handle errors gracefully with proper logging
- Document service interfaces and behaviors
- Write unit tests for critical functionality
- Follow asynchronous patterns with async/await