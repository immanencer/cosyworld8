
// Import models configuration from server
const getModelRarity = (modelName) => {
  const models = window.modelsConfig || [];
  const model = models.find(m => m.model === modelName);
  return model?.rarity || 'common';
};

const rarityToTier = {
  legendary: 'S',
  rare: 'A',
  uncommon: 'B',
  common: 'C'
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

// Expose utils to window object
window.utils = {
  getModelRarity,
  getTierFromModel,
  clipDescription,
  rarityToTier
};
