import { EmbedBuilder } from 'discord.js';

/**
 * Build a sleek mini avatar embed for movement or notifications.
 */
export function buildMiniAvatarEmbed(avatar, message = '') {
  return new EmbedBuilder()
    .setColor('#00b0f4')
    .setAuthor({ name: `${avatar.emoji || ''} ${avatar.name}`, iconURL: avatar.imageUrl })
    .setDescription(message || `${avatar.name} is on the move!`)
    .setThumbnail(avatar.imageUrl)
    .setFooter({ text: 'Movement Update', iconURL: avatar.imageUrl });
}

/**
 * Build a sleek full avatar profile embed.
 */
export function buildFullAvatarEmbed(avatar, options = {}) {
  const rarityColors = {
    legendary: '#FFD700',
    rare: '#1E90FF',
    uncommon: '#32CD32',
    common: '#A9A9A9',
    undefined: '#808080'
  };

  const rarity = avatar.rarity || 'undefined';
  const color = rarityColors[rarity.toLowerCase()] || '#5865F2';

  const tierMap = { legendary: 'S', rare: 'A', uncommon: 'B', common: 'C', undefined: 'U' };
  const tier = tierMap[rarity.toLowerCase()] || 'U';

  const embed = new EmbedBuilder()
    .setColor(color)
    .setTitle(`${avatar.emoji || ''} ${avatar.name}`)
    .setDescription(avatar.short_description || avatar.description || 'No description.')
    .setThumbnail(avatar.imageUrl)
    .addFields(
      { name: 'Tier', value: `**${tier}**`, inline: true },
      { name: 'Model', value: avatar.model || 'N/A', inline: true },
    )
    .setFooter({ text: 'Avatar Profile', iconURL: avatar.imageUrl });

  if (avatar.stats) {
    const { strength, dexterity, constitution, intelligence, wisdom, charisma, hp } = avatar.stats;
    const conMod = Math.floor((constitution - 10) / 2);
    const maxHp = 10 + conMod;
    const dexMod = Math.floor((dexterity - 10) / 2);
    const ac = 10 + dexMod;
    const statsStr = `🛡️ AC ${ac}  ❤️ HP ${hp}/${maxHp}\n⚔️ ${strength} 🏃 ${dexterity} 🩸 ${constitution}\n🧠 ${intelligence} 🌟 ${wisdom} 💬 ${charisma}`;
    embed.addFields({ name: 'Stats', value: statsStr, inline: false });
  }

  if (avatar.inventory && avatar.inventory.length > 0) {
    const invList = avatar.inventory.map(i => `• ${i.name}`).join('\n');
    embed.addFields({ name: '🎒 Inventory', value: invList.length > 1000 ? invList.slice(0, 997) + '...' : invList, inline: false });
  }

  if (avatar.traits) {
    embed.addFields({ name: '🧬 Traits', value: avatar.traits, inline: false });
  }

  if (options.viewDetailsUrl || avatar._id) {
    const url = options.viewDetailsUrl || `${process.env.BASE_URL}/avatar.html?id=${avatar._id}`;
    embed.addFields({ name: '🔗 Avatar Page', value: `[View Details](${url})`, inline: false });
  }

  return embed;
}

/**
 * Build a sleek location embed.
 */
export function buildLocationEmbed(location, items = [], avatars = []) {
  const rarityColors = {
    legendary: '#FFD700',
    rare: '#1E90FF',
    uncommon: '#32CD32',
    common: '#A9A9A9',
    undefined: '#808080'
  };
  const rarity = location.rarity || 'undefined';
  const color = rarityColors[rarity.toLowerCase()] || '#5865F2';

  return new EmbedBuilder()
    .setColor(color)
    .setTitle(location.name)
    .setDescription(location.description || 'No description.')
    .setImage(location.imageUrl)
    .addFields(
      { name: 'Rarity', value: rarity, inline: true },
      { name: 'Items', value: `${items.length}`, inline: true },
      { name: 'Avatars', value: `${avatars.length}`, inline: true }
    )
    .setFooter({ text: 'Location Info' });
}
