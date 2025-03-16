export class ChannelManager {
  constructor(client, logger) {
    this.client = client;
    this.logger = logger;
    this.activeChannels = new Set();
    this.lastActivityTime = new Map();
    this.guildActivity = new Map();
    this.ACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  }

  markChannelActive(channelId, guildId) {
    this.activeChannels.add(channelId);
    this.lastActivityTime.set(channelId, Date.now());
    if (guildId) this.guildActivity.set(guildId, Date.now());
  }

  isChannelActive(channelId) {
    const lastActivity = this.lastActivityTime.get(channelId);
    return lastActivity && Date.now() - lastActivity <= this.ACTIVITY_TIMEOUT;
  }

  async getActiveChannels() {
    const now = Date.now();
    const activeChannels = [];
    for (const [guildId, guild] of this.client.guilds.cache) {
      if (now - (this.guildActivity.get(guildId) || 0) <= this.ACTIVITY_TIMEOUT) {
        const channels = guild.channels.cache.filter((c) => this.activeChannels.has(c.id) && c.isTextBased());
        activeChannels.push(...channels.values());
      }
    }
    return activeChannels;
  }
}