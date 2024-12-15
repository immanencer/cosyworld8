import Fuse from 'fuse.js';
import { OpenRouterService } from '../openrouterService.mjs';
import { uploadImage } from '../s3imageService/s3imageService.mjs';
import { sendAsWebhook } from '../discordService.mjs';
import { MongoClient } from 'mongodb';
import Replicate from 'replicate';
import fs from 'fs/promises';

export class LocationService {
  constructor(discordClient, aiService = null) {
    if (!discordClient) {
      throw new Error('Discord client is required for LocationService');
    }
    this.client = discordClient;
    this.aiService = aiService || new OpenRouterService(); // Allow injection or create new
    this.fuseOptions = {
      threshold: 0.4,
      keys: ['name']
    };

    // Add Replicate for image generation
    this.replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN
    });

    // Add message tracking
    this.locationMessages = new Map(); // locationId -> {count: number, messages: Array}
    this.SUMMARY_THRESHOLD = 100; // Messages before generating summary
    this.MAX_STORED_MESSAGES = 50; // Keep last 50 messages for context

    this.db = null;
    this.initDatabase();
  }

  async initDatabase() {
    try {
      const client = await MongoClient.connect(process.env.MONGO_URI);
      this.db = client.db('cosyworld2');
    } catch (error) {
      console.error('Failed to connect to MongoDB:', error);
    }
  }

  // Function to download image
  async downloadImage(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to get '${url}' (${response.status})`);
      }
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      return buffer;
    } catch (error) {
      throw new Error('Error downloading the image: ' + error.message);
    }
  }

  async generateLocationImage(locationName, description) {
    const [output] = await this.replicate.run(
      "immanencer/mirquo:dac6bb69d1a52b01a48302cb155aa9510866c734bfba94aa4c771c0afb49079f",
      {
        input: {
          prompt: `MRQ ${locationName} holographic neon dark watercolor ${description} MRQ`,
          model: "dev",
          lora_scale: 1,
          num_outputs: 1,
          aspect_ratio: "16:9",
          output_format: "png",
          guidance_scale: 3.5,
          output_quality: 90,
          prompt_strength: 0.8,
          extra_lora_scale: 1,
          num_inference_steps: 28,
          disable_safety_checker: true,
        }
      }
    );

    const imageUrl = output.url ? output.url() : [output];
    const imageBuffer = await this.downloadImage(imageUrl.toString());
    const filename = `./images/location_${Date.now()}.png`;
    await fs.mkdir('./images', { recursive: true });
    await fs.writeFile(filename, imageBuffer);

    if (this.db) {
      await this.db.collection('locations').updateOne(
        { name: locationName },
        { 
          $set: { 
            imageUrl: await uploadImage(filename),
            updatedAt: new Date()
          }
        },
        { upsert: true }
      );
    }

    return await uploadImage(filename);
  }

  async generateDepartureMessage(avatar, currentLocation, newLocation) {
    // If no image exists for the current location, generate one
    if (!currentLocation.imageUrl) {
      try {
        const locationDescription = await this.aiService.chat([
          { role: 'system', content: 'Generate a brief description of this location.' },
          { role: 'user', content: `Describe ${currentLocation.name} in 2-3 sentences.` }
        ]);
        currentLocation.imageUrl = await this.generateLocationImage(currentLocation.name, locationDescription);
      } catch (error) {
        console.error('Error generating location image:', error);
      }
    }

    const prompt = `You are ${currentLocation.name}. Describe ${avatar.name}'s departure to ${newLocation.name} in a brief atmospheric message.`;
    const response = await this.aiService.chat([
      { role: 'system', content: 'You are a mystical location describing travelers.' },
      { role: 'user', content: prompt }
    ]);
    return response.replace(newLocation.name, `<#${newLocation.channel.id}>`);
  }

  async generateLocationDescription(locationName, imageUrl) {
    const prompt = `
      You are a master storyteller describing a mystical location.
      Looking at this scene of ${locationName}, write a vivid, evocative description that brings it to life.
      Focus on the atmosphere, unique features, and feelings it evokes.
      Keep it to 2-3 compelling sentences.`;

    const response = await this.aiService.chat([
      { role: 'system', content: 'You are a poetic location narrator skilled in atmospheric descriptions.' },
      { role: 'user', content: prompt }
    ]);

    return response;
  }

  async findOrCreateLocation(guild, locationName, sourceChannel = null) {
    if (!guild) {
      throw new Error('Guild is required to find or create location');
    }

    try {
      const channels = await this.getAllLocations(guild);
      const fuse = new Fuse(channels, this.fuseOptions);
      
      let cleanLocationName = await this.aiService.chat([
        { role: 'system', content: 'You are an expert editor.' },
        { role: 'user', content: `The avatar has requested to move to or create the following location:

        ${locationName}

        Ensure your response is a single location name, less than 80 characters, and suitable for a fantasy setting.
        If the name is already suitable, return it as is.
        If it needs editing, revise it to be more suitable for a fantasy setting.
        Try to keep the original meaning intact.
        ONLY return the revised name, without any additional text.` }
      ], {
        model: 'openai/gpt-4o'
      });

      if (!cleanLocationName) {
        throw new Error("clean location name is null");
      }

      // trim by words
      const words = cleanLocationName.split(' ');
      while (words.join(' ').length > 100) { words.pop(); }

      cleanLocationName = (words.join(' ')).trim();
      
      // Try to find existing location
      const matches = fuse.search(cleanLocationName, { limit: 1 });
      if (matches.length > 0) {
        return matches[0].item;
      }

      // Use the source channel if provided, otherwise find/create #locations
      let parentChannel = sourceChannel;
      if (!parentChannel || !parentChannel.threads) {
        parentChannel = guild.channels.cache.find(c => 
          c.isTextBased() && c.threads
        );
      }

      if (!parentChannel) {
        throw new Error('No suitable channel found for creating location thread');
      }

      // Generate location content
      const locationDescription = await this.aiService.chat([
        { role: 'system', content: 'Generate a brief, atmospheric description of this fantasy location.' },
        { role: 'user', content: `Describe ${cleanLocationName} in 2-3 sentences.` }
      ], {
        model: 'openai/gpt-4o'
      });

      const locationImage = await this.generateLocationImage(cleanLocationName, locationDescription);

      // Create thread in the source channel
      const thread = await parentChannel.threads.create({
        name: cleanLocationName,
        autoArchiveDuration: 60
      });

      // Post initial content
      await thread.send({ 
        files: [{ 
          attachment: locationImage,
          name: `${cleanLocationName.toLowerCase().replace(/\s+/g, '_')}.png`
        }]
      });

      const evocativeDescription = await this.generateLocationDescription(cleanLocationName, locationImage);

      await sendAsWebhook(
        thread.id,
        evocativeDescription,
        cleanLocationName,
        locationImage
      );

      if (this.db) {
        await this.db.collection('locations').updateOne(
          { channelId: thread.id },
          { 
            $set: {
              name: cleanLocationName,
              description: evocativeDescription,
              imageUrl: locationImage,
              createdAt: new Date(),
              updatedAt: new Date()
            }
          },
          { upsert: true }
        );
      }

      return {
        id: thread.id,
        name: cleanLocationName,
        channel: thread,
        description: evocativeDescription,
        imageUrl: locationImage
      };

    } catch (error) {
      console.error('Error in findOrCreateLocation:', error);
      throw error;
    }
  }

  async getAllLocations(guild) {
    const locations = [];
    
    // Get all text channels
    const textChannels = guild.channels.cache.filter(c => c.isTextBased());
    locations.push(...textChannels.map(c => ({ name: c.name, channel: c })));

    // Get all active threads from channels that support threading
    for (const channel of textChannels.values()) {
      // Check if channel supports threads
      if (channel.threads && typeof channel.threads.fetchActive === 'function') {
        try {
          const threads = await channel.threads.fetchActive();
          if (threads?.threads?.size > 0) {
            locations.push(...threads.threads.map(t => ({ name: t.name, channel: t })));
          }
        } catch (error) {
          console.warn(`Failed to fetch threads for channel ${channel.name}:`, error.message);
          continue; // Skip this channel and continue with others
        }
      }
    }

    return locations;
  }

  async generateAvatarResponse(avatar, location) {
    const prompt = `You have just arrived at ${location.name}. Write a short in-character message about your arrival or your reaction to this place.`;
    
    const response = await this.aiService.chat([
      { role: 'system', content: `You are ${avatar.name}, a ${avatar.personality}. Keep responses brief and in-character.` },
      { role: 'assistant', content: `${avatar.dynamicPersonality}\n\n${avatar.memory || ''}` },
      { role: 'user', content: prompt }
    ]);

    return response;
  }

  async trackLocationMessage(locationId, message) {
    if (!locationId || !message) {
      this.logger?.warn('Invalid parameters for trackLocationMessage');
      return;
    }

    if (!this.locationMessages.has(locationId)) {
      this.locationMessages.set(locationId, { count: 0, messages: [] });
    }

    const locationData = this.locationMessages.get(locationId);
    locationData.count++;
    
    // Store message data
    locationData.messages.push({
      author: message.author.username,
      content: message.content,
      timestamp: message.createdTimestamp
    });

    // Keep only recent messages
    if (locationData.messages.length > this.MAX_STORED_MESSAGES) {
      locationData.messages.shift();
    }

    // Check if we need to generate a summary
    if (locationData.count >= this.SUMMARY_THRESHOLD) {
      await this.generateLocationSummary(locationId);
      locationData.count = 0; // Reset counter
    }
  }

  async generateLocationSummary(locationId) {
    try {
      const locationData = this.locationMessages.get(locationId);
      if (!locationData) return;

      const location = await this.findLocationById(locationId);
      if (!location) return;

      const prompt = `As ${location.name}, observe the recent events and characters within your boundaries. 
      Describe the current atmosphere, notable characters present, and significant events that have occurred.
      Focus on the mood, interactions, and any changes in the environment.
      Recent activity:
      ${locationData.messages.map(m => `${m.author}: ${m.content}`).join('\n')}`;

      const summary = await this.aiService.chat([
        { role: 'system', content: 'You are a mystical location describing the events and characters within your bounds.' },
        { role: 'user', content: prompt }
      ]);

      // Send the summary as the location
      await sendAsWebhook(
        location.channel.id,
        summary,
        location.name,
        location.imageUrl
      );

    } catch (error) {
      console.error('Error generating location summary:', error);
    }
  }

  async findLocationById(locationId) {
    const guild = this.client.guilds.cache.first();
    if (!guild) return null;

    try {
      const channel = await guild.channels.fetch(locationId);
      if (!channel) return null;

      return {
        id: channel.id,
        name: channel.name,
        channel: channel,
        description: channel.topic || '',
        imageUrl: this.locationImages.get(channel.id)
      };
    } catch (error) {
      console.error('Error finding location:', error);
      return null;
    }
  }
}