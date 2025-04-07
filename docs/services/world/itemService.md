# Item Service

## Overview
The ItemService manages the creation, storage, retrieval, and interaction of items within the RATi Avatar System. It implements the RATi NFT Metadata Standard for items, enabling them to exist as on-chain assets with autonomous behaviors and effects. Items can be traded, used, combined, and evolve through interactions with avatars and environments.

## Functionality
- **Item Creation**: Generates new items with AI-driven properties and RATi-compliant metadata
- **Inventory Management**: Tracks item ownership and transfers across wallets and platforms
- **Item Retrieval**: Provides methods to find and access items by various criteria
- **Item Interactions**: Handles using, combining, and affecting items with autonomous behaviors
- **Item Evolution**: Manages the burn-to-upgrade process for items
- **Blockchain Integration**: Supports on-chain verification and persistent storage

## Implementation
The ItemService extends BasicService and uses both database and blockchain storage to persist item information. It interfaces with AI services to generate item descriptions and behaviors.

```javascript
export class ItemService extends BasicService {
  constructor(container) {
    super(container, [
      'databaseService',
      'aiService',
      'configService',
      'arweaveService',
      'nftMintService',
    ]);
    
    this.db = this.databaseService.getDatabase();
    
    // Additional initialization...
  }
  
  // Methods...
}
```

### Key Methods

#### `createItem(data)`
Creates a new item with RATi-compliant metadata, generating missing fields with AI services.

#### `getItemById(itemId)`
Retrieves an item from the database by its ID, with optional blockchain verification.

#### `searchItems(locationId, searchTerm)`
Finds items in a specific location, optionally filtered by search term.

#### `addItemToInventory(avatarId, itemId)`
Transfers an item to an avatar's inventory, updating both database and blockchain records.

#### `removeItemFromInventory(avatarId, itemId)`
Removes an item from an avatar's inventory, updating records accordingly.

#### `useItem(avatarId, itemId, targetId = null)`
Processes the usage of an item, potentially affecting the target and triggering autonomous behaviors.

#### `generateItemResponse(item, channelId)`
Uses AI to generate a "response" from an item as if it were speaking, based on its metadata attributes.

#### `updateArweaveMetadata(item)`
Updates permanent storage with current item data for blockchain integration.

#### `mintNFTFromItem(item, walletAddress)`
Creates an on-chain NFT representation of an item following the RATi NFT Metadata Standard.

#### `evolveItem(itemIds, walletAddress)`
Implements the burn-to-upgrade process for evolving items by combining multiple source items.

## RATi NFT Metadata Integration
Items implement the RATi NFT Metadata Standard with these mappings:

```javascript
// Standard RATi metadata for items
const ratiMetadata = {
  tokenId: item._id.toString(),
  name: item.name,
  description: item.description,
  media: {
    image: item.imageUrl
  },
  attributes: [
    { trait_type: "Type", value: item.type },
    { trait_type: "Rarity", value: item.rarity },
    { trait_type: "Effect", value: item.effect || "None" }
  ],
  storage: {
    primary: item.arweaveId ? `ar://${item.arweaveId}` : null,
    backup: item.ipfsId ? `ipfs://${item.ipfsId}` : null
  },
  evolution: {
    level: item.evolutionLevel || 1,
    previous: item.sourceItemIds || [],
    timestamp: item.updatedAt.toISOString()
  },
  memory: {
    recent: item.interactionArweaveId ? `ar://${item.interactionArweaveId}` : null,
    archive: null
  }
};
```

## Item Schema
Items follow a standardized schema that extends the RATi NFT Metadata Standard:

### Core Identity
- `name`: The item's name
- `description`: Detailed description of appearance and properties
- `type`: Item category (weapon, tool, artifact, etc.)
- `rarity`: How rare/valuable the item is (common, uncommon, rare, legendary)
- `imageUrl`: Visual representation
- `arweaveId`: Permanent storage identifier
- `tokenId`: On-chain NFT identifier (when minted)

### Properties and Effects
- `properties`: Special attributes and effects object
- `effect`: Primary effect description
- `usageCount`: Number of times the item has been used
- `durability`: Current durability status
- `cooldown`: Timestamp for next available use

### Ownership and Location
- `ownerId`: Current owner (avatar ID or wallet address)
- `locationId`: Current location if not in inventory
- `transferable`: Whether the item can be traded
- `bound`: Whether the item is soul-bound to its owner

### Evolution and Crafting
- `evolutionLevel`: Current upgrade level
- `sourceItemIds`: Array of items used to create this item
- `craftingRecipe`: Requirements for using in evolution
- `ingredientFor`: Items this can help create

## Item Types and Effects
The service supports different categories of items:

### Equipment
- Wearable items that provide passive benefits
- Affects avatar appearance and capabilities
- Can be equipped in specific slots
- May have durability limitations

### Consumables
- One-time or limited-use items
- Provides immediate effects when used
- May restore avatar resources
- Often used as crafting ingredients

### Artifacts
- Unique special items with powerful effects
- Often triggers location or story events
- May have autonomous behaviors
- Usually non-transferable or rare

### Key Items
- Progression-related items
- Unlocks locations or abilities
- Often part of quest chains
- Typically non-consumable

## Autonomous Behaviors
Items can exhibit autonomous behaviors based on:
- **Rarity Tier**: Higher rarity enables more complex behaviors
- **Type Properties**: Different categories have specific action patterns
- **Environmental Context**: Responds differently based on location
- **Interaction History**: Adapts based on previous uses
- **Owner Relationship**: Personalized behaviors for long-term owners

## Dependencies
- DatabaseService: For traditional persistence of item data
- AIService: For generating item descriptions and behaviors
- ArweaveService: For permanent metadata storage
- NFTMintService: For on-chain item minting
- ConfigService: For item-related settings and rules

## Blockchain Integration
The ItemService provides several blockchain-related features:
- **NFT Minting**: Creation of on-chain item representations
- **Metadata Storage**: Permanent recording of item properties on Arweave
- **Transfer Verification**: Ensuring legitimate ownership transitions
- **Evolution Processing**: Implementing the burn-to-upgrade process
- **Cross-Platform Consistency**: Maintaining consistent representation across platforms