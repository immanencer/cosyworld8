export class BasicService {
  constructor(services = {}, requiredServices = []) {
    this.logger = services.logger
     || (()=> { throw new Error("Logger service is missing.")});

    this.services = services;
    this.registerServices(requiredServices);
  }

  async initializeServices() {
    // Initialize services that depend on this service.
    for (const serviceName of Object.keys(this.services)) {
      if (this.services[serviceName].initialize && !this.services[serviceName].initialized) {
        this.logger.info(`Initializing service: ${serviceName}`);
        await this.services[serviceName].initialize();
        this.services[serviceName].initialized = true;
        this.logger.info(`Service initialized: ${serviceName}`);
      }
    }
  }

  registerServices(serviceList) {
    serviceList.forEach(element => {
      if (!this.services[element]) {
        throw new Error(`Required service ${element} is missing.`);
      }
      this[element] = this.services[element];
    });
  }
}