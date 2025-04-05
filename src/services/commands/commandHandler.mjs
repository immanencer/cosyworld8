export async function handleCommands(message, services, avatar) {
  const content = message.content.trim();
  if (!message.guildId) {
    throw new Error("Message does not have a guild ID.");
  }
  const guildConfig = await services.configService.getGuildConfig(message.guildId);

  if (services.toolService) {
    services.toolService.applyGuildToolEmojiOverrides(guildConfig);
  }

  const toolEmojis = services.toolService
    ? Array.from(services.toolService.toolEmojis.keys())
    : [];

  const isToolCommand = toolEmojis.some(emoji => content.includes(emoji));

  if (isToolCommand) {
    try {
      await services.mapService.updateAvatarPosition(avatar, message.channel.id);

      const { commands } = services.toolService.extractToolCommands(content);

      commands.forEach(async ({ command, params }) => {
        const tool = services.toolService.tools.get(command);
        if (tool) {
          const args = Array.isArray(params) && params[0] === tool.name
            ? params.slice(1)
            : params;
          await services.discordService.reactToMessage(message, tool.emoji);
          const result = await tool.execute(message, args, avatar, services);
          await services.discordService.replyToMessage(message, `-# ${tool.emoji} **results for ${avatar.name}.**\n${result}`);
        } else {
          await services.discordService.reactToMessage(message, "❌");
          await services.discordService.replyToMessage(message, `-# [Unknown command: ${command}]`);
        }
      });
    } catch (error) {
      console.error("Error handling tool command:", error);
      await services.discordService.reactToMessage(message, "❌");
      await services.discordService.replyToMessage(message, `-# [There was an error processing your command: ${error.message}]`);
    }
    return;
  }
}