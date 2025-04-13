// SchedulingService.mjs
import { BasicService } from '../foundation/basicService.mjs';

export class SchedulingService extends BasicService {
  requiredServices = [
    'channelManager',
    'avatarService'
  ];
  constructor(services) {
    super(services);
      
    this.channelManager = services.channelManager;
    this.avatarService = services.avatarService;
    

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
  }

  /** Stops all periodic tasks. */
  stop() {
    this.intervals.forEach(clearInterval);
    this.logger.info('[SchedulingService] Stopped all scheduled tasks');
  }
}