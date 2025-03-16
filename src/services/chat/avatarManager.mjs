export class AvatarManager {
  constructor(db, avatarService, logger) {
    this.db = db;
    this.avatarService = avatarService;
    this.logger = logger;
    this.channelAvatars = new Map(); // channelId -> Set of avatarIds
    this.avatarActivityCount = new Map(); // avatarId -> activity count
  }

  async setupDatabase() {
    this.avatarsCollection = this.db.collection('avatars');
    this.messagesCollection = this.db.collection('messages');
    this.channelsCollection = this.db.collection('channels');
    await Promise.all([
      this.avatarsCollection.createIndex({ name: 1 }),
      this.avatarsCollection.createIndex({ messageCount: -1 }),
      this.messagesCollection.createIndex({ timestamp: 1 }),
      this.channelsCollection.createIndex({ lastActive: 1 }),
    ]);
    this.logger.info('AvatarManager database setup completed.');
  }

  async getActiveAvatars() {
    const avatars = await this.avatarService.getAllAvatars();
    return avatars
      .map((avatar) => ({
        ...avatar,
        id: avatar._id || avatar.id,
        name: avatar.name || null,
        active: avatar.active !== false,
      }))
      .filter((avatar) => avatar.id && avatar.name && avatar.active);
  }

  async getAvatarsInChannel(channelId) {
    return await this.avatarService.getAvatarsInChannel(channelId);
  }

  async manageChannelAvatars(channelId, newAvatarId) {
    // Logic from MessageProcessor.manageChannelAvatars
    let avatars = this.channelAvatars.get(channelId) || new Set();
    if (newAvatarId && avatars.size >= 8) {
      let leastActive = [...avatars].reduce((min, id) => {
        const count = this.avatarActivityCount.get(id) || 0;
        return count < (this.avatarActivityCount.get(min) || 0) ? id : min;
      });
      avatars.delete(leastActive);
    }
    if (newAvatarId) {
      avatars.add(newAvatarId);
      this.avatarActivityCount.set(newAvatarId, (this.avatarActivityCount.get(newAvatarId) || 0) + 1);
    }
    this.channelAvatars.set(channelId, avatars);
    return avatars;
  }
}