import { jsonSchema } from 'ai';
import { JSONSchema7 } from 'json-schema';
import { IntegrationToolArgs } from '../types';

const flowGroupingSchema: JSONSchema7 = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      description: 'Flow grouping name'
    }
  },
  required: ['name'],
  additionalProperties: false
};

const integrationSchema: JSONSchema7 = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      description: 'Integration name'
    },
    flowGroupings: {
      type: 'array',
      description: 'Flow groupings',
      items: flowGroupingSchema
    }
  },
  required: ['name', 'flowGroupings'],
  additionalProperties: false
};

export const integrationToolSchema: JSONSchema7 = {
  type: 'object',
  description: 'Manage Celigo integrations',
  properties: {
    action: {
      type: 'string',
      enum: ['create', 'update', 'get', 'list'],
      description: 'Action to perform'
    },
    integrationId: {
      type: 'string',
      description: 'Integration ID (required for update/get)'
    },
    config: {
      ...integrationSchema,
      description: 'Integration configuration (required for create/update)'
    },
    _id: {
      type: 'string',
      description: 'Integration ID (alternative to integrationId)'
    }
  },
  required: ['action'],
  additionalProperties: false
};

// Export the schema wrapped with jsonSchema helper
export const integrationToolJsonSchema = jsonSchema<IntegrationToolArgs>(integrationToolSchema);

// Example usage:
/*
const createIntegrationExample = {
  "action": "create",
  "config": {
    "name": "My Integration",
    "flowGroupings": [
      { "name": "Sales Orders" },
      { "name": "Inventory" }
    ]
  }
};

const updateIntegrationExample = {
  "action": "update",
  "integrationId": "123",
  "config": {
    "name": "Updated Integration",
    "flowGroupings": [
      { "name": "Updated Group" }
    ]
  }
};

const getIntegrationExample = {
  "action": "get",
  "_id": "123"
};

const listIntegrationsExample = {
  "action": "list"
};
*/
