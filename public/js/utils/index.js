
export const getModelRarity = (modelName) => {
  const modelRarities = {
    'meta-llama/llama-3.2-1b-instruct': 'common',
    // ... rest of model rarities
  };
  return modelRarities[modelName] || 'common';
};

export const rarityToTier = {
  legendary: 'S',
  rare: 'A',
  uncommon: 'B',
  common: 'C',
};

export const getTierFromModel = (model) => {
  if (!model) return 'U';
  const rarity = getModelRarity(model);
  return rarityToTier[rarity] || 'U';
};

export const clipDescription = (text) => {
  if (!text) return '';
  const doubleNewline = text.indexOf('\n\n');
  return doubleNewline > -1 ? text.slice(0, doubleNewline) : text;
};
export function getTierFromModel(model) {
  if (!model) return 'U';
  
  const modelLower = model.toLowerCase();
  if (modelLower.includes('gpt-4')) return 'S';
  if (modelLower.includes('claude')) return 'A';
  if (modelLower.includes('llama')) return 'B';
  if (modelLower.includes('gpt-3.5')) return 'C';
  return 'U';
}
