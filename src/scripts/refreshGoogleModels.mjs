
import { GoogleAIService } from '../services/googleAIService.mjs';
import fs from 'fs/promises';
import path from 'path';

/**
 * Refreshes the Google AI models and saves them to a backup file
 */
async function refreshGoogleModels() {
  console.log('[INFO] Starting Google AI model refresh...');
  
  try {
    const service = new GoogleAIService();
    const models = await service.fetchModels();
    
    if (!models || models.length === 0) {
      console.error('[ERROR] Failed to fetch models or no models returned');
      return;
    }
    
    console.log(`[INFO] Successfully fetched ${models.length} models`);
    
    // Save to backup file (optional)
    const outputPath = path.join(process.cwd(), 'src', 'google-models.backup.mjs');
    const configContent = `export default ${JSON.stringify(models, null, 2)};\n`;
    await fs.writeFile(outputPath, configContent);
    
    console.log(`[INFO] Models backup saved to ${outputPath}`);
  } catch (error) {
    console.error('[ERROR] Failed to refresh Google AI models:', error);
  }
}

// Execute if this file is run directly
if (process.argv[1].endsWith('refreshGoogleModels.mjs')) {
  refreshGoogleModels();
}

export default refreshGoogleModels;
