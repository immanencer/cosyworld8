# Scheduling Service

## Overview
The SchedulingService manages all periodic tasks in the system, providing a unified interface for adding, starting, and stopping scheduled tasks. It ensures that background operations run at appropriate intervals.

## Functionality
- **Task Management**: Add, start, and stop scheduled periodic tasks
- **Interval Management**: Configure execution intervals for tasks
- **Error Handling**: Gracefully handle task execution errors
- **Centralized Scheduling**: Single service for all system scheduling needs

## Implementation
The SchedulingService extends BasicService and uses JavaScript's setInterval for scheduling. It maintains an internal list of active intervals for proper cleanup.

```javascript
export class SchedulingService extends BasicService {
  constructor(container) {
    super(container, ['channelManager', 'avatarService']);
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
      30 * 60 * 1000 // every 30 minutes
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
      60 * 60 * 1000 // every hour
    );
  }

  /** Stops all periodic tasks. */
  stop() {
    this.intervals.forEach(clearInterval);
    this.logger.info('[SchedulingService] Stopped all scheduled tasks');
  }
}
```

## Usage
The SchedulingService is used to centralize all recurring tasks that were previously scattered across various services:

```javascript
// In ServiceInitializer:
services.schedulingService = container.resolve('schedulingService');
services.schedulingService.start();

// To stop all tasks during shutdown:
services.schedulingService.stop();
```

## Dependencies
- BasicService
- ChannelManager (for ambient responses)
- AvatarService (for generating reflections)