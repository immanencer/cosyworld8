import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const defaultModels = [
  { model: "gemini-2.0-flash", rarity: "uncommon" },
  { model: "gemini-2.0-flash-001", rarity: "uncommon" },
  { model: "gemini-2.0-pro", rarity: "legendary" },
  { model: "gemini-2.0-pro-001", rarity: "legendary" },
  { model: "gemini-1.5-pro", rarity: "rare" },
  { model: "gemini-1.5-flash", rarity: "common" }
];

const rarityTiers = [
  { tier: 'legendary', models: ['pro-001', '2.0-pro', 'pro'] },
  { tier: 'rare', models: ['1.5-pro'] },
  { tier: 'uncommon', models: ['2.0-flash', 'flash-001'] },
  { tier: 'common', models: ['1.5-flash', 'flash'] }
];

function assignRarity(modelId) {
  for (const { tier, models } of rarityTiers) {
    if (models.some(sub => modelId.includes(sub))) {
      return tier;
    }
  }
  return 'uncommon';
}

async function fetchGoogleModelsFromAPI(apiKey) {
  const endpoint = 'https://generativelanguage.googleapis.com/v1beta/models';
  try {
    const response = await fetch(`${endpoint}?key=${apiKey}`);
    const data = await response.json();
    return data.models
      .filter(model => model.name.includes('gemini'))
      .map(model => ({
        model: model.name.replace('models/', ''),
        rarity: assignRarity(model.name)
      }));
  } catch (error) {
    console.error('[WARN] Could not fetch models from Google API:', error.message);
    return null;
  }
}

async function refreshGoogleModels() {
  console.log('[INFO] Updating Google AI model configuration...');
  const outputPath = path.join(process.cwd(), 'src', 'models.google.config.mjs');

  const apiKey = process.env.GOOGLE_API_KEY;
  let models = defaultModels;

  if (apiKey) {
    const fetchedModels = await fetchGoogleModelsFromAPI(apiKey);
    if (fetchedModels && fetchedModels.length > 0) {
      models = fetchedModels;
    } else {
      console.warn('[WARN] Using fallback default models.');
    }
  } else {
    console.warn('[WARN] No GOOGLE_API_KEY found in environment. Using default models.');
  }

  const configContent = `export default ${JSON.stringify(models, null, 2)};\n`;

  try {
    await fs.writeFile(outputPath, configContent);
    console.log(`[INFO] Models configuration saved to ${outputPath}`);
    console.log(`[INFO] Configured ${models.length} models`);
    return models;
  } catch (error) {
    console.error('[ERROR] Failed to write model config file:', error.message);
    return [];
  }
}

if (process.argv[1].endsWith('refreshGoogleModels.mjs')) {
  refreshGoogleModels();
}

export default refreshGoogleModels;