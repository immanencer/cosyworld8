
import { BaseTool } from './BaseTool.mjs';

export class DefendTool extends BaseTool {
  constructor() {
    super();
    this.name = 'defend';
    this.description = 'Take a defensive stance';
    this.emoji = '🛡️';
  }

  async execute(message, params, avatar, services) {
    const avatarId = avatar._id;
    const stats = await services.dungeonService.getOrCreateStatsForAvatar(avatarId, services);
    
    stats.isDefending = true;
    await services.dungeonService.updateAvatarStats(avatarId, stats);

    return `🛡️ ${message.author.username} takes a defensive stance! AC increased by 2 until next attack.`;
  }

  getDescription() {
    return 'Take a defensive stance (+2 AC until next attack)';
  }

  getSyntax() {
    return '!defend';
  }
}
