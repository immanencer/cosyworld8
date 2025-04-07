# OpenRouter AI Service

## Overview
The OpenRouter AI Service provides access to a wide variety of AI models from different providers through the OpenRouter API. This service serves as the default AI provider for the system, offering robust capabilities, model fallback mechanisms, and flexible configuration options.

## Functionality
- **Multiple Model Access**: Single interface to access models from OpenAI, Anthropic, Meta, and other providers
- **Random Model Selection**: Tiered model selection based on rarity categories
- **Chat Completions**: Process multi-turn conversations with context
- **Text Completions**: Generate text from prompts
- **Model Fallback**: Automatic fallback to alternative models when requested models are unavailable
- **Fuzzy Model Matching**: Find similar model names when exact matches aren't found

## Implementation
The service extends `BasicService` and uses the OpenAI SDK configured to connect to OpenRouter's API endpoint. It implements model selection logic, rarity-based randomization, and comprehensive error handling.

```javascript
// Initialization in the service
this.openai = new OpenAI({
  apiKey: this.configService.config.ai.openrouter.apiKey,
  baseURL: 'https://openrouter.ai/api/v1',
  defaultHeaders: {
    'HTTP-Referer': 'https://ratimics.com',
    'X-Title': 'rativerse',
  },
});
```

### Model Selection System
The service implements a D20-based random model selection system that categorizes models by rarity:
- Common (60%): Rolls 1-12
- Uncommon (25%): Rolls 13-17
- Rare (10%): Rolls 18-19
- Legendary (5%): Roll 20

This system adds variety to AI responses and allows for occasional use of more powerful (and potentially more expensive) models.

## Rarity-Based Model Selection
```javascript
async selectRandomModel() {
  // Roll a d20 to determine rarity tier
  const roll = Math.ceil(Math.random() * 20);
  
  // Select rarity based on roll ranges
  const selectedRarity = rarityRanges.find(
    range => roll >= range.min && roll <= range.max
  )?.rarity;
  
  // Filter and return random model from that tier
  const availableModels = this.modelConfig.filter(
    model => model.rarity === selectedRarity
  );
  
  if (availableModels.length > 0) {
    return availableModels[Math.floor(Math.random() * availableModels.length)].model;
  }
  return this.model; // Fallback to default
}
```

## Configuration Options
The service provides default configurations for different types of completions:

### Chat Defaults
```javascript
this.defaultChatOptions = {
  model: 'meta-llama/llama-3.2-1b-instruct',
  temperature: 0.7,
  max_tokens: 1000,
  top_p: 1.0,
  frequency_penalty: 0,
  presence_penalty: 0,
};
```

### Completion Defaults
```javascript
this.defaultCompletionOptions = {
  temperature: 0.7,
  max_tokens: 1000,
  top_p: 1.0,
  frequency_penalty: 0,
  presence_penalty: 0,
};
```

### Vision Defaults
```javascript
this.defaultVisionOptions = {
  model: 'x-ai/grok-2-vision-1212',
  temperature: 0.5,
  max_tokens: 200,
};
```

## Error Handling and Retries
The service implements a robust retry mechanism for rate limit errors:
- Automatic retry after a 5-second delay
- Configurable number of retry attempts
- Detailed error logging
- Graceful fallback to default models

## Dependencies
- OpenAI SDK (configured for OpenRouter)
- String similarity library for fuzzy model matching
- Model configuration file (`models.config.mjs`)
- Configuration service for API keys and defaults

## Usage Examples

### Chat Completion
```javascript
const response = await openRouterService.chat([
  { role: 'system', content: 'You are a fantasy game assistant.' },
  { role: 'user', content: 'Create a magical item for my character.' }
], {
  model: 'anthropic/claude-3-opus-20240229'
});
```

### Structured Output
```javascript
const characterData = await openRouterService.chat([
  { role: 'user', content: 'Generate a fantasy character' }
], {
  schema: {
    type: 'object',
    properties: {
      name: { type: 'string' },
      class: { type: 'string' },
      level: { type: 'number' },
      abilities: { type: 'array', items: { type: 'string' } }
    },
    required: ['name', 'class', 'level', 'abilities']
  }
});
```

### Item Speech Generation
```javascript
const itemSpeech = await openRouterService.speakAsItem({
  name: 'Ancient Amulet of Whispering',
  description: 'A mysterious amulet that seems to murmur secrets from bygone eras.'
}, 'dungeon-channel-123');
```

## Limitations
- Image analysis capabilities may be limited compared to specialized vision models
- Availability and performance of specific models depends on OpenRouter's agreements with providers
- Rate limits and costs vary by model provider