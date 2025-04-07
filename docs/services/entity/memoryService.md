# Memory Service

## Overview
The MemoryService provides long-term memory capabilities for AI avatars, allowing them to recall past events, interactions, and knowledge. It implements both explicit and implicit memory creation, retrieval, and management.

## Functionality
- **Memory Storage**: Persists memories in the database with metadata
- **Memory Retrieval**: Fetches relevant memories based on context
- **Explicit Memory Creation**: Allows direct creation of memories
- **Implicit Memory Formation**: Automatically extracts significant details from interactions
- **Memory Relevance**: Ranks and filters memories based on importance and recency

## Implementation
The MemoryService extends BasicService and uses the database to store memory records. Each memory includes content, metadata, and relevance information to facilitate effective retrieval.

```javascript
export class MemoryService extends BasicService {
  constructor(container) {
    super(container, [
      'databaseService',
      'aiService',
      'avatarService',
    ]);
    
    this.db = this.databaseService.getDatabase();
    
    // Additional initialization...
  }
  
  // Methods...
}
```

### Key Methods

#### `createMemory(avatarId, memory, metadata = {})`
Creates a new memory for an avatar with the provided content and metadata.

#### `getMemories(avatarId, limit = 10, query = {})`
Retrieves recent memories for an avatar, optionally filtered by query criteria.

#### `searchMemories(avatarId, searchText)`
Searches an avatar's memories for specific content or keywords.

#### `generateMemoryFromText(avatarId, text)`
Uses AI to extract and formulate memories from conversation text.

#### `deleteMemory(memoryId)`
Removes a specific memory from an avatar's history.

## Memory Structure
Each memory includes:
- `avatarId`: The owner of the memory
- `memory`: The actual memory content
- `timestamp`: When the memory was formed
- `importance`: A numerical rating of significance (1-10)
- `tags`: Categorization labels for filtering
- `context`: Associated information (location, participants, etc.)
- `source`: How the memory was formed (explicit, conversation, etc.)

## Memory Retrieval Logic
Memories are retrieved based on a combination of factors:
- Recency (newer memories prioritized)
- Importance (higher importance memories retained longer)
- Relevance (contextual matching to current situation)
- Explicit tagging (categorization for targeted recall)

## Dependencies
- DatabaseService: For persistence of memory data
- AIService: For generating and extracting memories
- AvatarService: For avatar context and relationships