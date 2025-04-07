// SchedulingService.mjs
import { BasicService } from '../foundation/basicService2.mjs';

export class SchedulingService extends BasicService {
  constructor(services) {
    super(services, ['channelManager', 'avatarService']);
    this.intervals = [];
    this.logger.info('[SchedulingService] Initialized');
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
    this.logger.info(`[SchedulingService] Task '${name}' added with interval ${intervalMs}ms`);
  }

  /** Starts all periodic tasks. */
  start() {
    this.logger.info('[SchedulingService] Starting scheduled tasks');

    this.addTask(
      'ambientResponses',
      async () => {
        try {
          await this.channelManager.triggerAmbientResponses();
        } catch (err) {
          this.logger.warn(`[SchedulingService] Ambient response error: ${err.message}`);
        }
      },
      30 * 60 * 1000 // every 60 seconds
    );

    this.addTask(
      'generateReflections',
      async () => {
        try {
          await this.avatarService.generateReflections();
        } catch (err) {
          this.logger.warn(`[SchedulingService] Reflection generation error: ${err.message}`);
        }
      },
      60 * 60 * 1000 // every 5 minutes
    );
  }

  /** Stops all periodic tasks. */
  stop() {
    this.intervals.forEach(clearInterval);
    this.logger.info('[SchedulingService] Stopped all scheduled tasks');
  }
}