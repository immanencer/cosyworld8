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

      // Extract system instruction from systemPrompt
      let systemInstruction = null;
      if (systemPrompt) {
        if (typeof systemPrompt === 'string') {
          systemInstruction = systemPrompt;
        } else if (systemPrompt.role === 'system' && systemPrompt.content) {
          systemInstruction = systemPrompt.content;
        } else if (Array.isArray(systemPrompt)) {
          // If it's an array, we'll use the first message with 'system' role
          const systemMessage = systemPrompt.find(msg => msg.role === 'system');
          if (systemMessage && systemMessage.content) {
            systemInstruction = typeof systemMessage.content === 'string' 
              ? systemMessage.content 
              : JSON.stringify(systemMessage.content);
          }
        } else if (typeof systemPrompt === 'object') {
          systemInstruction = systemPrompt.content || JSON.stringify(systemPrompt);
        }
      }

      // Configure the model with additional settings for JSON output if requested
      const modelConfig = { 
        model,
        systemInstruction: systemInstruction
      };

      // Add JSON schema if provided
      if (options.responseSchema) {
        modelConfig.generationConfig = {
          responseMimeType: options.responseMimeType || "application/json",
          responseSchema: options.responseSchema
        };
      }

      // Get the generative model instance with proper configuration
      const generativeModel = this.googleAI.getGenerativeModel(modelConfig);

      // Build generation config
      const generationConfig = {
        temperature: options.temperature || 0.7,
        maxOutputTokens: options.maxOutputTokens || 1024,
        topP: options.topP || 0.95,
        topK: options.topK || 40
      };

      // Add structured output schema if provided
      if (options.responseSchema) {
        generationConfig.responseSchema = options.responseSchema;

        // When using responseSchema, set system instructions to reinforce structured output
        if (!Array.isArray(messages)) {
          const systemMessage = {
            role: "system",
            content: "Respond with the structured format specified in the schema. Do not include any additional text outside the required structure."
          };
          messages = [systemMessage, { role: "user", content: messages }];
        } else if (messages[0]?.role !== "system") {
          messages.unshift({
            role: "system",
            content: "Respond with the structured format specified in the schema. Do not include any additional text outside the required structure."
          });
        }
      }

      // Log the input parameters for debugging
      console.log(`Chat inputs: systemPrompt type=${typeof systemPrompt}, userPrompt type=${typeof userPrompt}, hasImages=${Array.isArray(userPrompt) && userPrompt.some(part => part.inlineData)}`);

      // Enhanced debugging for text content
      if (Array.isArray(userPrompt)) {
        const textParts = userPrompt.filter(part => part.text);
        if (textParts.length > 0) {
          // Show more detail about text parts for debugging
          console.log(`Text parts in prompt: ${textParts.length}, first part preview: ${textParts[0].text?.substring(0, 50) + '...'}`);

          // Log the contextual content more clearly
          if (textParts.length === 1 && textParts[0].text?.includes('Channel:')) {
            const contextSnippet = textParts[0].text.substring(0, 200).replace(/\n/g, ' ') + '...';
            console.log(`Context content: ${contextSnippet}`);
          }
        }
      }

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

      // Process user prompt parts
      const userParts = [];

      // Add user content - with default fallback text to prevent empty parts
      if (typeof userPrompt === 'string') {
        userParts.push({ text: userPrompt });
      } else if (Array.isArray(userPrompt)) {
        // Process array of content parts
        for (const part of userPrompt) {
          if (typeof part === 'string') {
            userParts.push({ text: part });
          } else if (part.text) {
            userParts.push({ text: part.text });
          } else if (part.inlineData) {
            // Add image directly if it has inline data
            userParts.push({
              inlineData: {
                data: part.inlineData.data,
                mimeType: part.inlineData.mimeType
              }
            });
          } else if (part.type === 'image_url' && part.image_url) {
            try {
              // Convert image URL to base64
              const base64 = await fetchImageAndConvertToBase64(part.image_url);
              const mimeType = base64.split(';')[0].split(':')[1]; // Extract mime type
              userParts.push({
                inlineData: {
                  data: base64.split(',')[1], // Remove the data:image/xxx;base64, prefix
                  mimeType: mimeType
                }
              });
            } catch (error) {
              console.error("Error processing image URL:", error);
              userParts.push({ text: '[Image could not be loaded]' });
            }
          }
        }
      } else if (userPrompt && typeof userPrompt === 'object') {
        // Handle single object case
        if (userPrompt.text) {
          userParts.push({ text: userPrompt.text });
        } else if (userPrompt.inlineData) {
          userParts.push({
            inlineData: {
              data: userPrompt.inlineData.data,
              mimeType: userPrompt.inlineData.mimeType
            }
          });
        }
      }

      // Ensure we have at least one part with text to prevent API errors
      if (userParts.length === 0) {
        userParts.push({ text: "Request avatar information" });
        console.log("Added default text prompt to prevent empty parts error");
      }

      // Prepare the request with proper structure - now only with user contents
      const contents = [{
        role: 'user',
        parts: userParts
      }];

      // Before finalizing the request, perform validation
      if (userParts.length === 0) {
        throw new Error("Cannot create a request with empty parts");
      }

      // Merge generationConfig with any options.generationConfig
      const finalGenerationConfig = {
        ...generationConfig,
        ...(options.generationConfig || {})
      };

      const chatParams = {
        contents,
        generationConfig: finalGenerationConfig
      };

      // Count number of images and text parts for logging
      const imageParts = userParts.filter(p => p.inlineData).length;
      const textParts = userParts.filter(p => p.text).length;
      console.log(`Preparing Gemini request with ${imageParts} images and ${textParts} text parts`);

      // More detailed logging for debugging
      if (textParts === 0 && imageParts === 0) {
        console.warn("WARNING: Request has no recognized content parts!");
        console.log("User prompt details:", typeof userPrompt, 
          Array.isArray(userPrompt) ? `Array length: ${userPrompt.length}` : 
          typeof userPrompt === 'object' ? `Object keys: ${Object.keys(userPrompt).join(', ')}` : 
          `Value: ${userPrompt}`);
      }

      // Log request parameters for debugging (but truncate base64 data)
      const logParams = JSON.parse(JSON.stringify(chatParams));
      if (logParams.contents && logParams.contents.length > 0) {
        logParams.contents.forEach(content => {
          if (content.parts) {
            content.parts = content.parts.map(part => {
              if (part.inlineData && part.inlineData.data) {
                return {
                  ...part,
                  inlineData: {
                    ...part.inlineData,
                    data: part.inlineData.data.substring(0, 50) + '... [truncated]',
                    mimeType: part.inlineData.mimeType
                  }
                };
              } else if (part.text) {
                return {
                  text: part.text.length > 200 ? 
                    part.text.substring(0, 200) + '... [truncated]' : 
                    part.text
                };
              }
              return part;
            });
          }
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

      // Return fallbackResponse if it exists
      if (options.fallbackOnError && options.fallbackResponse) {
        console.log("Returning fallback response due to error");
        return options.fallbackResponse;
      }

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

      // Add structured output schema if provided
      if (options.responseSchema) {
        generationConfig.responseSchema = options.responseSchema;
      }

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