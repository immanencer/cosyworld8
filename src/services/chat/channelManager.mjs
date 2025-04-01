import { BasicService } from '../basicService.mjs';

export class ChannelManager extends BasicService {
  constructor(services) {
    super(services, ['databaseService', 'discordService']);
    this.client = this.discordService.client;
    this.channelActivityCollection = this.services.databaseService.getDatabase().collection('channel_activity');
    this.ACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  }

  /**
   * Checks if a channel is currently active based on the activity timeout.
   * @param {string} channelId - The ID of the channel.
   * @returns {boolean} - True if the channel is active, false otherwise.
   */
  async isChannelActive(channelId) {
    const doc = await this.channelActivityCollection.findOne({ _id: channelId });
    return doc && doc.lastActivityTimestamp >= Date.now() - this.ACTIVITY_TIMEOUT;
  }

  /**
   * Retrieves all channels that are currently active within the timeout period.
   * @returns {Array} - Array of active channel objects.
   */
  async getActiveChannels() {
    const now = Date.now();
    const activeDocs = await this.channelActivityCollection.find({
      lastActivityTimestamp: { $gte: now - this.ACTIVITY_TIMEOUT }
    }).toArray();
    const activeChannels = activeDocs
      .map(doc => this.client.channels.cache.get(doc._id))
      .filter(c => c && c.isTextBased());
    return activeChannels;
  }

  /**
   * Retrieves the X most recently active channels.
   * @param {number} limit - The number of recent channels to retrieve.
   * @returns {Array} - Array of the most recently active channel objects.
   */
  async getMostRecentActiveChannels(limit) {
    const recentDocs = await this.channelActivityCollection.find()
      .sort({ lastActivityTimestamp: -1 })
      .limit(limit)
      .toArray();
    const recentChannels = recentDocs
      .map(doc => this.client.channels.cache.get(doc._id))
      .filter(c => c && c.isTextBased());
    return recentChannels;
  }
}