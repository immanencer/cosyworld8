# System Diagram

## System Architecture (Flowchart)

This diagram provides a high-level overview of the system's core components and their interconnections.

It illustrates how the **Platform Bots** interface with external APIs, how the **Core Services** process and manage data, and how these services interact with Storage and AI providers. The diagram shows the system's layered architecture and primary data flow paths.

```mermaid
flowchart TD
    subgraph PB["Platform Bots"]
        DS[Discord Bot]:::blue
        TB[Telegram Bot]:::blue
        XB[X Bot]:::blue
    end
    subgraph PA["Platform APIs"]
        DISCORD[Discord]:::gold
        TG[Telegram]:::gold
        X[Twitter]:::gold
    end
    subgraph CS["Core Services"]
        CHAT[Chat Service]:::green
        MS[Memory Service]:::green
        AS[Avatar Service]:::green
        AIS[AI Service]:::green
        TS[Tool Service]:::green
        LS[Location Service]:::green
        CS[Creation Service]:::green
    end
    subgraph SL["Storage Layer"]
        MONGO[MongoDB]:::brown
        S3[S3 Storage]:::brown
        ARW[Arweave]:::brown
    end
    subgraph AI["AI Services"]
        OR[OpenRouter]:::gold
        GAI[Google AI]:::gold
        REP[Replicate]:::gold
    end
    DS --> DISCORD
    TB --> TG
    XB --> X
    DS --> CHAT
    TB --> CHAT
    XB --> CHAT
    CHAT --> MS
    CHAT --> AS
    CHAT --> AIS
    CHAT --> TS
    TS --> LS
    AS --> CS
    AIS --> OR
    AIS --> GAI
    CS --> REP
    MS --> MONGO
    TS --> MONGO
    LS --> MONGO
    AS --> S3
    AS --> ARW
    CS --> S3
    classDef blue fill:#1a5f7a,stroke:#666,color:#fff
    classDef green fill:#145a32,stroke:#666,color:#fff
    classDef brown fill:#5d4037,stroke:#666,color:#fff
    classDef gold fill:#7d6608,stroke:#666,color:#fff
    style PB fill:#1a1a1a,stroke:#666,color:#fff
    style PA fill:#1a1a1a,stroke:#666,color:#fff
    style CS fill:#1a1a1a,stroke:#666,color:#fff
    style SL fill:#1a1a1a,stroke:#666,color:#fff
    style AI fill:#1a1a1a,stroke:#666,color:#fff
```

## Message Flow (Sequence Diagram)

This sequence diagram tracks the lifecycle of a user message through the system.

It demonstrates the interaction between different services, showing how a message flows from initial user input to final response. Each message is enriched with historical context from memory, can trigger media generation, and gets archived for future reference. The diagram illustrates how our services work together in real-time, handling everything from chat responses to image creation and data storage.

**Key Features**

- Message routing connects our agents to users across different platforms
- Context from past conversations informs responses
- AI services generate natural, contextual replies
- Dynamic creation of images and media
- Persistent memory storage for future context
- Real-time processing and response delivery

```mermaid
sequenceDiagram
    participant U as User
    participant B as Platform Bot
    participant C as Chat Service
    participant M as Memory Service
    participant A as Avatar Service
    participant AI as AI Service
    participant CR as Creation Service
    participant S as Storage
    U->>B: Send Message
    B->>C: Route Message
    rect rgb(40, 40, 40)
        note right of C: Context Loading
        C->>M: Get Context
        M->>S: Fetch History
        S-->>M: Return History
        M-->>C: Return Context
    end
    rect rgb(40, 40, 40)
        note right of C: Response Generation
        C->>AI: Generate Response
        alt Content Generation
            AI->>CR: Generate Content
            CR->>A: Create Entity
            A->>S: Store Entity
            S-->>A: Return Reference
            A-->>CR: Entity Details
            CR-->>AI: Generated Content
        end
        AI-->>C: Complete Response
    end
    rect rgb(40, 40, 40)
        note right of C: Memory Storage
        C->>M: Store Interaction
        M->>S: Save Memory
        alt Memory Milestone
            M->>S: Archive to Chain
        end
    end
    C-->>B: Send Response
    B-->>U: Display Message
```