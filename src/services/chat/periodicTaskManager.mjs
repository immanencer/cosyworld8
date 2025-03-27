export class PeriodicTaskManager {
  constructor(services) {
    this.services = services;
    this.avatarService = services.avatarService;
    this.channelManager = services.channelManager;
    this.logger = services.logger;
    this.intervals = [];
    this.AMBIENT_CHECK_INTERVAL = 60 * 60 * 1000; // 1 hour
    this.REFLECTION_INTERVAL = 1 * 3600 * 1000; // 1 hour
  }

  start() {
    this.intervals.push(
      setInterval(() => this.triggerAmbientResponses(), this.AMBIENT_CHECK_INTERVAL),
      setInterval(() => this.generateReflections(), this.REFLECTION_INTERVAL)
    );
  }

  stop() {
    this.intervals.forEach(clearInterval);
  }

  async triggerAmbientResponses() {
    const activeChannels = await this.channelManager.getActiveChannels();
    for (const channel of activeChannels) {
      const avatars = await this.avatarService.getAvatarsInChannel(channel.id);
      const selected = avatars.sort(() => Math.random() - 0.5).slice(0, 2);
      for (const avatar of selected) {


    await this.services.conversationManager.sendResponse(channel, avatar);
      }
    }
  }

  async generateReflections() {
    const avatars = await this.avatarService.getActiveAvatars();
    for (const avatar of avatars.sort(() => Math.random() - 0.5)) {
      await this.services.conversationManager.generateNarrative(avatar);
    }
  }
}