// commands/attackCommand.mjs
import { replyToMessage, reactToMessage } from "../services/discordService.mjs";
import { findAvatarByName } from "../utils/utils.mjs";

export async function handleAttackCommand(message, args, services) {
  if (!args.length) {
    await replyToMessage(message, "Mention an avatar to attack.");
    return;
  }
  const targetName = args.join(" ");
  const avatars = await services.avatarService.getAllAvatars();
  const targetAvatar = await findAvatarByName(targetName, avatars, services);
  if (!targetAvatar) {
    await replyToMessage(message, `Avatar "${targetName}" not found.`);
    return;
  }
  const attackResult = await services.chatService.dungeonService.tools.get("attack").execute(message, [targetAvatar.name], targetAvatar);
  await reactToMessage(message, "⚔️");
  await replyToMessage(message, `🔥 **${attackResult}**`);
}