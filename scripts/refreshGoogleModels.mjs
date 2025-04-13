import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const capabilityMapping = {
  'generateContent': 'text',
  'generateImage': 'image',
  'generateAudio': 'audio',
  'generateVideo': 'video',
};

const defaultModels = [
  { model: "gemini-2.0-flash", rarity: "uncommon", capabilities: ["text"] },
  { model: "gemini-2.0-flash-001", rarity: "uncommon", capabilities: ["text"] },
  { model: "gemini-2.0-pro", rarity: "legendary", capabilities: ["text", "image"] },
  { model: "gemini-2.0-pro-001", rarity: "legendary", capabilities: ["text", "image"] },
  { model: "gemini-1.5-pro", rarity: "rare", capabilities: ["text", "audio"] },
  { model: "gemini-1.5-flash", rarity: "common", capabilities: ["text"] }
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
    return data.models || [];
  } catch (error) {
    console.error('[WARN] Could not fetch models from Google API:', error.message);
    return [];
  }
}

async function refreshGoogleModels() {
  console.log('[INFO] Updating Google AI model configuration...');
  const outputPath = path.join(process.cwd(), 'src', 'services', 'ai', 'models.google.config.mjs');

  const apiKey = process.env.GOOGLE_API_KEY;
  let rawModels = [];

  if (apiKey) {
    rawModels = await fetchGoogleModelsFromAPI(apiKey);
    if (rawModels.length === 0) {
      console.warn('[WARN] No models fetched from Google API.');
    }
  } else {
    console.warn('[WARN] No GOOGLE_API_KEY found in environment.');
  }

  const configContent = `export default {
  rawModels: ${JSON.stringify(rawModels, null, 2)}
};\n`;

  try {
    await fs.writeFile(outputPath, configContent);
    console.log(`[INFO] Models configuration saved to ${outputPath}`);
    console.log(`[INFO] Configured ${rawModels.length} models`);
    return rawModels;
  } catch (error) {
    console.error('[ERROR] Failed to write model config file:', error.message);
    return [];
  }
}

if (process.argv[1].endsWith('refreshGoogleModels.mjs')) {
  refreshGoogleModels();
}

export default refreshGoogleModels;