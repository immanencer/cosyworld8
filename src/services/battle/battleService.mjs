// BattleService.mjs
// Centralizes all combat mechanics (attack, defend, knockout, etc.)

import { BasicService } from "../foundation/basicService.mjs";

export class BattleService extends BasicService {
  requiredServices = [
    'avatarService',
    'statService',
    'mapService',
    'diceService',
    'databaseService',
    'conversationManager'
  ];

  constructor(services) {
    super(services);
    this.avatarService = services.avatarService;
    this.statService = services.statService;
    this.mapService = services.mapService;
    this.diceService = services.diceService;
    this.databaseService = services.databaseService;
    this.conversationManager = services.conversationManager;
  }

  async attack({ message, attacker, defender, services }) {
    // Get or create stats for attacker and target
    const attackerStats = await this.avatarService.getOrCreateStats(attacker);
    const targetStats = await this.avatarService.getOrCreateStats(defender);

    // D&D style attack roll: d20 + strength modifier
    const strMod = Math.floor((attackerStats.strength - 10) / 2);
    const dexMod = Math.floor((targetStats.dexterity - 10) / 2);
    const attackRoll = this.diceService.rollDie(20) + strMod;
    const armorClass = 10 + dexMod + (targetStats.isDefending ? 2 : 0);

    if (attackRoll >= armorClass) {
      // Damage roll: 1d8 + strength modifier (longsword)
      const damage = Math.max(1, this.diceService.rollDie(8) + strMod);
      // Apply damage as a damage counter (modifier)
      await this.statService.createModifier('damage', damage, { avatarId: defender._id });
      targetStats.isDefending = false; // Reset defense stance
      await this.avatarService.updateAvatarStats(defender, targetStats);

      // Compute current HP: base HP - total damage counters
      const totalDamage = await this.statService.getTotalModifier(defender._id, 'damage');
      const currentHp = targetStats.hp - totalDamage;

      if (currentHp <= 0) {
        return await this.handleKnockout({ message, targetAvatar: defender, damage, attacker, services });
      }

      // Optionally send responses (simulate combat)
      setTimeout(async () => {
        await this.conversationManager.sendResponse(message.channel, defender);
        setTimeout(async () => {
          await this.conversationManager.sendResponse(message.channel, attacker);
        }, 1000);
      }, 1000);

      return {
        result: 'hit',
        message: `-# ⚔️ [ ${attacker.name} hits ${defender.name} for ${damage} damage! (${attackRoll} vs AC ${armorClass}) | HP: ${currentHp}/${targetStats.hp} ]`,
        damage,
        currentHp,
        attackRoll,
        armorClass
      };
    } else {
      targetStats.isDefending = false; // Reset defense stance on miss
      await this.avatarService.updateAvatarStats(defender, targetStats);
      return {
        result: 'miss',
        message: `-# 🛡️ [ ${attacker.name}'s attack misses ${defender.name}! (${attackRoll} vs AC ${armorClass}) ]`,
        attackRoll,
        armorClass
      };
    }
  }

  async handleKnockout({ message, targetAvatar, damage, attacker, services }) {
    targetAvatar.lives = (targetAvatar.lives || 3) - 1;
    if (targetAvatar.lives <= 0) {
      targetAvatar.status = 'dead';
      targetAvatar.deathTimestamp = Date.now();
      await this.avatarService.updateAvatar(targetAvatar);
      return {
        result: 'dead',
        message: `-# 💀 [ ${attacker.name} has dealt the final blow! ${targetAvatar.name} has fallen permanently! ☠️ ]`
      };
    }
    // Remove all damage counters (healing to full) on knockout
    const db = this.databaseService.getDatabase();
    await db.collection('dungeon_modifiers').deleteMany({ avatarId: targetAvatar._id, stat: 'damage' });
    // Reset stats upon knockout
    const newStats = services.statService.generateStatsFromDate(targetAvatar.createdAt);
    newStats.avatarId = targetAvatar._id;
    await this.avatarService.updateAvatarStats(targetAvatar, newStats);
    await this.avatarService.updateAvatar(targetAvatar);
    return {
      result: 'knockout',
      message: `-# 💥 [ ${attacker.name} knocked out ${targetAvatar.name} for ${damage} damage! ${targetAvatar.lives} lives remaining! 💫 ]`
    };
  }

  async defend({ avatar }) {
    const stats = await this.avatarService.getOrCreateStats(avatar);
    stats.isDefending = true;
    await this.avatarService.updateAvatarStats(avatar, stats);
    return `-# 🛡️ [ **${avatar.name}** takes a defensive stance! **AC increased by 2** until next attack. ]`;
  }
}
