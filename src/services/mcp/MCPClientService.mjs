import { Client } from '@modelcontextprotocol/sdk/client/index.js';

export class MCPClientService {
  clients = new Map();

  constructor() {}

  async addServer(name, options) {
    const client = new Client(options.identity, options.capabilities);
    await client.connect(options.transport);
    this.clients.set(name, client);
  }

  async removeServer(name) {
    this.clients.delete(name);
  }

  async listServers() {
    return Array.from(this.clients.keys());
  }

  async handleTaskRequest(taskDescription) {
    return {
      status: 'not_implemented',
      message: 'Task handling not yet implemented',
      taskDescription
    };
  }
}
