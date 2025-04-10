export const netsuiteConnectionSchema = {
  type: 'object',
  properties: {
    type: {
      type: 'string',
      const: 'netsuite',
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
    netsuite: {
      type: 'object',
      properties: {
        wsdlVersion: {
          type: 'string',
          description: 'NetSuite WSDL version',
          example: '2020.2',
        },
        concurrencyLevel: {
          type: 'number',
          default: 1,
          description: 'Concurrency level',
        },
      },
      required: ['wsdlVersion', 'concurrencyLevel'],
    },
    microServices: {
      type: 'object',
      properties: {
        disableRdbms: {
          type: 'boolean',
          default: false,
        },
      },
      required: ['disableRdbms'],
    },
  },
  required: ['type', 'name', 'netsuite', 'microServices'],
};
