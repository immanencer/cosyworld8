// commands/commandHandler.mjs
import { replyToMessage, reactToMessage, sendAsWebhook } from "../services/discordService.mjs";
import { getSummonEmoji } from "../utils/utils.mjs";

export async function handleCommands(message, services) {
  const content = message.content.trim();
  const guildId = message.guild?.id;
  let summonEmoji = await getSummonEmoji();

  if (content.startsWith("!summon")) {
    await replyToMessage(message, `Command Deprecated. Use ${summonEmoji} Instead.`);
    return;
  }
  
  // Get allowed tool emojis
  let toolEmojis = [];
  
  // First try to get tools from ToolService if available
  if (services.toolService) {
    // Fall back to ToolService
    try {
      toolEmojis = Array.from(services.toolService.toolEmojis.keys());
    } catch (error) {
      // Final fallback to default emojis
      toolEmojis = [summonEmoji, "⚔️", "🛡️", "🏹", "🔍", "🧠", "🧪", "🏃"];
    }
  }
  
  // Check if the message starts with any tool emoji
  const isToolCommand = toolEmojis.some(emoji => content.startsWith(emoji));
  
  // If it's a user requesting a tool command for their avatar
  if (isToolCommand) {
    try {
      // React to acknowledge we're processing
      await reactToMessage(message, "⏳");
      
      // Get or create the user's avatar
      const avatarResult = await services.avatarService.summonUserAvatar(message, services);
      
      if (!avatarResult || !avatarResult.avatar) {
        await reactToMessage(message, "❌");
        await replyToMessage(message, "Sorry, I couldn't create or summon your avatar.");
        return;
      }
      
      const avatar = avatarResult.avatar;

      // If it's a new avatar, inform the user
      if (avatarResult.isNewAvatar) {
        await replyToMessage(message, `Created a new avatar called ${avatar.name} for you! Your avatar will now try to execute: ${content}`);
      }
      
      // Check if avatar object is valid and has required properties
      if (!avatar || !avatar.name || !avatar._id) {
        await reactToMessage(message, "❌");
        await replyToMessage(message, "Avatar data is incomplete. Unable to process command.");
        return;
      }
      
      const { commands, cleanText } = services.toolService.extractToolCommands(message.content);
      let sentMessage = null;
      let commandResults = [];
      if (commands.length > 0) {
        services.logger.info(`Processing ${commands.length} command(s) for ${avatar.name}`);
        commandResults = await Promise.all(
          commands.map(cmd =>
            services.toolService.processAction(
              { channel: message.channel, author: { id: avatar._id, username: avatar.name }, content: message.content },
              cmd.command,
              cmd.params,
              avatar,
              services
            )
          )
        );
        if (commandResults.length) {
          sentMessage = await this.services.discordService.sendAsWebhook(
            avatar.channelId,
            commandResults.map(t => `-# [${t}]`).join('\n'),
            { name: `${avatar.name.split(',')[0]} used a command`, emoji: `🛠️`, imageUrl: avatar.imageUrl }
          );
        }
      }

      // Respond as the user's avatar
      await services.responseGenerator.respondAsAvatar(message.channel, avatar);
    } catch (error) {
      console.error("Error handling tool command:", error);
      await reactToMessage(message, "❌");
      await replyToMessage(message, `There was an error processing your command: ${error.message}`);
    }
    return;
  }
}