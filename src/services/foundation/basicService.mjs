export class BasicService {
  constructor(services) {
    this.logger = services.logger;
    this.services = services;
    this.initialized = false;
  }
}
