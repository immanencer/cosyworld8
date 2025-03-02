
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Default models configuration - this is used when the API is not available
 */
const defaultModels = [
  {
    "model": "gemini-2.0-flash",
    "rarity": "uncommon"
  },
  {
    "model": "gemini-2.0-flash-001",
    "rarity": "uncommon"
  },
  {
    "model": "gemini-2.0-pro",
    "rarity": "legendary"
  },
  {
    "model": "gemini-2.0-pro-001",
    "rarity": "legendary"
  },
  {
    "model": "gemini-1.5-pro",
    "rarity": "rare"
  },
  {
    "model": "gemini-1.5-flash",
    "rarity": "common"
  },
  {
    "model": "gemini-1.0-pro",
    "rarity": "uncommon"
  },
  {
    "model": "anthropic/claude-3-opus",
    "rarity": "legendary"
  },
  {
    "model": "anthropic/claude-3-sonnet",
    "rarity": "rare"
  },
  {
    "model": "anthropic/claude-3-haiku",
    "rarity": "uncommon"
  },
  {
    "model": "openai/gpt-4o",
    "rarity": "legendary"
  },
  {
    "model": "openai/gpt-4-turbo",
    "rarity": "rare"
  },
  {
    "model": "openai/gpt-4",
    "rarity": "rare"
  },
  {
    "model": "openai/gpt-3.5-turbo",
    "rarity": "common"
  },
  {
    "model": "mistralai/mistral-large",
    "rarity": "rare"
  },
  {
    "model": "mistralai/mistral-small",
    "rarity": "common"
  },
  {
    "model": "mistralai/mixtral-8x7b",
    "rarity": "uncommon"
  }
];

/**
 * Creates or updates the models configuration file
 */
async function refreshGoogleModels() {
  console.log('[INFO] Updating Google AI model configuration...');
  
  try {
    // Get the path to the models.config.mjs file
    const outputPath = path.join(process.cwd(), 'src', 'models.config.mjs');
    
    // Format the models array as a JavaScript module
    const configContent = `export default ${JSON.stringify(defaultModels, null, 2)};\n`;
    
    // Write to the file
    await fs.writeFile(outputPath, configContent);
    
    console.log(`[INFO] Models configuration saved to ${outputPath}`);
    console.log(`[INFO] Configured ${defaultModels.length} models`);
    
    return defaultModels;
  } catch (error) {
    console.error('[ERROR] Failed to update Google AI models configuration:', error);
    return [];
  }
}

// Execute if this file is run directly
if (process.argv[1].endsWith('refreshGoogleModels.mjs')) {
  refreshGoogleModels();
}

export default refreshGoogleModels;
