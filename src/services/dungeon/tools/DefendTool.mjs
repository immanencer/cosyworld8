import { BaseTool } from './BaseTool.mjs';

export class DefendTool extends BaseTool {
  constructor(dungeonService) {
    super(dungeonService);
    this.name = 'defend';
    this.description = 'Raise your AC temporarily';
    this.emoji = '🛡️';
  }
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
import { BaseTool } from './BaseTool.mjs';

export class DefendTool extends BaseTool {
  constructor(dungeonService) {
    super(dungeonService);
    this.name = 'defend';
    this.description = 'Take a defensive stance';
    this.emoji = '🛡️';
  }

  async execute(message) {
    const avatarId = message.author.id;
    const stats = await this.getStatsWithRetry(avatarId);
    
    stats.isDefending = true;
    await this.dungeonService.updateAvatarStats(avatarId, stats);

    return `🛡️ ${message.author.username} takes a defensive stance! AC increased by 2 until next attack.`;
  }

  async getStatsWithRetry(avatarId, retries = 3) {
    for (let i = 0; i < retries; i++) {
      try {
        const stats = await this.dungeonService.getAvatarStats(avatarId);
        if (!stats || !this.validateStats(stats)) {
          const avatar = await this.dungeonService.avatarService.getAvatarById(avatarId);
          const statService = new StatGenerationService();
          const generatedStats = statService.generateStatsFromDate(avatar?.createdAt || new Date());
          return await this.dungeonService.createAvatarStats({
            _id: new ObjectId(),
            avatarId,
            isDefending: false,
            ...generatedStats
          });
        }
        return stats;
      } catch (error) {
        if (i === retries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, 100 * Math.pow(2, i)));
      }
    }
  }

  validateStats(stats) {
    const requiredStats = ['hp', 'strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
    return requiredStats.every(stat => {
      const value = stats[stat];
      return typeof value === 'number' && !isNaN(value) && value >= 0 && value <= 30;
    });
  }

  getDescription() {
    return 'Take a defensive stance (+2 AC until next attack)';
  }

  getSyntax() {
    return '!defend';
  }
}
