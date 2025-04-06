import Fuse from 'fuse.js';

import { ObjectId } from 'mongodb';
import { SchemaValidator } from '../utils/schemaValidator.mjs';
import { BasicService } from '../basicService.mjs';

const STRUCTURED_MODEL = process.env.STRUCTURED_MODEL || 'openai/gpt-4o';

export class LocationService extends BasicService {
  /**
   * Constructs a new LocationService.
   * @param {Object} discordClient - The Discord client (required).
   * @param {Object} [aiService=null] - Optional AI service (defaults to OpenRouterService if not provided).
   */
  constructor(services) {
    super(services, [
      'aiService',
      'discordService',
      'databaseService',
      'creationService',
      'itemService',
      'avatarService',
      'channelManager',
      'conversationManager',
      'mapService',
    ]);

    this.client = this.discordService.client;
    this.db = this.databaseService.getDatabase(); 

    // Fuzzy-search config
    this.fuseOptions = {
      threshold: 0.4,
      keys: ['name']
    };

    // Location message tracking
    this.locationMessages = new Map(); // Map<locationId, {count: number, messages: Array}>
    this.SUMMARY_THRESHOLD = 100; // Summarize after 100 messages
    this.MAX_STORED_MESSAGES = 50; // Keep last 50 messages in memory
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
    return await this.creationService.generateImage(`${locationName}: ${description} Overhead RPG Map Style`, '16:9'); // Use CreationService
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
  async generateLocationDescription(locationName, description) {
    try {
      const prompt = `
        You are a master storyteller describing the layout of a location.
        Looking at this scene of ${locationName}, write a vivid, evocative description that brings it to life.
        
        ${description}
        
        Focus on the atmosphere, unique features, and feelings it evokes.
        Keep it to 2-3 compelling sentences.
      `;

      const schema = {
      name: 'RATi LOCATION',
      strict: true,
      description: 'Location generation schema',
      schema: {
        type: 'object',
        properties: {
          description: { type: 'string' }
        },
        required: ['description'],

        additionalProperties: false,
      }};

      const response = await this.creationService.executePipeline({ prompt, schema });
      return response.description || `A mysterious aura surrounds ${locationName}, but words fail to capture it.`;
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
          model: STRUCTURED_MODEL
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
            content: 'Generate a brief, atmospheric description of this location, describing its layout and features in an interesting way.'
          },
          {
            role: 'user',
            content: `Describe ${cleanLocationName} in 2-3 sentences.`
          }
        ],
        {
          model: STRUCTURED_MODEL
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


      // Create location document
      const locationDocument = {
        name: cleanLocationName,
        description: locationDescription,
        imageUrl: locationImage,
        channelId: thread.id,
        type: 'thread',
        parentId: parentChannel.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: '1.0.0'
      };

      // Post the location image as a webhook
      await this.discordService.sendAsWebhook(thread.id, locationImage, locationDocument);

      // Post the evocative description as a webhook
      await this.discordService.sendAsWebhook(thread.id, locationDescription, locationDocument);

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
        description: locationDescription,
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
        { model: STRUCTURED_MODEL }
      ).catch(() => locationName.slice(0, 80)); // Fallback to original name if AI fails

      // Generate a description
      const description = await this.aiService.chat(
        [
          { role: 'system', content: 'Generate a brief, atmospheric description of this fantasy location.' },
          { role: 'user', content: `Describe ${cleanLocationName} in 2-3 sentences.` }
        ],
        { model: STRUCTURED_MODEL }
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
      await this.discordService.sendLocationEmbed(location, [], [], channelId);
      await this.discordService.sendAsWebhook(channelId, description, 
        { name: cleanLocationName, imageUrl });
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
    if (!location || (!location.lastSummaryUpdate && !location.updatedAt)) {
      return true; // Needs update if no summary exists
    }

    const lastUpdate = new Date(location.lastSummaryUpdate || location.updatedAt);
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
   * Generates a summary of recent messages for a location, posts it with the location image via webhook as "the location,"
   * and includes a small chance to create an item based on recent activity.
   * @param {string} locationId - The channel or thread ID in Discord.
   */
  async generateLocationSummary(locationId) {
    try {
      const channelHistory = await this.services.conversationManager?.getChannelContext(locationId, 50);
      if (!channelHistory) {
        console.warn('No message data found for location ID', locationId);
        return;
      }

      const { location, avatars } = await this.mapService.getLocationAndAvatars(locationId);


      if (!location) {
        console.warn('No location found with ID', locationId);
        return;
      }

      const items = await this.itemService.searchItems(locationId, '');
      const prompt = `
        
        Recent activity:
        ${channelHistory.map(m => `${m.author}: ${m.content}`).join('\n')}
        As ${location.name}, provide a short atmosheric summary of the recent activity in this location.
        No more than one or two paragraphs.
      `;
      const summary = await this.aiService.chat([
        { role: 'system', content: 'You are a mystical location describing events and characters.' },
        { role: 'user', content: prompt }
      ]);

      this.discordService.sendLocationEmbed(location, items, avatars, locationId);
      await this.discordService.sendAsWebhook(locationId, summary, {
        id: locationId,
        name: location.name,
        imageUrl: location.imageUrl
      });

      await this.db.collection('locations').updateOne(
        { channelId: locationId },
        { $set: { lastSummaryUpdate: new Date().toISOString(), updatedAt: new Date().toISOString() } }
      );
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
      return await this.db.collection('locations').findOne({
        $or: [{ channelId: locationId }, { _id: ObjectId.createFromTime(locationId) }]
      });
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
