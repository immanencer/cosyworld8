# Item Service

## Overview
The ItemService manages the creation, storage, retrieval, and interaction with items in the game world. It handles item lifecycles, inventories, and the effects items have on avatars and the environment.

## Functionality
- **Item Creation**: Generates new items with AI-driven properties
- **Inventory Management**: Tracks item ownership and transfers
- **Item Retrieval**: Provides methods to find and access items
- **Item Interactions**: Handles using, combining, and affecting items
- **Item Properties**: Manages item attributes, effects, and behaviors

## Implementation
The ItemService extends BasicService and uses the database to persist item information. It interfaces with AI services to generate item descriptions and behaviors.

```javascript
export class ItemService extends BasicService {
  constructor(services) {
    super(services, [
      'databaseService',
      'aiService',
      'configService',
    ]);
    
    this.db = this.databaseService.getDatabase();
    
    // Additional initialization...
  }
  
  // Methods...
}
```

### Key Methods

#### `createItem(data)`
Creates a new item with the provided properties, generating missing fields with AI.

#### `getItemById(itemId)`
Retrieves an item from the database by its ID.

#### `searchItems(locationId, searchTerm)`
Finds items in a specific location, optionally filtered by search term.

#### `addItemToInventory(avatarId, itemId)`
Transfers an item to an avatar's inventory.

#### `removeItemFromInventory(avatarId, itemId)`
Removes an item from an avatar's inventory.

#### `getItemsDescription(avatar)`
Generates a formatted description of an avatar's inventory items.

#### `useItem(avatarId, itemId, targetId = null)`
Processes the usage of an item, potentially affecting the target.

#### `generateItemResponse(item, channelId)`
Uses AI to generate a "response" from an item as if it were speaking.

## Item Schema
Items follow a standardized schema:
- `name`: The item's name
- `description`: Detailed description of appearance and properties
- `type`: Item category (weapon, tool, artifact, etc.)
- `rarity`: How rare/valuable the item is
- `properties`: Special attributes and effects
- `location`: Where the item is (or owner's inventory)
- `imageUrl`: Visual representation
- Various timestamps and version information

## Item Types and Effects
The service supports different categories of items:
- **Equipment**: Items that can be equipped to provide benefits
- **Consumables**: One-time use items with immediate effects
- **Quest Items**: Special items related to narrative progression
- **Artifacts**: Unique items with special properties and behaviors

## Dependencies
- DatabaseService: For persistence of item data
- AIService: For generating item descriptions and behaviors
- ConfigService: For item-related settings and rules