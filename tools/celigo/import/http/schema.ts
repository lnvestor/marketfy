import { JSONSchema7, JSONSchema7Definition } from 'json-schema';
import { jsonSchema } from 'ai';
import { HttpImportToolParameters } from './types';
import { baseImportSchema } from '../shared/schemas';

// HTTP-specific import schema
export const httpImportSchema: JSONSchema7 = {
  type: 'object',
  properties: {
    name: (baseImportSchema as JSONSchema7).properties?.name as JSONSchema7Definition,
    _connectionId: (baseImportSchema as JSONSchema7).properties?._connectionId as JSONSchema7Definition,
    apiIdentifier: (baseImportSchema as JSONSchema7).properties?.apiIdentifier as JSONSchema7Definition,
    ignoreExisting: {
      type: 'boolean',
      default: false,
      description: 'Whether to ignore existing records'
    },
    ignoreMissing: {
      type: 'boolean',
      default: false,
      description: 'Whether to ignore missing records'
    },
    oneToMany: {
      type: 'boolean',
      default: false,
      description: 'Whether this is a one-to-many import'
    },
    sandbox: {
      type: 'boolean',
      description: 'Whether this is a sandbox import'
    },
    http: {
      type: 'object',
      properties: {
        relativeURI: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of relative URIs to call'
        },
        method: {
          type: 'array',
          items: { 
            type: 'string',
            enum: ['POST', 'PUT']
          },
          description: 'Array of HTTP methods to use (only POST and PUT supported for imports)'
        },
        body: {
          type: 'array',
          items: { 
            type: ['string', 'object']
          },
          description: 'Array of request bodies (strings or objects with template variables)'
        },
        batchSize: {
          type: 'number',
          description: 'Number of records to process in each batch'
        },
        sendPostMappedData: {
          type: 'boolean',
          description: 'Whether to send post-mapped data. For POST/PUT operations with templated variables like {{variableName}}, this should typically be set to true. When true, Celigo will process and map the data before sending the request.'
        },
        formType: {
          type: 'string',
          enum: ['http', 'graph_ql', 'rest'],
          description: 'Type of form data - can be HTTP, GraphQL, or REST'
        },
        isRest: {
          type: 'boolean',
          description: 'Whether this is a REST import'
        }
      },
      required: ['relativeURI', 'method', 'body', 'sendPostMappedData', 'formType'],
      additionalProperties: false,
      description: 'HTTP-specific configuration'
    },
    adaptorType: {
      type: 'string',
      const: 'HTTPImport',
      description: 'Type of import adaptor - must be HTTPImport'
    }
  },
  required: ['name', '_connectionId', 'apiIdentifier', 'http', 'adaptorType'],
  additionalProperties: false,
  description: 'Schema for HTTP Import configuration in Celigo integrator.io'
};

// HTTP import tool schema
export const httpImportToolSchema: JSONSchema7 = {
  type: 'object',
  description: 'Create and manage HTTP imports in Celigo',
  properties: {
    action: {
      type: 'string',
      enum: ['create', 'update', 'get', 'list', 'delete'],
      description: 'Action to perform'
    },
    importId: {
      type: 'string',
      description: 'Import ID (required for update/get/delete)'
    },
    config: httpImportSchema,
    limit: {
      type: 'number',
      minimum: 1,
      description: 'Maximum number of imports to return (for list action)'
    },
    offset: {
      type: 'number',
      minimum: 0,
      description: 'Number of imports to skip (for list action)'
    }
  },
  required: ['action'],
  additionalProperties: false
};

// Export the schema wrapped with jsonSchema helper
export const httpImportToolJsonSchema = jsonSchema<HttpImportToolParameters>(httpImportToolSchema);
