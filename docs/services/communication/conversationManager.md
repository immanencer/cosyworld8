# Conversation Manager

## Overview
The ConversationManager orchestrates the flow of messages between users and AI avatars. It manages the conversation lifecycle, including message processing, response generation, narrative development, and channel context management.

## Functionality
- **Response Generation**: Creates context-aware avatar responses to user messages
- **Narrative Generation**: Periodically generates character reflections and development 
- **Channel Context**: Maintains and updates conversation history and summaries
- **Permission Management**: Ensures the bot has necessary channel permissions
- **Rate Limiting**: Implements cooldown mechanisms to prevent response spam

## Implementation
The ConversationManager extends BasicService and requires several dependencies for its operation. It manages cooldowns, permission checks, and orchestrates the process of generating and sending responses.

```javascript
export class ConversationManager extends BasicService {
  constructor(container) {
    super(container, [
      'discordService',
      'avatarService',
      'aiService',
    ]);

    this.GLOBAL_NARRATIVE_COOLDOWN = 60 * 60 * 1000; // 1 hour
    this.lastGlobalNarrativeTime = 0;
    this.channelLastMessage = new Map();
    this.CHANNEL_COOLDOWN = 5 * 1000; // 5 seconds
    this.MAX_RESPONSES_PER_MESSAGE = 2;
    this.channelResponders = new Map();
    this.requiredPermissions = ['ViewChannel', 'SendMessages', 'ReadMessageHistory', 'ManageWebhooks'];
   
    this.db = services.databaseService.getDatabase();
  }
  
  // Methods...
}
```

### Key Methods

#### `generateNarrative(avatar)`
Periodically generates personality development and narrative reflection for an avatar. This enables characters to "think" about their experiences and evolve over time.

#### `getChannelContext(channelId, limit)`
Retrieves recent message history for a channel, using database records when available and falling back to Discord API when needed.

#### `getChannelSummary(avatarId, channelId)`
Maintains and updates AI-generated summaries of channel conversations to provide context without using excessive token count.

#### `sendResponse(channel, avatar)`
Orchestrates the full response generation flow:
1. Checks permissions and cooldowns
2. Gathers context and relevant information
3. Assembles prompts and generates AI response
4. Processes any commands in the response
5. Sends the response to the channel

#### `removeAvatarPrefix(response, avatar)`
Cleans up responses that might include the avatar's name as a prefix.

## Rate Limiting Implementation
The service implements several rate limiting mechanisms:
- Global narrative cooldown (1 hour)
- Per-channel response cooldown (5 seconds)
- Maximum responses per message (2)

## Dependencies
- DiscordService: For Discord interactions
- AvatarService: For avatar data and updates
- AIService: For generating AI responses
- DatabaseService: For persistence
- PromptService: For generating structured prompts