// utils/utils.mjs
export function sanitizeInput(input) {
  return input.replace(/[^\p{L}\p{N}\s\p{Emoji}]/gu, "").trim();
}

export async function findAvatarByName(name, avatars) {
  const sanitizedName = sanitizeInput(name.toLowerCase());
  return avatars
    .filter((avatar) =>
      avatar.name.toLowerCase() === sanitizedName ||
      sanitizeInput(avatar.name.toLowerCase()) === sanitizedName
    )
    .sort(() => Math.random() - 0.5)[0] || null;
}

export async function getSummonEmoji(guildId, services) {
  const guildConfig = guildId ? await services.configService.getGuildConfig(guildId) : null;
  return guildConfig?.toolEmojis?.summon || guildConfig?.summonEmoji || process.env.DEFAULT_SUMMON_EMOJI || "🔮";
}