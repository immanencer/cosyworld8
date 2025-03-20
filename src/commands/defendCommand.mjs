// commands/defendCommand.mjs
import { replyToMessage, reactToMessage } from "../services/discordService.mjs";

export async function handleDefendCommand(message, services) {
  // Get the avatar for the user issuing the command
  const defendAvatar = await services.avatarService.getOrCreateUniqueAvatarForUser(
    message.author.id,
    `${message.author.username}:${JSON.stringify(message.content)}`, message.channel.id
  );

  // Execute the defend action using the defend tool
  const defendResult = await services.dungeonService.tools.get("defend").execute(
    message,
    [], // No target required for defend
    defendAvatar.avatar,
    services
  );

  // Provide feedback via reaction and message
  await reactToMessage(message, "🛡️");
  await replyToMessage(message, `-# [🛡️ ${defendResult}]`);
}