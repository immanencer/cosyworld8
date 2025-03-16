export class PeriodicTaskManager {
  constructor(avatarManager, channelManager, responseGenerator, logger) {
    this.avatarManager = avatarManager;
    this.channelManager = channelManager;
    this.responseGenerator = responseGenerator;
    this.logger = logger;
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
      const avatars = await this.avatarManager.getAvatarsInChannel(channel.id);
      const selected = avatars.sort(() => Math.random() - 0.5).slice(0, 2);
      for (const avatar of selected) {
        await this.responseGenerator.respondAsAvatar(channel, avatar, true);
      }
    }
  }

  async generateReflections() {
    const avatars = await this.avatarManager.getActiveAvatars();
    for (const avatar of avatars.sort(() => Math.random() - 0.5)) {
      await this.responseGenerator.conversationHandler.generateNarrative(avatar);
    }
  }
}