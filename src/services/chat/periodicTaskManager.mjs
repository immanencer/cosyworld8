// PeriodicTaskManager.mjs
import { BasicService } from '../basicService.mjs';
export class PeriodicTaskManager extends BasicService {
  constructor(services) {
    super(services, [
      'avatarService',
      'locationService',
      'mapService',
      'conversationManager',
      'channelManager',
    ]);
    this.intervals = [];
    this.AMBIENT_CHECK_INTERVAL = 60 * 60 * 1000; // 1 hour
    this.REFLECTION_INTERVAL = 8 * 3600 * 1000; // 1 hour
    this.AMBIANCE_UPDATE_INTERVAL = 12 * 60 * 60 * 1000; // 1 hour
  }

  /** Starts all periodic tasks. */
  start() {
    this.intervals.push(
      setInterval(() => this.triggerAmbientResponses(), this.AMBIENT_CHECK_INTERVAL),
      setInterval(() => this.generateReflections(), this.REFLECTION_INTERVAL),
    );
    this.logger.info('Periodic tasks initialized.');
  }

  /** Stops all periodic tasks. */
  stop() {
    this.intervals.forEach(clearInterval);
  }

  /**
   * Adds a named periodic task.
   * @param {string} name - Task name for logging.
   * @param {Function} fn - Async function to execute periodically.
   * @param {number} intervalMs - Interval in milliseconds.
   */
  addTask(name, fn, intervalMs) {
    const interval = setInterval(fn, intervalMs);
    this.intervals.push(interval);
    this.logger.info(`Periodic task '${name}' added with interval ${intervalMs}ms`);
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
      const avatars = (await this.mapService.getLocationAndAvatars(channel.id)).avatars;
      const selected = avatars.sort(() => Math.random() - 0.5).slice(0, 2);
      for (const avatar of selected) {
        await this.services.conversationManager.sendResponse(channel, avatar);
      }
    }
  }

  /** Generates reflections for active avatars. */
  async generateReflections() {
    const avatars = (await this.services.avatarService.getActiveAvatars()).slice(0, 3);
    if (avatars.length === 0) {
      this.logger.info('No active avatars found for reflection generation.');
      return;
    }

    await Promise.all(
      avatars.map(async (avatar) => {
        await this.services.conversationManager.generateNarrative(avatar);
      })
    );
    this.logger.info('Reflections generated for active avatars.');
  }
}