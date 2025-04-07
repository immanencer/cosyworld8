# Prompt Service

## Overview
The Prompt Service is responsible for constructing context-rich, structured prompts for AI interactions throughout the system. It centralizes prompt creation logic, ensuring consistent and effective communication with AI models while incorporating relevant game state, avatar information, and contextual data.

## Functionality
- **System Prompt Generation**: Creates detailed system contexts for avatars
- **Narrative Prompt Building**: Constructs prompts for avatar personality development
- **Response Prompt Creation**: Builds prompts for avatar responses in conversations
- **Dungeon Context Assembly**: Combines location, inventory, and available actions
- **Memory Integration**: Incorporates avatar memories into prompts
- **Image Description Handling**: Processes and includes image descriptions in context

## Implementation
The PromptService extends the BasicService class and integrates with multiple other services to gather contextual information:

```javascript
constructor(services) {
  super(container, [
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
```

### Prompt Types

#### Basic System Prompt
Provides the core identity of an avatar:

```javascript
async getBasicSystemPrompt(avatar) {
  return `You are ${avatar.name}. ${avatar.personality}`;
}
```

#### Full System Prompt
Extends the basic prompt with location and narrative information:

```javascript
async getFullSystemPrompt(avatar, db) {
  const lastNarrative = await this.getLastNarrative(avatar, db);
  const { location } = await this.mapService.getLocationAndAvatars(avatar.channelId);

  return `
You are ${avatar.name}.
${avatar.personality}
${avatar.dynamicPersonality}
${lastNarrative ? lastNarrative.content : ''}
Location: ${location.name || 'Unknown'} - ${location.description || 'No description available'}
Last updated: ${new Date(location.updatedAt).toLocaleString() || 'Unknown'}
  `.trim();
}
```

#### Narrative Prompt
Used for avatar personality development and inner reflection:

```javascript
async buildNarrativePrompt(avatar) {
  const memories = await this.getMemories(avatar,100);
  const recentActions = await this.getRecentActions(avatar);
  const narrativeContent = await this.getNarrativeContent(avatar);
  return `
You are ${avatar.name || ''}.
Base personality: ${avatar.personality || ''}
Current dynamic personality: ${avatar.dynamicPersonality || 'None yet'}
Physical description: ${avatar.description || ''}
Recent memories:
${memories}
Recent actions:
${recentActions}
Recent thoughts and reflections:
${narrativeContent}
Based on all of the above context, share an updated personality that reflects your recent experiences, actions, and growth. Focus on how these events have shaped your character.
  `.trim();
}
```

#### Dungeon Prompt
Provides information about available commands, location, and items:

```javascript
async buildDungeonPrompt(avatar, guildId) {
  const commandsDescription = this.toolService.getCommandsDescription(guildId) || '';
  const location = await this.mapService.getLocationDescription(avatar.channelId, avatar.channelName);
  const items = await this.itemService.getItemsDescription(avatar);
  // ... additional context gathering ...
  
  return `
These commands are available in this location:
${summonEmoji} <any concept or thing> - Summon an avatar to your location.
${breedEmoji} <avatar one> <avatar two> - Breed two avatars together.
${commandsDescription}
${locationText}
${selectedItemText}
${groundItemsText}
You can also use these items in your inventory:
${items}
  `.trim();
}
```

#### Response User Content
Formats conversation history with image descriptions for chat responses:

```javascript
async getResponseUserContent(avatar, channel, messages, channelSummary) {
  // Format conversation history with images
  const channelContextText = messages
    .map(msg => {
      const username = msg.authorUsername || 'User';
      if (msg.content && msg.imageDescription) {
        return `${username}: ${msg.content} [Image: ${msg.imageDescription}]`;
      }
      // ... handle other message types ...
    })
    .join('\n');
  
  // ... assemble complete prompt ...
  
  return `
Channel: #${context.channelName} in ${context.guildName}

Channel summary:
${channelSummary}

Actions Available:
${dungeonPrompt}

Recent conversation history:
${channelContextText}

${avatar.name} ${avatar.emoji}:`.trim();
}
```

### Message Assembly
The service provides methods to build complete message arrays for AI conversations:

```javascript
async getNarrativeChatMessages(avatar) {
  const systemPrompt = await this.getBasicSystemPrompt(avatar);
  const assistantContext = await this.getNarrativeAssistantContext(avatar);
  const userPrompt = await this.buildNarrativePrompt(avatar);
  return [
    { role: 'system', content: systemPrompt },
    { role: 'assistant', content: assistantContext },
    { role: 'user', content: userPrompt }
  ];
}

async getResponseChatMessages(avatar, channel, messages, channelSummary, db) {
  const systemPrompt = await this.getFullSystemPrompt(avatar, db);
  const lastNarrative = await this.getLastNarrative(avatar, db);
  const userContent = await this.getResponseUserContent(avatar, channel, messages, channelSummary);
  return [
    { role: 'system', content: systemPrompt },
    { role: 'assistant', content: lastNarrative?.content || 'No previous reflection' },
    { role: 'user', content: userContent }
  ];
}
```

## Support Methods
The service includes several helper methods to gather contextual information:

- **getMemories**: Retrieves avatar memories from memory service
- **getRecentActions**: Gets recent actions performed by the avatar
- **getNarrativeContent**: Retrieves avatar inner monologue content
- **getLastNarrative**: Gets the most recent narrative reflection
- **getImageDescriptions**: Processes images in messages to include descriptions

## Dependencies
- AvatarService - For avatar data
- MemoryService - For avatar memories
- ToolService - For action logs and command descriptions
- ImageProcessingService - For processing images in messages
- ItemService - For inventory and item information
- DiscordService - For channel and message access
- MapService - For location information
- DatabaseService - For narrative storage and retrieval
- ConfigService - For system configuration

## Usage Examples

### Generating Narrative Chat Messages
```javascript
// For avatar reflection/personality development
const narrativeMessages = await promptService.getNarrativeChatMessages(avatar);
const narrativeResponse = await aiService.chat(narrativeMessages);
```

### Generating Response Chat Messages
```javascript
// For avatar responses in conversations
const responseMessages = await promptService.getResponseChatMessages(
  avatar, 
  channel, 
  recentMessages, 
  channelSummary,
  database
);
const avatarResponse = await aiService.chat(responseMessages);
```

### Building Custom Prompts
```javascript
// For specific prompt use cases
const systemPrompt = await promptService.getFullSystemPrompt(avatar, database);
const dungeonContext = await promptService.buildDungeonPrompt(avatar, guildId);
```

## Integration Points
The Prompt Service integrates with:
- AI Service for prompt delivery
- Conversation Manager for chat context
- Avatar Service for personality and traits
- Memory Service for contextual history
- Map Service for environmental context