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