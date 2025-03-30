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
- [Dungeon System](systems/06-dungeon-system.md) - Game mechanics and environments

### Services
- [Services Overview](services/README.md) - Introduction to the service architecture
- [Architecture Report](services/architecture-report.md) - Comprehensive analysis and recommendations

#### Core Services
- [Basic Service](services/core/basicService.md) - Foundation for all services
- [Database Service](services/core/databaseService.md) - Data persistence layer
- [AI Service](services/core/aiService.md) - AI model abstraction
- [Avatar Service](services/core/avatarService.md) - Avatar management
- [Memory Service](services/core/memoryService.md) - Long-term memory system
- [Prompt Service](services/core/promptService.md) - AI prompt construction

#### Domain Services
- [Conversation Manager](services/chat/conversationManager.md) - Message handling
- [Tool Service](services/tools/toolService.md) - Game mechanics
- [Location Service](services/location/locationService.md) - Spatial management
- [Item Service](services/item/itemService.md) - Item and inventory system
- [Quest Generator](services/quest/questGeneratorService.md) - Quest management

#### Integration Services
- [S3 Service](services/s3/s3Service.md) - File storage
- [Web Service](services/web/webService.md) - HTTP API

### Deployment
- [Deployment Guide](deployment/07-deployment.md) - Deployment procedures
- [Future Work](deployment/08-future-work.md) - Roadmap and planned features

## Building Documentation

To build the HTML version of this documentation, run:

```bash
npm run docs
```

This will generate HTML files in the `docs/build` directory that you can view in a web browser.