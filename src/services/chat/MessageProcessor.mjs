export class MessageProcessor {
  /**
   * @param {object} avatarService - Service for avatar database operations.
   * @param {object} client - The Discord client instance.
   * @param {object} chatService - Service used to trigger chat responses.
   * @param {object} imageProcessingService - Optional service for image processing.
   */
  constructor(avatarService, client, chatService, imageProcessingService = null) {
    this.avatarService = avatarService;
    this.client = client;
    this.chatService = chatService;
    this.imageProcessingService = imageProcessingService;

    this.activeChannels = new Set();
    this.lastActivityTime = new Map();
    this.ACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes

    this.guildActivity = new Map(); // Map of guildId -> lastActivity timestamp

    // Set of meat-related emojis (duplicates removed)
    this.MEAT_EMOJIS = new Set(['🍖', '🥩', '🍗', '🥓', '🌭', '🍔']);

    this.SCATTER_COOLDOWN = 60 * 1000; // 1 minute cooldown between scatters
    this.lastScatterTime = new Map(); // Map of channelId -> timestamp

    this.MAX_AVATARS_PER_CHANNEL = 8;
    this.channelAvatars = new Map(); // Map of channelId -> Set of avatarIds
    this.avatarActivityCount = new Map(); // Map of avatarId -> activity count

    this.channelUpdateInterval = 60 * 1000; // 1 minute update interval for responsiveness
    this.lastChannelUpdate = new Map(); // Map of channelId -> timestamp

    // Start periodic checks for channel avatar updates.
    this.startChannelUpdates();
  }

  /**
   * Checks the message for meat emojis and scatters avatars if conditions are met.
   * @param {object} message - The Discord message object.
   */
  async checkMessage(message) {
    try {
      // Only process non-bot messages containing any meat emoji.
      const hasMeatEmoji = [...message.content].some(char => this.MEAT_EMOJIS.has(char));
      if (hasMeatEmoji && !message.author.bot) {
        const channelId = message.channel.id;
        const now = Date.now();
        const lastScatter = this.lastScatterTime.get(channelId) || 0;
        if (now - lastScatter >= this.SCATTER_COOLDOWN) {
          await this.scatterAvatars(message.channel);
          this.lastScatterTime.set(channelId, now);
        }
      }
    } catch (error) {
      console.error('Error in checkMessage:', error);
    }
  }

  /**
   * Scatters all avatars in the current channel to random other text channels.
   * @param {object} channel - The current Discord text channel.
   */
  async scatterAvatars(channel) {
    try {
      const { guild } = channel;
      // Get all available text channels except the current one.
      const availableChannels = guild.channels.cache
        .filter(c => c.isTextBased() && c.id !== channel.id)
        .map(c => c);
      if (availableChannels.length === 0) return;

      // Pre-manage avatars for each target channel.
      for (const targetChannel of availableChannels) {
        await this.manageChannelAvatars(targetChannel.id);
      }

      // Retrieve avatars in current channel.
      const avatarsInChannel = await this.avatarService.getAvatarsInChannel(channel.id);
      for (const avatar of avatarsInChannel) {
        try {
          const randomChannel = availableChannels[Math.floor(Math.random() * availableChannels.length)];
          // Update avatar's channel ID.
          avatar.channelId = randomChannel.id;
          await this.avatarService.updateAvatar(avatar);
          // Send scatter message.
          await randomChannel.send(`*${avatar.name} ${avatar.emoji || '👻'} scatters here in fear of meat!*`);
        } catch (error) {
          console.error(`Error scattering avatar ${avatar.name}:`, error);
        }
      }
      if (avatarsInChannel.length > 0) {
        await channel.send('*The smell of meat causes nearby AI to scatter in fear!* 🏃💨');
      }
    } catch (error) {
      console.error('Error in scatterAvatars:', error);
    }
  }

  /**
   * Increments the activity count for a given avatar.
   * @param {string} avatarId - The ID of the avatar.
   */
  incrementAvatarActivity(avatarId) {
    const currentCount = this.avatarActivityCount.get(avatarId) || 0;
    this.avatarActivityCount.set(avatarId, currentCount + 1);
  }

  /**
   * Retrieves the Set of avatar IDs for a given channel.
   * @param {string} channelId
   * @returns {Set<string>}
   */
  getChannelAvatars(channelId) {
    return this.channelAvatars.get(channelId) || new Set();
  }

  /**
   * Manages avatars for a channel, adding a new avatar if provided.
   * Removes the least active avatar if the channel is at capacity.
   * @param {string} channelId
   * @param {string} [newAvatarId] - Optional new avatar to add.
   * @returns {Promise<Set<string>>}
   */
  async manageChannelAvatars(channelId, newAvatarId = null) {
    let avatars = this.getChannelAvatars(channelId);
    if (newAvatarId) {
      if (avatars.size >= this.MAX_AVATARS_PER_CHANNEL) {
        let leastActiveAvatar = null;
        let lowestActivity = Infinity;
        for (const avatarId of avatars) {
          const activity = this.avatarActivityCount.get(avatarId) || 0;
          if (activity < lowestActivity) {
            lowestActivity = activity;
            leastActiveAvatar = avatarId;
          }
        }
        if (leastActiveAvatar) {
          avatars.delete(leastActiveAvatar);
          this.avatarActivityCount.delete(leastActiveAvatar);
          const avatar = await this.avatarService.getAvatarById(leastActiveAvatar);
          if (avatar) {
            avatar.channelId = null;
            await this.avatarService.updateAvatar(avatar);
          }
        }
      }
      avatars.add(newAvatarId);
      this.channelAvatars.set(channelId, avatars);
      this.incrementAvatarActivity(newAvatarId);
    }
    return avatars;
  }

  /**
   * Retrieves and normalizes active avatars from the avatar service.
   * @returns {Promise<object[]>} List of normalized active avatars.
   */
  async getActiveAvatars() {
    try {
      const avatars = await this.avatarService.getAllAvatars();
      if (!avatars?.length) {
        console.warn('No avatars found in database');
        return [];
      }
      return avatars
        .map(avatar => {
          const id = avatar._id || avatar.id;
          return {
            ...avatar,
            id,
            name: avatar.name || null,
            emoji: avatar.emoji || null,
            personality: avatar.personality || '',
            description: avatar.description || '',
            imageUrl: avatar.imageUrl || null,
            active: avatar.active !== false
          };
        })
        .filter(avatar => {
          if (!avatar.id || !avatar.name) {
            console.error('Invalid avatar data after normalization:', avatar);
            return false;
          }
          return avatar.active;
        });
    } catch (error) {
      console.error('Error fetching active avatars:', error);
      return [];
    }
  }

  /**
   * Retrieves channels that are active based on recent guild activity.
   * @returns {Promise<array>} List of active text channels.
   */
  async getActiveChannels() {
    const now = Date.now();
    const activeChannels = [];
    for (const [guildId, guild] of this.client.guilds.cache.entries()) {
      const lastActivity = this.guildActivity.get(guildId) || 0;
      if (now - lastActivity <= this.ACTIVITY_TIMEOUT) {
        const channels = guild.channels.cache.filter(channel =>
          this.activeChannels.has(channel.id) && channel.isTextBased()
        );
        activeChannels.push(...channels.values());
      }
    }
    return activeChannels;
  }

  /**
   * Marks a channel (and optionally its guild) as active.
   * Also triggers an immediate avatar update if needed.
   * @param {string} channelId
   * @param {string} [guildId]
   */
  markChannelActive(channelId, guildId = null) {
    this.activeChannels.add(channelId);
    this.lastActivityTime.set(channelId, Date.now());
    if (guildId) {
      this.guildActivity.set(guildId, Date.now());
    }
    // Trigger an immediate channel update if the update interval has elapsed.
    const lastUpdate = this.lastChannelUpdate.get(channelId) || 0;
    if (Date.now() - lastUpdate >= this.channelUpdateInterval) {
      this.updateChannelAvatar(channelId);
    }
  }

  /**
   * Checks if a channel is active based on last activity timestamp.
   * @param {string} channelId
   * @returns {boolean}
   */
  isChannelActive(channelId) {
    const lastActivity = this.lastActivityTime.get(channelId);
    return lastActivity && (Date.now() - lastActivity <= this.ACTIVITY_TIMEOUT);
  }

  /**
   * Periodically checks channels for avatar updates.
   * Runs every minute to keep responsiveness high.
   */
  startChannelUpdates() {
    setInterval(async () => {
      for (const channelId of this.activeChannels) {
        const lastUpdate = this.lastChannelUpdate.get(channelId) || 0;
        if (Date.now() - lastUpdate >= this.channelUpdateInterval) {
          await this.updateChannelAvatar(channelId);
        }
      }
    }, 60 * 1000); // Check every minute
  }

  /**
   * Updates an avatar in a channel.
   * Prioritizes avatars that are marked as active and have higher activity counts.
   * Triggers a chat response via chatService.
   * @param {string} channelId
   */
  async updateChannelAvatar(channelId) {
    try {
      const avatarsInChannel = await this.avatarService.getAvatarsInChannel(channelId);
      if (!avatarsInChannel || avatarsInChannel.length === 0) return;

      // Filter for avatars marked as active.
      const activeAvatars = avatarsInChannel.filter(avatar => avatar.active);
      let selectedAvatar;
      if (activeAvatars.length > 0) {
        // Sort descending by activity count.
        activeAvatars.sort((a, b) => {
          const activityA = this.avatarActivityCount.get(a.id) || 0;
          const activityB = this.avatarActivityCount.get(b.id) || 0;
          return activityB - activityA;
        });
        selectedAvatar = activeAvatars[0];
      } else {
        // If none are marked active, fallback to highest activity overall.
        avatarsInChannel.sort((a, b) => {
          const activityA = this.avatarActivityCount.get(a.id) || 0;
          const activityB = this.avatarActivityCount.get(b.id) || 0;
          return activityB - activityA;
        });
        selectedAvatar = avatarsInChannel[0];
      }

      if (selectedAvatar) {
        this.incrementAvatarActivity(selectedAvatar.id);
        this.lastChannelUpdate.set(channelId, Date.now());
        const channel = await this.client.channels.fetch(channelId);
        if (channel) {
          // Trigger the avatar response via chatService.
          await this.chatService.respondAsAvatar(channel, selectedAvatar, true);
        }
      }
    } catch (error) {
      console.error(`Error updating channel ${channelId}:`, error);
    }
  }
}
