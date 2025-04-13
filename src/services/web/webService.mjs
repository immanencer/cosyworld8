import { BasicService } from '../foundation/basicService.mjs';
import initializeApp from './server/app.mjs';

export class WebService extends BasicService {
  static requiredServices = [
    'logger',
    'configService',
    'databaseService',
    'discordService',
    's3Service',
    'aiModelService',
  ];
  constructor(services) {
    super(services)
    this.services = services;
  }

  async start(services) {
    try {
      this.logger.info('Starting WebService...');
      await initializeApp(services);
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