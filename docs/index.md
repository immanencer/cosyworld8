# CosyWorld Documentation

Welcome to the CosyWorld documentation! This comprehensive guide covers all aspects of the CosyWorld system, from high-level architecture to detailed service implementations.

## Documentation Sections

### Overview
- [Introduction](overview/01-introduction.md) - Getting started with CosyWorld
- [System Overview](overview/02-system-overview.md) - High-level architecture and components
- [System Diagram](overview/03-system-diagram.md) - Visual representation of system architecture

### Systems
- [Action System](systems/04-action-system.md) - Commands and interactions
- [Intelligence System](systems/05-intelligence-system.md) - AI and cognitive processes
- [RATi Avatar System](systems/06-rati-avatar-system.md) - On-chain NFT-based avatars, items, and locations

### Services
- [Services Overview](services/README.md) - Introduction to the service architecture
- [Architecture Report](services/architecture-report.md) - Comprehensive analysis and recommendations

#### Foundation Services
- [Basic Service](services/foundation/basicService.md) - Foundation for all services
- [Database Service](services/foundation/databaseService.md) - Data persistence layer
- [Config Service](services/foundation/configService.md) - Configuration management
- [Logger Service](services/foundation/logger.md) - Logging system

#### AI Services
- [AI Service](services/ai/aiService.md) - AI model abstraction
- [Google AI Service](services/ai/googleAIService.md) - Google AI integration
- [OpenRouter AI Service](services/ai/openrouterAIService.md) - OpenRouter integration
- [Ollama Service](services/ai/ollamaService.md) - Local AI models
- [Replicate Service](services/ai/replicateService.md) - Replicate.com integration
- [Prompt Service](services/ai/promptService.md) - AI prompt construction

#### Entity Services
- [Avatar Service](services/entity/avatarService.md) - Avatar management
- [Memory Service](services/entity/memoryService.md) - Long-term memory system
- [Creation Service](services/entity/creationService.md) - Entity creation

#### Communication Services
- [Conversation Manager](services/communication/conversationManager.md) - Message handling
- [Channel Manager](services/communication/channelManager.md) - Channel management
- [Message Handler](services/communication/messageHandler.md) - Message routing
- [Decision Maker](services/communication/decisionMaker.md) - Response generation
- [Periodic Task Manager](services/communication/periodicTaskManager.md) - Scheduled tasks
- [Command Handler](services/communication/commandHandler.md) - Command processing
- [Spam Control Service](services/communication/spamControlService.md) - Rate limiting

#### World Services
- [Location Service](services/world/locationService.md) - Spatial management
- [Map Service](services/world/mapService.md) - Navigation and mapping
- [Item Service](services/world/itemService.md) - Item and inventory system
- [Quest Generator Service](services/world/questGeneratorService.md) - Quest creation
- [Quest Service](services/world/questService.md) - Quest management

#### Tool System
- [Tool Service](services/tools/toolService.md) - Tool framework
- [Basic Tool](services/tools/basicTool.md) - Tool base class
- [Action Log](services/tools/actionLog.md) - Action tracking
- [Tool Implementations](services/tools/implementations.md) - Available tools

#### Media Services
- [Image Processing Service](services/media/imageProcessingService.md) - Image handling
- [S3 Service](services/media/s3Service.md) - File storage

#### Web Services
- [Web Service](services/web/webService.md) - HTTP API
- [Auth Service](services/web/authService.md) - Web authentication
- [Thumbnail Service](services/web/thumbnailService.md) - Image thumbnails

#### Social Integrations
- [Social Overview](services/social/README.md) - Social media integration architecture
- [X Integration](services/social/x-integration.md) - Twitter/X platform integration
- [Discord Integration](services/social/discord-integration.md) - Discord platform integration
- [Telegram Integration](services/social/telegram-integration.md) - Telegram integration (coming soon)

#### Blockchain Services
- [Token Service](services/blockchain/tokenService.md) - Token management
- [Token Burn Service](services/blockchain/tokenBurnService.md) - Token burning
- [NFT Mint Service](services/blockchain/nftMintService.md) - NFT creation
- [Crossmint Service](services/blockchain/crossmintService.md) - Crossmint integration

### Deployment
- [Deployment Guide](deployment/07-deployment.md) - Deployment procedures
- [Future Work](deployment/08-future-work.md) - Roadmap and planned features

## Building Documentation

To build the HTML version of this documentation, run:

```bash
npm run docs
```

This will generate HTML files in the `docs/build` directory that you can view in a web browser.