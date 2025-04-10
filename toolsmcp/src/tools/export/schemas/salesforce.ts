import { responseSchema, deltaSchema, transformSchema } from './shared.js';

const salesforceSOQLSchema = {
  type: 'object',
  properties: {
    query: {
      type: 'string',
      description: 'SOQL query string'
    }
  },
  required: ['query']
};

const salesforceConfigSchema = {
  type: 'object',
  properties: {
    type: {
      type: 'string',
      const: 'soql'
    },
    api: {
      type: 'string',
      const: 'rest'
    },
    soql: salesforceSOQLSchema,
    response: responseSchema
  },
  required: ['type', 'api', 'soql']
};

export const salesforceExportSchema = {
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
    salesforce: salesforceConfigSchema,
    delta: deltaSchema,
    transform: transformSchema,
    adaptorType: {
      type: 'string',
      const: 'SalesforceExport'
    }
  },
  required: ['name', '_connectionId', 'apiIdentifier', 'asynchronous', 'oneToMany', 'sandbox', 'salesforce', 'adaptorType']
};
