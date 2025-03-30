// PeriodicTaskManager.mjs

export class PeriodicTaskManager {
  constructor(services) {
    this.services = services;
    this.avatarService = services.avatarService;
    this.channelManager = services.channelManager;
    this.logger = services.logger;
    this.intervals = [];
    this.AMBIENT_CHECK_INTERVAL = 60 * 60 * 1000; // 1 hour
    this.REFLECTION_INTERVAL = 1 * 3600 * 1000; // 1 hour
    this.AMBIANCE_UPDATE_INTERVAL = 60 * 60 * 1000; // 1 hour
  }

  /** Starts all periodic tasks. */
  start() {
    this.triggerAmbientResponses();
    this.generateReflections();
    this.intervals.push(
      setInterval(() => this.triggerAmbientResponses(), this.AMBIENT_CHECK_INTERVAL),
      setInterval(() => this.generateReflections(), this.REFLECTION_INTERVAL),
    );
  }

  /** Stops all periodic tasks. */
  stop() {
    this.intervals.forEach(clearInterval);
  }

  /**
   * Triggers ambient responses in active channels, ensuring locations exist and updating ambiance if stale.
   */
  async triggerAmbientResponses() {
    // Ensure locationService is available
    this.locationService = this.services.locationService;

    const activeChannels = await this.channelManager.getMostRecentActiveChannels(3);
    for (const channel of activeChannels) {
      // Ensure location exists
      await this.locationService.getLocationByChannelId(channel.id);

      // Update ambiance if stale (tied to avatar activity via periodic check)
      if (await this.locationService.summaryIsStale(channel.id)) {
        await this.locationService.generateLocationSummary(channel.id);
      }

      // Handle avatar responses
      const avatars = await this.avatarService.getAvatarsInChannel(channel.id);
      const selected = avatars.sort(() => Math.random() - 0.5).slice(0, 2);
      for (const avatar of selected) {
        await this.services.conversationManager.sendResponse(channel, avatar);
      }
    }
  }

  /** Generates reflections for active avatars. */
  async generateReflections() {
    const avatars = await this.services.avatarService.getActiveAvatars();
    for (const avatar of avatars.sort(() => Math.random() - 0.5)) {
      await this.services.conversationManager.generateNarrative(avatar);
    }
  }
}