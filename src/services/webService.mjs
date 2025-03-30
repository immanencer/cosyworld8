import { BasicService } from './basicService.mjs';
import initializeApp from './web/server/app.mjs';

export class WebService extends BasicService {
  constructor(services) {
    super(services);
  }
  async start() {
    try {
      this.logger.info('Starting WebService...');
      await initializeApp(this.services); // Ensure the app is initialized
      this.logger.info('WebService started successfully.');
    } catch (error) {
      this.logger.error('Failed to start WebService:', error);
      throw error;
    }
  }

  async stop() {
    try {
      this.logger.info('Stopping WebService...');
      // Perform any cleanup if necessary
      this.logger.info('WebService stopped successfully.');
    } catch (error) {
      this.logger.error('Failed to stop WebService:', error);
      throw error;
    }
  }
}