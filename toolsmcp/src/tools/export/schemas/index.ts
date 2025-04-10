export * from './shared.js';
export * from './http.js';
export * from './netsuite.js';
export * from './salesforce.js';
export * from './rdbms.js';

import { httpExportSchema } from './http.js';
import { netsuiteExportSchema } from './netsuite.js';
import { salesforceExportSchema } from './salesforce.js';
import { rdbmsExportSchema } from './rdbms.js';

export const createExportSchema = {
  type: 'object',
  oneOf: [
    httpExportSchema,
    netsuiteExportSchema,
    salesforceExportSchema,
    rdbmsExportSchema
  ]
};

export const getExportsSchema = {
  type: 'object',
  properties: {},
  required: [],
  additionalProperties: false,
  description: 'Get all exports (no parameters required)'
};

export const getExportByIdSchema = {
  type: 'object',
  properties: {
    _id: {
      type: 'string',
      description: 'Export ID'
    }
  },
  required: ['_id']
};

export const updateExportSchema = {
  type: 'object',
  properties: {
    exportId: {
      type: 'string',
      description: 'ID of the export to update'
    },
    config: {
      type: 'object',
      oneOf: [
        httpExportSchema,
        netsuiteExportSchema,
        salesforceExportSchema,
        rdbmsExportSchema
      ]
    }
  },
  required: ['exportId', 'config']
};
