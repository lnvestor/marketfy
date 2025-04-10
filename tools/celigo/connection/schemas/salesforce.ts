export const salesforceConnectionSchema = {
  type: 'object',
  properties: {
    type: {
      type: 'string',
      enum: ['salesforce'],
      description: 'Connection type'
    },
    name: {
      type: 'string',
      description: 'Connection name'
    },
    offline: {
      type: 'boolean',
      description: 'Whether the connection is offline'
    },
    sandbox: {
      type: 'boolean',
      description: 'Whether this is a sandbox connection'
    },
    salesforce: {
      type: 'object',
      required: [
        'sandbox',
        'oauth2FlowType',
        'packagedOAuth',
        'scope',
        'concurrencyLevel'
      ],
      properties: {
        sandbox: {
          type: 'boolean',
          description: 'Whether to use Salesforce sandbox environment'
        },
        oauth2FlowType: {
          type: 'string',
          description: 'OAuth 2.0 flow type'
        },
        packagedOAuth: {
          type: 'boolean',
          description: 'Whether to use packaged OAuth'
        },
        scope: {
          type: 'array',
          items: {
            type: 'string'
          },
          description: 'OAuth scopes'
        },
        concurrencyLevel: {
          type: 'number',
          minimum: 1,
          description: 'Concurrency level for API requests'
        }
      }
    },
    microServices: {
      type: 'object',
      properties: {
        disableNetSuiteWebServices: {
          type: 'boolean',
          description: 'Disable NetSuite web services'
        },
        disableRdbms: {
          type: 'boolean',
          description: 'Disable RDBMS'
        },
        disableDataWarehouse: {
          type: 'boolean',
          description: 'Disable data warehouse'
        }
      }
    },
    queues: {
      type: 'array',
      items: {
        type: 'object',
        required: ['name', 'size'],
        properties: {
          name: {
            type: 'string',
            description: 'Queue name'
          },
          size: {
            type: 'number',
            minimum: 1,
            description: 'Queue size'
          }
        }
      }
    }
  },
  required: ['type', 'name', 'salesforce'],
  additionalProperties: false
} as const;
