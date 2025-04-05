# CosyWorld Documentation

Welcome to the CosyWorld developer hub. This guide covers everything from high-level architecture to detailed service implementations.

---

## Contents

### Overview
- [Introduction](overview/01-introduction.md)
- [System Overview](overview/02-system-overview.md)
- [System Diagrams](overview/03-system-diagram.md)

### Core Systems
- [RATi Avatar System](systems/06-rati-avatar-system.md)
- [Action System](systems/04-action-system.md)
- [Intelligence System](systems/05-intelligence-system.md)

### Services
- **Foundation**
  - [Basic Service](services/foundation/basicService.md)
  - [Database Service](services/foundation/databaseService.md)
  - [Config Service](services/foundation/configService.md)
  - [Logger Service](services/foundation/logger.md)
- **AI Services**
  - [AI Service](services/ai/aiService.md)
  - [Google AI](services/ai/googleAIService.md)
  - [OpenRouter](services/ai/openrouterAIService.md)
  - [Ollama](services/ai/ollamaService.md)
  - [Replicate](services/ai/replicateService.md)
  - [Prompt Service](services/ai/promptService.md)
- **Entity Services**
  - [Avatar Service](services/entity/avatarService.md)
  - [Memory Service](services/entity/memoryService.md)
  - [Creation Service](services/entity/creationService.md)
- **Communication**
  - [Conversation Manager](services/communication/conversationManager.md)
  - [Channel Manager](services/communication/channelManager.md)
  - [Message Handler](services/communication/messageHandler.md)
  - [Decision Maker](services/communication/decisionMaker.md)
  - [Periodic Task Manager](services/communication/periodicTaskManager.md)
  - [Command Handler](services/communication/commandHandler.md)
  - [Spam Control](services/communication/spamControlService.md)
- **World Services**
  - [Location Service](services/world/locationService.md)
  - [Map Service](services/world/mapService.md)
  - [Item Service](services/world/itemService.md)
  - [Quest Generator](services/world/questGeneratorService.md)
  - [Quest Service](services/world/questService.md)
- **Tool System**
  - [Tool Service](services/tools/toolService.md)
  - [Basic Tool](services/tools/basicTool.md)
  - [Action Log](services/tools/actionLog.md)
  - [Tool Implementations](services/tools/implementations.md)
- **Media Services**
  - [Image Processing](services/media/imageProcessingService.md)
  - [S3 Storage](services/media/s3Service.md)
- **Web Services**
  - [Web API](services/web/webService.md)
  - [Auth](services/web/authService.md)
  - [Thumbnail](services/web/thumbnailService.md)
- **Social Integrations**
  - [Discord](services/social/discord-integration.md)
  - [X (Twitter)](services/social/x-integration.md)
  - [Telegram](services/social/telegram-integration.md)
- **Blockchain**
  - [Token Service](services/blockchain/tokenService.md)
  - [NFT Minting](services/blockchain/nftMintService.md)
  - [Crossmint](services/blockchain/crossmintService.md)

### Deployment
- [Deployment Guide](deployment/07-deployment.md)
- [Future Roadmap](deployment/08-future-work.md)

### Architecture & Reports
- [Architecture Report](services/architecture-report.md)
- [System Report](../SYSTEM_REPORT.md)

---

## Building the Docs

Generate the HTML docs with:

```bash
npm run docs
```

Output is in `docs/build`.

---

For contribution guidelines, style guide, and tooling, see [README.docs.md](../README.docs.md).