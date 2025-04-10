import { responseSchema, deltaSchema, transformSchema, filterSchema } from './shared.js';

// NetSuite search criteria operators should match shared filter operators
const netSuiteCriteriaSchema = {
  type: 'object',
  properties: {
    field: {
      type: 'string',
      description: 'Search field'
    },
    operator: {
      type: 'string',
      enum: [
        'equals',
        'notequals',
        'greaterthan',
        'greaterthanorequals',
        'lessthan',
        'lessthanorequals',
        'startswith',
        'endswith',
        'contains',
        'doesnotcontain',
        'empty',
        'notempty',
        'matches'
      ],
      description: 'Search operator (matches shared filter operators)'
    },
    searchValue: {
      type: 'string',
      description: 'Search value'
    }
  },
  required: ['field', 'operator']
};

export const netsuiteExportSchema = {
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
    type: {
      type: 'string',
      enum: ['delta'],
      description: 'Export type. Use "delta" for incremental data fetching based on lastExportDateTime'
    },
    netsuite: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          const: 'restlet',
          description: 'NetSuite export type'
        },
        skipGrouping: {
          type: 'boolean',
          default: true
        },
        statsOnly: {
          type: 'boolean',
          default: false
        },
        restlet: {
          type: 'object',
          properties: {
            recordType: {
              type: 'string',
              description: 'NetSuite record type'
            },
            searchId: {
              type: 'string',
              description: 'Search ID'
            },
            criteria: {
              type: 'array',
              items: netSuiteCriteriaSchema
            },
            markExportedBatchSize: {
              type: 'number',
              default: 100
            }
          },
          required: ['recordType', 'searchId']
        }
      },
      required: ['type', 'restlet']
    },
    asynchronous: {
      type: 'boolean',
      default: true
    },
    oneToMany: {
      type: 'boolean',
      default: false
    },
    sandbox: {
      type: 'boolean',
      default: false
    },
    filter: filterSchema,
    delta: deltaSchema,
    transform: transformSchema,
    adaptorType: {
      type: 'string',
      const: 'NetSuiteExport'
    }
  },
  required: ['name', '_connectionId', 'apiIdentifier', 'netsuite', 'adaptorType']
};
