import { BasicService } from './basicService.mjs';
import app from './web/server/app.mjs';

export class WebService extends BasicService {
  async start() {
    try {
      console.log('Starting WebService...');
      await app; // Ensure the app is initialized
      console.log('WebService started successfully.');
    } catch (error) {
      console.error('Failed to start WebService:', error);
      throw error;
    }
  }

  async stop() {
    try {
      console.log('Stopping WebService...');
      // Perform any cleanup if necessary
      console.log('WebService stopped successfully.');
    } catch (error) {
      console.error('Failed to stop WebService:', error);
      throw error;
    }
  }
}