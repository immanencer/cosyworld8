export class BaseTool {

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