import { tool } from 'ai';
import {
  handleCreateHttpConnection,
  handleUpdateHttpConnection,
  handleGetHttpConnection,
  handleListHttpConnections,
  handleDeleteHttpConnection
} from './handler';
import { HttpConnection } from './types';
import { httpConnectionToolJsonSchema } from './schema';

let currentToken: string | null = null;

export const setHttpCredentials = (token: string) => {
  console.log('Setting HTTP connection credentials:', {
    hasToken: !!token,
    tokenLength: token?.length,
    tokenPreview: token ? `${token.substring(0, 4)}...${token.substring(token.length - 4)}` : null,
    timestamp: new Date().toISOString()
  });
  currentToken = token;
  console.log('HTTP connection credentials set successfully', {
    timestamp: new Date().toISOString(),
    status: 'success',
    tokenStatus: token ? 'valid' : 'missing'
  });
};

export const createHttpConnectionTool = tool<typeof httpConnectionToolJsonSchema, string>({
  description: `Create and manage HTTP connections in Celigo. HTTP connections allow you to connect to cloud applications that expose an API based on HTTP standards. The HTTP(S) protocol enables performing requests to different cloud applications with proper authentication.

This universal HTTP connector is the most flexible endpoint type with a wide variety of settings to cover many data transfer configurations that cloud apps employ.

Available actions:
- create: Create a new HTTP connection with authentication details and endpoint configuration
- update: Update an existing HTTP connection's settings or credentials
- get: Retrieve full HTTP connection details by connection ID
- list: List all HTTP connections with optional pagination for large result sets
- delete: Remove an HTTP connection from the system by connection ID

Example of creating a basic HTTP connection:
{
  "action": "create",
  "config": {
    "type": "http",
    "name": "My API Connection",
    "http": {
      "formType": "http",
      "mediaType": "json",
      "baseURI": "https://api.example.com",
      "auth": {
        "type": "basic",
        "basic": {
          "username": "user",
          "password": "pass"
        }
      },
      "ping": {
        "relativeURI": "/health",
        "method": "GET"
      }
    }
  }
}

The connection requires proper authentication settings based on the API you're connecting to, and can be configured with connection testing (ping) endpoints to verify connectivity.

Before creating a connection, verify which authentication method is appropriate for the application. Think deeply about what would be the correct endpoint and authentication approach:
- Basic auth: Simple username/password for straightforward APIs 
- Token auth: For APIs using bearer tokens or API keys
- OAuth 2.0: For secure delegated access to resources without sharing credentials
- Other methods: Some APIs may require custom authentication schemes

Also consider the appropriate endpoints for both the base URI and testing (ping) endpoints to ensure reliable connectivity verification.`,
  parameters: httpConnectionToolJsonSchema,
  execute: async (args) => {
    if (!currentToken) {
      console.log('HTTP connection tool execution failed: No credentials available', {
        timestamp: new Date().toISOString(),
        tokenStatus: 'missing'
      });
      return JSON.stringify({
        status: 'error',
        error: 'No Celigo credentials available. Please ensure the Celigo addon is enabled and properly configured.'
      });
    }

    try {
      console.log('Executing HTTP connection tool:', {
        action: args.action,
        hasConfig: !!args.config,
        hasConnectionId: !!args.connectionId,
        tokenStatus: 'valid',
        timestamp: new Date().toISOString()
      });

      switch (args.action) {
        case 'create':
          if (!args.config) {
            return JSON.stringify({
              status: 'error',
              error: 'Connection configuration is required for create action'
            });
          }
          const createResult = await handleCreateHttpConnection(
            args.config as HttpConnection,
            currentToken
          );
          return JSON.stringify(createResult);

        case 'update':
          if (!args.connectionId || !args.config) {
            return JSON.stringify({
              status: 'error',
              error: 'Connection ID and configuration are required for update action'
            });
          }
          const updateResult = await handleUpdateHttpConnection(
            args.connectionId,
            args.config as Partial<HttpConnection>,
            currentToken
          );
          return JSON.stringify(updateResult);

        case 'get':
          if (!args.connectionId) {
            return JSON.stringify({
              status: 'error',
              error: 'Connection ID is required for get action'
            });
          }
          const getResult = await handleGetHttpConnection(
            args.connectionId,
            currentToken
          );
          return JSON.stringify(getResult);

        case 'list':
          const listResult = await handleListHttpConnections(
            currentToken,
            args.limit,
            args.offset
          );
          return JSON.stringify(listResult);

        case 'delete':
          if (!args.connectionId) {
            return JSON.stringify({
              status: 'error',
              error: 'Connection ID is required for delete action'
            });
          }
          await handleDeleteHttpConnection(args.connectionId, currentToken);
          return JSON.stringify({
            status: 'success',
            message: `HTTP connection ${args.connectionId} deleted successfully`
          });

        default:
          console.log('Invalid HTTP connection tool action:', {
            action: args.action,
            timestamp: new Date().toISOString()
          });
          return JSON.stringify({
            status: 'error',
            error: `Unknown action: ${args.action}`
          });
      }
    } catch (error) {
      console.error('HTTP connection tool execution error:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        tokenStatus: 'invalid',
        timestamp: new Date().toISOString()
      });
      return JSON.stringify({
        status: 'error',
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      });
    }
  }
});
