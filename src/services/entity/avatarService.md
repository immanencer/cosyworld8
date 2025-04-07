# Avatar Service

## Overview
The AvatarService manages the lifecycle of AI avatars within the RATi ecosystem. It handles avatar creation, retrieval, updates, and management of avatar state. Avatars are persistent, on-chain entities with personalities, appearances, and narrative histories that conform to the RATi NFT Metadata Standard.

## Functionality
- **Avatar Creation**: Generates new avatars with AI-driven personalities and metadata
- **Avatar Retrieval**: Provides methods to fetch avatars by various criteria
- **State Management**: Handles avatar state changes with on-chain persistence
- **Avatar Evolution**: Manages avatar development through the burn-to-upgrade process
- **Breeding**: Facilitates creation of new avatars from parent traits
- **Media Management**: Handles avatar images with Arweave storage
- **NFT Integration**: Implements RATi NFT Metadata Standard

## Implementation
The AvatarService extends BasicService and works with both traditional databases and blockchain storage to ensure avatar persistence. It interfaces with AI services for generating personality traits and with image services for visual representations.

```javascript
export class AvatarService extends BasicService {
  constructor(container) {
    super(container, [
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
Creates a new avatar with the provided data, generating RATi-compliant metadata for any missing required fields using AI services.

#### `getAvatarById(avatarId)` and `getAvatarByName(name)`
Retrieves avatars by ID or name from the database, with optional blockchain verification.

#### `getAvatarsInChannel(channelId)`
Finds all avatars currently located in a specific channel or location.

#### `updateAvatar(avatar, updates)`
Updates an avatar with new information while maintaining data integrity and on-chain consistency.

#### `generatePersonality(name, description)`
Uses AI to generate a personality for a new avatar based on name and description, formatted as RATi metadata attributes.

#### `breedAvatars(parent1, parent2, options)`
Creates a new avatar by combining traits from two parent avatars, with lineage tracking in the evolution field.

#### `updateArweaveMetadata(avatar)`
Updates permanent storage (Arweave) with current avatar data for long-term preservation and blockchain integration.

#### `mintNFTFromAvatar(avatar, walletAddress)`
Creates an on-chain NFT representation of an avatar following the RATi NFT Metadata Standard.

## RATi NFT Metadata Integration
Avatars implement the RATi NFT Metadata Standard with these mappings:

```javascript
// Standard RATi metadata for avatars
const ratiMetadata = {
  tokenId: avatar._id.toString(),
  name: avatar.name,
  description: avatar.description,
  media: {
    image: avatar.imageUrl
  },
  attributes: [
    { trait_type: "Personality", value: avatar.personality.slice(0, 50) },
    { trait_type: "Voice", value: avatar.voiceStyle || "Standard" },
    { trait_type: "Role", value: avatar.role || "Explorer" }
  ],
  storage: {
    primary: avatar.arweaveId ? `ar://${avatar.arweaveId}` : null,
    backup: avatar.ipfsId ? `ipfs://${avatar.ipfsId}` : null
  },
  evolution: {
    level: avatar.evolutionLevel || 1,
    previous: avatar.parentIds || [],
    timestamp: avatar.updatedAt.toISOString()
  },
  memory: {
    recent: avatar.memoryArweaveId ? `ar://${avatar.memoryArweaveId}` : null,
    archive: avatar.archiveArweaveId ? `ar://${avatar.archiveArweaveId}` : null
  }
};
```

## Avatar Schema
Avatars follow a standardized schema that extends the RATi NFT Metadata Standard:

### Core Identity
- `name`: The avatar's name
- `emoji`: Emoji representation
- `description`: Physical description
- `personality`: Core personality traits
- `imageUrl`: Visual representation
- `arweaveId`: Permanent storage identifier
- `tokenId`: On-chain NFT identifier (when minted)

### State and Location
- `status`: Current state (alive, dead, inactive)
- `channelId`: Current location channel
- `model`: Associated AI model
- `lives`: Number of lives remaining

### Evolution and Lineage
- `evolutionLevel`: Current upgrade level
- `parentIds`: Array of parent avatar IDs
- `childIds`: Array of child avatar IDs
- `breedingCount`: Number of breeding events

### Memory and Context
- `dynamicPersonality`: Evolves based on experiences
- `innerMonologueChannel`: Channel for private thoughts
- `memoryArweaveId`: Link to recent memories
- `archiveArweaveId`: Link to complete history

## Autonomous Behaviors
Avatars exhibit autonomous behaviors based on:
- **Personality Traits**: Core behavioral patterns
- **Recent Memories**: Context-specific reactions
- **Location Context**: Environmental influences
- **Relationship Network**: Interactions with other avatars
- **Inventory Items**: Special abilities and tools

## Dependencies
- DatabaseService: For traditional persistence of avatar data
- AIService: For generating personalities and traits
- ImageProcessingService: For avatar images
- ConfigService: For avatar-related settings
- NFTMintService: For on-chain avatar minting
- ArweaveService: For permanent metadata storage

## Integration with Blockchain
The AvatarService provides several blockchain-related features:
- **NFT Minting**: Creation of on-chain avatar representations
- **Metadata Verification**: Ensuring consistency between database and blockchain
- **Evolution Processing**: Implementing the burn-to-upgrade process
- **Cross-Platform Identity**: Maintaining consistent representation across platforms
- **Cryptographic Signatures**: Verifying authenticity of avatar data and transitions