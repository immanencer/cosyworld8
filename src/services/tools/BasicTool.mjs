import { BasicService } from '../foundation/basicService.mjs';
export class BasicTool extends BasicService {

  constructor(services, requiredServices) { 
    super(services, requiredServices);
    this.replyNotification = false;
    this.cooldownMs = 60 * 60 * 1000; // default 1 hour cooldown
  }

  async execute(message, params, avatar, services) {
    throw new Error('Tool must implement execute method');
  }

  getDescription() {
    throw new Error('Tool must implement getDescription method');
  }

  toolEmojisGuildCache = new Map();

  async getEmoji(guildId) {
    if (!this.configService) return this.emoji;
    try {
      const guildConfig = await this.configService.getGuildConfig(
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
    return `${emoji} ${this.name || ''} ${this.parameters || ''}`;
  }
}