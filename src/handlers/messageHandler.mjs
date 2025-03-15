// handlers/messageHandler.mjs
import { saveMessageToDatabase } from "../utils/databaseUtils.mjs";
import { handleCommands } from "../commands/commandHandler.mjs";
import { sendAvatarProfileEmbedFromObject } from "../services/discordService.mjs";

export async function handleMessage(message, services) {
  const { databaseService, spamControlService, avatarService, chatService, messageHandler, logger } = services;

  if (!message.guild) return;

  // Guild authorization check
  if (!services.client.authorizedGuilds?.get(message.guild.id)) {
    const db = databaseService.getDatabase();
    if (!db) return;
    const guildConfig = await services.configService.getGuildConfig(db, message.guild.id);
    const isAuthorized = guildConfig?.authorized === true ||
      (await services.configService.get("authorizedGuilds") || []).includes(message.guild.id);
    services.client.authorizedGuilds = services.client.authorizedGuilds || new Map();
    services.client.authorizedGuilds.set(message.guild.id, isAuthorized);
    if (!isAuthorized) {
      logger.warn(`Guild ${message.guild.name} (${message.guild.id}) not authorized.`);
      return;
    }
  }

  if (!(await spamControlService.shouldProcessMessage(message))) return;

  await saveMessageToDatabase(message, services);
  await handleCommands(message, services);

  if (message.author.bot) return;

  await messageHandler.processChannel(message.channel.id);

  const result = await avatarService.getOrCreateUniqueAvatarForUser(
    message.author.id,
    `A unique avatar for ${message.author.username} (${message.author.displayName})`,
    message.channel.id
  );
  if (result.new) {
    result.avatar.model = result.avatar.model || (await services.aiService.selectRandomModel());
    result.avatar.stats = await chatService.dungeonService.getAvatarStats(result.avatar._id);
    await avatarService.updateAvatar(result.avatar);
    await sendAvatarProfileEmbedFromObject(result.avatar);
    await chatService.respondAsAvatar(message.channel, result.avatar, true);
  }
  await messageHandler.processChannel(message.channel.id);
}