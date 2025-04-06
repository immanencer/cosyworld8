import { EmbedBuilder } from 'discord.js';

function splitDescription(text) {
  if (!text) return { firstSentence: '', rest: '' };
  const match = text.match(/([^.!?]+[.!?])\s*(.*)/s);
  if (!match) return { firstSentence: text, rest: '' };
  return { firstSentence: match[1].trim(), rest: match[2].trim() };
}

/**
 * Build a sleek mini avatar embed for movement or notifications.
 */
export function buildMiniAvatarEmbed(avatar, message = '') {
  const text = message || `${avatar.name} is on the move!`;

  // Split into sentences
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const randomSentence = sentences[Math.floor(Math.random() * sentences.length)].trim();

  const { firstSentence, rest } = splitDescription(randomSentence);

  const embed = new EmbedBuilder()
    .setColor('#00b0f4')
    .setAuthor({ name: `${avatar.emoji || ''} ${avatar.name}`, iconURL: avatar.imageUrl })
    .setDescription(firstSentence)
    .setThumbnail(avatar.imageUrl)
    .setFooter({ text: 'Movement Update', iconURL: avatar.imageUrl });

  if (rest) {
    embed.addFields({ name: 'More Info', value: rest, inline: false });
  }
  return embed;
}

/**
 * Build a sleek full avatar profile embed.
 * @param {Object} avatar - The avatar object
 * @param {Object} options - Additional options
 * @param {Object} [options.aiService] - Optional AI service instance with modelConfig
 */
export function buildFullAvatarEmbed(avatar, options = {}) {
  const aiService = options.aiService;

  let rarity = avatar.rarity;

  if ((!rarity || rarity === 'undefined') && aiService && avatar.model) {
    const modelEntry = aiService.modelConfig?.find(m => m.model === avatar.model);
    if (modelEntry) {
      rarity = modelEntry.rarity;
    }
  }

  rarity = rarity || 'undefined';

  const rarityColors = {
    legendary: '#FFD700',
    rare: '#1E90FF',
    uncommon: '#32CD32',
    common: '#A9A9A9',
    undefined: '#808080'
  };

  const color = rarityColors[rarity.toLowerCase()] || '#5865F2';

  const tierMap = { 
    legendary: 'S', 
    rare: 'A', 
    uncommon: 'B', 
    common: 'C',
    undefined: 'U' };
  const tier = tierMap[rarity.toLowerCase()] || 'U';

  const { firstSentence, rest } = splitDescription(avatar.short_description || avatar.description || 'No description.');

  const embed = new EmbedBuilder()
    .setColor(color)
    .setTitle(`${avatar.emoji || ''} ${avatar.name}`)
    .setDescription(firstSentence)
    .setThumbnail(avatar.imageUrl)
    .addFields(
      { name: 'Model', value: `${avatar.model} (Tier ${tier})` || 'N/A', inline: true },
    )
    .setFooter({ text: 'RATi Avatar Profile', iconURL: avatar.imageUrl });

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

  const { firstSentence, rest } = splitDescription(location.description || 'No description.');

  const embed = new EmbedBuilder()
    .setColor(color)
    .setTitle(location.name)
    .setDescription(firstSentence)
    .setImage(location.imageUrl)
    .addFields(
      { name: 'Rarity', value: rarity, inline: true },
      { name: 'Items', value: `${items.length}`, inline: true },
      { name: 'Avatars', value: `${avatars.length}`, inline: true }
    )
    .setFooter({ text: 'Location Info' });

  if (rest) {
    embed.addFields({ name: 'More Info', value: rest, inline: false });
  }

  return embed;
}
