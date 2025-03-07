# CosyWorld - AI Avatar Discord Bot

## 0.0.89 Project 89 Update 🌟

An advanced Discord bot that creates AI-powered avatars with persistent memory, combat mechanics, and cross-platform capabilities.

## Features

- 🤖 **Advanced AI Integration**: Uses GPT-4, Claude, Llama and other models via OpenRouter
- 🧠 **Memory Systems**: Short-term and long-term memory for meaningful interactions
- ⚔️ **Dynamic Combat**: PvP battles with strategy and consequences
- 🧬 **Avatar Breeding**: Create unique avatars by combining traits
- 🎭 **Evolving Personalities**: Avatars develop based on interactions
- 💾 **Persistent Storage**: MongoDB for dynamic data, Arweave for permanent records
- 🖼️ **Image Generation**: Create avatar visuals via Replicate API

## Prerequisites

- Node.js v18+
- MongoDB database
- Discord Bot Token
- OpenRouter API key (for AI models)
- S3-compatible storage (for images)

## Environment Setup

Create `.env` file with:

```env
DISCORD_BOT_TOKEN="your_discord_bot_token"
MONGO_URI="mongodb://127.0.0.1:27017"
MONGO_DB_NAME="moonstone"
OPENROUTER_API_TOKEN="your_openrouter_token"
REPLICATE_API_TOKEN="your_replicate_token"

S3_API_ENDPOINT="your_s3_endpoint"
S3_API_KEY="your_s3_key"
CLOUDFRONT_DOMAIN="your_cdn_domain"
```

## Quick Start

1. Install dependencies:
```bash
npm install
```

2. Start the bot:
```bash
npm start
```

## Commands

- `!summon [description]` - Create or summon an existing avatar
- `!breed [avatar1] [avatar2]` - Breed two avatars
- `!attack [avatar]` - Initiate combat with another avatar

## Architecture

- **Chat Service**: Manages conversations and AI interactions
- **Dungeon Service**: Handles combat and RPG mechanics
- **Memory Service**: Stores and retrieves avatar memories
- **Location Service**: Manages environmental contexts
- **Avatar Service**: Handles avatar creation and management

## Development

The project uses:
- Discord.js for bot functionality
- MongoDB for data persistence
- OpenRouter for AI model access
- S3 for image storage
- Replicate for image generation

## License

This project is licensed under the [MIT License](LICENSE).  
See the [LICENSE](LICENSE) file for more details.
