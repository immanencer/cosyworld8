# Config Service

## Overview
The Config Service manages configuration settings throughout the CosyWorld system. It provides a centralized approach to handling global defaults, environment variables, and guild-specific configurations. This service ensures consistent configuration access and caching for improved performance.

## Functionality
- **Global Configuration**: Manages system-wide settings from multiple sources
- **Environment Variable Integration**: Incorporates environment variables as configuration values
- **Guild-Specific Settings**: Manages unique configurations for individual Discord guilds
- **Configuration Caching**: Improves performance by caching frequently accessed configurations
- **Configuration Validation**: Ensures critical configuration values are present
- **Configuration Merging**: Combines defaults with customized settings

## Implementation
The ConfigService extends the BasicService class and maintains multiple configuration layers:

```javascript
export class ConfigService extends BasicService {
  constructor(services) {
    super(services, ['databaseService']);
    this.db = this.databaseService.getDatabase();
    
    // Initialize global configuration with defaults from environment variables
    this.config = {
      prompt: {
        summon: process.env.SUMMON_PROMPT || "Create a twisted avatar...",
        introduction: process.env.INTRODUCTION_PROMPT || "You've just arrived. Introduce yourself."
      },
      ai: {
        openrouter: {
          apiKey: process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_TOKEN,
          model: process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.2-3b-instruct',
          // Additional AI configuration...
        },
        // More AI service configurations...
      },
      mongo: {
        uri: process.env.MONGO_URI,
        dbName: process.env.MONGO_DB_NAME || 'discord-bot',
        collections: {
          avatars: 'avatars',
          imageUrls: 'image_urls',
          guildConfigs: 'guild_configs'
        }
      },
      webhooks: {}
    };
    
    this.guildConfigCache = new Map(); // Cache for guild configurations
  }
}
```

### Key Methods

#### Loading Configuration Files

```javascript
async loadConfig() {
  try {
    const defaultConfig = JSON.parse(
      await fs.readFile(path.join(CONFIG_DIR, 'default.config.json'), 'utf8')
    );
    let userConfig = {};
    try {
      userConfig = JSON.parse(
        await fs.readFile(path.join(CONFIG_DIR, 'user.config.json'), 'utf8')
      );
    } catch (error) {
      // Create user config with defaults if it doesn't exist
      await fs.writeFile(
        path.join(CONFIG_DIR, 'user.config.json'),
        JSON.stringify(this.config, null, 2)
      );
      userConfig = this.config;
    }

    // Merge configs, with user config taking precedence
    this.config = { ...this.config, ...defaultConfig, ...userConfig };
  } catch (error) {
    console.error('Error loading config:', error);
  }
}
```

#### Guild Configuration Management

```javascript
async getGuildConfig(guildId, forceRefresh = false) {
  if (!guildId) {
    console.warn(`Invalid guild ID: ${guildId}`);
    return this.getDefaultGuildConfig(guildId);
  }

  // Check cache first
  if (!forceRefresh && this.guildConfigCache.has(guildId)) {
    return this.guildConfigCache.get(guildId);
  }

  // Fetch from database and cache the result
  try {
    const collection = db.collection(this.config.mongo.collections.guildConfigs);
    const guildConfig = await collection.findOne({ guildId });
    const mergedConfig = this.mergeWithDefaults(guildConfig, guildId);
    this.guildConfigCache.set(guildId, mergedConfig);
    return mergedConfig;
  } catch (error) {
    console.error(`Error fetching guild config for ${guildId}:`, error);
    return this.getDefaultGuildConfig(guildId);
  }
}
```

### Configuration Structure
The service maintains configuration in a hierarchical structure:

- **Global Configuration**: System-wide settings
  - **Prompts**: Default prompts for system operations
  - **AI Settings**: Configuration for various AI providers
  - **Database Settings**: MongoDB connection and collection details
  - **Webhooks**: External communication endpoints

- **Guild Configuration**: Discord guild-specific settings
  - **Permissions**: Role-based access control
  - **Custom Prompts**: Guild-specific prompt overrides
  - **UI Settings**: Custom emojis and visual elements
  - **Feature Toggles**: Guild-specific feature enablement

## Dependencies
- **DatabaseService**: For storing and retrieving guild configurations
- **Environment Variables**: For sensitive configuration values
- **Configuration Files**: For persistent configuration storage

## Usage Examples

### Accessing Global Configuration
```javascript
// Get AI configuration
const aiConfig = configService.get('ai');
console.log(`Using AI model: ${aiConfig.openrouter.model}`);

// Get Discord-specific configuration
const discordConfig = configService.getDiscordConfig();
```

### Working with Guild Configurations
```javascript
// Get configuration for a specific guild
const guildConfig = await configService.getGuildConfig('123456789012345678');
console.log(`Guild summon prompt: ${guildConfig.prompts.summon}`);

// Update guild configuration
await configService.updateGuildConfig('123456789012345678', {
  'prompts.summon': 'Create a heroic avatar to join your adventure',
  'summonEmoji': '⚔️'
});
```

### Configuration Validation
```javascript
// Validate critical configuration values
if (configService.validate()) {
  console.log('Configuration is valid');
} else {
  console.error('Configuration validation failed');
}
```

## Best Practices
- Use environment variables for sensitive values (API keys, tokens)
- Use configuration files for complex defaults and non-sensitive values
- Cache frequently accessed configurations
- Provide sensible defaults for all configuration values
- Validate critical configuration values during initialization