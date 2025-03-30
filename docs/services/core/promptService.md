# Prompt Service

## Overview
The PromptService is responsible for creating, managing, and optimizing the various prompts used by AI models throughout the system. It centralizes prompt construction logic to ensure consistency and enable prompt optimization across different use cases.

## Functionality
- **System Prompts**: Constructs foundational identity prompts for avatars
- **Narrative Prompts**: Creates prompts for generating narrative and reflection content
- **Response Prompts**: Builds context-aware prompts for avatar responses
- **Dungeon Prompts**: Specialized prompts for dungeon-based interaction and gameplay
- **Chat Messages Assembly**: Organizes prompts into structured message sequences for AI services

## Implementation
The service extends BasicService and requires multiple dependencies to construct rich, contextual prompts. It uses these dependencies to gather relevant information about avatars, their memories, locations, available tools, and other contextual elements.

```javascript
export class PromptService extends BasicService {
  constructor(services) {
    super(services, [
      "avatarService",
      "memoryService",
      "toolService",
      "imageProcessingService",
      "itemService",
      "discordService",
      "mapService",
      "databaseService",
      "configService",
    ]);

    this.client = this.discordService.client;
    this.db = this.databaseService.getDatabase();
  }
  
  // Methods for different prompt types...
}
```

### Key Methods

#### `getBasicSystemPrompt(avatar)`
Builds a minimal system prompt with just the avatar's identity.

#### `getFullSystemPrompt(avatar, db)`
Constructs a comprehensive system prompt including location details and narrative history.

#### `buildNarrativePrompt(avatar)`
Creates a prompt specifically for generating avatar self-reflection and personality development.

#### `buildDungeonPrompt(avatar, guildId)`
Builds context for dungeon interaction, including available commands, location details, and inventory.

#### `getResponseUserContent(avatar, channel, messages, channelSummary)`
Constructs the user content portion of a response prompt, incorporating channel context and recent messages.

#### `getNarrativeChatMessages(avatar)` and `getResponseChatMessages(...)`
Assembles complete chat message arrays ready for submission to AI models.

## Helper Methods
The service includes several helper methods that gather and format specific types of information:

- `getMemories(avatar, count)`: Retrieves recent memories for context
- `getRecentActions(avatar)`: Fetches recent action history
- `getNarrativeContent(avatar)`: Gets recent inner monologue/narrative content
- `getLastNarrative(avatar, db)`: Retrieves the most recent narrative reflection
- `getImageDescriptions(messages)`: Extracts image descriptions from messages

## Dependencies
- AvatarService: For avatar data
- MemoryService: For retrieving memories
- ToolService: For available commands and actions
- ImageProcessingService: For handling image content
- ItemService: For inventory and item information
- DiscordService: For channel and message access
- MapService: For location context
- DatabaseService: For persistent data access
- ConfigService: For system configuration