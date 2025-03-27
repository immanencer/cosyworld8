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
    this.toolService = services?.toolService;
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
    // Get the attacker's location using MapService
    const attackerLocation = await services.mapService.getAvatarLocation(attackerId);
    if (!attackerLocation) return `🤔 You don't seem to be anywhere!`;

    // Get all avatars in the same location using AvatarService
    const avatarsInLocation = await services.avatarService.getAvatarsInChannel(attackerLocation.id);
    const targetAvatar = avatarsInLocation.find(a => a.name.toLowerCase() === targetName.toLowerCase());
    if (!targetAvatar) return `🫠 Target [${targetName}] not found in this area.`;

    // Check if the target is already dead
    if (targetAvatar.status === 'dead') {
      return `⚰️ ${targetAvatar.name} is already dead! Have some respect for the fallen.`;
    }

    // Get or create stats for attacker and target using MapService and StatGenerationService
    const attackerStats = await this.getOrCreateStats(attackerId, services);
    const targetStats = await this.getOrCreateStats(targetAvatar._id, services);

    // D&D style attack roll: d20 + strength modifier
    const strMod = Math.floor((attackerStats.strength - 10) / 2);
    const dexMod = Math.floor((targetStats.dexterity - 10) / 2);
    const attackRoll = Math.floor(Math.random() * 20) + 1 + strMod;
    const armorClass = 10 + dexMod + (targetStats.isDefending ? 2 : 0);

    if (attackRoll >= armorClass) {
      // Damage roll: 1d8 + strength modifier (longsword)
      const damage = Math.max(1, Math.floor(Math.random() * 8) + 1 + strMod);
      targetStats.hp -= damage;
      targetStats.isDefending = false; // Reset defense stance

      // Update target stats using MapService
      await services.mapService.updateAvatarStats(targetAvatar._id, targetStats);

      if (targetStats.hp <= 0) {
        return await this.handleKnockout(message, targetAvatar, damage, services);
      }

      return `⚔️ ${message.author.username} hits ${targetAvatar.name} for ${damage} damage! (${attackRoll} vs AC ${armorClass})`;
    } else {
      targetStats.isDefending = false; // Reset defense stance on miss
      await services.mapService.updateAvatarStats(targetAvatar._id, targetStats);
      return `🛡️ ${message.author.username}'s attack misses ${targetAvatar.name}! (${attackRoll} vs AC ${armorClass})`;
    }
  }

  async handleKnockout(message, targetAvatar, damage, services) {
    targetAvatar.lives = (targetAvatar.lives || 3) - 1;

    if (targetAvatar.lives <= 0) {
      targetAvatar.status = 'dead';
      targetAvatar.deathTimestamp = Date.now();
      await services.avatarService.updateAvatar(targetAvatar);
      return `💀 ${message.author.username} has dealt the final blow! ${targetAvatar.name} has fallen permanently! ☠️`;
    }

    // Reset stats upon knockout
    const newStats = services.statGenerationService.generateStatsFromDate(targetAvatar.createdAt);
    newStats.avatarId = targetAvatar._id;
    await services.mapService.updateAvatarStats(targetAvatar._id, newStats);

    await services.avatarService.updateAvatar(targetAvatar);
    return `💥 ${message.author.username} knocked out ${targetAvatar.name} for ${damage} damage! ${targetAvatar.lives} lives remaining! 💫`;
  }

  async getOrCreateStats(avatarId, services) {
    let stats = await services.mapService.getAvatarStats(avatarId);
    if (!stats || !services.statGenerationService.validateStats(stats)) {
      const avatar = await services.avatarService.getAvatarById(avatarId);
      stats = services.statGenerationService.generateStatsFromDate(avatar?.createdAt || new Date());
      stats.avatarId = avatarId;
      await services.mapService.updateAvatarStats(avatarId, stats);
    }
    return stats;
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