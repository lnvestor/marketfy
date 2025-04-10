import { httpConnectionSchema } from './http';
import { ftpConnectionSchema } from './ftp';
import { salesforceConnectionSchema } from './salesforce';
import { netsuiteConnectionSchema } from './netsuite';

// Base schemas for common operations
export const listConnectionsSchema = {
  type: 'object',
  properties: {
    type: {
      type: 'string',
      enum: ['http', 'ftp', 'salesforce', 'netsuite'],
      description: 'Filter connections by type'
    },
    limit: {
      type: 'number',
      minimum: 1,
      description: 'Maximum number of connections to return'
    },
    offset: {
      type: 'number',
      minimum: 0,
      description: 'Number of connections to skip'
    }
  },
  additionalProperties: false
} as const;

export const getConnectionSchema = {
  type: 'object',
  properties: {
    connectionId: {
      type: 'string',
      description: 'ID of the connection to retrieve'
    }
  },
  required: ['connectionId'],
  additionalProperties: false
} as const;

// Export all connection schemas
export {
  httpConnectionSchema,
  ftpConnectionSchema,
  salesforceConnectionSchema,
  netsuiteConnectionSchema
};

// Combined schema for creating any type of connection
export const createConnectionSchema = {
  oneOf: [
    httpConnectionSchema,
    ftpConnectionSchema,
    salesforceConnectionSchema,
    netsuiteConnectionSchema
  ]
} as const;

// Schema for updating any type of connection
export const updateConnectionSchema = {
  type: 'object',
  properties: {
    connectionId: {
      type: 'string',
      description: 'ID of the connection to update'
    },
    config: {
      oneOf: [
        {
          type: 'object',
          properties: httpConnectionSchema.properties,
          additionalProperties: false
        },
        {
          type: 'object',
          properties: ftpConnectionSchema.properties,
          additionalProperties: false
        },
        {
          type: 'object',
          properties: salesforceConnectionSchema.properties,
          additionalProperties: false
        },
        {
          type: 'object',
          properties: netsuiteConnectionSchema.properties,
          additionalProperties: false
        }
      ]
    }
  },
  required: ['connectionId', 'config'],
  additionalProperties: false
} as const;
