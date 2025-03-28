import Fuse from 'fuse.js';
import { AIService } from "../aiService.mjs";
// import { AIService } from "../aiService.mjs";
import { uploadImage } from '../s3/s3imageService.mjs';

import { ObjectId } from 'mongodb';
import { SchemaValidator } from '../utils/schemaValidator.mjs';
import Replicate from 'replicate';
import fs from 'fs/promises';

const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'openai/gpt-4o';

export class LocationService {
  /**
   * Constructs a new LocationService.
   * @param {Object} discordClient - The Discord client (required).
   * @param {Object} [aiService=null] - Optional AI service (defaults to OpenRouterService if not provided).
   */
  constructor(discordClient, aiService = null, db) {
    if (!discordClient) {
      throw new Error('Discord client is required for LocationService');
    }

    this.client = discordClient;
    this.aiService = aiService || new AIService(); // Allow injection or create a new one

    // Fuzzy-search config
    this.fuseOptions = {
      threshold: 0.4,
      keys: ['name']
    };

    // For image generation
    this.replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN
    });

    // Location message tracking
    this.locationMessages = new Map(); // Map<locationId, {count: number, messages: Array}>
    this.SUMMARY_THRESHOLD = 100; // Summarize after 100 messages
    this.MAX_STORED_MESSAGES = 50; // Keep last 50 messages in memory

    // DB Setup
    /** @type {import('mongodb').Db|null} */
    this.db = db;
  }

  /**
   * Ensures the DB is connected before proceeding.
   * @private
   */
  ensureDbConnection() {
    if (!this.db) {
      throw new Error('Database not connected');
    }
    return this.db;
  }

  /**
   * Downloads an image from a URL and returns the Buffer.
   * @param {string} url - The URL to download from.
   * @returns {Promise<Buffer>}
   */
  async downloadImage(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to get '${url}' (status: ${response.status})`);
      }
      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch (error) {
      console.error('Error downloading the image:', error);
      throw error;
    }
  }

  /**
   * Generates an image for a location using Replicate and uploads it to S3.
   * @param {string} locationName - The location name used in the prompt.
   * @param {string} description - Additional descriptive text for the prompt.
   * @returns {Promise<string>} - The uploaded image URL.
   */
  async generateLocationImage(locationName, description) {
    this.ensureDbConnection();

    const trigger = process.env.REPLICATE_LORA_TRIGGER || '';

    try {
      // 1. Use Replicate to generate an image
      const [output] = await this.replicate.run(
        process.env.REPLICATE_MODEL || 'immanencer/mirquo:dac6bb69d1a52b01a48302cb155aa9510866c734bfba94aa4c771c0afb49079f',
        {
          input: {
            prompt: `${trigger} ${locationName} ${trigger} ${description} ${trigger}`,
            model: 'dev',
            lora_scale: 1,
            num_outputs: 1,
            aspect_ratio: '16:9',
            output_format: 'png',
            guidance_scale: 3.5,
            output_quality: 90,
            prompt_strength: 0.8,
            extra_lora_scale: 1,
            num_inference_steps: 28,
            disable_safety_checker: true
          }
        }
      );

      // 2. Grab the URL from the replicate output
      const imageUrl = output.url ? output.url() : [output];
      const finalUrl = imageUrl.toString();

      // 3. Download the image to local disk
      const imageBuffer = await this.downloadImage(finalUrl);
      const localFilename = `./images/location_${Date.now()}.png`;
      await fs.mkdir('./images', { recursive: true });
      await fs.writeFile(localFilename, imageBuffer);

      // 4. Upload image to S3
      const uploadedUrl = await uploadImage(localFilename);

      // 5. Update the "locations" DB record if it exists
      await this.db.collection('locations').updateOne(
        { name: locationName },
        {
          $set: {
            imageUrl: uploadedUrl,
            updatedAt: new Date()
          }
        },
        { upsert: true }
      );

      return uploadedUrl;
    } catch (error) {
      console.error('Error generating location image:', error);
      throw error;
    }
  }

  /**
   * Generates a short, atmospheric departure message from currentLocation to newLocation.
   * @param {Object} avatar - The avatar object with at least { name, ... }.
   * @param {Object} currentLocation - The current location object { name, imageUrl, ... }.
   * @param {Object} newLocation - The target location object { name, channel, ... }.
   * @returns {Promise<string>} - The AI-generated message.
   */
  async generateDepartureMessage(avatar, currentLocation, newLocation) {
    try {
      // Generate an image if currentLocation has none
      if (!currentLocation.imageUrl) {
        const locDescription = await this.aiService.chat([
          {
            role: 'system',
            content: 'Generate a brief description of this location.'
          },
          {
            role: 'user',
            content: `Describe ${currentLocation.name} in 2-3 sentences.`
          }
        ]);
        currentLocation.imageUrl = await this.generateLocationImage(
          currentLocation.name,
          locDescription
        );
      }

      // Generate the AI text
      const prompt = `You are ${currentLocation.name}. Describe ${avatar.name}'s departure to ${newLocation.name} in a brief atmospheric message.`;
      const response = await this.aiService.chat([
        {
          role: 'system',
          content: 'You are a mystical location describing travelers.'
        },
        {
          role: 'user',
          content: prompt
        }
      ]);

      // Replace mention of the new location with a channel reference
      return response.replace(newLocation.name, `<#${newLocation.channel.id}>`);
    } catch (error) {
      console.error('Error generating departure message:', error);
      return 'The winds shift, but no words arise...';
    }
  }

  /**
   * Generates a short 2-3 sentence description of the location (used after image creation).
   * @param {string} locationName
   * @param {string} imageUrl
   * @returns {Promise<string>}
   */
  async generateLocationDescription(locationName, imageUrl) {
    try {
      const prompt = `
        You are a master storyteller describing a mystical location.
        Looking at this scene of ${locationName}, write a vivid, evocative description that brings it to life.
        Focus on the atmosphere, unique features, and feelings it evokes.
        Keep it to 2-3 compelling sentences.
      `;

      const responseSchema = {
        type: "STRING",
        description: "A short, vivid description of the location."
      };

      const response = await this.aiService.chat(
        [
          { role: 'system', content: 'You are a poetic location narrator skilled in atmospheric descriptions.' },
          { role: 'user', content: prompt }
        ],
        { responseSchema }
      );

      return response || `A mysterious aura surrounds ${locationName}, but words fail to capture it.`;
    } catch (error) {
      console.error('Error generating location description:', error);
      return `A mysterious aura surrounds ${locationName}, but words fail to capture it.`;
    }
  }

  /**
   * Attempts to find or create a location (Discord Thread or Channel) by fuzzy name matching.
   * @param {import('discord.js').Guild} guild
   * @param {string} locationName
   * @param {import('discord.js').BaseGuildTextChannel} [sourceChannel=null]
   * @returns {Promise<Object>} - The location object { id, name, channel, description, imageUrl }.
   */
  async findOrCreateLocation(guild, locationName, sourceChannel = null) {
    if (!guild) {
      throw new Error('Guild is required to find or create location');
    }

    try {
      this.ensureDbConnection();

      // Gather existing location channels/threads
      const existingLocations = await this.getAllLocations(guild);
      const fuse = new Fuse(existingLocations, this.fuseOptions);

      // Use AI to sanitize or refine the location name
      let cleanLocationName = await this.aiService.chat(
        [
          { role: 'system', content: 'You are an expert editor.' },
          {
            role: 'user',
            content: `The avatar wants to move to or create this location:

${locationName}

Return ONLY a single location name, less than 80 characters, suitable for a fantasy setting.
If already suitable, return as is. If it needs editing, revise it while preserving its meaning.`
          }
        ],
        {
          model: OPENROUTER_MODEL
        }
      );

      // Safety net for name length
      if (!cleanLocationName) {
        cleanLocationName = locationName.slice(0, 80);
      } else {
        cleanLocationName = cleanLocationName.trim().slice(0, 80);
      }

      // Attempt fuzzy-match against existing
      const [bestMatch] = fuse.search(cleanLocationName, { limit: 1 });
      if (bestMatch) {
        // Return existing location if found
        return bestMatch.item;
      }

      // If no existing location, create new thread in a channel
      let parentChannel = sourceChannel;
      if (!parentChannel || !parentChannel.threads) {
        parentChannel = guild.channels.cache.find(
          (c) => c.isTextBased() && c.threads
        );
      }

      if (!parentChannel) {
        throw new Error('No suitable parent channel found for location threads');
      }

      // Generate short description & image for new location
      const locationDescription = await this.aiService.chat(
        [
          {
            role: 'system',
            content: 'Generate a brief, atmospheric description of this fantasy location.'
          },
          {
            role: 'user',
            content: `Describe ${cleanLocationName} in 2-3 sentences.`
          }
        ],
        {
          model: OPENROUTER_MODEL
        }
      );
      const locationImage = await this.generateLocationImage(
        cleanLocationName,
        locationDescription
      );

      // Create a thread
      const thread = await parentChannel.threads.create({
        name: cleanLocationName,
        autoArchiveDuration: 60
      });

      if (!thread) {
        throw new Error('Failed to create thread for location');
      }

      // Post the location image
      await thread.send({
        files: [
          {
            attachment: locationImage,
            name: `${cleanLocationName.toLowerCase().replace(/\s+/g, '_')}.png`
          }
        ]
      });

      // Generate a final evocative description
      const evocativeDescription = await this.generateLocationDescription(
        cleanLocationName,
        locationImage
      );


      // Create location document
      const locationDocument = {
        name: cleanLocationName,
        description: evocativeDescription,
        imageUrl: locationImage,
        channelId: thread.id,
        type: 'thread',
        parentId: parentChannel.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: '1.0.0'
      };

      // Post the evocative description as a webhook
      await this.services.discordService.sendAsWebhook(thread.id, evocativeDescription, locationDocument);

      // Validate location schema
      const schemaValidator = new SchemaValidator();
      const validation = schemaValidator.validateLocation(locationDocument);
      if (!validation.valid) {
        throw new Error(`Invalid location schema: ${JSON.stringify(validation.errors)}`);
      }

      // Save to DB
      await this.db.collection('locations').updateOne(
        { channelId: thread.id },
        { $set: locationDocument },
        { upsert: true }
      );

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

  /**
 * Retrieves or creates a location document based on the channel ID.
 * @param {string} channelId - The Discord channel or thread ID.
 * @returns {Promise<Object>} - The location document.
 */
  async getLocationByChannelId(channelId) {
    this.ensureDbConnection();

    let location = await this.db.collection('locations').findOne({ channelId });
    if (!location) {
      // Fetch the channel from Discord
      const channel = await this.client.channels.fetch(channelId);
      if (!channel) {
        throw new Error(`Channel with ID ${channelId} not found`);
      }

      // Use the channel name as the base
      let locationName = channel.name;

      // Refine the name with AI for a fantasy setting (optional)
      const cleanLocationName = await this.aiService.chat(
        [
          { role: 'system', content: 'You are an expert editor.' },
          {
            role: 'user',
            content: `Refine this channel name for a fantasy location: "${locationName}". Return ONLY the refined name, less than 80 characters.`
          }
        ],
        { model: OPENROUTER_MODEL }
      ).catch(() => locationName.slice(0, 80)); // Fallback to original name if AI fails

      // Generate a description
      const description = await this.aiService.chat(
        [
          { role: 'system', content: 'Generate a brief, atmospheric description of this fantasy location.' },
          { role: 'user', content: `Describe ${cleanLocationName} in 2-3 sentences.` }
        ],
        { model: OPENROUTER_MODEL }
      );

      // Generate an image
      const imageUrl = await this.generateLocationImage(cleanLocationName, description);

      // Create the location document
      location = {
        name: cleanLocationName,
        description,
        imageUrl,
        channelId,
        type: channel.isThread() ? 'thread' : 'channel',
        parentId: channel.isThread() ? channel.parentId : null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastSummaryUpdate: null, // Initialize for ambiance tracking
        version: '1.0.0'
      };

      await this.db.collection('locations').insertOne(location);

      // Optionally post the description and image to the channel
      await this.services.discordService.sendAsWebhook(channelId, description, { files: [imageUrl] });
    }
    return location;
  }

  /**
 * Checks if the location's summary is stale (older than 48 hours).
 * @param {string} channelId - The Discord channel or thread ID.
 * @returns {Promise<boolean>} - True if the summary is stale or missing.
 */
  async summaryIsStale(channelId) {
    this.ensureDbConnection();

    const location = await this.db.collection('locations').findOne({ channelId });
    if (!location || !location.lastSummaryUpdate) {
      return true; // Needs update if no summary exists
    }

    const lastUpdate = new Date(location.lastSummaryUpdate);
    const now = new Date();
    const hoursSinceUpdate = (now - lastUpdate) / (1000 * 60 * 60); // Convert ms to hours
    return hoursSinceUpdate > 48;
  }

  /**
   * Returns all text-based channels and active threads in the guild as location objects.
   * @param {import('discord.js').Guild} guild
   * @returns {Promise<Array<{ name: string, channel: import('discord.js').BaseGuildTextChannel }>>}
   */
  async getAllLocations(guild) {
    const locations = [];

    // 1) Get all text-based channels
    const textChannels = guild.channels.cache.filter((c) => c.isTextBased());
    locations.push(...textChannels.map((c) => ({ name: c.name, channel: c })));

    // 2) Fetch active threads from each text channel
    for (const channel of textChannels.values()) {
      if (channel.threads && typeof channel.threads.fetchActive === 'function') {
        try {
          const threads = await channel.threads.fetchActive();
          if (threads?.threads?.size > 0) {
            locations.push(
              ...threads.threads.map((t) => ({ name: t.name, channel: t }))
            );
          }
        } catch (err) {
          console.warn(
            `Failed to fetch threads for channel ${channel.name}: ${err.message}`
          );
        }
      }
    }

    return locations;
  }

  /**
   * Generates a brief in-character message from an avatar upon arriving at a new location.
   * @param {Object} avatar - The avatar object { name, personality, memory, ... }.
   * @param {Object} location - The location object { name, ... }.
   * @returns {Promise<string>}
   */
  async generateAvatarResponse(avatar, location) {
    try {
      const prompt = `You have just arrived at ${location.name}. Write a short in-character message about your arrival or your reaction to this place.`;
      const response = await this.aiService.chat([
        {
          role: 'system',
          content: `You are ${avatar.name}, a ${avatar.personality}. Keep responses brief and in-character.`
        },
        {
          role: 'assistant',
          content: `${avatar.dynamicPersonality}\n\n${avatar.memory || ''}`
        },
        {
          role: 'user',
          content: prompt
        }
      ]);
      return response;
    } catch (error) {
      console.error('Error generating avatar response:', error);
      return `${avatar.name} seems speechless...`;
    }
  }

  /**
   * Tracks a single message in a location, incrementing the count and storing the content.
   * If threshold is reached, it auto-generates a location summary.
   * @param {string} locationId
   * @param {Object} message
   */
  async trackLocationMessage(locationId, message) {
    if (!locationId || !message) {
      console.warn('Invalid parameters for trackLocationMessage');
      return;
    }

    if (!this.locationMessages.has(locationId)) {
      this.locationMessages.set(locationId, { count: 0, messages: [] });
    }

    const locationData = this.locationMessages.get(locationId);
    locationData.count += 1;

    // Store message data
    locationData.messages.push({
      author: message.author?.username || 'Unknown',
      content: message.content,
      timestamp: message.createdTimestamp
    });

    // Keep only recent messages
    if (locationData.messages.length > this.MAX_STORED_MESSAGES) {
      locationData.messages.shift();
    }

    // Check if we need to summarize
    if (locationData.count >= this.SUMMARY_THRESHOLD) {
      await this.generateLocationSummary(locationId);
      locationData.count = 0; // Reset after summary
    }
  }

  /**
   * Generates a summary of recent messages for a location, posts it with the location image via webhook as "the location,"
   * and includes a small chance to create an item based on recent activity.
   * @param {string} locationId - The channel or thread ID in Discord.
   */
  async generateLocationSummary(locationId) {
    try {
      const locationData = this.locationMessages.get(locationId);
      if (!locationData) {
        console.warn('No message data found for location ID', locationId);
        return;
      }

      const location = await this.findLocationById(locationId);
      if (!location) {
        console.warn('No location found with ID', locationId);
        return;
      }

      // Compile recent messages into a text block
      const messagesText = locationData.messages
        .map((m) => `${m.author}: ${m.content}`)
        .join('\n');

      // Generate the ambiance summary
      const prompt = `As ${location.name}, observe the recent events and characters within your boundaries.
Describe the current atmosphere, notable characters present, and significant events that have occurred.
Focus on the mood, interactions, and any changes in the environment.
Recent activity:
${messagesText}`;

      const summary = await this.aiService.chat([
        {
          role: 'system',
          content: 'You are a mystical location describing the events and characters within your bounds.'
        },
        {
          role: 'user',
          content: prompt
        }
      ]);

      // Post the summary along with the location's current image
      await this.services.discordService.sendAsWebhook(location.id, {
        content: summary,
        files: location.imageUrl ? [location.imageUrl] : []
      }, location);

      // Small chance (5%) to create an item based on recent activity
      const createItemChance = 0.05;
      if (Math.random() < createItemChance) {
        const itemPrompt = `Based on the recent events in ${location.name}, suggest a unique item that could be found here.
Provide a name and a brief description in the format:
Name: [item name]
Description: [item description]`;

        const itemResponse = await this.aiService.chat([
          {
            role: 'system',
            content: 'You are a creative item generator for a fantasy setting.'
          },
          {
            role: 'user',
            content: itemPrompt
          }
        ]);

        // Parse the item response
        const lines = itemResponse.split('\n');
        const nameLine = lines.find(line => line.startsWith('Name:'));
        const descLine = lines.find(line => line.startsWith('Description:'));
        const itemName = nameLine ? nameLine.replace('Name:', '').trim() : 'Mysterious Item';
        const itemDesc = descLine ? descLine.replace('Description:', '').trim() : 'An item of unknown origin.';

        // Create the item using ItemService
        const newItem = await this.services.itemService.createItem({
          name: itemName,
          description: itemDesc,
          locationId: location.id
        });

        // Announce the item's appearance
        const announcement = `A new item has appeared: **${newItem.name}** - ${newItem.description}`;
        await this.services.discordService.sendAsWebhook(location.id, announcement, location);
      }
      // Update lastSummaryUpdate in the database
      await this.db.collection('locations').updateOne(
        { channelId },
        { $set: { lastSummaryUpdate: new Date().toISOString(), updatedAt: new Date().toISOString() } }
      );

      // Reset message count if triggered by threshold
      if (locationData.count >= this.SUMMARY_THRESHOLD) {
        locationData.count = 0;
      }
    } catch (error) {
      console.error('Error generating location summary:', error);
    }
  }

  /**
   * Finds a location by its channel/thread ID in Discord, returning a location-like object.
   * If your DB stores location data, you could also fetch it there.
   * @param {string} locationId
   * @returns {Promise<null|Object>}
   */
  async findLocationById(locationId) {
    try {
      const guild = this.client.guilds.cache.first();
      if (!guild) {
        console.warn('No guild found in the Discord client');
        return null;
      }

      const channel = await guild.channels.fetch(locationId);
      if (!channel) return null;

      // Optionally, fetch DB info
      let dbLocation = null;
      if (this.db) {
        dbLocation = await this.db.collection('locations').findOne({
          $or: [{ channelId: locationId }, { _id: new ObjectId(locationId) }]
        });
      }

      return {
        id: channel.id,
        name: channel.name,
        channel,
        description: dbLocation?.description || channel.topic || '',
        imageUrl: dbLocation?.imageUrl || null
      };
    } catch (error) {
      console.error('Error finding location by ID:', error);
      return null;
    }
  }

  /**
   * Generates RATi-compatible metadata for a location.
   * @param {Object} location - The location object.
   * @param {Object} storageUris - URIs for metadata storage (e.g., { primary: 'ar://...', backup: 'ipfs://...' }).
   * @returns {Object} - The RATi-compatible metadata.
   */
  generateRatiMetadata(location, storageUris) {
    return {
      tokenId: location._id.toString(),
      name: location.name,
      description: location.description,
      media: {
        image: location.imageUrl,
        video: location.videoUrl || null
      },
      attributes: [
        { trait_type: "Region", value: location.region || "Unknown" },
        { trait_type: "Ambience", value: location.ambience || "Neutral" },
        { trait_type: "Accessibility", value: location.accessibility || "Public" }
      ],
      signature: null, // To be signed by the RATi node.
      storage: storageUris,
      evolution: {
        level: location.evolutionLevel || 1,
        previous: location.previousTokenIds || [],
        timestamp: location.updatedAt
      },
      memory: {
        recent: location.memoryRecent || null,
        archive: location.memoryArchive || null
      }
    };
  }
}
