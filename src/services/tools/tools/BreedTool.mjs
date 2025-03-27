
import { BaseTool } from './BaseTool.mjs';

export class BreedTool extends BaseTool {
  constructor(services) {
    super();
    this.services = services;
    this.name = 'breed';
    this.description = 'Breeds two avatars together';
    this.emoji = '🏹';
    this.configService = services?.configService;
    this.avatarService = services?.avatarService;
    this.databaseService = services?.databaseService;
  }

  getDescription() {
    return 'Breeds two existing avatars to create a new one';
  }

  async getEmoji(guildId) {
    if (!this.configService) return this.emoji;
    
    try {
      const guildConfig = await this.configService.getGuildConfig(
        this.databaseService.getDatabase(),
        guildId
      );
      
      if (guildConfig?.toolEmojis?.breed) {
        return guildConfig.toolEmojis.breed;
      }
      return this.emoji;
    } catch (error) {
      console.error(`Error getting breed emoji from config: ${error.message}`);
      return this.emoji;
    }
  }

  async getSyntax(guildId) {
    const emoji = await this.getEmoji(guildId);
    return `${emoji} <avatar1> <avatar2>`;
  }

  async execute(message, params, avatar, services) {
    try {
      const commandLine = message.content.trim().substring(2).trim();
      const avatars = await services.avatarService.getAvatarsInChannel(message.channel.id);
      const mentionedAvatars = Array.from(services.avatarService.extractMentionedAvatars(commandLine, avatars))
        .sort(() => Math.random() - 0.5)
        .slice(-2);

      if (mentionedAvatars.length !== 2) {
        await this.services.discordService.sendAsWebhook(message, "Please mention exactly two avatars to breed.");
        return "Failed to breed: Need exactly two avatars";
      }

      const [avatar1, avatar2] = mentionedAvatars;
      if (avatar1._id === avatar2._id) {
        await this.services.discordService.sendAsWebhook(message, "Both avatars must be different to breed.");
        return "Failed to breed: Cannot breed an avatar with itself";
      }

      const checkRecentBreed = async (avatar) => {
        const lastBred = await services.avatarService.getLastBredDate(avatar._id.toString());
        return lastBred && (Date.now() - new Date(lastBred) < 24 * 60 * 60 * 1000);
      };

      if (await checkRecentBreed(avatar1) || await checkRecentBreed(avatar2)) {
        await this.services.discordService.sendAsWebhook(message, `${(await checkRecentBreed(avatar1) ? avatar1 : avatar2).name} has been bred in the last 24 hours.`);
        return "Failed to breed: Avatar recently bred";
      }

      await this.services.discordService.sendAsWebhook(message, `Breeding ${avatar1.name} with ${avatar2.name}...`);

      const buildNarrative = async (avatar) => {
        const memories = (await services.memoryService.getMemories(avatar._id)).map(m => m.memory).join("\n");
        return services.conversationManager.buildNarrativePrompt(avatar, [memories]);
      };

      const guildConfig = await services.configService.getGuildConfig(services.databaseService.getDatabase(), message.guild?.id, true);
      const summonPrompt = guildConfig?.prompts?.summon || "Create an avatar with the following description:";
      
      const prompt = `Breed the following avatars to combine them, develop a short backstory for the offspring:\n\n` +
        `AVATAR 1: ${avatar1.name} - ${avatar1.prompt}\n${avatar1.description}\n${avatar1.personality}\n${await buildNarrative(avatar1)}\n\n` +
        `AVATAR 2: ${avatar2.name} - ${avatar2.prompt}\n${avatar2.description}\n${avatar2.personality}\n${await buildNarrative(avatar2)}\n\n` +
        `Combine their attributes creatively, avoiding cosmic or mystical elements and aiming for a down-to-earth feel suitable for the Monstone Sanctum.`;

      const originalContent = message.content;
      message.content = `🔮 ${prompt}`;
      
      // Use SummonTool directly
      const summonTool = services.toolService?.getTool('summon') || services.toolService.tools.get('summon');
      if (!summonTool) {
        throw new Error('Summon tool not available');
      }
      
      const result = await summonTool.execute(message, { breed: true, attributes: { parents: [avatar1._id, avatar2._id] } }, avatar, services);
      message.content = originalContent;
      
      return `Successfully bred: ${result}`;
    } catch (error) {
      console.error('Error in BreedTool:', error);
      return `Failed to breed avatars: ${error.message}`;
    }
  }
}
