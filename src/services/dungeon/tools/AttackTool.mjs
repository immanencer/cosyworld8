import { BaseTool } from './BaseTool.mjs';

export class AttackTool extends BaseTool {
  constructor(services) {
    super();
    this.name = 'attack';
    this.description = 'Attacks the specified avatar';
    this.emoji = '⚔️';
    this.configService = services?.configService;
    this.avatarService = services?.avatarService;
    this.databaseService = services?.databaseService;
    this.dungeonService = services?.dungeonService;
  }
  async execute(message, params, avatar, services) {
    if (!params || !params[0]) {
      return "🤺 Attack what? Specify a target!";
    }

    const targetName = params.join(' ');

    try {
      console.log(`Attacker: ${JSON.stringify(avatar.name)}`);
      return await this.attack(message, targetName, avatar._id, services);
    } catch (error) {
      console.error(`Attack error: ${error.message}`);
      return `⚠️ Attack failed: ${error.message}`;
    }
  }

  async attack(message, targetName, attackerId, services) {
    const location = await services.dungeonService.getAvatarLocation(attackerId);
    const targetAvatar = await services.dungeonService.findAvatarInArea(targetName, location);

    if (!targetAvatar) return `🫠 Target [${targetName}] not found in this area.`;
    if (targetAvatar.status === 'dead') {
      return `⚰️ ${targetAvatar.name} is already dead! Have some respect for the fallen.`;
    }

    const stats = await services.dungeonService.getOrCreateStatsForAvatar(attackerId, services);
    const targetStats = await services.dungeonService.getOrCreateStatsForAvatar(targetAvatar._id, services);

    // D&D style attack roll: d20 + strength modifier
    const strMod = Math.floor((stats.strength - 10) / 2);
    const dexMod = Math.floor((targetStats.dexterity - 10) / 2);
    
    const attackRoll = Math.floor(Math.random() * 20) + 1 + strMod;
    const armorClass = 10 + dexMod + (targetStats.isDefending ? 2 : 0);

    if (attackRoll >= armorClass) {
      // Damage roll: 1d8 + strength modifier (longsword)
      const damage = Math.max(1, Math.floor(Math.random() * 8) + 1 + strMod);
      targetStats.hp -= damage;
      targetStats.isDefending = false; // Reset defense stance

      if (targetStats.hp <= 0) {
        return await this.handleKnockout(message, targetAvatar, damage, services);
      }

      await services.dungeonService.updateAvatarStats(attackerId, stats);
      return `⚔️ ${message.author.username} hits ${targetAvatar.name} for ${damage} damage! (${attackRoll} vs AC ${armorClass})`;
    }

    targetStats.isDefending = false; // Reset defense stance on miss
    await services.dungeonService.updateAvatarStats(targetAvatar._id, targetStats);
    return `🛡️ ${message.author.username}'s attack misses ${targetAvatar.name}! (${attackRoll} vs AC ${armorClass})`;
  }


  async handleKnockout(message, targetAvatar, damage, services) {
    targetAvatar.lives = (targetAvatar.lives || 3) - 1;

    if (targetAvatar.lives <= 0) {
      targetAvatar.status = 'dead';
      targetAvatar.deathTimestamp = Date.now();
      await services.avatarService.updateAvatar(targetAvatar);
      return `💀 ${message.author.username} has dealt the final blow! ${targetAvatar.name} has fallen permanently! ☠️`;
    }

    await services.dungeonService.updateAvatarStats(targetAvatar._id, {
      hp: 100,
      attack: 10,
      defense: 5
    });

    await services.avatarService.updateAvatar(targetAvatar);
    return `💥 ${message.author.username} knocked out ${targetAvatar.name} for ${damage} damage! ${targetAvatar.lives} lives remaining! 💫`;
  }

  getDescription() {
    return 'Attack another avatar';
  }

  async getEmoji(guildId) {
    if (!this.configService) return this.emoji;
    
    try {
      const guildConfig = await this.configService.getGuildConfig(
        this.databaseService.getDatabase(),
        guildId
      );
      
      if (guildConfig?.toolEmojis?.attack) {
        return guildConfig.toolEmojis.attack;
      }
      return this.emoji;
    } catch (error) {
      console.error(`Error getting attack emoji from config: ${error.message}`);
      return this.emoji;
    }
  }

  async getSyntax(guildId) {
    const emoji = await this.getEmoji(guildId);
    return `${emoji} <target>`;
  }
}