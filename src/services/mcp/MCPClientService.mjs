import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import dotenv from 'dotenv';

dotenv.config();

export class MCPClientService {
  constructor({ logger }) {
    this.logger = logger;
    this.clients = new Map();
    this.tools = new Map();
  }

  async connectMemoryClient() {
    this.logger?.info('Connecting MCP client to memory server...');
  
    const transport = new StdioClientTransport({
      command: "npx @modelcontextprotocol/server-memory -y",
      cwd: process.cwd(),
    });
  
    const client = new Client({ 
      transport,
      clientInfo: {
        name: 'memory-client',
        version: '1.0.0'
      }
    });
  
    try {
      await client.connect(); // Remove the redundant transport and clientInfo here
      this.clients.set('memory', client);
      this.logger?.info('Connected to MCP memory server');
  
      const { tools } = await client.listTools();
      this.tools.set('memory', tools);
      this.logger?.info(`Memory server tools: ${tools.map(t => t.name).join(', ')}`);
    } catch (err) {
      this.logger?.error('Failed to connect to MCP memory server: ' + err.message);
      console.log(err.stack);
    }
  }

  async initialize() {
    if (!process.env.ANTHROPIC_API_KEY) {
      this.logger?.warn('ANTHROPIC_API_KEY not set. Claude integration disabled.');
    }
    await this.connectMemoryClient();
  }

  async shutdown() {
    for (const client of this.clients.values()) {
      try {
        await client.close();
      } catch {}
    }
  }

  async addServer(name, options) {
    const client = new Client(options);
    await client.connect();
    this.clients.set(name, client);
    try {
      const { tools } = await client.listTools();
      this.tools.set(name, tools);
      this.logger?.info(`Server ${name} tools: ${tools.map(t => t.name).join(', ')}`);
    } catch (err) {
      this.logger?.warn(`Failed to fetch tools from server ${name}: ${err.message}`);
    }
  }

  async removeServer(name) {
    const client = this.clients.get(name);
    if (client) {
      try {
        await client.close();
      } catch {}
    }
    this.clients.delete(name);
    this.tools.delete(name);
  }

  async listServers() {
    return Array.from(this.clients.keys());
  }

  async callTool(serverName, toolCall) {
    const client = this.clients.get(serverName);
    if (!client) throw new Error(`No MCP client connected for server ${serverName}`);
    try {
      return await client.callTool(toolCall);
    } catch (err) {
      this.logger?.warn(`Tool call failed on ${serverName}: ${err.message}`);
      throw err;
    }
  }

  getTools(serverName) {
    return this.tools.get(serverName) || [];
  }
}
