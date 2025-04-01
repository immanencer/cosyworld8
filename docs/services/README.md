# CosyWorld Services Documentation

## Overview
This documentation provides a comprehensive overview of the service architecture in the CosyWorld system. Each service is documented with its purpose, functionality, implementation details, and dependencies.

## Architecture Report
The [Architecture Report](architecture-report.md) provides a high-level analysis of the system's design, strengths, challenges, and recommendations for improvement.

## Service Categories

### Foundation Services
These services form the core infrastructure of the system:

- [Basic Service](foundation/basicService.md) - Base class for dependency injection and service lifecycle
- [Database Service](foundation/databaseService.md) - Data persistence and MongoDB integration
- [Config Service](foundation/configService.md) - Configuration management and environment variables
- [Logger Service](foundation/logger.md) - Logging system for application events

### AI Services
Services that handle artificial intelligence and natural language processing:

- [AI Service](ai/aiService.md) - AI model abstraction and provider management
- [Google AI Service](ai/googleAIService.md) - Integration with Google AI Platform
- [OpenRouter AI Service](ai/openrouterAIService.md) - Integration with OpenRouter API
- [Ollama Service](ai/ollamaService.md) - Self-hosted AI model integration
- [Replicate Service](ai/replicateService.md) - Integration with Replicate.com
- [Prompt Service](ai/promptService.md) - AI prompt construction and optimization

### Entity Services
Services that manage game entities and their data:

- [Avatar Service](entity/avatarService.md) - Avatar creation and management
- [Memory Service](entity/memoryService.md) - Long-term memory for avatars
- [Creation Service](entity/creationService.md) - Character and asset creation

### Communication Services
Services that handle messaging and player interactions:

- [Conversation Manager](communication/conversationManager.md) - Manages message flow and responses
- [Channel Manager](communication/channelManager.md) - Manages chat channels and contexts
- [Message Handler](communication/messageHandler.md) - Processes and routes messages
- [Decision Maker](communication/decisionMaker.md) - AI-driven decision making
- [Periodic Task Manager](communication/periodicTaskManager.md) - Scheduled task execution
- [Discord Service](communication/discordService.md) - Discord platform integration
- [Command Handler](communication/commandHandler.md) - User command processing
- [Spam Control Service](communication/spamControlService.md) - Anti-spam measures

### World Services
Services that manage the game world and environment:

- [Location Service](world/locationService.md) - Spatial management and environment
- [Map Service](world/mapService.md) - Dungeon mapping and navigation
- [Item Service](world/itemService.md) - Item creation and inventory management
- [Quest Generator Service](world/questGeneratorService.md) - Quest creation
- [Quest Service](world/questService.md) - Quest lifecycle management

### Tool System
Services that enable game mechanics and avatar abilities:

- [Tool Service](tools/toolService.md) - Tool framework and management
- [Basic Tool](tools/basicTool.md) - Tool base class and shared functionality
- [Action Log](tools/actionLog.md) - Avatar action tracking
- [Tool Implementations](tools/implementations.md) - Individual game mechanics tools

### Media Services
Services that handle media files and processing:

- [Image Processing Service](media/imageProcessingService.md) - Image handling and analysis
- [S3 Service](media/s3Service.md) - Cloud storage integration

### Web Services
Services that power the web interface:

- [Web Service](web/webService.md) - HTTP API and web interface
- [Auth Service](web/authService.md) - Web authentication and authorization
- [Thumbnail Service](web/thumbnailService.md) - Image thumbnail generation

### Social Integrations
Services that connect to social media platforms:

- [Social Overview](social/README.md) - Social integration architecture
- [X Integration](social/x-integration.md) - Twitter/X platform integration
- [Discord Integration](social/discord-integration.md) - Discord communication platform
- [Telegram Integration](social/telegram-integration.md) - Telegram messaging (coming soon)

### Blockchain Services
Services that handle blockchain and cryptocurrency interactions:

- [Token Service](blockchain/tokenService.md) - Token creation and management
- [Token Burn Service](blockchain/tokenBurnService.md) - Token burn operations
- [NFT Mint Service](blockchain/nftMintService.md) - NFT minting functionality
- [Crossmint Service](blockchain/crossmintService.md) - Crossmint platform integration

## Service Interactions
The services interact in a layered architecture:

1. **Foundation Layer**: BasicService, DatabaseService, ConfigService, Logger
2. **Core Layer**: AI Services, Entity Services
3. **Domain Layer**: World Services, Tool Services, Communication Services
4. **Integration Layer**: Web Services, Media Services, Integration Services, Blockchain Services

Services communicate through dependency injection, with dependencies explicitly declared and validated during initialization.

## Development Guidelines

### Adding a New Service
1. Create a new class that extends BasicService
2. Declare dependencies in the constructor
3. Implement required functionality
4. Register the service in initializeServices.mjs
5. Document the service following the documentation template

### Modifying Existing Services
1. Ensure backward compatibility with existing consumers
2. Update dependencies as needed
3. Document changes and update unit tests
4. Follow the service lifecycle patterns
5. Update service documentation

## Documentation Template
When documenting a service, follow this structure:

```markdown
# Service Name

## Overview
Brief description of the service's purpose and role in the system.

## Functionality
List of key features and capabilities.

## Implementation
Technical details, code examples, and design patterns.

## Dependencies
List of services this service depends on.

## Usage Examples
Code snippets showing how to use the service.
```

## Best Practices
- Use dependency injection consistently
- Handle errors gracefully with proper logging
- Document service interfaces and behaviors
- Write unit tests for critical functionality
- Follow asynchronous patterns with async/await
- Adhere to the established code style guidelines