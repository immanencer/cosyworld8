import initializeApp from './server/app.mjs';

export class WebService {
  constructor(services) {
    this.logger = services.logger;
    this.configService = services.configService;
    this.databaseService = services.databaseService;
    this.discordService = services.discordService;
  }

  async start() {
    try {
      this.logger.info('Starting WebService...');
      await initializeApp({
        logger: this.logger,
        databaseService: this.databaseService,
        configService: this.configService,
        discordService: this.discordService,
      });
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