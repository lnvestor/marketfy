import { tool } from 'ai';
import {
  handleCreateIntegration,
  handleUpdateIntegration,
  handleGetIntegration,
  handleListIntegrations
} from './handler';
import { IntegrationToolArgs } from './types';
import { integrationToolJsonSchema } from './schemas/tool';

let currentToken: string | null = null;

export const setCredentials = (token: string) => {
  console.log('Setting Celigo integration credentials:', {
    hasToken: !!token,
    tokenLength: token?.length,
    tokenPreview: token ? `${token.substring(0, 4)}...${token.substring(token.length - 4)}` : null,
    timestamp: new Date().toISOString()
  });
  currentToken = token;
};

function validateToken(): string {
  if (!currentToken) {
    console.error('No Celigo credentials available', {
      timestamp: new Date().toISOString()
    });
    throw new Error('No Celigo credentials available. Please ensure the Celigo addon is enabled and properly configured.');
  }
  return currentToken;
}

export const createIntegrationTool = tool<typeof integrationToolJsonSchema, string>({
  description: `Create and manage Celigo integrations. Available actions:
- create: Create a new integration with flow groupings
- update: Update an existing integration
- get: Get integration details by ID
- list: List all integrations

Example:
{
  "action": "create",
  "config": {
    "name": "My Integration",
    "flowGroupings": [
      { "name": "Sales Orders" },
      { "name": "Inventory" }
    ]
  }
}`,
  parameters: integrationToolJsonSchema,
  execute: async (args: IntegrationToolArgs) => {
    try {
      console.log('Executing Celigo integration tool:', {
        action: args.action,
        hasConfig: !!args.config,
        hasIntegrationId: !!args.integrationId,
        timestamp: new Date().toISOString()
      });

      const token = validateToken();

      let result;
      switch (args.action) {
        case 'create':
          if (!args.config) {
            console.error('Missing integration configuration', {
              action: args.action,
              timestamp: new Date().toISOString()
            });
            return JSON.stringify({
              status: 'error',
              error: 'Integration configuration is required for create action',
              details: {
                code: 'MISSING_CONFIG',
                message: 'Please provide a valid integration configuration with name and flowGroupings'
              }
            });
          }

          if (!args.config.name || !args.config.flowGroupings?.length) {
            console.error('Invalid integration configuration', {
              action: args.action,
              config: args.config,
              timestamp: new Date().toISOString()
            });
            return JSON.stringify({
              status: 'error',
              error: 'Invalid integration configuration',
              details: {
                code: 'INVALID_CONFIG',
                message: 'Integration must have a name and at least one flow grouping'
              }
            });
          }

          result = await handleCreateIntegration(
            args.config,
            token
          );
          break;

        case 'update':
          if (!args.integrationId || !args.config) {
            console.error('Missing required parameters for update', {
              action: args.action,
              hasIntegrationId: !!args.integrationId,
              hasConfig: !!args.config,
              timestamp: new Date().toISOString()
            });
            return JSON.stringify({
              status: 'error',
              error: 'Integration ID and configuration are required for update action',
              details: {
                code: 'MISSING_PARAMETERS',
                message: 'Please provide both integrationId and config for update operation'
              }
            });
          }

          if (!args.config.name || !args.config.flowGroupings?.length) {
            console.error('Invalid update configuration', {
              action: args.action,
              config: args.config,
              timestamp: new Date().toISOString()
            });
            return JSON.stringify({
              status: 'error',
              error: 'Invalid integration configuration',
              details: {
                code: 'INVALID_CONFIG',
                message: 'Integration must have a name and at least one flow grouping'
              }
            });
          }

          result = await handleUpdateIntegration(
            args.integrationId,
            args.config,
            token
          );
          break;

        case 'get':
          const id = args.integrationId || args._id;
          if (!id) {
            console.error('Missing integration ID', {
              action: args.action,
              timestamp: new Date().toISOString()
            });
            return JSON.stringify({
              status: 'error',
              error: 'Integration ID is required for get action',
              details: {
                code: 'MISSING_ID',
                message: 'Please provide either integrationId or _id parameter'
              }
            });
          }
          result = await handleGetIntegration(
            id,
            token
          );
          break;

        case 'list':
          result = await handleListIntegrations(token);
          break;

        default:
          console.error('Invalid action', {
            action: args.action,
            timestamp: new Date().toISOString()
          });
          return JSON.stringify({
            status: 'error',
            error: `Unknown action: ${args.action}`,
            details: {
              code: 'INVALID_ACTION',
              message: 'Please provide a valid action: create, update, get, or list'
            }
          });
      }

      console.log('Integration tool execution completed:', {
        action: args.action,
        status: result.status,
        timestamp: new Date().toISOString()
      });

      return JSON.stringify(result);
    } catch (error) {
      console.error('Integration tool execution error:', {
        action: args.action,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      });

      return JSON.stringify({
        status: 'error',
        error: error instanceof Error ? error.message : 'An unknown error occurred',
        details: {
          code: 'EXECUTION_ERROR',
          message: error instanceof Error ? error.stack || error.message : String(error)
        }
      });
    }
  }
});
