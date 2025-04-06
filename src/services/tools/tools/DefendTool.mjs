import { BasicTool } from '../BasicTool.mjs';

export class DefendTool extends BasicTool {
  constructor(services) {
    super(services, [
      'configService',
      'avatarService',
      'databaseService',
    ]);
    this.name = 'defend';
    this.description = 'Take a defensive stance';
    this.emoji = '🛡️';
    this.replyNotification = true;
    this.cooldownMs = 30 * 1000; // 30 seconds cooldown
  }

  async execute(message, params, avatar) {
    const avatarId = avatar._id;
    const stats = await this.avatarService.getOrCreateStats(avatar);
    
    stats.isDefending = true;
    await this.avatarService.updateAvatarStats(avatar, stats);
    return `-# 🛡️ [ **${avatar.name}** takes a defensive stance! **AC increased by 2** until next attack. ]`;
  }

  getDescription() {
    return 'Take a defensive stance (+2 AC until next attack)';
  }
}
