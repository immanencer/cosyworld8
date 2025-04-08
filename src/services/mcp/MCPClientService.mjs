import { spawn } from 'child_process';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import dotenv from 'dotenv';

dotenv.config();

class WebSocketLikeTransport {
  constructor(transport) {
    if (!transport || !transport.stdin || !transport.stdout) {
      throw new Error('Invalid transport: stdin and stdout must be defined');
    }

    this._transport = transport;
    this.onclose = null;
    this.onerror = null;
    this.onmessage = null;
    this.onopen = null;

    // Log transport initialization
    console.info('Initializing WebSocketLikeTransport with valid streams.');

    // Simulate WebSocket-like behavior
    this._transport.stdin.on('error', (err) => {
      if (typeof this.onerror === 'function') {
        this.onerror(err);
      }
    });

    this._transport.stdout.on('data', (data) => {
      if (typeof this.onmessage === 'function') {
        this.onmessage({ data: data.toString() });
      }
    });

    // Simulate open event
    setTimeout(() => {
      if (typeof this.onopen === 'function') {
        this.onopen();
      }
    }, 0);
  }

  send(data) {
    if (!this._transport.stdin) {
      throw new Error('Transport stdin is not available for sending data');
    }
    this._transport.stdin.write(data);
  }

  close() {
    if (this._transport.stdin) {
      this._transport.stdin.end();
    }
    if (typeof this.onclose === 'function') {
      this.onclose();
    }
  }
}

export class MCPClientService {
  constructor({ logger }) {
    this.logger = logger;
    this.clients = new Map();
    this.tools = new Map();
    this.memoryTransport = null;
    this.memoryProcess = null;
  }

  async startMemoryServer() {
    this.logger?.info('Starting MCP memory server subprocess...');

    // Attempt to spawn the subprocess using npx
    let proc;
    try {
      proc = spawn('npx', ['-y', '@modelcontextprotocol/server-memory'], {
        shell: true,
        stdio: ['pipe', 'pipe', 'pipe'], // Ensure streams are piped
      });
    } catch (err) {
      this.logger?.error('Failed to spawn MCP memory server using npx: ' + err.message);
      throw err;
    }

    // Log subprocess details
    if (!proc || !proc.stdin || !proc.stdout) {
      this.logger?.error('Subprocess streams are invalid. stdin or stdout is undefined.');
      throw new Error('Invalid subprocess streams');
    }

    this.logger?.info('Subprocess streams initialized successfully.');
    this.memoryProcess = proc;

    proc.on('error', (err) => {
      this.logger?.error('MCP memory server error: ' + err.message);
    });
    proc.on('exit', (code) => {
      this.logger?.info('MCP memory server exited with code ' + code);
    });

    const stdioTransport = new StdioClientTransport({
      stdin: proc.stdin,
      stdout: proc.stdout,
      stderr: proc.stderr
    });

    // Wrap transport in WebSocket-like shim
    this.memoryTransport = new WebSocketLikeTransport(stdioTransport);

    // Wait for server ready message before proceeding
    await new Promise((resolve) => {
      proc.stdout.on('data', (data) => {
        const text = data.toString();
        this.logger?.info(`MCP memory server output: ${text.trim()}`);
        if (text.includes('Knowledge Graph MCP Server running on stdio')) {
          this.logger?.info('MCP memory server is ready.');
          resolve();
        }
      });
    });
  }

  async connectMemoryClient() {
    if (!this.memoryTransport) {
      this.logger?.warn('Memory transport not initialized, skipping MCP client connection');
      return;
    }
    this.logger?.info('Connecting MCP client to memory server...');
    const client = new Client({ transport: this.memoryTransport });
    try {
      await client.connect();
      this.clients.set('memory', client);
      this.logger?.info('Connected to MCP memory server');

      try {
        const toolResult = await client.listTools();
        this.tools.set('memory', toolResult.tools);
        this.logger?.info(`Memory server tools: ${toolResult.tools.map(t => t.name).join(', ')}`);
      } catch (err) {
        this.logger?.warn('Failed to fetch tools from memory server: ' + err.message);
      }
    } catch (err) {
      this.logger?.error('Failed to connect to MCP memory server: ' + err.message);
    }
  }

  async initialize() {
    if (!process.env.ANTHROPIC_API_KEY) {
      this.logger?.warn('ANTHROPIC_API_KEY not set. Claude integration disabled.');
    }
    await this.startMemoryServer();
    await this.connectMemoryClient();
  }

  async shutdown() {
    for (const client of this.clients.values()) {
      try {
        await client.close();
      } catch {}
    }
    if (this.memoryProcess) {
      this.memoryProcess.kill();
      this.logger?.info('MCP memory server subprocess terminated.');
    }
  }

  async addServer(name, options) {
    const client = new Client(options);
    await client.connect();
    this.clients.set(name, client);
    try {
      const toolResult = await client.listTools();
      this.tools.set(name, toolResult.tools);
      this.logger?.info(`Server ${name} tools: ${toolResult.tools.map(t => t.name).join(', ')}`);
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
