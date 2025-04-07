# Item Service

## Overview
The ItemService manages creation, storage, retrieval, and interaction of items in the RATi Avatar System. It supports AI-driven item generation, inventory management, item evolution, crafting, and blockchain integration via the RATi NFT Metadata Standard.

## Functionality
- **Item Creation**: Generates new items with AI-driven properties and metadata
- **Inventory Management**: Tracks item ownership and transfers (wallets, avatars, locations)
- **Item Retrieval**: Finds items by criteria or location
- **Item Interactions**: Handles using, combining, and affecting items
- **Item Evolution & Leveling**: Burn-to-upgrade process requiring two lower-level items
- **Refined Crafting System**: Combines items with DnD stat influence and rarity rolls
- **Blockchain Integration**: Supports NFT minting, metadata storage, and verification

## Implementation
The ItemService extends BasicService, using database and blockchain storage, and AI services.

```javascript
export class ItemService extends BasicService {
  constructor(container) {
    super(container, [
      'databaseService', 'aiService', 'configService', 'arweaveService', 'nftMintService'
    ]);
    this.db = this.databaseService.getDatabase();
    // ...
  }
}
```

## Key Methods
- `createItem(data)`: Creates an item with AI-generated metadata
- `getItemById(itemId)`: Retrieves an item
- `searchItems(locationId, searchTerm)`: Finds items
- `addItemToInventory(avatarId, itemId)`: Adds item to avatar
- `removeItemFromInventory(avatarId, itemId)`: Removes item
- `useItem(avatarId, itemId, targetId)`: Uses item
- `generateItemResponse(item, channelId)`: AI-generated item speech
- `updateArweaveMetadata(item)`: Updates blockchain metadata
- `mintNFTFromItem(item, walletAddress)`: Mints NFT
- `evolveItem(itemIds, walletAddress)`: Burn-to-upgrade evolution

## RATi NFT Metadata
```js
const ratiMetadata = {
  tokenId: item._id.toString(),
  name: item.name,
  description: item.description,
  media: { image: item.imageUrl },
  attributes: [
    { trait_type: 'Type', value: item.type },
    { trait_type: 'Rarity', value: item.rarity },
    { trait_type: 'Effect', value: item.effect || 'None' }
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
- `name`, `description`, `type`, `rarity`, `imageUrl`, `arweaveId`, `tokenId`
- `properties`: effects, durability, DnD stats (STR, DEX, CON, INT, WIS, CHA)
- `ownerId`, `locationId`, `transferable`, `bound`
- `evolutionLevel`, `sourceItemIds`, `craftingRecipe`, `ingredientFor`
- `createdAt`, `updatedAt`, `version`

## Leveling & Refined Crafting
- To **level up** an item, combine **two items of the same level** (e.g., two level 2 → level 3)
- During crafting/evolution:
  - **Roll a d20**
  - On **1**: one source item is randomly destroyed, no upgrade
  - On **20**: upgrade succeeds, item becomes **legendary** rarity
  - Otherwise, rarity is based on roll (e.g., 1-12 common, 13-17 uncommon, 18-19 rare)
- Crafted items inherit or average **DnD stats** from source items
- Metadata records evolution lineage

## Item Types
- **Equipment**: Wearable, passive effects
- **Consumables**: One-time use
- **Artifacts**: Unique, powerful
- **Quest Items**: Progression
- **Key Items**: Unlocks

## Dependencies
- DatabaseService, AIService, ConfigService, ArweaveService, NFTMintService

## Blockchain Features
- NFT minting
- Metadata storage
- Ownership verification
- Evolution tracking