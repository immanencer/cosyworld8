export async function handleCommands(message, services, avatar) {
  const content = message.content.trim();
  if (!message.guildId) {
    throw new Error("Message does not have a guild ID.");
  }
  const summonEmoji = (await services.configService.getGuildConfig(message.guildId)).summonEmoji || "🪄";


  // Get allowed tool emojis
  let toolEmojis = [];
  try {
    toolEmojis = services.toolService
      ? Array.from(services.toolService.toolEmojis.keys())
      : [summonEmoji, "⚔️", "🛡️", "🏹", "🔍", "🧠", "🧪", "🏃"];
  } catch (error) {
    toolEmojis = [summonEmoji, "⚔️", "🛡️", "🏹", "🔍", "🧠", "🧪", "🏃"];
  }

  // Check if the message starts with any tool emoji
  const isToolCommand = toolEmojis.some(emoji => content.startsWith(emoji));

  if (isToolCommand) {
    try {
      await services.discordService.reactToMessage(message, "⏳");
      await services.mapService.updateAvatarPosition(avatar, message.channel.id);

      services.toolService.extractToolCommands(content).forEach(async ({ command, params }) => {
        const tool = services.toolService.tools.get(command);
        if (tool) {
          await tool.execute(message, params, avatar, services);
        } else {
          await services.discordService.reactToMessage(message, "❌");
          await services.discordService.replyToMessage(message, `Unknown command: ${command}`);
        }
      });
    } catch (error) {
      console.error("Error handling tool command:", error);
      await services.discordService.reactToMessage(message, "❌");
      await services.discordService.replyToMessage(message, `There was an error processing your command: ${error.message}`);
    }
    return;
  }
}