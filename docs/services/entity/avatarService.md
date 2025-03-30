# Avatar Service

## Overview
The AvatarService manages the lifecycle of AI avatars within the system. It handles avatar creation, retrieval, updates, and management of avatar state. Avatars are persistent entities with personalities, appearances, and narrative histories.

## Functionality
- **Avatar Creation**: Generates new avatars with AI-driven personalities
- **Avatar Retrieval**: Provides methods to fetch avatars by various criteria
- **State Management**: Handles avatar state changes and persistence
- **Avatar Evolution**: Manages avatar development and narrative history
- **Breeding**: Facilitates creation of new avatars from parent traits
- **Media Management**: Handles avatar images and other media

## Implementation
The AvatarService extends BasicService and works closely with the database to persist avatar data. It interfaces with AI services for generating personality traits and with image services for visual representations.

```javascript
export class AvatarService extends BasicService {
  constructor(services) {
    super(services, [
      'databaseService',
      'aiService',
      'imageProcessingService',
      'configService',
    ]);
    
    this.db = this.databaseService.getDatabase();
    
    // Additional initialization...
  }
  
  // Methods...
}
```

### Key Methods

#### `createAvatar(data)`
Creates a new avatar with the provided data, generating any missing required fields using AI services.

#### `getAvatarById(avatarId)` and `getAvatarByName(name)`
Retrieves avatars by ID or name from the database.

#### `getAvatarsInChannel(channelId)`
Finds all avatars currently located in a specific channel.

#### `updateAvatar(avatar, updates)`
Updates an avatar with new information while maintaining data integrity.

#### `generatePersonality(name, description)`
Uses AI to generate a personality for a new avatar based on name and description.

#### `breedAvatars(parent1, parent2, options)`
Creates a new avatar by combining traits from two parent avatars.

#### `updateAllArweavePrompts()`
Updates permanent storage (Arweave) with current avatar data for long-term preservation.

## Avatar Schema
Avatars follow a standardized schema:
- `name`: The avatar's name
- `emoji`: Emoji representation
- `description`: Physical description
- `personality`: Core personality traits
- `imageUrl`: Visual representation
- `status`: Current state (alive, dead, inactive)
- `model`: Associated AI model
- `lives`: Number of lives remaining
- `channelId`: Current location channel
- Various timestamps and version information

## Narrative and Memory Integration
Avatars maintain:
- Core personality (static)
- Dynamic personality (evolves based on experiences)
- Narrative history (recent reflections and developments)
- Memories (significant experiences)

## Dependencies
- DatabaseService: For persistence of avatar data
- AIService: For generating personalities and traits
- ImageProcessingService: For avatar images
- ConfigService: For avatar-related settings