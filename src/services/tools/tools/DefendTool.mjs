import { BasicTool } from '../BasicTool.mjs';

export class DefendTool extends BasicTool {
  constructor(services) {
    super(services);
    this.configService = services.configService;
    this.avatarService = services.avatarService;
    this.battleService = services.battleService;

    this.name = 'defend';
    this.description = 'Take a defensive stance';
    this.emoji = '🛡️';
    this.replyNotification = true;
    this.cooldownMs = 30 * 1000; // 30 seconds cooldown
  }

  async execute(message, params, avatar) {
    // Delegate to battleService
    return await this.battleService.defend({ avatar });
  }

  getDescription() {
    return 'Take a defensive stance (+2 AC until next attack)';
  }
}
