import { JSONSchema7 } from 'json-schema';
import { jsonSchema } from 'ai';
import { FilterScriptToolArgs } from './types';

// Filter script schema
export const filterScriptSchema = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  type: 'object',
  properties: {
    name: {
      type: 'string',
      description: 'Name of the filter script. Choose a descriptive name that indicates what the filter does.'
    },
    content: {
      type: 'string',
      description: `JavaScript filter function code. Must include a function named 'filter' that accepts an options parameter and returns a boolean.

The function MUST return true or false:
- true: The record will be processed in the export
- false: The record will be skipped and not included in the export
      
Example:
/*
* filterFunction stub:
*
* The name of the function can be changed to anything you like.
*
* The function will be passed one 'options' argument that has the following fields:
*   'record' - object {} or array [] depending on the data source.
*   'pageIndex' - 0 based. context is the batch export currently running.
*   'lastExportDateTime' - delta exports only.
*   'currentExportDateTime' - delta exports only.
*   'settings' - all custom settings in scope for the filter currently running.
*   'testMode' - boolean flag indicating test mode and previews.
*   'job' - the job currently running.
*
* The function needs to return true or false. i.e. true indicates the record should be processed.
* Throwing an exception will return an error for the record.
*/
function filter(options) {
  // Check if id is not empty
  if (!options.record.id) {
    return false;
  }
  // Check if status equals "OPEN"
  if (options.record.status !== "OPEN") {
    return false;
  }
  return true;
}`
    },
    sandbox: {
      type: 'boolean',
      default: false,
      description: 'Indicates if this script is for testing/sandbox purposes.'
    }
  },
  required: ['name', 'content']
} as unknown as JSONSchema7;

// Export the schema wrapped with jsonSchema helper
export const filterScriptJsonSchema = jsonSchema<FilterScriptToolArgs>({
  type: 'object',
  properties: {
    action: {
      type: 'string',
      enum: ['create', 'update', 'get', 'delete'],
      description: 'Action to perform on filter script'
    },
    scriptId: {
      type: 'string',
      description: 'Script ID for update/get/delete operations'
    },
    config: filterScriptSchema
  },
  required: ['action']
});