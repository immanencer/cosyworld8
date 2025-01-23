
// Utility functions
const getTierFromModel = (model) => {
  if (!model) return 'U';
  const modelLower = model.toLowerCase();
  if (modelLower.includes('gpt-4-32k')) return 'S';
  if (modelLower.includes('gpt-4')) return 'A';
  if (modelLower.includes('gpt-3.5')) return 'B';
  if (modelLower.includes('claude')) return 'A';
  return 'C';
};

const MarkdownContent = ({ content }) => {
  if (!content) return null;
  return React.createElement('div', {
    dangerouslySetInnerHTML: { __html: marked.parse(content) }
  });
};

// Models configuration
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

const clipDescription = (text) => {
  if (!text) return '';
  const doubleNewline = text.indexOf('\n\n');
  return doubleNewline > -1 ? text.slice(0, doubleNewline) : text;
};

// Initialize window.utils if not exists
window.utils = window.utils || {};
window.getTierFromModel = getTierFromModel;

// Add utils to window object
Object.assign(window.utils, {
  getModelRarity,
  getTierFromModel,
  clipDescription,
  MarkdownContent,
  rarityToTier
});
