import { BaseTool } from './BaseTool.mjs';

export class DefendTool extends BaseTool {
  async execute(message) {
    const avatarId = message.author.id;
    const stats = await this.dungeonService.getAvatarStats(avatarId);
    
    const acBoost = 2;
    const boostDuration = 60000; // 1 minute

    // Store original dexterity to ensure correct removal
    const originalDexterity = stats.dexterity;
    stats.dexterity += 4; // +2 to AC via +4 dexterity
    await this.dungeonService.updateAvatarStats(avatarId, stats);
    
    setTimeout(async () => {
      const currentStats = await this.dungeonService.getAvatarStats(avatarId);
      // Only remove boost if dexterity hasn't been modified by other effects
      if (currentStats.dexterity === stats.dexterity) {
        currentStats.dexterity = originalDexterity;
        await this.dungeonService.updateAvatarStats(avatarId, currentStats);
      }
    }, boostDuration);

    return `🛡️ ${message.author.username} takes a defensive stance! AC increased by ${acBoost} for 1 minute.`;
  }

  getDescription() {
    return 'Increase defense temporarily';
  }

  getSyntax() {
    return '!defend';
  }
}