import { tool } from 'ai';
import {
  handleCreateHttpImport,
  handleUpdateHttpImport,
  handleGetHttpImport,
  handleListHttpImports,
  handleDeleteHttpImport
} from './handler';
import { HttpImportConfig } from './types';
import { httpImportToolJsonSchema } from './schema';

let currentToken: string | null = null;

const validHttpMethods = ['POST', 'PUT'] as const;

export const setHttpImportCredentials = (token: string) => {
  console.log('Setting HTTP import credentials:', {
    hasToken: !!token,
    tokenLength: token?.length,
    tokenPreview: token ? `${token.substring(0, 4)}...${token.substring(token.length - 4)}` : null,
    timestamp: new Date().toISOString()
  });
  currentToken = token;
  console.log('HTTP import credentials set successfully', {
    timestamp: new Date().toISOString(),
    status: 'success',
    tokenStatus: token ? 'valid' : 'missing'
  });
};

export const createHttpImportTool = tool<typeof httpImportToolJsonSchema, string>({
  description: `Create and manage HTTP imports in Celigo. Available actions:
- create: Create a new HTTP import
- update: Update an existing HTTP import
- get: Get HTTP import details by ID
- list: List all HTTP imports with optional pagination
- delete: Delete an HTTP import by ID

Example:
{
  "action": "create",
  "config": {
    "name": "My HTTP Import",
    "_connectionId": "connection123",
    "apiIdentifier": "my-import",
    "ignoreExisting": false,
    "ignoreMissing": false,
    "oneToMany": false,
    "sandbox": false,
    "http": {
      "relativeURI": ["/api/data"],
      "method": ["POST"],
      "body": ["{\"field\": {{variable}}}"],
      "sendPostMappedData": true,
      "formType": "http",
      "isRest": false
    },
    "adaptorType": "HTTPImport"
  }
}

IMPORTANT: When using variables like {{variable}} in the request body, set sendPostMappedData to true. 
This is required for endpoints like Shopify inventory updates that use template variables.`,
  parameters: httpImportToolJsonSchema,
  execute: async (args) => {
    if (!currentToken) {
      console.log('HTTP import tool execution failed: No credentials available', {
        timestamp: new Date().toISOString(),
        tokenStatus: 'missing'
      });
      return JSON.stringify({
        status: 'error',
        error: 'No Celigo credentials available. Please ensure the Celigo addon is enabled and properly configured.'
      });
    }

    try {
      console.log('Executing HTTP import tool:', {
        action: args.action,
        hasConfig: !!args.config,
        hasImportId: !!args.importId,
        tokenStatus: 'valid',
        timestamp: new Date().toISOString()
      });

      switch (args.action) {
        case 'create':
          if (!args.config) {
            return JSON.stringify({
              status: 'error',
              error: 'Import configuration is required for create action'
            });
          }
          
          // Make a mutable copy of the config
          let configToUse = JSON.parse(JSON.stringify(args.config));
          
          // Add detailed logging to see what's failing validation
          console.log('Validating HTTP import config:', JSON.stringify(configToUse, null, 2));
          
          if (!isValidHttpImportConfig(configToUse)) {
            // Log more details about the validation failure
            const http = configToUse.http || {};
            console.error('Invalid HTTP import config:', {
              configKeys: Object.keys(configToUse),
              hasHttp: 'http' in configToUse,
              adaptorType: configToUse.adaptorType,
              httpDetails: {
                hasRelativeURI: Array.isArray(http.relativeURI),
                hasMethod: Array.isArray(http.method),
                hasBody: Array.isArray(http.body),
                batchSizeType: typeof http.batchSize,
                sendPostMappedDataType: typeof http.sendPostMappedData,
                formType: http.formType
              },
              timestamp: new Date().toISOString()
            });
            return JSON.stringify({
              status: 'error',
              error: 'Invalid HTTP import configuration provided. Missing required fields or incorrect structure.'
            });
          }
          
          const createResult = await handleCreateHttpImport(
            configToUse,
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
          const updateResult = await handleUpdateHttpImport(
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
          const getResult = await handleGetHttpImport(
            args.importId,
            currentToken
          );
          return JSON.stringify(getResult);

        case 'list':
          const listResult = await handleListHttpImports(
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
          await handleDeleteHttpImport(args.importId, currentToken);
          return JSON.stringify({
            status: 'success',
            message: `HTTP import ${args.importId} deleted successfully`
          });

        default:
          console.log('Invalid HTTP import tool action:', {
            action: args.action,
            timestamp: new Date().toISOString()
          });
          return JSON.stringify({
            status: 'error',
            error: `Unknown action: ${args.action}`
          });
      }
    } catch (error) {
      console.error('HTTP import tool execution error:', {
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

// Type guard for HTTP import config
function isValidHttpImportConfig(config: unknown): config is HttpImportConfig {
  if (
    typeof config !== 'object' ||
    config === null ||
    !('name' in config) ||
    !('_connectionId' in config) ||
    !('apiIdentifier' in config) ||
    !('http' in config) ||
    !('adaptorType' in config) ||
    config.adaptorType !== 'HTTPImport'
  ) {
    return false;
  }

  const http = (config as any).http;
  if (
    typeof http !== 'object' ||
    http === null ||
    !Array.isArray(http.relativeURI) ||
    !Array.isArray(http.method) ||
    !Array.isArray(http.body) ||
    (http.batchSize !== undefined && typeof http.batchSize !== 'number') ||
    typeof http.sendPostMappedData !== 'boolean' ||
    !['http', 'graph_ql', 'rest'].includes(http.formType)
  ) {
    return false;
  }

  // Validate HTTP methods
  if (!http.method.every((method: string) => validHttpMethods.includes(method as any))) {
    return false;
  }
  
  // No special handling needed for POST/PUT requests

  return true;
}
