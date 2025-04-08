import { BasicService } from '../foundation/basicService.mjs';

export class ChannelManager extends BasicService {
  constructor(services) {
    super(services);
    
    this.databaseService = services.databaseService;
    this.discordService = services.discordService;
    this.schedulingService = services.schedulingService;
    this.locationService = services.locationService;
    this.mapService = services.mapService;
    this.conversationManager = services.conversationManager;
    
    this.client = this.discordService.client;
    this.channelActivityCollection = this.databaseService.getDatabase().collection('channel_activity');
    this.ACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  }

  async initializeServices() {
    this.logger.info('[ChannelManager] Registering ambient response periodic task');
    this.schedulingService.addTask(
      'triggerAmbientResponses',
      async () => {
        try {
          await this.triggerAmbientResponses();
        } catch (err) {
          this.logger.warn(`[ChannelManager] Error in ambient response task: ${err.message}`);
        }
      },
      60 * 60 * 1000 // every hour
    );
    this.triggerAmbientResponses();
  }

  async triggerAmbientResponses() {
    this.logger.info('[ChannelManager] Triggering ambient responses');

    const activeChannels = await this.getMostRecentActiveChannels(3);
    for (const channel of activeChannels) {
      // Ensure location exists
      await this.locationService.getLocationByChannelId(channel.id);

      // Update ambiance if stale (tied to avatar activity via periodic check)
      if (await this.locationService.summaryIsStale(channel.id)) {
        await this.locationService.generateLocationSummary(channel.id);
      }

      // Handle avatar responses
      const avatars = (await this.mapService.getLocationAndAvatars(channel.id)).avatars;
      const selected = avatars.sort(() => Math.random() - 0.5).slice(0, 2);
      for (const avatar of selected) {
        await this.conversationManager.sendResponse(channel, avatar);
      }
    }
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