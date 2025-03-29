import { BasicService } from '../basicService.mjs';
export class BasicTool extends BasicService {

  constructor(services, requiredServices) { 
    super(services, requiredServices);
  }

  async execute(message, params, avatar, services) {
    throw new Error('Tool must implement execute method');
  }

  getDescription() {
    throw new Error('Tool must implement getDescription method');
  }

  getSyntax() {
    throw new Error('Tool must implement getSyntax method');
  }
}