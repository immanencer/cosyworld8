// aiModelService.mjs
// Central registry for AI models and random selection logic

const modelRegistry = new Map(); // serviceName -> [{ model, rarity, ... }]

export const aiModelService = {
  /**
   * Register models for a given service.
   * @param {string} serviceName
   * @param {Array} modelsArray - Array of { model, rarity, ... }
   */
  registerModels(serviceName, modelsArray) {
    modelRegistry.set(serviceName, modelsArray);
  },

  /**
   * Get all models for a service.
   */
  getAllModels(serviceName) {
    return modelRegistry.get(serviceName) || [];
  },

  /**
   * Select a random model for a service, optionally by rarity.
   */
  getRandomModel(serviceName, rarity) {
    const models = this.getAllModels(serviceName);
    if (!models.length) return null;
    let filtered = models;
    if (rarity) filtered = models.filter(m => m.rarity === rarity);
    if (!filtered.length) filtered = models;
    const idx = Math.floor(Math.random() * filtered.length);
    return filtered[idx].model;
  },

  /**
   * Check if a model is available for a service.
   */
  modelIsAvailable(serviceName, modelName) {
    return this.getAllModels(serviceName).some(m => m.model === modelName.replace(':online', ''));
  },

  /**
   * Fuzzy match a model name for a service.
   */
  findClosestModel(serviceName, modelName) {
    const models = this.getAllModels(serviceName);
    const names = models.map(m => m.model);
    if (names. includes(modelName)) return modelName;
    try {
      const stringSimilarity = require('string-similarity');
      const { bestMatch } = stringSimilarity.findBestMatch(modelName, names);
      if (bestMatch.rating > 0.5) return bestMatch.target;
    } catch {}
    return this.getRandomModel(serviceName);
  }
};
