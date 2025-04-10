import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { ListResourcesRequestSchema, ListResourceTemplatesRequestSchema, ReadResourceRequestSchema } from '@modelcontextprotocol/sdk/types.js';

export function setupResources(server: Server) {
  // List static resources
  server.setRequestHandler(ListResourcesRequestSchema, async () => ({
    resources: [
      // Connection Resources
      {
        uri: 'celigo://connections/http',
        name: 'HTTP Connection Template',
        mimeType: 'application/json',
        description: 'Template for HTTP connections with basic auth'
      },
      {
        uri: 'celigo://connections/graphql',
        name: 'GraphQL Connection Template',
        mimeType: 'application/json',
        description: 'Template for GraphQL connections with basic auth'
      },
      {
        uri: 'celigo://connections/ftp',
        name: 'FTP Connection Template',
        mimeType: 'application/json',
        description: 'Template for FTP connections'
      },
      {
        uri: 'celigo://connections/salesforce',
        name: 'Salesforce Connection Template',
        mimeType: 'application/json',
        description: 'Template for Salesforce connections'
      },

      // Export Resources
      {
        uri: 'celigo://exports/http',
        name: 'HTTP Export Template',
        mimeType: 'application/json',
        description: 'Template for HTTP exports'
      },
      {
        uri: 'celigo://exports/graphql',
        name: 'GraphQL Export Template',
        mimeType: 'application/json',
        description: 'Template for GraphQL exports'
      },
      {
        uri: 'celigo://exports/salesforce',
        name: 'Salesforce Export Template',
        mimeType: 'application/json',
        description: 'Template for Salesforce exports'
      },
      {
        uri: 'celigo://exports/netsuite',
        name: 'NetSuite Export Template',
        mimeType: 'application/json',
        description: 'Template for NetSuite exports'
      },

      // Import Resources
      {
        uri: 'celigo://imports/http',
        name: 'HTTP Import Template',
        mimeType: 'application/json',
        description: 'Template for HTTP imports'
      },
      {
        uri: 'celigo://imports/graphql',
        name: 'GraphQL Import Template',
        mimeType: 'application/json',
        description: 'Template for GraphQL imports'
      },
      {
        uri: 'celigo://imports/ftp',
        name: 'FTP Import Template',
        mimeType: 'application/json',
        description: 'Template for FTP imports'
      },
      {
        uri: 'celigo://imports/netsuite',
        name: 'NetSuite Import Template',
        mimeType: 'application/json',
        description: 'Template for NetSuite imports'
      },

      // Flow Resources
      {
        uri: 'celigo://flows/sequential',
        name: 'Sequential Flow Template',
        mimeType: 'application/json',
        description: 'Template for sequential export-import operations flow'
      },
      {
        uri: 'celigo://flows/parallel',
        name: 'Parallel Flow Template',
        mimeType: 'application/json',
        description: 'Template for parallel export-import operations flow'
      }
    ]
  }));

  // List resource templates
  server.setRequestHandler(ListResourceTemplatesRequestSchema, async () => ({
    resourceTemplates: [
      {
        uriTemplate: 'celigo://connections/{type}',
        name: 'Connection Template',
        mimeType: 'application/json',
        description: 'Template for different types of connections (http, graphql, ftp, salesforce)'
      },
      {
        uriTemplate: 'celigo://exports/{type}',
        name: 'Export Template',
        mimeType: 'application/json',
        description: 'Template for different types of exports (http, graphql, salesforce, netsuite)'
      },
      {
        uriTemplate: 'celigo://imports/{type}',
        name: 'Import Template',
        mimeType: 'application/json',
        description: 'Template for different types of imports (http, graphql, ftp, netsuite)'
      },
      {
        uriTemplate: 'celigo://flows/{type}',
        name: 'Flow Template',
        mimeType: 'application/json',
        description: 'Template for different types of flows (sequential, parallel)'
      }
    ]
  }));

  // Handle resource reading
  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const { uri } = request.params;
    let content = '';

    // Connection templates
    if (uri === 'celigo://connections/http') {
      content = JSON.stringify({
        type: "http",
        name: "",
        sandbox: false,
        http: {
          formType: "http",
          mediaType: "json",
          baseURI: "",
          auth: {
            type: "basic",
            basic: {
              username: "",
              password: ""
            }
          }
        }
      }, null, 2);
    }
    else if (uri === 'celigo://connections/graphql') {
      content = JSON.stringify({
        type: "http",
        name: "",
        offline: true,
        sandbox: false,
        http: {
          formType: "graph_ql",
          mediaType: "json",
          baseURI: "",
          ping: {
            relativeURI: "",
            method: "GET"
          },
          auth: {
            type: "basic",
            basic: {
              username: "",
              password: ""
            }
          }
        }
      }, null, 2);
    }
    else if (uri === 'celigo://connections/ftp') {
      content = JSON.stringify({
        type: "ftp",
        name: "",
        offline: true,
        sandbox: false,
        ftp: {
          type: "ftp",
          hostURI: "",
          username: "",
          password: "",
          port: 21,
          usePassiveMode: true,
          userDirectoryIsRoot: false
        }
      }, null, 2);
    }
    else if (uri === 'celigo://connections/salesforce') {
      content = JSON.stringify({
        type: "salesforce",
        name: "",
        offline: true,
        sandbox: false,
        salesforce: {
          sandbox: false,
          oauth2FlowType: "jwtBearerToken",
          packagedOAuth: true,
          scope: [],
          concurrencyLevel: 5
        }
      }, null, 2);
    }

    // Export templates
    else if (uri === 'celigo://exports/http') {
      content = JSON.stringify({
        name: "",
        _connectionId: "",
        apiIdentifier: "",
        asynchronous: true,
        oneToMany: false,
        sandbox: false,
        http: {
          relativeURI: "",
          method: "GET",
          formType: "http"
        },
        adaptorType: "HTTPExport"
      }, null, 2);
    }
    else if (uri === 'celigo://exports/graphql') {
      content = JSON.stringify({
        name: "",
        _connectionId: "",
        apiIdentifier: "",
        asynchronous: true,
        oneToMany: false,
        sandbox: false,
        http: {
          relativeURI: "",
          method: "GET",
          formType: "graph_ql",
          response: {
            resourcePath: "data"
          }
        },
        adaptorType: "HTTPExport"
      }, null, 2);
    }
    else if (uri === 'celigo://exports/salesforce') {
      content = JSON.stringify({
        name: "",
        _connectionId: "",
        apiIdentifier: "",
        asynchronous: true,
        oneToMany: false,
        sandbox: false,
        salesforce: {
          type: "soql",
          api: "rest",
          soql: {
            query: ""
          }
        },
        adaptorType: "SalesforceExport"
      }, null, 2);
    }
    else if (uri === 'celigo://exports/netsuite') {
      content = JSON.stringify({
        name: "",
        _connectionId: "",
        apiIdentifier: "",
        asynchronous: true,
        isLookup: false,
        oneToMany: false,
        sandbox: false,
        netsuite: {
          type: "restlet",
          skipGrouping: true,
          statsOnly: false,
          restlet: {
            recordType: "",
            searchId: "",
            criteria: [],
            columns: [],
            restletVersion: "suiteapp2.0",
            markExportedBatchSize: 100
          },
          distributed: {
            executionContext: [],
            executionType: []
          }
        },
        adaptorType: "NetSuiteExport"
      }, null, 2);
    }

    // Import templates
    else if (uri === 'celigo://imports/http') {
      content = JSON.stringify({
        name: "",
        _connectionId: "",
        apiIdentifier: "",
        ignoreExisting: false,
        ignoreMissing: false,
        oneToMany: false,
        sandbox: false,
        http: {
          relativeURI: [],
          method: ["POST"],
          body: [],
          batchSize: 1,
          sendPostMappedData: true,
          formType: "http"
        },
        adaptorType: "HTTPImport"
      }, null, 2);
    }
    else if (uri === 'celigo://imports/graphql') {
      content = JSON.stringify({
        name: "",
        _connectionId: "",
        apiIdentifier: "",
        ignoreExisting: false,
        ignoreMissing: false,
        oneToMany: false,
        sandbox: false,
        http: {
          relativeURI: ["/"],
          method: ["POST"],
          body: ["{\"query\":\"\"}"],
          sendPostMappedData: true,
          formType: "graph_ql"
        },
        adaptorType: "HTTPImport"
      }, null, 2);
    }
    else if (uri === 'celigo://imports/ftp') {
      content = JSON.stringify({
        name: "",
        _connectionId: "",
        apiIdentifier: "",
        oneToMany: false,
        sandbox: false,
        file: {
          fileName: "file-{{timestamp}}.csv",
          skipAggregation: false,
          type: "csv",
          csv: {
            rowDelimiter: "\\n",
            columnDelimiter: ",",
            includeHeader: true,
            wrapWithQuotes: false,
            replaceTabWithSpace: false,
            replaceNewlineWithSpace: false,
            truncateLastRowDelimiter: false
          }
        },
        ftp: {
          directoryPath: "",
          fileName: "file-{{timestamp}}.csv"
        },
        adaptorType: "FTPImport"
      }, null, 2);
    }
    else if (uri === 'celigo://imports/netsuite') {
      content = JSON.stringify({
        name: "",
        _connectionId: "",
        distributed: true,
        apiIdentifier: "",
        ignoreExisting: false,
        ignoreMissing: false,
        oneToMany: false,
        sandbox: false,
        lookups: [],
        netsuite_da: {
          restletVersion: "suiteapp2.0",
          operation: "add",
          recordType: "",
          lookups: [],
          mapping: {
            fields: [],
            lists: []
          }
        },
        adaptorType: "NetSuiteDistributedImport"
      }, null, 2);
    }

    // Flow templates
    else if (uri === 'celigo://flows/sequential') {
      content = JSON.stringify({
        name: "",
        pageGenerators: [{
          _exportId: "",
          skipRetries: false
        }],
        pageProcessors: [
          {
            type: "export",
            _exportId: "",
            responseMapping: {
              fields: [{
                extract: "data",
                generate: "result"
              }],
              lists: []
            }
          },
          {
            type: "import",
            _importId: "",
            responseMapping: {
              fields: [],
              lists: []
            }
          }
        ],
        free: false
      }, null, 2);
    }
    else if (uri === 'celigo://flows/parallel') {
      content = JSON.stringify({
        name: "",
        pageGenerators: [{
          _exportId: "",
          skipRetries: false
        }],
        pageProcessors: [
          {
            type: "import",
            _importId: "",
            proceedOnFailure: true,
            responseMapping: {
              fields: [{
                extract: "id",
                generate: "resultId"
              }],
              lists: []
            }
          }
        ],
        free: false
      }, null, 2);
    }

    return {
      contents: [{
        uri,
        mimeType: 'application/json',
        text: content
      }]
    };
  });
}
