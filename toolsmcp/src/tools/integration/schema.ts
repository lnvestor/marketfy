export const getIntegrationsSchema = {
  type: 'object',
  properties: {},
  required: [],
  additionalProperties: false,
  description: 'Get all integrations (no parameters required)'
};

export const getIntegrationByIdSchema = {
  type: 'object',
  properties: {
    _id: {
      type: 'string',
      description: 'Integration ID'
    }
  },
  required: ['_id']
};

export const createIntegrationSchema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      description: 'Integration name'
    },
    flowGroupings: {
      type: 'array',
      description: 'Flow groupings',
      items: {
        type: 'object',
        required: ['name'],
        properties: {
          name: {
            type: 'string',
            description: 'Flow grouping name'
          }
        },
        additionalProperties: false
      }
    }
  },
  required: ['name', 'flowGroupings'],
  additionalProperties: false
};

export const updateIntegrationSchema = {
  type: 'object',
  properties: {
    integrationId: {
      type: 'string',
      description: 'ID of the integration to update'
    },
    config: createIntegrationSchema
  },
  required: ['integrationId', 'config']
};
