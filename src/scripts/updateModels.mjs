
import fs from 'fs/promises';
import path from 'path';

// Import existing models config to preserve rarities
import existingModels from '../models.config.mjs';

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

function calculateStats(costs) {
  const mean = costs.reduce((a, b) => a + b, 0) / costs.length;
  const sortedCosts = [...costs].sort((a, b) => a - b);
  const median = costs.length % 2 === 0 
    ? (sortedCosts[costs.length/2 - 1] + sortedCosts[costs.length/2]) / 2
    : sortedCosts[Math.floor(costs.length/2)];
  
  // Calculate standard deviation
  const variance = costs.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / costs.length;
  const stdDev = Math.sqrt(variance);
  
  return { mean, median, stdDev };
}

function findOutliers(models, stats) {
  const outlierThreshold = 2; // Number of standard deviations for outlier detection
  return models.filter(model => {
    const cost = model.cost || 0;
    return Math.abs(cost - stats.mean) > (outlierThreshold * stats.stdDev);
  });
}

async function updateModelsConfig() {
  try {
    // Fetch latest models from OpenRouter
    const { data: models } = await fetchModels();
    
    // Calculate average cost for each model and preserve existing rarities
    // Calculate average costs across all models with pricing
    const modelsWithPricing = models.filter(m => m.pricing);
    const avgPromptCost = modelsWithPricing.reduce((sum, m) => sum + m.pricing.prompt, 0) / modelsWithPricing.length;
    const avgCompletionCost = modelsWithPricing.reduce((sum, m) => sum + m.pricing.completion, 0) / modelsWithPricing.length;

    const configModels = models.map(model => {
      const avgCost = model.pricing 
        ? (model.pricing.prompt + model.pricing.completion) / 2 
        : (avgPromptCost + avgCompletionCost) / 2; // Use average cost for models without pricing
      
      const existingModel = existingModels.find(m => m.model === model.id);
      return {
        model: model.id,
        rarity: existingModel?.rarity || 'common',
        cost: avgCost
      };
    });

    // Group models by rarity
    const rarityGroups = {
      legendary: configModels.filter(m => m.rarity === 'legendary'),
      rare: configModels.filter(m => m.rarity === 'rare'),
      uncommon: configModels.filter(m => m.rarity === 'uncommon'),
      common: configModels.filter(m => m.rarity === 'common')
    };

    // Analyze cost distribution for each rarity
    console.log('\nCost Distribution Analysis:');
    for (const [rarity, models] of Object.entries(rarityGroups)) {
      const costs = models.map(m => m.cost);
      const stats = calculateStats(costs);
      const outliers = findOutliers(models, stats);
      
      console.log(`\n${rarity.toUpperCase()}:`);
      console.log(`Total models: ${models.length}`);
      console.log(`Average cost: $${stats.mean.toFixed(4)}`);
      console.log(`Median cost: $${stats.median.toFixed(4)}`);
      console.log(`Standard deviation: $${stats.stdDev.toFixed(4)}`);
      
      if (outliers.length > 0) {
        console.log('\nOutliers:');
        outliers.forEach(model => {
          console.log(`- ${model.model}: $${model.cost.toFixed(4)}`);
        });
      }
    }

    // Sort by rarity and cost within each rarity
    const rarityOrder = { legendary: 0, rare: 1, uncommon: 2, common: 3 };
    configModels.sort((a, b) => {
      const rarityDiff = rarityOrder[a.rarity] - rarityOrder[b.rarity];
      return rarityDiff !== 0 ? rarityDiff : b.cost - a.cost;
    });
    
    // Remove cost property before saving
    const finalConfig = configModels.map(({ model, rarity }) => ({ model, rarity }));
    
    // Generate the new config file content
    const configContent = `export default ${JSON.stringify(finalConfig, null, 2)};\n`;
    
    // Write to models.config.mjs
    await fs.writeFile(
      path.join(process.cwd(), 'src', 'models.config.mjs'),
      configContent
    );
    
    console.log('\nModels config updated successfully!');
    
  } catch (error) {
    console.error('Failed to update models config:', error);
    process.exit(1);
  }
}

updateModelsConfig();
