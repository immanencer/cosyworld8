import { getSummonEmoji } from "../../utils/utils.mjs";

export async function handleCommands(message, services) {
  const content = message.content.trim();
  let summonEmoji = await getSummonEmoji();

  if (content.startsWith("!summon")) {
    await services.discordService.replyToMessage(message, `Command Deprecated. Use ${summonEmoji} Instead.`);
    return;
  }

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

      const avatarResult = await services.avatarService.summonUserAvatar(message, services);
      if (!avatarResult || !avatarResult.avatar) {
        await services.discordService.reactToMessage(message, "❌");
        await services.discordService.replyToMessage(message, "Sorry, I couldn't create or summon your avatar.");
        return;
      }

      const avatar = avatarResult.avatar;
      if (avatarResult.isNewAvatar) {
        await services.discordService.replyToMessage(message, `Created a new avatar called ${avatar.name} for you! Your avatar will now try to execute: ${content}`);
      }

      if (!avatar || !avatar.name || !avatar._id) {
        await services.discordService.reactToMessage(message, "❌");
        await services.discordService.replyToMessage(message, "Avatar data is incomplete. Unable to process command.");
        return;
      }

      await services.mapService.updateAvatarPosition(avatar._id, message.channel.id);

      const { commands, cleanText } = services.toolService.extractToolCommands(content);
      if (commands.length > 0) {
        services.logger.info(`Processing ${commands.length} command(s) for ${avatar.name}`);
        const commandResults = await Promise.all(
          commands.map(async cmd => {
            const result = await services.toolService.processAction(
              message,
              cmd.command,
              cmd.params,
              avatar,
              services
            );
            return { command: cmd.command, emoji: cmd.emoji, result };
          })
        );

        if (commandResults.length) {
          const resultText = commandResults
            .map(t => `-# ${t.emoji} [ ${t.result}]`)
            .join("\n");
          await services.discordService.sendAsWebhook(
            avatar.channelId,
            `${resultText}`,
            { name: `${avatar.name.split(",")[0]} Results`, imageUrl: avatar.imageUrl }
          );
        }
      }

      await services.conversationManager.sendResponse(message.channel, avatar);
    } catch (error) {
      console.error("Error handling tool command:", error);
      await services.discordService.reactToMessage(message, "❌");
      await services.discordService.replyToMessage(message, `There was an error processing your command: ${error.message}`);
    }
    return;
  }
}