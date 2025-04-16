# Tool Service

## Overview
The ToolService manages the game mechanics and interactive capabilities of the system through a collection of specialized tools. It acts as a central registry for all gameplay tools, processes commands from AI avatars, and coordinates tool execution with appropriate logging.

## Functionality
- **Tool Registry**: Maintains a collection of available tools and their emoji triggers
- **Command Processing**: Extracts and processes tool commands from avatar messages (supports multiple commands per message)
- **Action Logging**: Records all tool usage for history and context
- **Dynamic Creation**: Handles creation of game entities when no specific tool matches
- **Cooldown Management**: Ensures fair tool usage per avatar
- **Guild Emoji Overrides**: Allows per-guild customization of tool emojis

## Implementation
The ToolService extends BasicService and initializes with a suite of specialized tool classes. Each tool is registered with both a unique name and an emoji trigger that can be used in messages. All tools must implement the following API:
- `getDescription()`: Returns a short description of the tool.
- `getSyntax()`: Returns usage instructions for the tool.
- `execute(message, params, avatar)`: Executes the tool's action.

### Tool Registration Example
```javascript
const toolClasses = {
  summon: SummonTool,
  breed: BreedTool,
  attack: AttackTool,
  defend: DefendTool,
  move: MoveTool,
  remember: RememberTool,
  create: CreationTool,
  x: XSocialTool, // Standardized name
  item: ItemTool,
  respond: ThinkTool,
  forum: ForumTool,
};
Object.entries(toolClasses).forEach(([name, ToolClass]) => {
  const tool = new ToolClass(this.services);
  this.tools.set(name, tool);
  if (tool.emoji) this.toolEmojis.set(tool.emoji, name);
});
```

### Key Methods

#### `extractToolCommands(text)`
Parses a text message to identify and extract all tool commands based on emoji triggers. Returns all detected commands and a cleaned version of the text.

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

  return { commands, cleanText: narrativeLines.join('\n'), commandLines };
}
```

#### `getCommandsDescription(guildId, avatar)`
Generates a formatted description of all available commands for a given guild and avatar, including syntax and descriptions. Only includes tools that are not on cooldown for the avatar.

#### `executeTool(toolName, message, params, avatar, guildConfig)`
Executes a tool command with the given parameters, checks cooldowns using CooldownService, and handles success/failure logging. If the command doesn't match a known tool, it uses the CreationTool as a fallback.

## Available Tools
The service manages multiple specialized tools:
- **SummonTool** (`summon`, emoji: `🔮`): Creates new avatars in the current location
- **BreedTool** (`breed`, emoji: `🏹`): Combines traits of two avatars to create a new one
- **AttackTool** (`attack`, emoji: `⚔️`): Handles combat mechanics
- **DefendTool** (`defend`, emoji: `🛡️`): Provides defensive actions
- **MoveTool** (`move`, emoji: `🏃‍♂️`): Allows avatars to change location
- **RememberTool** (`remember`, emoji: `📝`): Creates explicit memories for an avatar
- **CreationTool** (`create`, emoji: `✨`): Handles generic creation of new entities
- **XSocialTool** (`x`, emoji: `🐦`): Enables social media integration (post, reply, like, etc.)
- **ItemTool** (`item`, emoji: `📦`): Manages item interactions
- **ThinkTool** (`respond`, emoji: `💭`): Enables internal monologue and reflection
- **ForumTool** (`forum`, emoji: `🛰️`): Interact with the forum (if enabled)

## Cooldown Management
ToolService uses a centralized `CooldownService` to manage per-tool, per-avatar cooldowns. When generating available commands or executing a tool, ToolService checks if the tool is on cooldown for the avatar. Cooldown checks and updates are handled via `CooldownService.getRemainingCooldown(toolName, avatarId, cooldownMs)` and `CooldownService.setUsed(toolName, avatarId)`.

## Guild Emoji Overrides
Guilds can override default tool emojis via configuration. ToolService applies these overrides at runtime, ensuring that command parsing and help output reflect the current guild's emoji mappings.

## Error Handling
All tools should provide user-friendly error messages and log detailed errors for debugging. Standardize error formatting for consistency. Example:
```
-# [ ❌ Error: <user-friendly message> ]
```

## Example Usage
```
🔮 summon
📦 take sword
⚔️ attack @enemy
🐦 post Hello world!
🛡️ defend
```

## Action Logging
The service uses the ActionLog component to record all tool usage, providing a history of actions in the world that can be used for context and storytelling.

## Testing
Unit tests are recommended for command extraction, cooldown logic, and tool execution. Ensure that new tools are covered by tests and that error handling is validated.

## Dependencies
- LocationService: For location-based operations
- AvatarService: For avatar management
- ItemService: For item interactions
- DiscordService: For message delivery
- DatabaseService: For data persistence
- ConfigService: For system configuration
- MapService: For spatial relationships
- CooldownService: For managing tool cooldowns