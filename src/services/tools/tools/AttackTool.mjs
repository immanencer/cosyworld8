import { BasicTool } from '../BasicTool.mjs';

export class AttackTool extends BasicTool {
  constructor(services) {
    super(services, [
      'configService',
      'avatarService',
      'databaseService',
      'statGenerationService',
    ]);
    this.name = 'attack';
    this.parameters = '<target>';
    this.description = 'Attacks the specified avatar';
    this.emoji = '⚔️';
  }

  async execute(message, params, avatar, services) {
    if (!params || !params[0]) {
      return "🤺 Attack what? Specify a target!";
    }

    const targetName = params.join(' ');

    try {
      return await this.attack(message, targetName, avatar._id, services);
    } catch (error) {
      this.logger.error(`Attack error: ${error.message}`);
      return `⚠️ Attack failed: ${error.message}`;
    }
  }

  async attack(message, targetName, attackerId, services) {
    // Get the attacker's location using MapService
    const attackerLocation = await services.mapService.getAvatarLocation(attackerId);
    if (!attackerLocation) return `🤔 You don't seem to be anywhere!`;

    // Get all avatars in the same location using AvatarService
    const avatarsInLocation = await services.mapService.getLocationAndAvatars(
      attackerLocation.id || attackerLocation.channel.id
    );
    const attackerAvatar = await services.avatarService.getAvatarById(attackerId);
    const targetAvatar = avatarsInLocation.avatars.find(a => a.name.toLowerCase() === targetName.toLowerCase());
    if (!targetAvatar) return `🫠 Target '${targetName}' not found in this area.`;

    // Check if the target is already dead
    if (targetAvatar.status === 'dead') {
      return `⚰️ ${targetAvatar.name} is already dead! Have some respect for the fallen.`;
    }

    // Get or create stats for attacker and target using MapService and StatGenerationService
    const attackerStats = await services.avatarService.getOrCreateStats(attackerAvatar, services);
    const targetStats = await services.avatarService.getOrCreateStats(targetAvatar, services);

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
      await services.avatarService.updateAvatarStats(targetAvatar, targetStats);

      if (targetStats.hp <= 0) {
        return await this.handleKnockout(message, targetAvatar, damage, services);
      }

      // Send messages in sequence to simulate combat
      setTimeout(async () => {
        await services.conversationManager.sendResponse(message.channel, targetAvatar);
        setTimeout(async () => {
          await services.conversationManager.sendResponse(message.channel, attackerAvatar);
        }, 1000);
      }
      , 1000);

      return `⚔️ ${attackerAvatar.name} hits ${targetAvatar.name} for ${damage} damage! (${attackRoll} vs AC ${armorClass}) ]`;
     } else {
      targetStats.isDefending = false; // Reset defense stance on miss
      await services.avatarService.updateAvatarStats(targetAvatar, targetStats);
      return `-# 🛡️ [ ${attackerAvatar.name}'s attack misses ${targetAvatar.name}! (${attackRoll} vs AC ${armorClass}) ]`;
    }
  }

  async handleKnockout(message, targetAvatar, damage, services) {
    targetAvatar.lives = (targetAvatar.lives || 3) - 1;

    if (targetAvatar.lives <= 0) {
      targetAvatar.status = 'dead';
      targetAvatar.deathTimestamp = Date.now();
      await services.avatarService.updateAvatar(targetAvatar);
      return `-# 💀 [ ${attackerAvatar.name} has dealt the final blow! ${targetAvatar.name} has fallen permanently! ☠️ ]`;
    }

    // Reset stats upon knockout
    const newStats = services.statGenerationService.generateStatsFromDate(targetAvatar.createdAt);
    newStats.avatarId = targetAvatar._id;
    await services.avatarService.updateAvatarStats(targetAvatar, newStats);

    await services.avatarService.updateAvatar(targetAvatar);
    return `-# 💥 [ ${attackerAvatar.name} knocked out ${targetAvatar.name} for ${damage} damage! ${targetAvatar.lives} lives remaining! 💫 ]`;
  }

  getDescription() {
    return 'Attack another avatar';
  }
}