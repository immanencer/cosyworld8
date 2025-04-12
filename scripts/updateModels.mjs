import fs from 'fs/promises';
import path from 'path';

// CONFIGURATION OPTIONS
const CONFIG = {
  rarity: {
    legendary: 0.05,   // top 5%
    rare: 0.15,        // next 15%
    uncommon: 0.30,    // next 30%
    // common: remainder
  },
  logging: {
    verbose: false     // set to true for more detailed logs
  },
  filters: ['-guard-'],         // e.g., ['gpt', 'test'] to filter models containing these words
};

// Import existing models config to preserve rarities
import existingModels from '../src/services/ai/models.config.mjs';

/**
 * Helper function to format cost values dynamically.
 * - For values >= 0.001, it displays 4 decimal places.
 * - For values < 0.001 (but nonzero), it displays 8 decimal places.
 * - Zero is shown as "0.0000".
 */
function formatCost(cost) {
  if (cost === 0) return '0.0000';
  return Math.abs(cost) < 0.001 ? cost.toFixed(8) : cost.toFixed(4);
}

/**
 * Fetches models from the OpenRouter API.
 */
async function fetchModels() {
  console.info('[INFO] Fetching models from OpenRouter API...');
  const response = await fetch('https://openrouter.ai/api/v1/models', {
    headers: {
      'HTTP-Referer': 'https://ratimics.com',
      'X-Title': 'rativerse'
    }
  });
  if (!response.ok) {
    console.error(`[ERROR] Failed to fetch models: ${response.statusText}`);
    throw new Error(`Failed to fetch models: ${response.statusText}`);
  }
  const data = await response.json();
  console.info('[INFO] Successfully fetched models.');
  if (CONFIG.logging.verbose) {
    console.debug(`[DEBUG] Fetched data: ${JSON.stringify(data, null, 2)}`);
  }
  return data;
}

/**
 * Calculates mean, median, and standard deviation for an array of costs.
 */
function calculateStats(costs) {
  if (costs.length === 0) {
    console.warn('[WARN] No costs provided to calculateStats. Returning zeros.');
    return { mean: 0, median: 0, stdDev: 0 };
  }
  const mean = costs.reduce((a, b) => a + b, 0) / costs.length;
  const sorted = [...costs].sort((a, b) => a - b);
  const median = costs.length % 2 === 0
    ? (sorted[costs.length / 2 - 1] + sorted[costs.length / 2]) / 2
    : sorted[Math.floor(costs.length / 2)];
  const variance = costs.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / costs.length;
  const stdDev = Math.sqrt(variance);

  if (CONFIG.logging.verbose) {
    console.debug(`[DEBUG] Stats => Mean: ${formatCost(mean)}, Median: ${formatCost(median)}, StdDev: ${formatCost(stdDev)}`);
  }
  return { mean, median, stdDev };
}

/**
 * Identifies outlier models whose cost deviates from the mean by a given threshold.
 */
function findOutliers(models, stats) {
  const threshold = 2; // number of standard deviations
  const outliers = models.filter(m => Math.abs(m.cost - stats.mean) > (threshold * stats.stdDev));
  if (CONFIG.logging.verbose) {
    console.debug(`[DEBUG] Outlier count: ${outliers.length}`);
  }
  return outliers;
}

/**
 * Dynamically assigns rarity tiers based on cost.
 * The models are sorted by cost (highest first) and then sliced
 * according to the percentage thresholds defined in CONFIG.rarity.
 */
function assignRarityByCost(models) {
  models.sort((a, b) => b.cost - a.cost);
  const total = models.length;
  const legendaryCount = Math.floor(total * CONFIG.rarity.legendary);
  const rareCount = Math.floor(total * CONFIG.rarity.rare);
  const uncommonCount = Math.floor(total * CONFIG.rarity.uncommon);
  const commonCount = total - (legendaryCount + rareCount + uncommonCount);

  console.info('[INFO] Assigned rarity thresholds:');
  console.info(`  Legendary: ${legendaryCount} models`);
  console.info(`  Rare: ${rareCount} models`);
  console.info(`  Uncommon: ${uncommonCount} models`);
  console.info(`  Common: ${commonCount} models`);

  models.forEach((model, index) => {
    if (index < legendaryCount) {
      model.rarity = 'legendary';
    } else if (index < legendaryCount + rareCount) {
      model.rarity = 'rare';
    } else if (index < legendaryCount + rareCount + uncommonCount) {
      model.rarity = 'uncommon';
    } else {
      model.rarity = 'common';
    }
  });
}

/**
 * Main function to update the models configuration.
 */
