import { tool } from 'ai';
import {
  handleCreateFlow,
  handleUpdateFlow,
  handleGetFlowById,
  handleGetFlows
} from './handler';
import { FlowToolArgs } from './types';
import { flowToolJsonSchema } from './schemas/tool';

let currentToken: string | null = null;

export const setCredentials = (token: string) => {
  console.log('Setting Celigo flow credentials:', {
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

export const createFlowTool = tool<typeof flowToolJsonSchema, string>({
  description: `Create and manage Celigo flows. Available actions:
- create: Create a new flow with source and destination configurations
- update: Update an existing flow
- get: Get flow details by ID
- list: List all flows

Example:
{
  "action": "create",
  "config": {
    "name": "Sales Order Sync",
    "_integrationId": "integration123",
    "_flowGroupingId": "group123",
    "pageGenerators": [
      {
        "_exportId": "export123",
        "skipRetries": false
      }
    ],
    "pageProcessors": [
      {
        "type": "export",
        "_exportId": "lookup123",
        "responseMapping": {
          "fields": [
            {
              "extract": "data[0].id",
              "generate": "orderId"
            }
          ],
          "lists": []
        }
      },
      {
        "type": "import",
        "_importId": "import123"
      }
    ],
    "free": false
  }
}`,
  parameters: flowToolJsonSchema,
  execute: async (args: FlowToolArgs) => {
    try {
      console.log('Executing Celigo flow tool:', {
        action: args.action,
        hasConfig: !!args.config,
        hasFlowId: !!args.flowId,
        timestamp: new Date().toISOString()
      });

      const token = validateToken();

      let result;
      switch (args.action) {
        case 'create':
          if (!args.config) {
            console.error('Missing flow configuration', {
              action: args.action,
              timestamp: new Date().toISOString()
            });
            return JSON.stringify({
              status: 'error',
              error: 'Flow configuration is required for create action',
              details: {
                code: 'MISSING_CONFIG',
                message: 'Please provide a valid flow configuration'
              }
            });
          }

          result = await handleCreateFlow(args.config, token);
          break;

        case 'update':
          if (!args.flowId || !args.config) {
            console.error('Missing required parameters for update', {
              action: args.action,
              hasFlowId: !!args.flowId,
              hasConfig: !!args.config,
              timestamp: new Date().toISOString()
            });
            return JSON.stringify({
              status: 'error',
              error: 'Flow ID and configuration are required for update action',
              details: {
                code: 'MISSING_PARAMETERS',
                message: 'Please provide both flowId and config for update operation'
              }
            });
          }

          result = await handleUpdateFlow(
            { flowId: args.flowId, config: args.config },
            token
          );
          break;

        case 'get':
          if (!args._id) {
            console.error('Missing flow ID', {
              action: args.action,
              timestamp: new Date().toISOString()
            });
            return JSON.stringify({
              status: 'error',
              error: 'Flow ID is required for get action',
              details: {
                code: 'MISSING_ID',
                message: 'Please provide _id parameter'
              }
            });
          }
          result = await handleGetFlowById(
            { _id: args._id },
            token
          );
          break;

        case 'list':
          result = await handleGetFlows(token);
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

      console.log('Flow tool execution completed:', {
        action: args.action,
        status: result.status,
        timestamp: new Date().toISOString()
      });

      return JSON.stringify(result);
    } catch (error) {
      console.error('Flow tool execution error:', {
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
