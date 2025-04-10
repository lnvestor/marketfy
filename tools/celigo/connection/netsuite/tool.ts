import { tool } from 'ai';
import {
  handleCreateNetSuiteConnection,
  handleUpdateNetSuiteConnection,
  handleGetNetSuiteConnection,
  handleListNetSuiteConnections,
  handleDeleteNetSuiteConnection
} from './handler';
import { NetSuiteConnection } from './types';
import { netsuiteConnectionToolJsonSchema } from './schema';

let currentToken: string | null = null;

export const setNetSuiteCredentials = (token: string) => {
  console.log('Setting NetSuite connection credentials:', {
    hasToken: !!token,
    tokenLength: token?.length,
    tokenPreview: token ? `${token.substring(0, 4)}...${token.substring(token.length - 4)}` : null,
    timestamp: new Date().toISOString()
  });
  currentToken = token;
  console.log('NetSuite connection credentials set successfully', {
    timestamp: new Date().toISOString(),
    status: 'success',
    tokenStatus: token ? 'valid' : 'missing'
  });
};

export const createNetSuiteConnectionTool = tool<typeof netsuiteConnectionToolJsonSchema, string>({
  description: `Create and manage NetSuite connections in Celigo. Available actions:
- create: Create a new NetSuite connection
- update: Update an existing NetSuite connection
- get: Get NetSuite connection details by ID
- list: List all NetSuite connections with optional pagination
- delete: Delete a NetSuite connection by ID

Example:
{
  "action": "create",
  "config": {
    "type": "netsuite",
    "name": "Production NetSuite",
    "netsuite": {
      "wsdlVersion": "2023.1",
      "concurrencyLevel": 5
    },
    "microServices": {
      "disableRdbms": false
    }
  }
}`,
  parameters: netsuiteConnectionToolJsonSchema,
  execute: async (args) => {
    if (!currentToken) {
      console.log('NetSuite connection tool execution failed: No credentials available', {
        timestamp: new Date().toISOString(),
        tokenStatus: 'missing'
      });
      return JSON.stringify({
        status: 'error',
        error: 'No Celigo credentials available. Please ensure the Celigo addon is enabled and properly configured.'
      });
    }

    try {
      console.log('Executing NetSuite connection tool:', {
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
          const createResult = await handleCreateNetSuiteConnection(
            args.config as NetSuiteConnection,
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
          const updateResult = await handleUpdateNetSuiteConnection(
            args.connectionId,
            args.config as Partial<NetSuiteConnection>,
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
          const getResult = await handleGetNetSuiteConnection(
            args.connectionId,
            currentToken
          );
          return JSON.stringify(getResult);

        case 'list':
          const listResult = await handleListNetSuiteConnections(
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
          await handleDeleteNetSuiteConnection(args.connectionId, currentToken);
          return JSON.stringify({
            status: 'success',
            message: `NetSuite connection ${args.connectionId} deleted successfully`
          });

        default:
          console.log('Invalid NetSuite connection tool action:', {
            action: args.action,
            timestamp: new Date().toISOString()
          });
          return JSON.stringify({
            status: 'error',
            error: `Unknown action: ${args.action}`
          });
      }
    } catch (error) {
      console.error('NetSuite connection tool execution error:', {
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
