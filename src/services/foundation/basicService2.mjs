export class BasicService {
  constructor(services = {}, requiredServices = []) {
    this.services = services;
    this.logger = services.logger || console;

    this.logger.warn(`[BasicService] Constructed ${this.constructor.name}`);

    this.registerServices(requiredServices);
  }

  registerServices(requiredServices = []) {
    requiredServices.forEach(dep => {
      if (!this.services[dep]) {
        this.logger.warn(`[BasicService] Missing dependency '${dep}' in ${this.constructor.name}`);
      } else {
        this[dep] = this.services[dep];
        this.logger.warn(`[BasicService] Registered dependency '${dep}' in ${this.constructor.name}`);
      }
    });
  }

  async initializeServices() {
    this.logger.warn(`[BasicService] initializeServices called for ${this.constructor.name}`);
  }

  async shutdown() {
    this.logger.warn(`[BasicService] shutdown called for ${this.constructor.name}`);
  }
}
