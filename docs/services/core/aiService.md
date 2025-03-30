# AI Service

## Overview
The AI Service serves as a facade for underlying AI model providers, enabling the system to switch between different AI services with minimal code changes. It acts as a mediator between the application and external AI providers such as OpenRouter, Google AI, and Ollama.

## Functionality
- **Provider Selection**: Dynamically selects the appropriate AI service provider based on environment configuration
- **Model Management**: Handles model selection, fallback mechanisms, and error recovery
- **Request Formatting**: Prepares prompts and parameters in the format expected by each provider

## Implementation
The service uses a factory pattern approach by importing specific provider implementations and exporting the appropriate one based on the `AI_SERVICE` environment variable. If the specified provider is unknown, it defaults to OpenRouterAIService.

```javascript
// Export selection based on environment variable
switch (process.env.AI_SERVICE) {
    case 'google':
        AIService = GoogleAIService;
        break;
    case 'ollama':
        AIService = OllamaService;
        break;
    case 'openrouter':
        AIService = OpenRouterAIService;
        break;
    default:
        console.warn(`Unknown AI_SERVICE: ${process.env.AI_SERVICE}. Defaulting to OpenRouterAIService.`);
        AIService = OpenRouterAIService;
        break;
}
```

## Provider Implementations
The system includes implementations for multiple AI providers:

### OpenRouterAIService
- Connects to OpenRouter's API for access to multiple AI models
- Provides chat completions, text completions, and basic image analysis
- Includes random model selection based on rarity tiers
- Handles API errors and implements retries for rate limits

### GoogleAIService
- Connects to Google's Vertex AI platform
- Provides similar functionality with Google's AI models

### OllamaService
- Connects to local Ollama instance for self-hosted AI models
- Useful for development or when privacy/cost concerns exist

## Dependencies
- Basic framework services (logger, etc.)
- OpenAI SDK (for OpenRouter compatibility)
- Google AI SDK (for GoogleAIService)