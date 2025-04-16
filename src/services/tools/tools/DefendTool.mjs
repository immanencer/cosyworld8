import { BasicTool } from '../BasicTool.mjs';

export class DefendTool extends BasicTool {
  requiredServices = [
    'configService',
    'avatarService',
    'battleService',
    'mapService',
    'conversationManager',
    'diceService',
  ];
  constructor(services) {
    super(services);

    this.name = 'defend';
    this.description = 'Take a defensive stance';
    this.emoji = '🛡️';
    this.replyNotification = true;
    this.cooldownMs = 30 * 1000; // 30 seconds cooldown
  }

  async execute(message, params, avatar) {
    try {
      return await this.battleService.defend({ avatar });
    } catch (error) {
      return `-# [ ❌ Error: Failed to defend: ${error.message} ]`;
    }
  }

  getDescription() {
    return 'Take a defensive stance (+2 AC until next attack)';
  }

  async getSyntax() {
    return `${this.emoji}`;
  }
}
