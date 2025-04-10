export const salesforceConnectionSchema = {
  type: 'object',
  properties: {
    type: {
      type: 'string',
      const: 'salesforce',
      description: 'Connection type',
    },
    name: {
      type: 'string',
      description: 'Connection name',
    },
    offline: {
      type: 'boolean',
      description: 'Whether the connection is offline',
    },
    sandbox: {
      type: 'boolean',
      description: 'Whether to use sandbox environment',
    },
    salesforce: {
      type: 'object',
      properties: {
        sandbox: {
          type: 'boolean',
          description: 'Use Salesforce sandbox',
        },
        oauth2FlowType: {
          type: 'string',
          description: 'OAuth2 flow type',
        },
        packagedOAuth: {
          type: 'boolean',
          description: 'Use packaged OAuth',
        },
        scope: {
          type: 'array',
          items: {
            type: 'string',
          },
          description: 'OAuth scopes',
        },
        concurrencyLevel: {
          type: 'number',
          description: 'Concurrency level',
        },
      },
      required: ['oauth2FlowType'],
    },
    microServices: {
      type: 'object',
      properties: {
        disableNetSuiteWebServices: {
          type: 'boolean',
          default: false,
        },
        disableRdbms: {
          type: 'boolean',
          default: false,
        },
        disableDataWarehouse: {
          type: 'boolean',
          default: false,
        },
      },
      required: ['disableNetSuiteWebServices', 'disableRdbms', 'disableDataWarehouse'],
    },
    queues: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'Queue name',
          },
          size: {
            type: 'number',
            description: 'Queue size',
          },
        },
        required: ['name', 'size'],
      },
    },
  },
  required: ['type', 'name', 'salesforce', 'microServices'],
};
