// commands/commandHandler.mjs
import { replyToMessage, reactToMessage } from "../services/discordService.mjs";
import { handleSummonCommand } from "./summonCommand.mjs";
import { handleAttackCommand } from "./attackCommand.mjs";
import { handleBreedCommand } from "./breedCommand.mjs";

import { getSummonEmoji } from "../utils/utils.mjs";

export async function handleCommands(message, services) {
  const content = message.content.trim();
  const guildId = message.guild?.id;
  let summonEmoji = await getSummonEmoji();

  if (content.startsWith("!summon")) {
    await replyToMessage(message, `Command Deprecated. Use ${summonEmoji} Instead.`);
    return;
  }
  
  if (content.startsWith(summonEmoji)) {
    const member = message.guild?.members?.cache?.get(message.author.id);
    const guildConfig = guildId ? await services.configService.getGuildConfig(services.databaseService.getDatabase(), guildId) : null;
    const requiredRole = guildConfig?.summonerRole || process.env.SUMMONER_ROLE;
    if (requiredRole && !message.author.bot && member && !member.roles.cache.some(r => r.id === requiredRole || r.name === requiredRole)) {
      await replyToMessage(message, `You lack the required role (${requiredRole}) to summon.`);
      return;
    }
    await reactToMessage(message, summonEmoji);
    await handleSummonCommand(message, false, {}, services);
  } else if (content.startsWith("⚔️")) {
    const args = content.slice(2).trim().split(" ");
    await reactToMessage(message, "⚔️");
    await handleAttackCommand(message, args, services);
    await reactToMessage(message, "✅");
  } else if (content.startsWith("🛡️")) {
    await reactToMessage(message, "🛡️");
    await handleDefendCommand(message, services);
    await reactToMessage(message, "✅");
  } else if (content.startsWith("🏹")) {
    const args = content.slice(2).trim().split(" ");
    await reactToMessage(message, "🏹");
    await handleBreedCommand(message, args, content, services);
    await reactToMessage(message, "✅");
  }
}