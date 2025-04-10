import { JSONSchema7 } from 'json-schema';
import { jsonSchema } from 'ai';
import { NetSuiteConnectionToolParameters } from './types';

export const netsuiteConnectionSchema: JSONSchema7 = {
  type: 'object',
  properties: {
    type: {
      type: 'string',
      enum: ['netsuite'],
      description: 'Connection type'
    },
    name: {
      type: 'string',
      description: 'Connection name'
    },
    offline: {
      type: 'boolean',
      description: 'Whether the connection is offline'
    },
    sandbox: {
      type: 'boolean',
      description: 'Whether this is a sandbox connection'
    },
    netsuite: {
      type: 'object',
      required: [
        'wsdlVersion',
        'concurrencyLevel'
      ],
      properties: {
        wsdlVersion: {
          type: 'string',
          description: 'WSDL version for NetSuite API'
        },
        concurrencyLevel: {
          type: 'number',
          minimum: 1,
          description: 'Concurrency level for API requests'
        }
      }
    },
    microServices: {
      type: 'object',
      properties: {
        disableNetSuiteWebServices: {
          type: 'boolean',
          description: 'Disable NetSuite web services'
        },
        disableRdbms: {
          type: 'boolean',
          description: 'Disable RDBMS'
        },
        disableDataWarehouse: {
          type: 'boolean',
          description: 'Disable data warehouse'
        }
      },
      required: ['disableRdbms'],
      additionalProperties: false
    },
    queues: {
      type: 'array',
      items: {
        type: 'object',
        required: ['name', 'size'],
        properties: {
          name: {
            type: 'string',
            description: 'Queue name'
          },
          size: {
            type: 'number',
            minimum: 1,
            description: 'Queue size'
          }
        }
      }
    }
  },
  required: ['type', 'name', 'netsuite', 'microServices'],
  additionalProperties: false
} as const;

export const netsuiteConnectionToolSchema: JSONSchema7 = {
  type: 'object',
  description: 'Create and manage NetSuite connections in Celigo',
  properties: {
    action: {
      type: 'string',
      enum: ['create', 'update', 'get', 'list', 'delete'],
      description: 'Action to perform'
    },
    connectionId: {
      type: 'string',
      description: 'Connection ID (required for update/get/delete)'
    },
    config: netsuiteConnectionSchema,
    limit: {
      type: 'number',
      minimum: 1,
      description: 'Maximum number of connections to return (for list action)'
    },
    offset: {
      type: 'number',
      minimum: 0,
      description: 'Number of connections to skip (for list action)'
    }
  },
  required: ['action'],
  additionalProperties: false
} as const;

// Export the schema wrapped with jsonSchema helper
export const netsuiteConnectionToolJsonSchema = jsonSchema<NetSuiteConnectionToolParameters>(netsuiteConnectionToolSchema);
