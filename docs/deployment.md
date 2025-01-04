
# Deployment Guide

## Environment Setup
Required environment variables:
- `MONGO_URI`: MongoDB connection string
- `OPENROUTER_API_TOKEN`: OpenRouter API access
- `S3_API_KEY`: For image storage
- `S3_API_ENDPOINT`: S3 endpoint URL
- `DISCORD_BOT_TOKEN`: Bot authentication

## Database Configuration
1. Ensure MongoDB instance is running
2. Create required collections:
   - avatars
   - dungeon_stats
   - dungeon_log
   - narratives
   - memories
   - messages

## API Rate Limits
- AI Model calls: Based on OpenRouter limits
- Discord API: Follow Discord rate limits
- Image Generation: Based on Replicate quotas

## Monitoring
- Uses Winston logger
- Logs stored in:
  - application.log
  - avatarService.log
  - discordService.log
