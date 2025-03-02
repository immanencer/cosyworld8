import { GoogleGenerativeAI } from '@google/generative-ai';
import defaultModels from '../models.config.mjs';

export class GoogleAIService {
  constructor(config = {}) {
    this.modelConfig = [];
    this.model = config.defaultModel || 'gemini-1.5-flash';
    this.apiKey = process.env.GOOGLE_AI_API_KEY;
    this.googleAI = new GoogleGenerativeAI(this.apiKey);
    console.log(`Initialized GoogleAIService with default model: ${this.model}`);
    this.fetchModels().then(() => {
      // Make sure default model exists in configuration, or set to an available one
      if (!this.modelIsAvailable(this.model)) {
        const availableModel = this.modelConfig.find(m => m.model.startsWith('gemini-'));
        if (availableModel) {
          console.log(`Default model ${this.model} not available, switching to ${availableModel.model}`);
          this.model = availableModel.model;
        }
      }
    });
  }

  /**
   * Fetches the available models from the local configuration
   * @returns {Promise<Array>} List of available models
   */
  async fetchModels() {
    try {
      const now = Date.now();
      // Only initialize models if enough time has passed or not loaded yet
      if (now - this.lastModelFetchTime > this.modelRefreshInterval || this.modelConfig.length === 0) {
        console.log('Loading models from local configuration');

        // Use default models from configuration
        this.modelConfig = defaultModels || [];

        this.lastModelFetchTime = now;
        console.log(`Loaded ${this.modelConfig.length} models from configuration`);
      }

      return this.modelConfig;
    } catch (error) {
      console.error('Error loading model configuration:', error);
      // Return empty array if there's an error
      return [];
    }
  }

