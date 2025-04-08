import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import http from 'http';

const server = new Server({
  name: 'memory-server',
  version: '1.0.0',
}, {
  capabilities: {
    tools: {},
  },
});

// Reuse the same handlers as the default server-memory
// You can extend this to add your own tools or logic

const httpServer = http.createServer();
const wsTransport = new SSEServerTransport({ server: httpServer });

httpServer.listen(8090, () => {
  console.log('Knowledge Graph MCP Server running on ws://localhost:8090');
});

(async () => {
  await server.connect(wsTransport);
})();
