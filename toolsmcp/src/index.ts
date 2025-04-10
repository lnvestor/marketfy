#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { setupResources } from './resources/index.js';
import { handleError } from './utils/error-handler.js';
import { toolDefinitions, toolList, handleToolRequest } from './tools/tool-handlers.js';

class CeligoServer {
  private server: Server;
  private bearerToken: string;

  constructor() {
    this.server = new Server(
      {
        name: 'celigo-connection-server',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: toolDefinitions,
          resources: {},
        },
      }
    );

    this.bearerToken = process.env.CELIGO_BEARER_TOKEN || '';
    if (!this.bearerToken) {
      throw new Error('CELIGO_BEARER_TOKEN environment variable is required');
    }

    this.setupHandlers();
    setupResources(this.server);
  }

  private setupHandlers() {
    // Set up error handler
    this.server.onerror = handleError;

    // Set up SIGINT handler
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });

    // Set up tool list handler
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: toolList
    }));

    // Set up tool request handler
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      return await handleToolRequest(
        request.params.name,
        request.params.arguments,
        this.bearerToken
      );
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Celigo MCP server running on stdio');
  }
}

const server = new CeligoServer();
server.run().catch(console.error);
