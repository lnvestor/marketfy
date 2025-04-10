import { JSONSchema7 } from 'json-schema';
import { jsonSchema } from 'ai';
import { HttpConnectionToolParameters } from './types';

export const httpConnectionSchema: JSONSchema7 = {
  type: 'object',
  properties: {
    type: {
      type: 'string',
      enum: ['http'],
      description: 'Connection type to specify HTTP(S) protocol for connecting to another server via an API. The HTTP protocol allows you to provide credentials and perform requests to different cloud applications.'
    },
    name: {
      type: 'string',
      description: 'Enter a unique name for your connection so that you can easily reference it from other parts of the application'
    },
    offline: {
      type: 'boolean',
      description: 'Indicates if the connection is currently offline and unavailable for use. An automated batch process runs periodically to ping offline connections and try to bring them back online.'
    },
    sandbox: {
      type: 'boolean',
      description: 'Set to true for test/sandbox environments, false for production environments. Indicates this connection is used for testing purposes and not production data.'
    },
    http: {
      type: 'object',
      required: ['formType', 'mediaType', 'baseURI', 'auth'],
      properties: {
        formType: {
          type: 'string',
          enum: ['http', 'graph_ql'],
          description: 'Specifies the format and structure of the request. Use "http" for standard REST APIs or "graph_ql" for GraphQL APIs that require specific query structures.'
        },
        mediaType: {
          type: 'string',
          enum: ['json'],
          description: 'Specifies the data format to use in the HTTP request body and response body. Options include: JSON, Multipart/form-data, Plain text, URL encoded, and XML. For JSON APIs, select JSON.'
        },
        baseURI: {
          type: 'string',
          description: 'Enter the common part of an API\'s URL, used across all of the HTTP endpoints you will invoke. For example, https://api.example.com/v2'
        },
        unencrypted: {
          type: 'object',
          properties: {
            field: {
              type: 'string',
              description: 'Use this JSON field to store all non-security-sensitive fields needed to access the application. For example: {\'email\':\'my_email@company.com\', \'accountId\': \'5765432\', \'role\': \'admin\'}'
            }
          },
          required: ['field']
        },
        encrypted: {
          type: 'string',
          description: 'Use this encrypted JSON setting to store all security-sensitive fields needed to access the application. For example, {\'password\': \'ayTb53Img!do\'} or {\'token\': \'x7ygd4njlwerf63nhg\'}'
        },
        auth: {
          type: 'object',
          required: ['type'],
          properties: {
            type: {
              type: 'string',
              enum: ['basic', 'token'],
              description: 'Authentication type. Options include Basic (username/password) and Token authentication.'
            },
            basic: {
              type: 'object',
              required: ['username', 'password'],
              properties: {
                username: {
                  type: 'string',
                  description: 'Username for Basic authentication. When this auth type is selected, integrator.io will include in the request header field Authorization: Basic <credentials>, where credentials is the Base64 encoding of your ID and password joined by a single colon (:).'
                },
                password: {
                  type: 'string',
                  description: 'Password for Basic authentication. Will be encoded along with username in the Authorization header.'
                }
              }
            },
            token: {
              type: 'object',
              required: ['token', 'location'],
              properties: {
                token: {
                  type: 'string',
                  description: 'The API token or access token value for authentication'
                },
                location: {
                  type: 'string',
                  enum: ['header', 'body', 'url'],
                  description: 'Where to place the token: in the request header, body, or URL query parameters'
                },
                headerName: {
                  type: 'string',
                  description: 'The name of the header field when token is sent via header (e.g., "Authorization")'
                },
                scheme: {
                  type: 'string',
                  description: 'Token scheme to use when sending via header (e.g., "Bearer", "MAC", or leave as space " " for no scheme)'
                },
                paramName: {
                  type: 'string',
                  description: 'Parameter name when sending token via body or URL (e.g., "access_token")'
                }
              }
            }
          }
        },
        ping: {
          type: 'object',
          properties: {
            relativeURI: {
              type: 'string',
              description: 'Enter a URI to an authenticated endpoint (relative to your Base URI) that integrator.io will use to verify that a connection is working properly. For example: /me, /tokenInfo, or /currentTime.'
            },
            method: {
              type: 'string',
              description: 'HTTP method to use when making the ping request. Most APIs use GET for simple verification endpoints.'
            }
          },
          required: ['relativeURI', 'method']
        }
      }
    },
    microServices: {
      type: 'object',
      properties: {
        disableNetSuiteWebServices: {
          type: 'boolean',
          description: 'If true, disables NetSuite web services for this connection'
        },
        disableRdbms: {
          type: 'boolean',
          description: 'If true, disables RDBMS services for this connection'
        },
        disableDataWarehouse: {
          type: 'boolean',
          description: 'If true, disables data warehouse services for this connection'
        }
      }
    }
  },
  required: ['type', 'name', 'http'],
  additionalProperties: false
} as const;

export const httpConnectionToolSchema: JSONSchema7 = {
  type: 'object',
  description: 'Create and manage HTTP connections in Celigo. HTTP connections allow you to connect to cloud applications that expose an API based on HTTP standards, providing credentials and performing requests to these applications.',
  properties: {
    action: {
      type: 'string',
      enum: ['create', 'update', 'get', 'list', 'delete'],
      description: 'Action to perform on the HTTP connection: create a new connection, update an existing one, retrieve connection details, list available connections, or delete a connection'
    },
    connectionId: {
      type: 'string',
      description: 'Unique identifier for the connection. Required for update, get, and delete operations on existing connections'
    },
    config: httpConnectionSchema,
    limit: {
      type: 'number',
      minimum: 1,
      description: 'Maximum number of connections to return when listing connections. Controls pagination size for large result sets'
    },
    offset: {
      type: 'number',
      minimum: 0,
      description: 'Number of connections to skip when listing connections. Use with limit for paginating through large result sets'
    }
  },
  required: ['action'],
  additionalProperties: false
} as const;

// Export the schema wrapped with jsonSchema helper
export const httpConnectionToolJsonSchema = jsonSchema<HttpConnectionToolParameters>(httpConnectionToolSchema);
