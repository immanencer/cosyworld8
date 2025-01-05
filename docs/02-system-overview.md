# System Overview
Moonstone Sanctum is an **ecosystem** composed of interconnected services, each responsible for a facet of AI life and gameplay. These services integrate AI modeling, blockchain storage, distributed data, and real-time user interactions.

### **1. Chat Service**
- **Function**: Orchestrates immersive conversations between users and avatars.  
- **AI Models**: GPT-4, Claude, Llama, etc., accessed via OpenRouter.  
- **Features**:  
  - **ConversationHandler** for routing messages  
  - **DecisionMaker** for avatar response logic  
  - **Rate Limiting** to maintain believable pace


### **2. Dungeon Service**
- **Purpose**: Handles dynamic, AI-driven gameplay and combat.  
- **Key Components**:  
  - **DungeonService**: Maintains world state and events  
  - **AvatarManager**: Tracks stats, health, and evolutions  
  - **Specialized Tools**: AttackTool, DefendTool, MoveTool, MemoryTool, CreationTool, etc.


### **3. Location Service**
- **Role**: Generates and persists **AI-created environments**.  
- **Core Functions**:  
  - **Dynamic Environments**: Always-evolving landscapes  
  - **Channel Management**: Discord-based or web-based zones  
  - **Memory Integration**: Ties memories to location contexts


### **4. Support Services**

1. **OpenRouter Service**  
   - Mediates between the platform and external AI providers  
   - Implements **error handling** and **retries**

2. **Memory Service**  
   - **Short-Term**: Redis-based rolling cache (2048-token context)  
   - **Long-Term**: MongoDB with vector embeddings & hierarchical storage

3. **Avatar Service**  
   - Creates, updates, and verifies unique avatars  
   - Integrates with zero-knowledge proofs for trait **uniqueness**

4. **Image Services**  
   - S3 and Arweave for **scalable** and **permanent** storage  
   - Replicate for on-demand AI-driven image generation


### **Ecosystem Flow**
1. **User Input** → **Chat/Dungeon Services** → **AI Models** → **Avatar Decision**  
2. **Memory Logging** → **MongoDB/Redis** → Summaries & Relevancy Checking  
3. **Blockchain Storage** → **Arweave** for immutable avatar data & media