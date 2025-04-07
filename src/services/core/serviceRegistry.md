# Service Registry

## Overview
The ServiceRegistry configures the Container with all available services in the system. It acts as the central configuration point for service registration, defining how services are created and their lifecycle options.

## Functionality
- **Service Configuration**: Defines all available services
- **Dependency Management**: Configures service creation with container-based dependency injection
- **Shared Container**: Exports a configured container instance for the entire application

## Implementation
The ServiceRegistry imports the Container and all service classes that need to be registered. It then creates a container instance and registers each service with its factory function and options.

```javascript
import { Container } from './container.mjs';
import { BasicService } from '../foundation/basicService.mjs';
import { SchedulingService } from '../scheduler/scheduler.mjs';

const container = new Container();

// Register logger
container.register('logger', () => console);

// Register BasicService as a test service
container.register('basic', (c) => new BasicService(c));
// Register SchedulingService
container.register('schedulingService', (c) => new SchedulingService(c));

export { container };
```

## Usage
The ServiceRegistry exports a pre-configured container that can be imported by other modules to resolve services:

```javascript
import { container } from './serviceRegistry.mjs';

// Resolve a service
const schedulingService = container.resolve('schedulingService');
```

The ServiceInitializer also uses the registry to access services during the application startup process.

## Dependencies
- Container
- All service classes that need to be registered

# Service Dependency Graph

```mermaid
graph LR

%% Infrastructure
subgraph Infrastructure
  Logger
  ConfigService
  DatabaseService
  SchedulingService
  S3Service
  ArweaveService
  ImageProcessingService
end

%% Domain
subgraph Domain
  DiscordService
  WebService
  MCPClientService
  AIService
  RiskManagerService
  SpamControlService
  MapService
  ItemService
  StatService
  CreationService
  MemoryService
  AvatarService
  PromptService
  DecisionMaker
  ConversationManager
  ChannelManager
  LocationService
  ModerationService
  ToolService
  MessageHandler
end

%% Infrastructure dependencies
ConfigService --> DatabaseService
DatabaseService -->|connect| ConfigService

%% Domain dependencies
DiscordService --> ConfigService
DiscordService --> DatabaseService

WebService --> ConfigService
WebService --> DatabaseService
WebService --> DiscordService

MCPClientService --> ConfigService

AIService --> ConfigService

RiskManagerService --> ConfigService
RiskManagerService --> DatabaseService

SpamControlService --> ConfigService
SpamControlService --> DatabaseService

MapService --> ConfigService
MapService --> DatabaseService

ItemService --> ConfigService
ItemService --> DatabaseService
ItemService --> DiscordService

StatService --> ConfigService
StatService --> DatabaseService

CreationService --> ConfigService
CreationService --> DatabaseService
CreationService --> AIService
CreationService --> S3Service

MemoryService --> ConfigService
MemoryService --> DatabaseService
MemoryService --> DiscordService
MemoryService --> CreationService
MemoryService --> MCPClientService

AvatarService --> ConfigService
AvatarService --> DatabaseService
AvatarService --> AIService
AvatarService --> SchedulingService
AvatarService --> MapService
AvatarService --> StatService

PromptService --> ConfigService
PromptService --> DiscordService
PromptService --> DatabaseService
PromptService --> MapService
PromptService --> ItemService
PromptService --> MemoryService
PromptService --> ToolService

DecisionMaker --> ConfigService
DecisionMaker --> AIService
DecisionMaker --> DiscordService

ConversationManager --> ConfigService
ConversationManager --> DatabaseService
ConversationManager --> AIService
ConversationManager --> DiscordService
ConversationManager --> AvatarService
ConversationManager --> MemoryService
ConversationManager --> PromptService

ChannelManager --> ConfigService
ChannelManager --> DatabaseService
ChannelManager --> DiscordService
ChannelManager --> SchedulingService
ChannelManager --> MapService
ChannelManager --> ConversationManager

LocationService --> ConfigService
LocationService --> AIService
LocationService --> DiscordService
LocationService --> DatabaseService
LocationService --> CreationService
LocationService --> ItemService
LocationService --> AvatarService
LocationService --> ChannelManager
LocationService --> ConversationManager
LocationService --> MapService

ModerationService --> AIService
ModerationService --> DatabaseService
ModerationService --> Logger
ModerationService --> ToolService
ModerationService --> RiskManagerService

ToolService --> ConfigService
ToolService --> DiscordService
ToolService --> DatabaseService
ToolService --> SpamControlService
ToolService --> AvatarService
ToolService --> SchedulingService
ToolService --> DecisionMaker
ToolService --> ConversationManager
ToolService --> ChannelManager
ToolService --> CreationService
ToolService --> PromptService
ToolService --> MemoryService
ToolService --> LocationService
ToolService --> MapService
ToolService --> AIService
ToolService --> ItemService
ToolService --> RiskManagerService

MessageHandler --> ConfigService
MessageHandler --> DiscordService
MessageHandler --> DatabaseService
MessageHandler --> SpamControlService
MessageHandler --> AvatarService
MessageHandler --> SchedulingService
MessageHandler --> DecisionMaker
MessageHandler --> ConversationManager
MessageHandler --> ChannelManager
MessageHandler --> CreationService
MessageHandler --> PromptService
MessageHandler --> MemoryService
MessageHandler --> LocationService
MessageHandler --> MapService
MessageHandler --> AIService
MessageHandler --> ItemService
MessageHandler --> RiskManagerService
MessageHandler --> ModerationService
MessageHandler --> ToolService
```