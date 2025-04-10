import { tool } from 'ai';
import { AxiosError } from 'axios';
import { filterScriptJsonSchema } from './schema';
import { createFilterScript, updateFilterScript, getFilterScript, deleteFilterScript } from './handler';

// Tool implementation
export const createFilterScriptTool = tool<typeof filterScriptJsonSchema, string>({
  description: `Create and manage filter scripts in Celigo. These scripts can be used to filter records in any export (HTTP, NetSuite, etc.) based on custom JavaScript logic. 

IMPORTANT: You must create a filter script BEFORE using it in an export. After creating the script, use its ID in the export's filter configuration.

The filterFunction accepts these options:
- 'record' - object {} or array [] depending on the data source.
- 'pageIndex' - 0 based. context is the batch export currently running.
- 'lastExportDateTime' - delta exports only.
- 'currentExportDateTime' - delta exports only.
- 'settings' - all custom settings in scope for the filter currently running.
- 'testMode' - boolean flag indicating test mode and previews.
- 'job' - the job currently running.

The function MUST return true or false:
- true: The record will be processed in the export
- false: The record will be skipped and not included in the export

Throwing an exception will return an error for the record.

Example:
{
  "action": "create",
  "config": {
    "name": "Active Records Filter",
    "content": "function filter(options) {\\n  // Only process active records with a valid ID\\n  return options.record.active === true && options.record.id != null;\\n}",
    "sandbox": false
  }
}`,
  parameters: filterScriptJsonSchema,
  execute: async (args) => {
    try {
      console.log('Executing filter script tool:', {
        action: args.action,
        hasConfig: !!args.config,
        hasScriptId: !!args.scriptId,
        timestamp: new Date().toISOString()
      });

      switch (args.action) {
        case 'create':
          if (!args.config) {
            return JSON.stringify({
              status: 'error',
              error: 'Script configuration is required for create action'
            });
          }
          const createResponse = await createFilterScript(args.config);
          return JSON.stringify({
            status: 'success',
            data: createResponse,
            message: `Filter script "${args.config.name}" created successfully with ID: ${createResponse._id}`
          });

        case 'update':
          if (!args.scriptId || !args.config) {
            return JSON.stringify({
              status: 'error',
              error: 'Script ID and configuration are required for update action'
            });
          }
          const updateResponse = await updateFilterScript(args.scriptId, args.config);
          return JSON.stringify({
            status: 'success',
            data: updateResponse,
            message: `Filter script "${args.config.name}" updated successfully`
          });

        case 'get':
          if (!args.scriptId) {
            return JSON.stringify({
              status: 'error',
              error: 'Script ID is required for get action'
            });
          }
          const getResponse = await getFilterScript(args.scriptId);
          return JSON.stringify({
            status: 'success',
            data: getResponse
          });

        case 'delete':
          if (!args.scriptId) {
            return JSON.stringify({
              status: 'error',
              error: 'Script ID is required for delete action'
            });
          }
          await deleteFilterScript(args.scriptId);
          return JSON.stringify({
            status: 'success',
            message: `Filter script with ID ${args.scriptId} deleted successfully`
          });

        default:
          console.log('Invalid filter script tool action:', {
            action: args.action,
            timestamp: new Date().toISOString()
          });
          return JSON.stringify({
            status: 'error',
            error: `Unknown action: ${args.action}`
          });
      }
    } catch (error: unknown) {
      console.error('Filter script tool execution error:', {
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