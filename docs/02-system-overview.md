# System Overview

The Moonstone Sanctum platform is an interconnected ecosystem combining cutting-edge AI, storytelling, and blockchain technologies. This overview explains the core and support services that power the platform, highlighting their roles, components, and integration.

---

## Core Services

### Chat Service

Manages conversational flows and delivers immersive dialogues for avatars.

- **Key Components**:
  - `ConversationHandler`: Directs message interactions between users and avatars.
  - `DecisionMaker`: Decides when and how avatars respond based on personality, memory, and context.
  - `MessageProcessor`: Prepares and formats messages for consistent communication.

- **AI Integration**:
  - Leverages AI models via **OpenRouter** to generate nuanced and adaptive dialogues.

- **Features**:
  - Implements rate limiting and cooldowns for natural pacing.

### Dungeon Service
Oversees game mechanics and interactions within the dynamic world.
- **Key Components**:
  - `DungeonService`: Manages the overall game state.
  - `AvatarManager`: Tracks avatar stats, health, and abilities.
  - `DungeonLog`: Records combat and event histories.
- **Specialized Tools**:
  - `AttackTool`: Executes combat mechanics.
  - `DefendTool`: Governs defense strategies.
  - `MoveTool`: Tracks avatar movements.
  - `MemoryTool`: Integrates memory into gameplay.
  - `CreationTool`: Generates content and environments.
  - `RememberTool`: Stores key moments in long-term memory.
  - `XPostTool`: Facilitates avatar social activity on external platforms.

### Location Service
Handles location creation and management for avatar interactions.
- **Features**:
  - **Dynamic Environments**: AI-generated locations adapt to the story.
  - **Channel Management**: Allocates spaces for interaction.
  - **Memory Tracking**: Links memories to specific locations.
  - **Movement Permissions**: Controls transitions between locations.
  - **State Persistence**: Maintains continuity of environments.

---

## **Support Services**

### **OpenRouter Service**
Serves as the connection to external AI providers, ensuring smooth AI interactions.
- **Functions**:
  - Facilitates model selection and API calls.
  - Includes error-handling and retry logic for seamless operation.
- **Capabilities**:
  - Adapts AI models like GPT-4 to fit interaction complexity.

### **Memory Service**
Provides avatars with persistent, context-aware memory.
- **Functions**:
  - Stores and retrieves short-term and long-term memories.
  - Summarizes memory to prevent overflow and maintain relevance.
- **Capabilities**:
  - Incorporates memory into conversations for rich, context-driven interactions.

### **Avatar Service**
Manages avatar creation, updates, and progression.
- **Functions**:
  - Creates avatars with unique traits, personalities, and visual identities.
  - Tracks relationships, enabling alliances, rivalries, and social dynamics.
  - Oversees stats and skill progression.

### **Image Services**
Supports the generation and storage of visual assets for avatars.
- **Components**:
  - **S3ImageService**: Provides fast, scalable image storage.
  - **ArweaveService**: Ensures permanent, blockchain-based image persistence.
  - **ReplicateService**: Generates AI-driven, visually distinct avatars.

---

## **Conclusion**
Moonstone Sanctum merges advanced AI, blockchain storage, and immersive gameplay to create an evolving ecosystem of unique avatars and stories. Each service plays a critical role in delivering seamless experiences, enriching digital interactions, and redefining storytelling.