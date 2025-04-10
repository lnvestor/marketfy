import { responseSchema, deltaSchema, transformSchema, filterSchema } from './shared.js';

// HTTP Paging schemas
const pagePagingSchema = {
  type: 'object',
  description: 'Page-based pagination configuration',
  properties: {
    method: {
      type: 'string',
      const: 'page',
      description: 'Page-based pagination'
    },
    page: {
      type: 'number',
      description: 'Current page number. Used in relativeURI as {{export.http.paging.page}}'
    }
  },
  required: ['method', 'page']
};

const linkHeaderPagingSchema = {
  type: 'object',
  description: 'Link header based pagination configuration',
  properties: {
    method: {
      type: 'string',
      const: 'linkheader',
      description: 'Link header based pagination'
    },
    lastPageStatusCode: {
      type: 'number',
      description: 'HTTP status code indicating last page (e.g. 404)'
    },
    linkHeaderRelation: {
      type: 'string',
      description: 'Link header relation to use (e.g. "next", "prev")'
    }
  },
  required: ['method', 'lastPageStatusCode']
};

const pagingSchema = {
  description: 'Pagination configuration at HTTP level. Do not put pagination in response.',
  oneOf: [
    pagePagingSchema,
    linkHeaderPagingSchema
  ]
};

export const httpExportSchema = {
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
    http: {
      type: 'object',
      description: 'HTTP configuration. IMPORTANT: Pagination goes in "paging", not in "response".',
      properties: {
        relativeURI: {
          type: 'string',
          description: 'Relative URI for the endpoint.\n' +
            'For delta exports: {{dateFormat "format" lastExportDateTime "format" "timezone"}}\n' +
            'For page paging: {{export.http.paging.page}}\n' +
            'Example: /api/orders?page={{export.http.paging.page}}&fromDate={{dateFormat "YYYY-MM-DDTHH:mm:ss" lastExportDateTime "YYYY-MM-DDTHH:mm:ss" "America/Chicago"}}'
        },
        method: {
          type: 'string',
          enum: ['GET', 'POST', 'PUT', 'DELETE'],
          description: 'HTTP method'
        },
        formType: {
          type: 'string',
          enum: ['http', 'graph_ql'],
          description: 'Form type'
        },
        parameters: {
          type: 'object',
          additionalProperties: {
            type: 'string'
          },
          description: 'Query parameters. For delta exports, consider using relativeURI with dateFormat helper instead'
        },
        body: {
          type: 'string',
          description: 'Request body. For delta exports with POST, can include dateFormat helper in JSON body'
        },
        isRest: {
          type: 'boolean',
          description: 'Whether this is a REST endpoint'
        },
        response: responseSchema,  // This schema prevents pagination in response
        paging: pagingSchema      // Pagination belongs here at HTTP level
      },
      required: ['relativeURI', 'method', 'formType']
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
      const: 'HTTPExport'
    }
  },
  required: ['name', '_connectionId', 'apiIdentifier', 'http', 'adaptorType']
};
