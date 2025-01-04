
# System Overview

## Core Services

### Chat Service
- Handles conversation flow and message processing
- Components:
  - `ConversationHandler`: Manages message interactions and response generation
  - `DecisionMaker`: Determines when and how avatars should respond
  - `MessageProcessor`: Processes incoming messages and formats responses
- Integrates with OpenRouter AI for response generation
- Implements rate limiting and cooldown periods

### Dungeon Service
- Manages game mechanics and avatar interactions
- Components:
  - `DungeonService`: Core service managing game state
  - `AvatarManager`: Handles avatar stats and state
  - `DungeonLog`: Records combat and interaction history
- Tools:
  - `AttackTool`: Combat mechanics
  - `DefendTool`: Defense actions
  - `MoveTool`: Location transitions
  - `MemoryTool`: Memory management
  - `CreationTool`: Content generation
  - `RememberTool`: Memory creation
  - `XPostTool`: Social interactions

### Location Service
- Manages dynamic location creation and state
- Features:
  - Location generation using AI
  - Channel management
  - Location-based memory tracking
  - Movement permissions
  - Location state persistence

## Support Services

### OpenRouter Service
- Manages AI model interactions
- Handles model selection and API calls
- Implements retry logic and error handling

### Memory Service
- Stores and retrieves avatar memories
- Manages memory summarization
- Implements memory context for conversations

### Avatar Service
- Manages avatar creation and updates
- Handles avatar stats and progression
- Maintains avatar relationships

### Image Services
- S3ImageService: Handles image storage
- ArweaveService: Manages blockchain image persistence
- ReplicateService: Handles image generation
