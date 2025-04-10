import { responseSchema, deltaSchema, transformSchema } from './shared.js';

const rdbmsConfigSchema = {
  type: 'object',
  properties: {
    query: {
      type: 'string',
      description: 'SQL query string'
    },
    response: responseSchema
  },
  required: ['query']
};

export const rdbmsExportSchema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      description: 'Export name'
    },
    _connectionId: {
      type: 'string',
      description: 'Connection ID'
    },
    apiIdentifier: {
      type: 'string',
      description: 'API identifier'
    },
    asynchronous: {
      type: 'boolean'
    },
    oneToMany: {
      type: 'boolean'
    },
    sandbox: {
      type: 'boolean'
    },
    rdbms: rdbmsConfigSchema,
    delta: deltaSchema,
    transform: transformSchema,
    adaptorType: {
      type: 'string',
      const: 'RDBMSExport'
    }
  },
  required: ['name', '_connectionId', 'apiIdentifier', 'asynchronous', 'oneToMany', 'sandbox', 'rdbms', 'adaptorType']
};
