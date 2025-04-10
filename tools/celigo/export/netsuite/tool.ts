import { tool } from 'ai';
import { AxiosError } from 'axios';
import { netsuiteExportJsonSchema } from './schema';
import { createNetSuiteExport, updateNetSuiteExport, getNetSuiteExport, listNetSuiteExports } from './handler';

// Tool implementation
export const createNetSuiteExportTool = tool<typeof netsuiteExportJsonSchema, string>({
  description: `Create and manage NetSuite exports in Celigo. Example:
{
  "action": "create",
  "config": {
    "name": "My NetSuite Export",
    "_connectionId": "connection-id",
    "apiIdentifier": "my-netsuite-export",
    "netsuite": {
      "type": "restlet",
      "skipGrouping": true,
      "restlet": {
        "recordType": "transaction",
        "searchId": "customsearch_123",
        "restletVersion": "suiteapp2.0"
      }
    },
    "filter": {
      "type": "script",
      "script": {
        "_scriptId": "script-id-from-filter-script-tool",
        "function": "filter"
      }
    },
    "adaptorType": "NetSuiteExport"
  }
}`,
  parameters: netsuiteExportJsonSchema,
  execute: async (args) => {
    try {
      console.log('Executing NetSuite export tool:', {
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
          const createResponse = await createNetSuiteExport(args.config);
          return JSON.stringify(createResponse);

        case 'update':
          if (!args.exportId || !args.config) {
            return JSON.stringify({
              status: 'error',
              error: 'Export ID and configuration are required for update action'
            });
          }
          const updateResponse = await updateNetSuiteExport(args.exportId, args.config);
          return JSON.stringify(updateResponse);

        case 'get':
          if (!args.exportId) {
            return JSON.stringify({
              status: 'error',
              error: 'Export ID is required for get action'
            });
          }
          const getResponse = await getNetSuiteExport(args.exportId);
          return JSON.stringify(getResponse);

        case 'list':
          const listResponse = await listNetSuiteExports();
          return JSON.stringify(listResponse);

        default:
          console.log('Invalid NetSuite export tool action:', {
            action: args.action,
            timestamp: new Date().toISOString()
          });
          return JSON.stringify({
            status: 'error',
            error: `Unknown action: ${args.action}`
          });
      }
    } catch (error: unknown) {
      console.error('NetSuite export tool execution error:', {
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