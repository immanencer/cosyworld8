
import fs from 'fs/promises';
import path from 'path';

const RARITY_THRESHOLDS = {
  legendary: 0.008, // More expensive models
  rare: 0.005,
  uncommon: 0.002,
  common: 0          // Cheapest models
};

async function fetchModels() {
  const response = await fetch('https://openrouter.ai/api/v1/models', {
    headers: {
      'HTTP-Referer': 'https://ratimics.com',
      'X-Title': 'rativerse'
    }
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch models: ${response.statusText}`);
  }
  
  return response.json();
}

// Import existing models config to preserve rarities
import existingModels from '../models.config.mjs';

function determineRarity(modelId, pricing) {
  // Check if model exists in current config and preserve its rarity
  const existingModel = existingModels.find(m => m.model === modelId);
  if (existingModel) {
    return existingModel.rarity;
  }

  // For new models, maintain similar distribution as existing config
  const rarityDistribution = {
    legendary: existingModels.filter(m => m.rarity === 'legendary').length / existingModels.length,
    rare: existingModels.filter(m => m.rarity === 'rare').length / existingModels.length,
    uncommon: existingModels.filter(m => m.rarity === 'uncommon').length / existingModels.length
  };

  const avgCost = (pricing.prompt + pricing.completion) / 2;
  const rand = Math.random();
  
  // Assign new models based on existing distribution
  if (rand < rarityDistribution.legendary) return 'legendary';
  if (rand < rarityDistribution.legendary + rarityDistribution.rare) return 'rare';
  if (rand < rarityDistribution.legendary + rarityDistribution.rare + rarityDistribution.uncommon) return 'uncommon';
  return 'common';
}

async function updateModelsConfig() {
  try {
    // Fetch latest models from OpenRouter
    const { data: models } = await fetchModels();
    
    // Transform the data into our config format while preserving existing rarities
    const configModels = models.map(model => ({
      model: model.id,
      rarity: determineRarity(model.id, model.pricing)
    }));
    
    // Sort by rarity (legendary first, then rare, etc.)
    const rarityOrder = { legendary: 0, rare: 1, uncommon: 2, common: 3 };
    configModels.sort((a, b) => rarityOrder[a.rarity] - rarityOrder[b.rarity]);
    
    // Generate the new config file content
    const configContent = `export default ${JSON.stringify(configModels, null, 2)};\n`;
    
    // Write to models.config.mjs
    await fs.writeFile(
      path.join(process.cwd(), 'src', 'models.config.mjs'),
      configContent
    );
    
    console.log('Models config updated successfully!');
    console.log(`Total models: ${configModels.length}`);
    
    // Print statistics
    const stats = configModels.reduce((acc, model) => {
      acc[model.rarity] = (acc[model.rarity] || 0) + 1;
      return acc;
    }, {});
    
    console.log('\nModel distribution:');
    Object.entries(stats).forEach(([rarity, count]) => {
      console.log(`${rarity}: ${count} models`);
    });
    
  } catch (error) {
    console.error('Failed to update models config:', error);
    process.exit(1);
  }
}

updateModelsConfig();
