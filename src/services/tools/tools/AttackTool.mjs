import { BasicTool } from '../BasicTool.mjs';

export class AttackTool extends BasicTool {
  static requiredServices = [
    'configService',
    'avatarService',
    'databaseService',
    'statService',
    'mapService',
    'conversationManager',
    'diceService',
    'battleService',
  ];
  constructor(services) {
    super(services);

    this.name = 'attack';
    this.parameters = '<target>';
    this.description = 'Attacks the specified avatar';
    this.emoji = '⚔️';
    this.replyNotification = true;
    this.cooldownMs = 30 * 1000; // 30 seconds cooldown
  }

  async execute(message, params, avatar, services) {
    if (!params || !params[0]) {
      return `-# [ ❌ Error: No target specified. ]`;
    }

    const targetName = params.join(' ');

    try {
      // Find defender in location
      const locationResult = await this.mapService.getAvatarLocation(avatar);
      if (!locationResult || !locationResult.location || !locationResult.avatars) {
        return `-# 🤔 [ You don't seem to be anywhere! ]`;
      }
      const defender = locationResult.avatars.find(a => a.name.toLowerCase() === targetName.toLowerCase());
      if (!defender) return `-# 🫠 [ Target '${targetName}' not found in this area. ]`;
      if (defender.status === 'dead') {
        return `-# ⚰️ [ **${defender.name}** is already dead! Have some *respect* for the fallen. ]`;
      }
      // Delegate to battleService
      const result = await this.battleService.attack({ message, attacker: avatar, defender, services });
      return result.message;
    } catch (error) {
      this.logger.error(`Attack error: ${error.message}`);
      return `-# [ ❌ Error: Attack failed. Please try again later. ]`;
    }
  }

  getDescription() {
    return 'Attack another avatar';
  }

  async getSyntax() {
    return `${this.emoji} <target>`;
  }
}