async function updateModelsConfig() {
  console.info('[INFO] Starting updateModelsConfig process...');
  try {
    // Create a map of existing model rarities to preserve them
    const existingModelRarities = new Map(existingModels.map(m => [m.model, m.rarity]));

    // Fetch and filter models
    const { data: models } = await fetchModels();
    console.info(`[INFO] Retrieved ${models.length} models from the API.`);

    // Apply filters to exclude models based on name
    const filteredModels = models.filter(m => !CONFIG.filters.some(f => m.id.toLowerCase().includes(f.toLowerCase())));
    console.info(`[INFO] After filtering, ${filteredModels.length} models remain.`);

    // Identify and exclude models with negative pricing values
    const validModels = filteredModels.filter(m => {
      if (m.pricing) {
        const prompt = parseFloat(m.pricing.prompt);
        const completion = parseFloat(m.pricing.completion);
        if (prompt < 0 || completion < 0) {
          console.warn(`[WARN] Excluding model ${m.id} from pricing calculations due to negative pricing.`);
          return false;
        }
      }
      return true;
    });

    const validModelsWithPricing = validModels.filter(m => m.pricing);
    console.info(`[INFO] Processing ${validModelsWithPricing.length} models with valid pricing.`);

    // Compute overall average prompt and completion costs from valid models
    const avgPromptCost = validModelsWithPricing.length > 0
      ? validModelsWithPricing.reduce((sum, m) => sum + parseFloat(m.pricing.prompt), 0) / validModelsWithPricing.length
      : 0;
    const avgCompletionCost = validModelsWithPricing.length > 0
      ? validModelsWithPricing.reduce((sum, m) => sum + parseFloat(m.pricing.completion), 0) / validModelsWithPricing.length
      : 0;
    console.info(`[INFO] Overall average prompt: $${formatCost(avgPromptCost)}, completion: $${formatCost(avgCompletionCost)}`);

    // Map models to a new structure with computed average cost
    const configModels = validModels.map(m => {
      const cost = m.pricing
        ? (parseFloat(m.pricing.prompt) + parseFloat(m.pricing.completion)) / 2
        : (avgPromptCost + avgCompletionCost) / 2;
      return { model: m.id, cost, rarity: 'common' }; // initial rarity placeholder
    });
    console.info(`[INFO] Computed average cost for ${configModels.length} models.`);

    // Dynamically assign rarity based on cost for all models
    assignRarityByCost(configModels);

    // Override rarity for existing models to preserve their original rarity
    configModels.forEach(model => {
      if (existingModelRarities.has(model.model)) {
        model.rarity = existingModelRarities.get(model.model);
      }
    });

    // Identify and report new models
    const newModels = configModels.filter(m => !existingModelRarities.has(m.model));
    console.info(`[INFO] Found ${newModels.length} new models:`);
    newModels.forEach(m => console.info(`  - ${m.model} - ${m.rarity}`));

    // Group by rarity for summary analysis
    const groups = configModels.reduce((acc, m) => {
      acc[m.rarity] = acc[m.rarity] || [];
      acc[m.rarity].push(m);
      return acc;
    }, {});
    Object.entries(groups).forEach(([rarity, group]) => {
      console.info(`[INFO] ${rarity.toUpperCase()} group: ${group.length} models`);
      const stats = calculateStats(group.map(m => m.cost));
      console.info(`       Avg: $${formatCost(stats.mean)}, Median: $${formatCost(stats.median)}, StdDev: $${formatCost(stats.stdDev)}`);
      const outliers = findOutliers(group, stats);
      console.info(`       Outliers: ${outliers.length}`);
      if (CONFIG.logging.verbose && outliers.length > 0) {
        outliers.forEach(m => console.debug(`         * ${m.model}: $${formatCost(m.cost)}`));
      }
    });

    // Final sort: by rarity order and then descending cost
    const rarityOrder = { legendary: 0, rare: 1, uncommon: 2, common: 3 };
    configModels.sort((a, b) => {
      const diff = rarityOrder[a.rarity] - rarityOrder[b.rarity];
      return diff !== 0 ? diff : b.cost - a.cost;
    });
    console.info('[INFO] Models sorted by rarity and cost.');

    // Remove the cost property before saving final config
    const finalConfig = configModels.map(({ model, rarity }) => ({ model, rarity }));
    if (CONFIG.logging.verbose) {
      console.debug('[DEBUG] Final configuration:', finalConfig);
    }

    // Write config file
    const configContent = `export default ${JSON.stringify(finalConfig, null, 2)};\n`;
    const outputPath = path.join(process.cwd(), 'src', 'models.config.mjs');
    await fs.writeFile(outputPath, configContent);
    console.info(`[INFO] Models config updated successfully at ${outputPath}!`);
  } catch (error) {
    console.error('[ERROR] Failed to update models config:', error);
    process.exit(1);
  }
}

updateModelsConfig();