export class BasicService {
  constructor(services = {}, requiredServices = []) {
    this.logger = services.logger
     || (()=> { throw new Error("Logger service is missing.")});

    this.services = services;
    this.registerServices(requiredServices);
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