  async selectRandomModel() {
    // Ensure models are loaded
    if (this.modelConfig.length === 0) {
      await this.fetchModels();
    }

    const rarityRanges = [
      { rarity: 'common', min: 1, max: 12 },        // Common: 1-12 (60%)
      { rarity: 'uncommon', min: 13, max: 17 },     // Uncommon: 13-17 (25%)
      { rarity: 'rare', min: 18, max: 19 },         // Rare: 18-19 (10%)
      { rarity: 'legendary', min: 20, max: 20 },    // Legendary: 20 (5%)
    ];

    // Roll a d20
    const roll = Math.ceil(Math.random() * 20);

    // Determine rarity based on the roll
    const selectedRarity = rarityRanges.find(range => roll >= range.min && roll <= range.max)?.rarity;

    // Filter models by the selected rarity
    const availableModels = this.modelConfig.filter(model => model.rarity === selectedRarity);

    // Return a random model from the selected rarity group or fallback to default
    if (availableModels.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableModels.length);
      return availableModels[randomIndex].model;
    }
    return this.model;
  }

  async modelIsAvailable(model) {
    try {
      // Check if the model exists in our configuration
      if (!this.modelConfig || !this.modelConfig.length) {
        await this.fetchModels();
      }

      const modelExists = this.modelConfig.some(m => m.model === model); // Corrected to use 'model' field

      if (!modelExists) {
        console.log(`Model ${model} not found in configuration.`);
        return false;
      }

      // Additional check - try to get model info from API
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}`;
      const response = await fetch(apiUrl, {
        headers: {
          'x-goog-api-key': process.env.GOOGLE_AI_API_KEY
        }
      });

      if (!response.ok) {
        console.log(`Model ${model} API check failed: ${response.status}`);
        return false;
      }

      return true;
    } catch (error) {
      console.error(`Error checking model availability: ${error.message}`);
      return false;
    }
  }

  async generateCompletion(prompt, options = {}) {
    // Ensure models are loaded
    if (this.modelConfig.length === 0) {
      await this.fetchModels();
    }

    // Merge our defaults with caller-supplied options.
    const mergedOptions = {
      model: this.model,
      prompt,
      ...this.defaultChatOptions,
      ...options,
    };

    try {
      const response = await this.openai.completions.create(mergedOptions);
      if (!response || !response.choices || response.choices.length === 0) {
        console.error('Invalid response from Google AI during completion generation.');
        return null;
      }
      return response.choices[0].text.trim();
    } catch (error) {
      console.error('Error while generating completion from Google AI:', error);
      return null;
    }
  }

  async chat(systemPrompt, userPrompt, options = {}) {
    try {
      const model = options.model || this.model; // Use this.model as default if no model is specified

      // Check if model is available before proceeding
      const isModelAvailable = await this.modelIsAvailable(model);
      if (!isModelAvailable) {
        console.log(`Model ${model} availability check: false`);
        throw new Error(`Model ${model} is not available.`);
      }

      console.log(`Model ${model} availability check: true`);

      // Get the generative model instance first
      const generativeModel = this.googleAI.getGenerativeModel({ model });

      // Build generation config
      const generationConfig = {
        temperature: options.temperature || 0.7,
        maxOutputTokens: options.maxOutputTokens || 1024,
        topP: options.topP || 0.95,
        topK: options.topK || 40
      };

      // Prepare content parts for the API
      const parts = [];

      // Helper function to fetch image and convert to base64
      const fetchImageAndConvertToBase64 = async (imageUrl) => {
        try {
          const response = await fetch(imageUrl);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const blob = await response.blob();
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result); // Contains the base64 string
            reader.onerror = reject;
            reader.readAsDataURL(blob); // Convert to base64
          });
        } catch (error) {
          console.error("Error fetching and converting image:", error);
          throw error; // Re-throw so the calling function can handle the error
        }
      };


      // Function to handle adding content parts (DRY)
      const addContentPart = async (content) => {
        if (typeof content === 'string') {
          parts.push({ text: content });
        } else if (content?.type === 'text') {
          parts.push({ text: content.text });
        } else if (content?.type === 'image_url' && content?.image_url) {
          // **MUST Fetch and Convert to Base64**
          try {
            const base64 = await fetchImageAndConvertToBase64(content.image_url);
            const mimeType = base64.split(';')[0].split(':')[1]; // Extract mime type
            parts.push({
              inlineData: {
                data: base64.split(',')[1], // Remove the data:image/xxx;base64, prefix
                mimeType: mimeType
              }
            });
          } catch (error) {
            console.error("Error processing image URL:", error);
            // Handle the error (e.g., skip the image, or add a placeholder)
            parts.push({ text: '[Image could not be loaded]' }); // Example placeholder
          }
        } else if (content?.inlineData) {
          // Handle inline data (base64 images) directly
          parts.push({
            inlineData: {
              data: content.inlineData.data,
              mimeType: content.inlineData.mimeType
            }
          });
        }
      };

      // Process system prompt
      if (systemPrompt) {
        if (typeof systemPrompt === 'string') {
          await addContentPart(systemPrompt);
        } else if (Array.isArray(systemPrompt)) {
          for (const message of systemPrompt) {
            if (message.content) {
              if (typeof message.content === 'string' || typeof message.content === 'object') {
                if (Array.isArray(message.content)) {
                  for (const contentItem of message.content) {
                    await addContentPart(contentItem);
                  }
                } else {
                  await addContentPart(message.content);
                }
              }
            }
          }
        } else if (systemPrompt.inlineData) {
          await addContentPart(systemPrompt);
        }
      }

      // Process user prompt
      if (typeof userPrompt === 'string') {
        await addContentPart(userPrompt);
      } else if (Array.isArray(userPrompt)) {
        for (const contentItem of userPrompt) {
          await addContentPart(contentItem);
        }
      } else if (userPrompt && typeof userPrompt === 'object') {
        await addContentPart(userPrompt);
      }

      // Prepare the request
      const chatParams = {
        contents: [{ role: 'user', parts }],
        generationConfig
      };

      // Log request parameters for debugging (but truncate base64 data)
      const logParams = JSON.parse(JSON.stringify(chatParams));
      if (logParams.contents[0].parts) {
        logParams.contents[0].parts = logParams.contents[0].parts.map(part => {
          if (part.inlineData && part.inlineData.data) {
            return {
              ...part,
              inlineData: {
                ...part.inlineData,
                data: part.inlineData.data.substring(0, 50) + '... [truncated]'
              }
            };
          }
          return part;
        });
      }
      console.log("Gemini API request parameters:", JSON.stringify(logParams, null, 2));

      // Generate content using the correct method
      const result = await generativeModel.generateContent(chatParams);

      // Log response for debugging
      console.log("Gemini API response:", JSON.stringify({
        text: result.response.text(),
        responseType: result.response.constructor.name
      }, null, 2));

      return result.response.text();
    } catch (error) {
      console.log("Error while chatting with Google AI:", JSON.stringify({
        message: error.message,
        stack: error.stack,
        details: error.details || 'No details available'
      }, null, 2));
      throw error;
    }
  }

  /**
   * Process an image and generate a text response
   * @param {string} imageBase64 - Base64 encoded image data
   * @param {string} mimeType - The MIME type of the image
   * @param {string} prompt - The prompt to send along with the image
   * @param {Object} options - Additional options for the model
   * @returns {Promise<string>} - The text response from the model
   */
  async analyzeImage(imageBase64, mimeType, prompt, options = {}) {
    try {
      const modelName = options.model || this.model;
      const generativeModel = this.googleAI.getGenerativeModel({ model: modelName });

      // Prepare generation config
      const generationConfig = {
        temperature: options.temperature || 0.7,
        maxOutputTokens: options.maxOutputTokens || 1024,
        topP: options.topP || 0.95,
        topK: options.topK || 40
      };

      // Create the prompt parts
      const parts = [
        {
          inlineData: {
            data: imageBase64,
            mimeType: mimeType
          }
        },
        { text: prompt }
      ];

      // Generate content
      const result = await generativeModel.generateContent({
        contents: [{ role: 'user', parts }],
        generationConfig
      });

      return result.response.text();
    } catch (error) {
      console.error("Error analyzing image:", error);
      throw error;
    }
  }

  /**
   * Generates a spoken response as the item within the current channel context.
   *
   * @param {Object} item - The item object (must include at least "name" and "description").
   * @param {string} channelId - The channel ID providing context for the response.
   * @returns {Promise<string>} - The spoken text as the item.
   */
  async speakAsItem(item, channelId) {
    const prompt = `
  You are a mystical item called "${item.name}" located in a dungeon channel (ID: ${channelId}).
  Your description is: ${item.description}.
  Respond with only your speech as if you are the item coming to life in this channel.
    `;
    const completion = await this.generateCompletion(prompt);
    if (!completion) {
      return `The ${item.name} remains silent.`;
    }
    return completion;
  }
}