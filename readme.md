# CosyWorld - AI Avatar Ecosystem

## 0.0.8 CosyWorld 🌟

An advanced AI avatar ecosystem that creates persistent, intelligent entities with memory, combat mechanics, and cross-platform capabilities.

## Features

- 🤖 **Advanced AI Integration**: Multiple intelligence tiers from GPT-4 and Claude to Llama and other models
- 🧠 **Hierarchical Memory**: Short-term, long-term, and emotional memory for meaningful interactions
- ⚔️ **Dynamic Combat**: Strategic PvP battles with unique mechanics and consequences
- 🧬 **Avatar Breeding**: Create unique avatars by combining traits and personalities
- 🎭 **Evolving Characters**: Avatars develop based on interactions and experiences
- 💾 **Persistent Storage**: MongoDB for dynamic data, S3 for assets, Arweave for permanent records
- 🖼️ **Image Generation**: AI-powered visual avatars via Replicate API
- 🌐 **Cross-Platform**: Support for Discord, Telegram, and X (Twitter)
- 🏭 **Creation Service**: Structured generation of content with schema validation
- 🔄 **Model Flexibility**: Support for Google AI and OpenRouter models

## Prerequisites

- Node.js v18+
- MongoDB database
- S3-compatible storage
- Discord Bot Token (for Discord integration)
- OpenRouter API key (for AI model access)
- Replicate API key (for image generation)
- Google AI API key (optional, for Google model integration)

## Environment Setup

Create a `.env` file with the following variables (see `.env.example` for a template):

```env
# Core Configuration
NODE_ENV="development"
API_URL="http://localhost:3000"
PUBLIC_URL="http://localhost:3000"

# Database
MONGO_URI="mongodb://127.0.0.1:27017"
MONGO_DB_NAME="moonstone"

# AI Services
OPENROUTER_API_TOKEN="your_openrouter_token"
REPLICATE_API_TOKEN="your_replicate_token"
GOOGLE_AI_API_KEY="your_google_ai_key"

# Storage
S3_API_ENDPOINT="your_s3_endpoint"
S3_API_KEY="your_s3_key"
S3_API_SECRET="your_s3_secret"
CLOUDFRONT_DOMAIN="your_cdn_domain"

# Platform Integration
DISCORD_BOT_TOKEN="your_discord_bot_token"
```

## Quick Start

1. Install dependencies:
```bash
npm install
```

2. Start both server and client:
```bash
npm start
```

3. For frontend development:
```bash
npm run dev
```

4. Run server only:
```bash
npm run serve
```

5. For production build:
```bash
npm run build
```

## Commands

### Avatar Management
- `!summon [description]` - Create or summon an existing avatar
- `!breed [avatar1] [avatar2]` - Breed two avatars to create a new one

### Combat System
- `!attack [avatar]` - Initiate combat with another avatar
- `!defend` - Take a defensive stance in combat

### World Interaction
- `!explore [location]` - Discover new areas and items
- `!remember [topic]` - Access avatar memories on a topic
- `!create [description]` - Generate new content in the world

## System Architecture

CosyWorld is composed of several interconnected services:

### Core Services
- **Chat Service**: Manages conversations and AI interactions
- **Avatar Service**: Handles avatar creation, evolution, and management
- **Memory Service**: Stores and retrieves hierarchical avatar memories
- **Location Service**: Manages environmental contexts and zones
- **Tool Service**: Coordinates actions and specialized tools

### Support Services
- **AI Service**: Interfaces with multiple AI providers through OpenRouter and Google AI
- **Image Service**: Handles avatar image generation and storage
- **Creation Service**: Provides structured generation with schema validation
- **Database Service**: Manages persistent data storage and retrieval

## Development

The project uses:
- Discord.js for bot functionality
- Express for the web server
- MongoDB for data persistence
- OpenRouter and Google AI for model access
- S3/Arweave for storage
- Webpack and Babel for frontend build
- TailwindCSS for styling

## Documentation

For detailed documentation, see the `/docs` directory:
- [Introduction](docs/01-introduction.md)
- [System Overview](docs/02-system-overview.md)
- [System Diagram](docs/03-system-diagram.md)
- [Action System](docs/04-action-system.md)
- [Intelligence System](docs/05-intelligence-system.md)
- [Dungeon System](docs/06-dungeon-system.md)
- [Deployment Guide](docs/07-deployment.md)

For build system documentation, see [README.build.md](README.build.md).

## License

This project is licensed under the [MIT License](LICENSE).