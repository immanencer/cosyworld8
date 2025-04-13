export class BasicService {
  constructor(services) {
    this.logger = services?.logger || console;
    if (!this.requiredServices) {
      this.logger.warn(`[ServiceRegistry] ${this.constructor.name} has no static property requiredServices defined.`);
      this.logger.debug(`[ServiceRegistry] ${this.constructor.name} received: ${services ? JSON.stringify(Object.keys(services)) : ''}`);
    }
  }

  /**
   * Validates and assigns required dependencies for all registered services.
   * Should be called after all services are registered.
   * @param {Object} services - The service registry object.
   */
  static validateServiceDependencies(services) {
    for (const [name, service] of Object.entries(services)) {
      const reqs = service.requiredServices || service.constructor.requiredServices || [];
      for (const dep of reqs) {
        if (!services[dep]) {
          throw new Error(`[ServiceRegistry] ${name} is missing required dependency: ${dep}`);
        }
        // Assign dependency to the service instance if not already set
        if (!service[dep]) {
          service[dep] = services[dep];
        }
      }
    }
  }
}
