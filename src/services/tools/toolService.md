# Tool Service

## Overview
The ToolService manages the game mechanics and interactive capabilities of the system through a collection of specialized tools. It acts as a central registry for all gameplay tools, processes commands from AI avatars, and coordinates tool execution with appropriate logging.

## Functionality
- **Tool Registry**: Maintains a collection of available tools and their emoji triggers
- **Command Processing**: Extracts and processes tool commands from avatar messages
- **Action Logging**: Records all tool usage for history and context
- **Dynamic Creation**: Handles creation of game entities when no specific tool matches

## Implementation
The ToolService extends BasicService and initializes with a suite of specialized tool classes. Each tool is registered with both a name and, optionally, an emoji trigger that can be used in messages.

```javascript
export class ToolService extends BasicService {
  constructor(container) {
    super(container, [
      'locationService',
      'avatarService',
      'itemService',
      'discordService',
      'databaseService',
      'configService',
      'mapService',
    ]);
    
    // Initialize tool registry
    this.tools = new Map();
    this.toolEmojis = new Map();

    // Register tools
    const toolClasses = {
      summon: SummonTool,
      breed: BreedTool,
      attack: AttackTool,
      defend: DefendTool,
      move: MoveTool,
      remember: RememberTool,
      create: CreationTool,
      xpost: XPostTool,
      item: ItemTool,
      respond: ThinkTool,
    };

    Object.entries(toolClasses).forEach(([name, ToolClass]) => {
      const tool = new ToolClass(this.services);
      this.tools.set(name, tool);
      if (tool.emoji) this.toolEmojis.set(tool.emoji, name);
    });
    
    // Additional initialization...
  }
  
  // Methods...
}
```

### Key Methods

#### `extractToolCommands(text)`
Parses a text message to identify and extract tool commands based on emoji triggers. Returns both the commands and a cleaned version of the text.

```javascript
extractToolCommands(text) {
  if (!text) return { commands: [], cleanText: '', commandLines: [] };

  const lines = text.split('\n');
  const commands = [];
  const commandLines = [];
  const narrativeLines = [];

  for (const line of lines) {
    const trimmedLine = line.trim();
    let isCommand = false;
    for (const [emoji, toolName] of this.toolEmojis.entries()) {
      if (trimmedLine.startsWith(emoji)) {
        const rest = trimmedLine.slice(emoji.length).trim();
        const params = rest ? rest.split(/\s+/) : [];
        commands.push({ command: toolName, emoji, params });
        commandLines.push(line);
        isCommand = true;
        break;
      }
    }
    if (!isCommand) narrativeLines.push(line);
  }

  return { commands, text, commandLines };
}
```

#### `getCommandsDescription(guildId)`
Generates a formatted description of all available commands for a given guild, including syntax and descriptions.

#### `processAction(message, command, params, avatar)`
Executes a tool command with the given parameters and handles success/failure logging. If the command doesn't match a known tool, it uses the CreationTool as a fallback.

## Available Tools
The service manages multiple specialized tools:
- **SummonTool**: Creates new avatars in the current location
- **BreedTool**: Combines traits of two avatars to create a new one
- **AttackTool**: Handles combat mechanics
- **DefendTool**: Provides defensive actions
- **MoveTool**: Allows avatars to change location
- **RememberTool**: Creates explicit memories for an avatar
- **CreationTool**: Handles generic creation of new entities
- **XPostTool**: Enables social media integration
- **ItemTool**: Manages item interactions
- **ThinkTool**: Enables internal monologue and reflection

## Action Logging
The service uses the ActionLog component to record all tool usage, providing a history of actions in the world that can be used for context and storytelling.

## Dependencies
- LocationService: For location-based operations
- AvatarService: For avatar management
- ItemService: For item interactions
- DiscordService: For message delivery
- DatabaseService: For data persistence
- ConfigService: For system configuration
- MapService: For spatial relationships