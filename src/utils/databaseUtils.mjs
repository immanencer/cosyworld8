// utils/databaseUtils.mjs
export async function saveMessageToDatabase(message, services) {
  const db = services.databaseService.getDatabase();
  if (!db) return;
  const messagesCollection = db.collection("messages");

  const attachments = Array.from(message.attachments.values()).map(a => ({
    id: a.id,
    url: a.url,
    proxyURL: a.proxyURL,
    filename: a.name,
    contentType: a.contentType,
    size: a.size,
    height: a.height,
    width: a.width,
  }));

  const embeds = message.embeds.map(e => ({
    type: e.type,
    title: e.title,
    description: e.description,
    url: e.url,
    image: e.image ? { url: e.image.url, proxyURL: e.image.proxyURL, height: e.image.height, width: e.image.width } : null,
    thumbnail: e.thumbnail ? { url: e.thumbnail.url, proxyURL: e.thumbnail.proxyURL, height: e.thumbnail.height, width: e.thumbnail.width } : null,
  }));

  const messageData = {
    messageId: message.id,
    channelId: message.channel.id,
    authorId: message.author.id,
    authorUsername: message.author.username,
    author: { id: message.author.id, bot: message.author.bot, username: message.author.username, discriminator: message.author.discriminator, avatar: message.author.avatar },
    content: message.content,
    attachments,
    embeds,
    hasImages: attachments.some(a => a.contentType?.startsWith("image/")) || embeds.some(e => e.image || e.thumbnail),
    timestamp: message.createdTimestamp,
  };

  if (!messageData.messageId || !messageData.channelId) {
    services.logger.error("Missing required message data:", messageData);
    return;
  }

  await messagesCollection.insertOne(messageData);
  services.logger.debug("💾 Message saved to database");
}

export async function loadGuildWhitelist(database, client, logger) {
  try {
    logger.info("Pre-loading guild whitelist settings...");
    const guildConfigs = await database.collection("guild_configs").find({}).toArray();
    client.authorizedGuilds = new Map();
    for (const config of guildConfigs) {
      if (config.guildId && config.authorized === true) {
        client.authorizedGuilds.set(config.guildId, true);
        logger.debug(`Pre-loaded whitelist for guild ${config.guildId}.`);
      }
    }
    logger.info(`Pre-loaded whitelist for ${client.authorizedGuilds.size} guild(s).`);
  } catch (err) {
    logger.error(`Failed to pre-load guild whitelist: ${err.message}`);
  }
}