import { tool } from 'ai';
import { AxiosError } from 'axios';
import { httpExportJsonSchema } from './schema';
import { createHttpExport, updateHttpExport, getHttpExport, listHttpExports } from './handler';

// Tool implementation
export const createHttpExportTool = tool<typeof httpExportJsonSchema, string>({
  description: `Create and manage HTTP exports in Celigo. Example:
{
  "action": "create",
  "config": {
    "name": "My API Export",
    "_connectionId": "connection-id",
    "apiIdentifier": "my-api",
    "http": {
      "relativeURI": "/api/data",
      "method": "GET",
      "formType": "http",
      "response": {
        "resourcePath": "data.items"
      },
      "paging": {
        "method": "linkheader",
        "linkHeaderRelation": "next"
      }
    },
    "filter": {
      "type": "script",
      "script": {
        "_scriptId": "script-id-from-filter-script-tool",
        "function": "filter"
      }
    },
    "adaptorType": "HTTPExport"
  }
}`,
  parameters: httpExportJsonSchema,
  execute: async (args) => {
    try {
      console.log('Executing HTTP export tool:', {
        action: args.action,
        hasConfig: !!args.config,
        hasExportId: !!args.exportId,
        timestamp: new Date().toISOString()
      });

      switch (args.action) {
        case 'create':
          if (!args.config) {
            return JSON.stringify({
              status: 'error',
              error: 'Export configuration is required for create action'
            });
          }
          const createResponse = await createHttpExport(args.config);
          return JSON.stringify(createResponse);

        case 'update':
          if (!args.exportId || !args.config) {
            return JSON.stringify({
              status: 'error',
              error: 'Export ID and configuration are required for update action'
            });
          }
          const updateResponse = await updateHttpExport(args.exportId, args.config);
          return JSON.stringify(updateResponse);

        case 'get':
          if (!args.exportId) {
            return JSON.stringify({
              status: 'error',
              error: 'Export ID is required for get action'
            });
          }
          const getResponse = await getHttpExport(args.exportId);
          return JSON.stringify(getResponse);

        case 'list':
          const listResponse = await listHttpExports();
          return JSON.stringify(listResponse);

        default:
          console.log('Invalid HTTP export tool action:', {
            action: args.action,
            timestamp: new Date().toISOString()
          });
          return JSON.stringify({
            status: 'error',
            error: `Unknown action: ${args.action}`
          });
      }
    } catch (error: unknown) {
      console.error('HTTP export tool execution error:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
      if (error instanceof AxiosError) {
        return JSON.stringify({
          status: 'error',
          error: `Celigo API error: ${error.response?.data?.message || error.message}`
        });
      }
      return JSON.stringify({
        status: 'error',
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      });
    }
  }
});
