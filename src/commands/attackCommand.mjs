// commands/attackCommand.mjs
import { replyToMessage, reactToMessage } from "../services/discordService.mjs";
import { findAvatarByName } from "../utils/utils.mjs";

export async function handleAttackCommand(message, args, services) {
  if (!args.length) {
    await replyToMessage(message, "Mention an avatar to attack.");
    return;
  }
  const targetName = args.join(" ");
  
    const attackAvatar = await services.avatarService.getOrCreateUniqueAvatarForUser(
      message.author.id,
      `${message.author.username}:${JSON.stringify(message.content)}`, message.channel.id
    );
  const attackResult = await services.dungeonService.tools.get("attack").execute(message, [targetName],  attackAvatar.avatar, services);
  await reactToMessage(message, "⚔️");
  await replyToMessage(message, `-# [⚔️ attack result] ${attackResult}`);
}