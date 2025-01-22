const getModelRarity = (modelName) => {
  const modelRarities = {
    'meta-llama/llama-3.2-1b-instruct': 'common',
    // ... rest of model rarities
  };
  return modelRarities[modelName] || 'common';
};

const rarityToTier = {
  legendary: 'S',
  rare: 'A',
  uncommon: 'B',
  common: 'C',
};

const getTierFromModel = (model) => {
  if (!model) return 'U';
  const rarity = getModelRarity(model);
  return rarityToTier[rarity] || 'U';
};

const clipDescription = (text) => {
  if (!text) return '';
  const doubleNewline = text.indexOf('\n\n');
  return doubleNewline > -1 ? text.slice(0, doubleNewline) : text;
};

window.getTierFromModel = getTierFromModel;

// export { getModelRarity, rarityToTier, getTierFromModel, clipDescription };