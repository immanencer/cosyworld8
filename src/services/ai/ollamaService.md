# Ollama Service

## Overview
The Ollama Service provides integration with locally-hosted AI models through the Ollama framework. This service enables the system to use open-source large language models running on local hardware, offering privacy, reduced costs, and offline capabilities.

## Functionality
- **Local Model Access**: Connect to locally running Ollama instance
- **Chat Completions**: Generate conversational responses from message chains
- **Text Completions**: Generate text from simple prompts
- **Image Analysis**: Basic support for analyzing images with multimodal models
- **Model Verification**: Check for model availability in the local Ollama instance

## Implementation
The Ollama Service uses the Ollama JavaScript client to communicate with a locally running Ollama server. It implements the standard AI service interface, making it compatible with the rest of the system.

```javascript
// Example initialization
const ollamaService = new OllamaService({
  defaultModel: 'llama3.2'
}, services);

// Example usage
const response = await ollamaService.chat([
  { role: 'user', content: 'What are the benefits of local AI?' }
]);
```

### Key Methods
- **chat()**: Process a conversation with multiple messages
- **generateCompletion()**: Generate text from a single prompt
- **analyzeImage()**: Process an image with a text prompt
- **modelIsAvailable()**: Check if a specific model is available on the Ollama server

## Configuration
The service is configured with sensible defaults but can be customized:

```javascript
// Default chat options
this.defaultChatOptions = {
  temperature: 0.7,
  max_tokens: 1000,
  top_p: 1.0,
  frequency_penalty: 0,
  presence_penalty: 0,
};
```

## Advantages of Local AI
Using Ollama for local model hosting provides several benefits:
- **Privacy**: Data stays on your own hardware
- **Cost-effective**: No API usage fees
- **Offline capability**: Works without internet connectivity
- **Customization**: Fine-tune models for specific needs
- **Reduced latency**: No network roundtrip for requests

## Model Support
Ollama supports a variety of open-source models:
- Llama 3.2
- Mistral
- Gemma
- And many other compatible models

## Dependencies
- Ollama client library (`ollama`)
- Local Ollama server running on the same machine or network
- (Optional) Environment variable: `OLLAMA_API_KEY` for secure setups

## Usage Examples

### Chat Completion
```javascript
const response = await ollamaService.chat([
  { role: 'system', content: 'You are a helpful assistant.' },
  { role: 'user', content: 'Explain quantum computing.' },
  { role: 'assistant', content: 'Quantum computing uses quantum mechanics...' },
  { role: 'user', content: 'How is that different from classical computing?' }
]);
```

### Text Completion
```javascript
const story = await ollamaService.generateCompletion(
  'Once upon a time in a digital realm,',
  { temperature: 0.9, max_tokens: 2000 }
);
```

### Image Analysis
```javascript
const description = await ollamaService.analyzeImage(
  imageBase64Data,
  'image/jpeg',
  'What objects do you see in this image?'
);
```

## Error Handling
The service includes graceful error handling to prevent failures from disrupting the application:
- Returns `null` instead of throwing exceptions
- Logs detailed error information
- Validates responses before returning them

## Limitations
- Performance depends on local hardware capabilities
- Advanced image processing may be limited compared to cloud services
- Not all models support all features (e.g., multimodal capabilities)