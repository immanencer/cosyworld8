# Deployment Guide

## Environment Setup

### Required Environment Variables
Create a `.env` file with the following variables:

```env
# Core Configuration
NODE_ENV="production"  # Use "production" for deployment
API_URL="https://your-api-domain.com"
PUBLIC_URL="https://your-public-domain.com"

# Database
MONGO_URI="mongodb://your-mongo-instance:27017"
MONGO_DB_NAME="moonstone"

# AI Services
OPENROUTER_API_TOKEN="your_openrouter_token"
REPLICATE_API_TOKEN="your_replicate_token"

# Storage
S3_API_ENDPOINT="your_s3_endpoint"
S3_API_KEY="your_s3_key"
S3_API_SECRET="your_s3_secret"
CLOUDFRONT_DOMAIN="your_cdn_domain"

# Platform Integration
DISCORD_BOT_TOKEN="your_discord_bot_token"

# Optional: Performance Tuning
MEMORY_CACHE_SIZE="1000"  # Number of memory entries to keep in cache
MAX_CONCURRENT_REQUESTS="50"  # Maximum concurrent AI requests
```

## Database Setup

### MongoDB Configuration
1. Ensure MongoDB instance is running (v4.4+ recommended)
2. Create required collections:
   - `avatars`: Stores avatar data and metadata
   - `dungeon_stats`: Combat and stat tracking
   - `dungeon_log`: History of interactions and battles
   - `narratives`: Generated story elements
   - `memories`: Long-term memory storage
   - `messages`: Communication history
   - `locations`: Environmental data
   - `items`: In-world items and artifacts

### Indexing
Create the following indexes for optimal performance:
```js
db.avatars.createIndex({ "avatarId": 1 }, { unique: true })
db.memories.createIndex({ "avatarId": 1, "timestamp": -1 })
db.messages.createIndex({ "channelId": 1, "timestamp": -1 })
```

## Server Configuration

### System Requirements
- 4+ CPU cores
- 8GB+ RAM
- 50GB+ SSD storage
- 100Mbps+ network connection

### Node.js Setup
- Use Node.js v18+ LTS
- Set appropriate memory limits:
  ```bash
  NODE_OPTIONS="--max-old-space-size=4096"
  ```

### Web Server
For production deployment, use Nginx as a reverse proxy:

1. Install Nginx: `sudo apt install nginx`
2. Configure Nginx using the template in `/config/nginx.conf`
3. Enable and start the service:
   ```bash
   sudo ln -s /path/to/config/nginx.conf /etc/nginx/sites-enabled/moonstone
   sudo systemctl restart nginx
   ```

## Service Management

### Systemd Configuration
Create a systemd service for reliable operation:

1. Copy the service file: `sudo cp /config/moonstone-sanctum.service /etc/systemd/system/`
2. Enable and start the service:
   ```bash
   sudo systemctl enable moonstone-sanctum
   sudo systemctl start moonstone-sanctum
   ```

3. Check status: `sudo systemctl status moonstone-sanctum`

## API Rate Limits

### External Service Limits
- **OpenRouter**: Based on your subscription plan (typically 3-10 req/min)
- **Discord API**: Stay within Discord's published rate limits
- **Replicate API**: Check your subscription quota
- **S3 Storage**: No practical limit for normal operation

### Internal Rate Limiting
The system implements the following rate limits:
- AI Model calls: Max 5 per avatar per minute
- Image Generation: Max 2 per avatar per hour
- Avatar Creation: Max 3 per user per day

## Monitoring and Logging

### Log Files
All logs are in the `/logs` directory with the following structure:
- `application.log`: Main application logs
- `avatarService.log`: Avatar-related operations
- `discordService.log`: Discord interactions
- `aiService.log`: AI model interactions
- `errors.log`: Critical errors only

### Log Rotation
Logs are automatically rotated:
- Daily rotation
- 7-day retention
- Compressed archives

### Health Checks
The system exposes health endpoints:
- `/health`: Basic system health
- `/health/ai`: AI services status
- `/health/db`: Database connectivity

## Backup Strategy

1. Database Backups:
   ```bash
   mongodump --uri="$MONGO_URI" --db="$MONGO_DB_NAME" --out=/backup/$(date +%Y-%m-%d)
   ```

2. Environment Backup:
   ```bash
   cp .env /backup/env/$(date +%Y-%m-%d).env
   ```

3. Automated Schedule:
   ```bash
   # Add to crontab
   0 1 * * * /path/to/scripts/backup.sh
   ```

## Scaling Considerations

For high-traffic deployments:
- Implement MongoDB replication
- Set up multiple application instances behind a load balancer
- Use Redis for centralized caching
- Consider containerization with Docker/Kubernetes for easier scaling