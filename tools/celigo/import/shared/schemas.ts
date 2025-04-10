import { JSONSchema7 } from 'json-schema';

// Shared schemas used across different import types
export const getImportsSchema: JSONSchema7 = {
  type: 'object',
  properties: {},
  required: [],
  additionalProperties: false,
  description: 'Get all imports (no parameters required)'
};

export const getImportByIdSchema: JSONSchema7 = {
  type: 'object',
  properties: {
    _id: {
      type: 'string',
      description: 'Import ID'
    }
  },
  required: ['_id']
};

// Base schema that all specific import schemas extend
export const baseImportSchema: JSONSchema7 = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      description: 'Import name',
    },
    _connectionId: {
      type: 'string',
      description: 'Connection ID',
    },
    apiIdentifier: {
      type: 'string',
      description: 'API identifier',
    },
    ignoreExisting: {
      type: 'boolean',
      default: false,
    },
    ignoreMissing: {
      type: 'boolean',
      default: false,
    },
    oneToMany: {
      type: 'boolean',
      default: false,
    },
    sandbox: {
      type: 'boolean',
      default: false,
    },
    adaptorType: {
      type: 'string',
      enum: ['HTTPImport', 'NetSuiteDistributedImport'],
      description: 'Type of import adaptor',
    }
  },
  required: ['name', '_connectionId', 'apiIdentifier', 'adaptorType']
};

// [REMOVED] Filter schema was previously used by NetSuite imports

// Base tool schema that specific import tools extend
export const importToolSchema: JSONSchema7 = {
  type: 'object',
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
export const importToolJsonSchema = {
  type: 'object',
  description: '[DEPRECATED] Create and manage imports. Please use specific import tools instead.',
  properties: importToolSchema.properties,
  required: importToolSchema.required,
  additionalProperties: false
} as const;
