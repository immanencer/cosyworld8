# Google AI Service

## Overview
The Google AI Service provides integration with Google's Generative AI platform, offering access to Google's Gemini models. This service implements the common AI service interface, allowing the system to switch between AI providers seamlessly.

## Functionality
- **Google Gemini Model Access**: Direct integration with Google's Generative AI models
- **Multi-modal Support**: Handles both text and image inputs for AI processing
- **Structured Output**: Supports generating responses in structured JSON format
- **Model Selection**: Includes model availability checking and fallback mechanisms
- **Random Model Selection**: Supports selection of models based on rarity tiers

## Implementation
The service is implemented as a class that connects to Google's Generative AI API using the official SDK. It provides methods for chat completions, image analysis, and structured output generation.

```javascript
// Example initialization
const googleAIService = new GoogleAIService({
  defaultModel: 'gemini-2.0-flash'
}, services);

// Example chat usage
const response = await googleAIService.chat([
  { role: 'system', content: 'You are a helpful assistant.' },
  { role: 'user', content: 'Tell me about the weather.' }
]);
```

### Key Features
- **System Instructions**: Supports system prompts for context setting
- **Message Format Conversion**: Translates between the system's message format and Google's expected format
- **Image Analysis**: Processes images with text prompts for detailed analysis
- **Response Schema**: Supports structured JSON output with validation schemas

## Google API Specifics
The service handles Google's unique API requirements:
- Converts 'assistant' role to 'model' for Google's format
- Properly formats system instructions
- Handles multi-part message content including inline images

## Model Configuration
The service maintains a list of available models with metadata:
- Model ID (e.g., 'gemini-2.0-flash')
- Rarity classification (common, uncommon, rare, legendary)
- Other model capabilities and parameters

## Dependencies
- Google Generative AI SDK (`@google/generative-ai`)
- Environment variable: `GOOGLE_AI_API_KEY`
- Models configuration (`models.google.config.mjs`)

## Usage Examples

### Chat Completion
```javascript
const response = await googleAIService.chat([
  { role: 'user', content: 'What is machine learning?' }
], {
  temperature: 0.5,
  max_tokens: 500
});
```

### Image Analysis
```javascript
const analysis = await googleAIService.analyzeImage(
  imageBase64Data,
  'image/jpeg',
  'Describe what you see in this image'
);
```

### Structured Output
```javascript
const itemSchema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    description: { type: 'string' },
    rarity: { type: 'string' }
  },
  required: ['name', 'description', 'rarity']
};

const item = await googleAIService.chat(
  [{ role: 'user', content: 'Create a magical sword item' }],
  { responseSchema: googleAIService.toResponseSchema(itemSchema) }
);
```

## Error Handling
The service includes robust error handling for:
- API connectivity issues
- Rate limiting and quotas
- Model unavailability
- Response format errors