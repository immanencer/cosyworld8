export class MessageProcessor {
  constructor(avatarService) {
    this.avatarService = avatarService;
    this.activeChannels = new Set();
    this.lastActivityTime = new Map();
    this.ACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes
    this.guildActivity = new Map(); // guildId -> lastActivity
    this.MEAT_EMOJIS = new Set(['🍖', '🥩', '🍗', '🥓', '🌭', '🍔', '🍗']); // All meat-related emojis
    this.SCATTER_COOLDOWN = 60 * 1000; // 1 minute cooldown between scatters
    this.lastScatterTime = new Map(); // channelId -> timestamp
    this.MAX_AVATARS_PER_CHANNEL = 8;
    this.channelAvatars = new Map(); // channelId -> Set of avatarIds
    this.avatarActivityCount = new Map(); // avatarId -> activity count
  }

  async checkMessage(message) {
    try {
      // Check for meat emojis
      const hasMeatEmoji = [...message.content].some(char => this.MEAT_EMOJIS.has(char));
      
      if (hasMeatEmoji && !message.author.bot) {
        const channelId = message.channel.id;
        const now = Date.now();
        const lastScatter = this.lastScatterTime.get(channelId) || 0;

        // Check cooldown
        if (now - lastScatter >= this.SCATTER_COOLDOWN) {
          await this.scatterAvatars(message.channel);
          this.lastScatterTime.set(channelId, now);
        }
      }
    } catch (error) {
      console.error('Error in checkMessage:', error);
    }
  }

  async scatterAvatars(channel) {
    try {
      // Get all available text channels in the guild
      const availableChannels = channel.guild.channels.cache
        .filter(c => c.isTextBased() && c.id !== channel.id)
        .map(c => c);

      if (availableChannels.length === 0) {
        return;
      }

      // Manage channel limits for scattered avatars
      for (const targetChannel of availableChannels) {
        await this.manageChannelAvatars(targetChannel.id);
      }

      // Get avatars in the current channel
      const avatarsInChannel = await this.avatarService.getAvatarsInChannel(channel.id);
      
      for (const avatar of avatarsInChannel) {
        try {
          // Pick a random channel
          const randomChannel = availableChannels[Math.floor(Math.random() * availableChannels.length)];
          
          // Update avatar's channel
          avatar.channelId = randomChannel.id;
          await this.avatarService.updateAvatar(avatar);

          // Send scatter message
          await randomChannel.send(`*${avatar.name} ${avatar.emoji || '👻'} scatters here in fear of meat!*`);
        } catch (error) {
          console.error(`Error scattering avatar ${avatar.name}:`, error);
        }
      }

      // Send message in original channel
      if (avatarsInChannel.length > 0) {
        await channel.send('*The smell of meat causes nearby AI to scatter in fear!* 🏃💨');
      }

    } catch (error) {
      console.error('Error in scatterAvatars:', error);
    }
  }

  incrementAvatarActivity(avatarId) {
    const count = (this.avatarActivityCount.get(avatarId) || 0) + 1;
    this.avatarActivityCount.set(avatarId, count);
  }

  getChannelAvatars(channelId) {
    return this.channelAvatars.get(channelId) || new Set();
  }

  async manageChannelAvatars(channelId, newAvatarId) {
    let channelAvatars = this.getChannelAvatars(channelId);
    
    // Add new avatar
    if (newAvatarId) {
      // If channel is at capacity, remove least active avatar
      if (channelAvatars.size >= this.MAX_AVATARS_PER_CHANNEL) {
        let leastActiveAvatar = null;
        let lowestActivity = Infinity;
        
        for (const avatarId of channelAvatars) {
          const activity = this.avatarActivityCount.get(avatarId) || 0;
          if (activity < lowestActivity) {
            lowestActivity = activity;
            leastActiveAvatar = avatarId;
          }
        }
        
        if (leastActiveAvatar) {
          channelAvatars.delete(leastActiveAvatar);
          this.avatarActivityCount.delete(leastActiveAvatar);
          
          // Update avatar's channel in database
          const avatar = await this.avatarService.getAvatarById(leastActiveAvatar);
          if (avatar) {
            avatar.channelId = null;
            await this.avatarService.updateAvatar(avatar);
          }
        }
      }
      
      channelAvatars.add(newAvatarId);
      this.channelAvatars.set(channelId, channelAvatars);
      this.incrementAvatarActivity(newAvatarId);
    }
    
    return channelAvatars;
  }

  async getActiveAvatars() {
    try {
      const avatars = await this.avatarService.getAllAvatars();
      if (!avatars?.length) {
        console.warn('No avatars found in database');
        return [];
      }
      
      const activeAvatars = avatars
        .filter(avatar => avatar && typeof avatar === 'object' && (avatar._id || avatar._id))
        .map(avatar => {
          const id = avatar._id || avatar._id;
          
          // Create normalized avatar object
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
          if (!avatar._id || !avatar.name) {
            console.error('Invalid avatar data after normalization:', JSON.stringify(avatar, null, 2));
            return false;
          }
          return avatar.active;
        });

      return activeAvatars;
    } catch (error) {
      console.error('Error fetching active avatars:', error);
      return [];
    }
  }

  async getActiveChannels(client) {
    const now = Date.now();
    const channels = [];
    
    for (const [guildId, guild] of client.guilds.cache) {
      const lastActivity = this.guildActivity.get(guildId) || 0;
      if (now - lastActivity <= this.ACTIVITY_TIMEOUT) {
        const guildChannels = Array.from(guild.channels.cache.values())
          .filter(channel => this.activeChannels.has(channel.id) && channel.isTextBased()); // Added channel type check
        channels.push(...guildChannels);
      }
    }
    
    return channels;
  }

  markChannelActive(channelId, guildId) {
    this.activeChannels.add(channelId);
    this.lastActivityTime.set(channelId, Date.now());
    if (guildId) {
      this.guildActivity.set(guildId, Date.now());
    }
  }

  isChannelActive(channelId) {
    const lastActivity = this.lastActivityTime.get(channelId);
    return lastActivity && (Date.now() - lastActivity <= this.ACTIVITY_TIMEOUT);
  }
}
