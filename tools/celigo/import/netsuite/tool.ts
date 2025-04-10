import { tool } from 'ai';
import {
  handleCreateNetSuiteImport,
  handleUpdateNetSuiteImport,
  handleGetNetSuiteImport,
  handleListNetSuiteImports,
  handleDeleteNetSuiteImport
} from './handler';
import { NetSuiteImportConfig } from './types';
import { netsuiteImportToolJsonSchema } from './schema';

let currentToken: string | null = null;

export const setNetSuiteImportCredentials = (token: string) => {
  console.log('Setting NetSuite import credentials:', {
    hasToken: !!token,
    tokenLength: token?.length,
    tokenPreview: token ? `${token.substring(0, 4)}...${token.substring(token.length - 4)}` : null,
    timestamp: new Date().toISOString()
  });
  currentToken = token;
  console.log('NetSuite import credentials set successfully', {
    timestamp: new Date().toISOString(),
    status: 'success',
    tokenStatus: token ? 'valid' : 'missing'
  });
};

export const createNetSuiteImportTool = tool<typeof netsuiteImportToolJsonSchema, string>({
  description: `Create and manage NetSuite imports in Celigo. Available actions:
- create: Create a new NetSuite import
- update: Update an existing NetSuite import
- get: Get NetSuite import details by ID
- list: List all NetSuite imports with optional pagination
- delete: Delete a NetSuite import by ID

IMPORTANT: When using internalIdLookup, you MUST specify ignoreExisting property.

Example:
{
  "action": "create",
  "config": {
    "name": "My NetSuite Import",
    "_connectionId": "connection123",
    "apiIdentifier": "my-import",
    "distributed": true,
    "ignoreExisting": false,
    "ignoreMissing": false,
    "oneToMany": false,
    "lookups": [
      {
        "name": "customerLookup",
        "recordType": "customer",
        "resultField": "internalid",
        "expression": "[[\"email\",\"is\",\"{{email}}\"]]",
        "allowFailures": false,
        "default": null
      }
    ],
    "netsuite_da": {
      "restletVersion": "suiteapp2.0",
      "operation": "add_update",
      "recordType": "salesorder",
      "internalIdLookup": {
        "expression": "[[\"tranid\",\"is\",\"{{orderNumber}}\"]]"
      },
      "mapping": {
        "fields": [
          {
            "generate": "tranid",
            "extract": "orderNumber",
            "discardIfEmpty": false,
            "immutable": true,
            "dataType": "string"
          },
          {
            "generate": "entity",
            "lookupName": "customerLookup",
            "internalId": true
          }
        ],
        "lists": [
          {
            "generate": "item",
            "fields": [
              {
                "generate": "item",
                "extract": "itemId",
                "internalId": true
              },
              {
                "generate": "quantity",
                "extract": "quantity",
                "dataType": "number"
              }
            ]
          }
        ]
      }
    },
    "adaptorType": "NetSuiteDistributedImport"
  }
}`,
  parameters: netsuiteImportToolJsonSchema,
  execute: async (args) => {
    if (!currentToken) {
      console.log('NetSuite import tool execution failed: No credentials available', {
        timestamp: new Date().toISOString(),
        tokenStatus: 'missing'
      });
      return JSON.stringify({
        status: 'error',
        error: 'No Celigo credentials available. Please ensure the Celigo addon is enabled and properly configured.'
      });
    }

    try {
      console.log('Executing NetSuite import tool:', {
        action: args.action,
        hasConfig: !!args.config,
        hasImportId: !!args.importId,
        tokenStatus: 'valid',
        timestamp: new Date().toISOString()
      });

      switch (args.action) {
        case 'create':
          if (!args.config || !isValidNetSuiteImportConfig(args.config)) {
            return JSON.stringify({
              status: 'error',
              error: 'Valid import configuration is required for create action'
            });
          }
          const createResult = await handleCreateNetSuiteImport(
            args.config,
            currentToken
          );
          return JSON.stringify(createResult);

        case 'update':
          if (!args.importId || !args.config) {
            return JSON.stringify({
              status: 'error',
              error: 'Import ID and configuration are required for update action'
            });
          }
          const updateResult = await handleUpdateNetSuiteImport(
            args.importId,
            args.config,
            currentToken
          );
          return JSON.stringify(updateResult);

        case 'get':
          if (!args.importId) {
            return JSON.stringify({
              status: 'error',
              error: 'Import ID is required for get action'
            });
          }
          const getResult = await handleGetNetSuiteImport(
            args.importId,
            currentToken
          );
          return JSON.stringify(getResult);

        case 'list':
          const listResult = await handleListNetSuiteImports(
            currentToken,
            args.limit,
            args.offset
          );
          return JSON.stringify(listResult);

        case 'delete':
          if (!args.importId) {
            return JSON.stringify({
              status: 'error',
              error: 'Import ID is required for delete action'
            });
          }
          await handleDeleteNetSuiteImport(args.importId, currentToken);
          return JSON.stringify({
            status: 'success',
            message: `NetSuite import ${args.importId} deleted successfully`
          });

        default:
          console.log('Invalid NetSuite import tool action:', {
            action: args.action,
            timestamp: new Date().toISOString()
          });
          return JSON.stringify({
            status: 'error',
            error: `Unknown action: ${args.action}`
          });
      }
    } catch (error) {
      console.error('NetSuite import tool execution error:', {
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

// Type guard for NetSuite import config
function isValidNetSuiteImportConfig(config: unknown): config is NetSuiteImportConfig {
  if (
    typeof config !== 'object' ||
    config === null ||
    !('name' in config) ||
    !('_connectionId' in config) ||
    !('apiIdentifier' in config) ||
    !('distributed' in config) ||
    !('netsuite_da' in config) ||
    !('adaptorType' in config) ||
    config.adaptorType !== 'NetSuiteDistributedImport' ||
    config.distributed !== true
  ) {
    return false;
  }

  const netsuite_da = (config as any).netsuite_da;
  if (
    typeof netsuite_da !== 'object' ||
    netsuite_da === null ||
    netsuite_da.restletVersion !== 'suiteapp2.0' ||
    !['add', 'update', 'delete', 'add_update', 'attach', 'detach'].includes(netsuite_da.operation) ||
    typeof netsuite_da.recordType !== 'string' ||
    !netsuite_da.mapping ||
    !Array.isArray(netsuite_da.mapping.fields) ||
    !Array.isArray(netsuite_da.mapping.lists)
  ) {
    return false;
  }

  // Filter validation removed as it's no longer required
  return true;
}
