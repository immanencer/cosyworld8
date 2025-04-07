import ollama from 'ollama';

export class OllamaService {
  constructor(config = {}, services) {
    this.model = config.defaultModel || 'llama3.2';
    this.apiKey = process.env.OLLAMA_API_KEY;
    this.services = services; // Store services
    this.defaultChatOptions = {
      temperature: 0.7,
      max_tokens: 1000,
      top_p: 1.0,
      frequency_penalty: 0,
      presence_penalty: 0,
    };
    console.log(`Initialized OllamaService with default model: ${this.model}`);
  }

  async modelIsAvailable(model) {
    try {
      const response = await ollama.listModels();
      return response.models.some(m => m.name === model);
    } catch (error) {
      console.error(`Error checking model availability: ${error.message}`);
      return false;
    }
  }

  async chat(messages, options = {}) {
    const mergedOptions = {
      ...this.defaultChatOptions,
      ...options,
    };

    try {
      const response = await ollama.chat({
        model: this.model,
        messages,
        ...mergedOptions,
      });
      if (!response || !response.message || !response.message.content) {
        console.error('Invalid response from Ollama during chat.');
        return null;
      }
      return response.message.content.trim();
    } catch (error) {
      console.error('Error while chatting with Ollama:', error);
      return null;
    }
  }

  async generateCompletion(prompt, options = {}) {
    const mergedOptions = {
      model: this.model,
      prompt,
      ...this.defaultChatOptions,
      ...options,
    };

    try {
      const response = await ollama.generate(mergedOptions);
      if (!response || !response.response || response.response.length === 0) {
        console.error('Invalid response from Ollama during completion generation.');
        return null;
      }
      return response.response.trim();
    } catch (error) {
      console.error('Error while generating completion from Ollama:', error);
      return null;
    }
  }

  async analyzeImage(imageBase64, mimeType, prompt = "Describe this image in detail.", options = {}) {
    try {
      const response = await ollama.generate({
        model: this.model,
        prompt,
        images: [{ data: imageBase64, mimeType }],
        ...options,
      });

      if (!response || !response.response || response.response.length === 0) {
        console.error('Invalid response from Ollama during image analysis.');
        return null;
      }

      return response.response.trim();
    } catch (error) {
      console.error('Error analyzing image with Ollama:', error);
      return null;
    }
  }

  async speakAsItem(item, channelId) {
    const prompt = `
      You are a mystical item called "${item.name}" located in a dungeon channel (ID: ${channelId}).
      Your description is: ${item.description}.
      Respond with only your speech as if you are the item coming to life in this channel.
    `;
    return await this.generateCompletion(prompt);
  }
}