import { BaseTool } from './BaseTool.mjs';
import { ObjectId } from 'mongodb';

export class AttackTool extends BaseTool {
  async execute(message, params) {
    if (!params || !params[0]) {
      return "🤺 Attack what? Specify a target!";
    }

    const attackerId = message.author.id;
    const targetName = params.join(' ');
    
    try {
      return await this.attack(message, targetName, attackerId);
    } catch (error) {
      console.error(`Attack error: ${error.message}`);
      return `⚠️ Attack failed: ${error.message}`;
    }
  }

  async attack(message, targetName, attackerId) {
    const location = await this.dungeonService.getAvatarLocation(attackerId);
    const targetAvatar = await this.dungeonService.findAvatarInArea(targetName, location);
    
    if (!targetAvatar) return `🫠 Target [${targetName}] not found in this area.`;
    if (targetAvatar.status === 'dead') {
      return `⚰️ ${targetAvatar.name} is already dead! Have some respect for the fallen.`;
    }

    const stats = await this.getStatsWithRetry(attackerId);
    const targetStats = await this.getStatsWithRetry(targetAvatar._id);

    const damage = Math.max(1, stats.attack - targetStats.defense);
    targetStats.hp -= damage;

    if (targetStats.hp <= 0) {
      return await this.handleKnockout(message, targetAvatar, damage);
    }

    await this.updateStatsWithRetry(targetAvatar._id, targetStats);
    return `⚔️ ${message.author.username} attacks ${targetAvatar.name} for ${damage} damage!`;
  }

  async getStatsWithRetry(avatarId, retries = 3) {
    for (let i = 0; i < retries; i++) {
      try {
        const stats = await this.dungeonService.getAvatarStats(avatarId);
        if (!stats) {
          return await this.dungeonService.createAvatarStats({
            _id: new ObjectId(),
            avatarId,
            hp: 100,
            attack: 10,
            defense: 5
          });
        }
        return stats;
      } catch (error) {
        if (i === retries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, 100 * Math.pow(2, i)));
      }
    }
  }

  async updateStatsWithRetry(avatarId, stats, retries = 3) {
    for (let i = 0; i < retries; i++) {
      try {
        // Update stats for the specific avatarId instead of creating new documents
        return await this.dungeonService.updateAvatarStats(avatarId, {
          ...stats,
          avatarId // Ensure avatarId is included
        });
      } catch (error) {
        if (i === retries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, 100 * Math.pow(2, i)));
      }
    }
  }

  async handleKnockout(message, targetAvatar, damage) {
    targetAvatar.lives = (targetAvatar.lives || 3) - 1;
    
    if (targetAvatar.lives <= 0) {
      targetAvatar.status = 'dead';
      targetAvatar.deathTimestamp = Date.now();
      await this.dungeonService.avatarService.updateAvatar(targetAvatar);
      return `💀 ${message.author.username} has dealt the final blow! ${targetAvatar.name} has fallen permanently! ☠️`;
    }

    await this.updateStatsWithRetry(targetAvatar._id, {
      hp: 100,
      attack: 10,
      defense: 5
    });
    
    await this.dungeonService.avatarService.updateAvatar(targetAvatar);
    return `💥 ${message.author.username} knocked out ${targetAvatar.name} for ${damage} damage! ${targetAvatar.lives} lives remaining! 💫`;
  }

  getDescription() {
    return 'Attack another avatar';
  }

  getSyntax() {
    return '!attack <target>';
  }
}