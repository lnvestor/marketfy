import { httpConnectionSchema } from './schemas/http.js';
import { ftpConnectionSchema } from './schemas/ftp.js';
import { salesforceConnectionSchema } from './schemas/salesforce.js';
import { netsuiteConnectionSchema } from './schemas/netsuite.js';
import type { ConnectionConfig, UpdateConnectionConfig } from './types.js';

// Re-export types
export type { ConnectionConfig, UpdateConnectionConfig };

// Schema for updating a connection
export const updateConnectionSchema = {
  type: 'object',
  properties: {
    connectionId: {
      type: 'string',
      description: 'ID of the connection to update'
    },
    config: {
      type: 'object',
      oneOf: [
        httpConnectionSchema,
        ftpConnectionSchema,
        salesforceConnectionSchema,
        netsuiteConnectionSchema,
      ]
    }
  },
  required: ['connectionId', 'config']
};

// Combined schema that validates any connection type for creation
export const getConnectionsSchema = {
  type: 'object',
  properties: {},
  required: [],
  additionalProperties: false,
  description: 'Get all connections (no parameters required)'
};

export const getConnectionByIdSchema = {
  type: 'object',
  properties: {
    _id: {
      type: 'string',
      description: 'Connection ID'
    }
  },
  required: ['_id']
};

export const createConnectionSchema = {
  type: 'object',
  oneOf: [
    httpConnectionSchema,
    ftpConnectionSchema,
    salesforceConnectionSchema,
    netsuiteConnectionSchema,
  ],
};
