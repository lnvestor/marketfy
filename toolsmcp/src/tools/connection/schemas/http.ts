export const httpConnectionSchema = {
  type: 'object',
  properties: {
    type: {
      type: 'string',
      const: 'http',
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
    http: {
      type: 'object',
      properties: {
        formType: {
          type: 'string',
          enum: ['http', 'graph_ql'],
          description: 'Form type for HTTP connections',
        },
        mediaType: {
          type: 'string',
          enum: ['json'],
          description: 'Media type',
        },
        baseURI: {
          type: 'string',
          description: 'Base URI for the endpoint',
        },
        unencrypted: {
          type: 'object',
          properties: {
            field: {
              type: 'string',
              description: 'Unencrypted field value',
            },
          },
        },
        encrypted: {
          type: 'string',
          description: 'Encrypted data',
        },
        auth: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              enum: ['basic', 'cookie', 'digest', 'token'],
              description: 'Authentication type',
            },
            basic: {
              type: 'object',
              properties: {
                username: {
                  type: 'string',
                  description: 'Basic/Digest auth username',
                },
                password: {
                  type: 'string',
                  description: 'Basic/Digest auth password',
                },
              },
              required: ['username', 'password'],
            },
            cookie: {
              type: 'object',
              properties: {
                uri: {
                  type: 'string',
                  description: 'Cookie auth URI',
                },
                method: {
                  type: 'string',
                  description: 'HTTP method for cookie auth',
                  enum: ['GET', 'POST'],
                },
              },
              required: ['uri', 'method'],
            },
            token: {
              type: 'object',
              properties: {
                token: {
                  type: 'string',
                  description: 'Authentication token',
                },
                location: {
                  type: 'string',
                  enum: ['body', 'header', 'url'],
                  description: 'Token location (body, header, or url)',
                },
                headerName: {
                  type: 'string',
                  description: 'Header name when using header location',
                },
                scheme: {
                  type: 'string',
                  enum: ['Bearer', 'custom', 'mac', 'None', ' '],
                  description: 'Authentication scheme (Bearer, custom, mac, None, or space for no scheme)',
                },
                paramName: {
                  type: 'string',
                  description: 'Parameter name for token',
                },
              },
              required: ['token', 'location', 'headerName', 'scheme', 'paramName'],
              allOf: [
                {
                  if: {
                    properties: { location: { const: 'header' } }
                  },
                  then: {
                    properties: {
                      scheme: {
                        enum: ['Bearer', 'custom', 'mac', 'None'],
                      },
                    },
                  }
                },
                {
                  if: {
                    properties: { location: { const: 'body' } }
                  },
                  then: {
                    properties: {
                      scheme: {
                        const: ' ',
                      },
                    },
                  }
                }
              ],
            },
          },
          required: ['type'],
          allOf: [
            {
              if: {
                properties: { type: { const: 'basic' } }
              },
              then: {
                required: ['basic']
              }
            },
            {
              if: {
                properties: { type: { const: 'cookie' } }
              },
              then: {
                required: ['cookie']
              }
            },
            {
              if: {
                properties: { type: { const: 'digest' } }
              },
              then: {
                required: ['basic']
              }
            },
            {
              if: {
                properties: { type: { const: 'token' } }
              },
              then: {
                required: ['token']
              }
            }
          ],
        },
        ping: {
          type: 'object',
          properties: {
            relativeURI: {
              type: 'string',
              description: 'Relative URI for ping endpoint',
            },
            method: {
              type: 'string',
              description: 'HTTP method for ping',
            },
          },
        },
      },
      required: ['formType', 'mediaType', 'baseURI', 'auth'],
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
  required: ['type', 'name', 'http', 'microServices'],
};
