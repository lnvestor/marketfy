import { JSONSchema7 } from 'json-schema';
import { jsonSchema } from 'ai';
import { HttpExportToolArgs } from './types';

// Main HTTP Export schema
export const httpExportSchema = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  type: 'object',
  properties: {
    name: {
      type: 'string',
      description: '1. REQUIRED: Unique identifier for this export configuration.\n2. Choose a descriptive name that clearly indicates the purpose and data source (e.g., \'Shopify New Orders Export\', \'Acumatica Daily Inventory Delta\').\n3. Use consistent naming conventions across your integrations.\n4. Should be unique within your integration environment to avoid confusion.\n5. Examples: \'Shopify_Orders_Delta\', \'Acumatica_Customers_Full\', \'SalesForce_Opportunities_Weekly\'.'
    },
    _connectionId: {
      type: 'string',
      description: '1. REQUIRED: Reference to a pre-configured HTTP connection.\n2. The connection contains authentication credentials (OAuth tokens, API keys, etc.).\n3. Also includes the base URI that will be prepended to the relativeURI.\n4. Use existing connections when possible for security and maintainability.\n5. Format: UUID string (e.g., \'60f5e1c2-3cd9-4c38-89a3-1d02c0b30822\').'
    },
    apiIdentifier: {
      type: 'string',
      description: '1. REQUIRED: Unique identifier for this specific API endpoint.\n2. Used for tracking requests and errors in system logs.\n3. Should be specific to this export but reusable across environments.\n4. Use lowercase with underscores for consistency.\n5. Examples: \'shopify_orders_api\', \'acumatica_inventory_api\', \'salesforce_opportunities_api\'.'
    },
    type: {
      type: 'string',
      enum: ['delta'],
      description: '1. REQUIRED: Determines how data is retrieved from the source.\n2. When set to \'delta\', only data changed since the last successful export run is retrieved.\n3. Delta exports MUST use lastExportDateTime in the relativeURI or request body.\n4. Delta exports help minimize data transfer and processing overhead.\n5. Delta exports require proper configuration of the \'delta\' section with dateFormat.\n6. For full exports that don\'t use timestamps, leave this field unset.'
    },
    http: {
      type: 'object',
      description: '1. REQUIRED: Core configuration for the HTTP request that fetches data.\n2. This section defines exactly how the system will communicate with the external API.\n3. Contains all details about the endpoint, request method, parameters, and response handling.\n4. Critical for proper API interaction - errors here will cause the entire export to fail.\n5. Must match the API documentation of the target system exactly.',
      properties: {
        relativeURI: {
          type: 'string',
          description: '1. REQUIRED: The API endpoint path relative to the connection\'s base URI.\n2. Forms the exact URL that will be called by appending to the base URI from the connection.\n3. For delta exports, MUST include lastExportDateTime using handlebars syntax: {{dateFormat "YYYY-MM-DDTHH:mm:ssZ" lastExportDateTime "YYYY-MM-DDTHH:mm:ssZ" "UTC"}}.\n4. For page-based pagination, include the page parameter: /api/customers?page={{export.http.paging.page}}&limit=100.\n5. Can combine delta and pagination: /api/orders?since={{dateFormat "YYYY-MM-DD" lastExportDateTime "YYYY-MM-DD" "UTC"}}&page={{export.http.paging.page}}.\n6. Supports query parameters directly in the URI or in the separate parameters object.\n7. Examples: \n   - \'/v1/orders\'\n   - \'/products?status=active&limit=100\'\n   - \'/customers?created_after={{dateFormat "YYYY-MM-DD" lastExportDateTime "YYYY-MM-DD" "UTC"}}\'.'
        },
        method: {
          type: 'string',
          enum: ['GET', 'POST', 'PUT', 'DELETE'],
          description: '1. REQUIRED: HTTP method to use for the API request.\n2. Most data retrieval APIs use GET for fetching data.\n3. Some APIs require POST even for data retrieval, especially for complex queries or GraphQL.\n4. PUT and DELETE are rarely used for exports but may be needed for specific API designs.\n5. Must match the method specified in the API documentation exactly.\n6. Examples:\n   - GET: Standard retrieval of resources (most common for exports)\n   - POST: Complex queries, especially with request bodies, filters, or GraphQL\n   - PUT: Uncommon for exports, but may be required by specific APIs\n   - DELETE: Very rare for exports, only used in special cases'
        },
        formType: {
          type: 'string',
          enum: ['http', 'graph_ql'],
          description: '1. REQUIRED: Specifies the format and structure of the request.\n2. Options:\n   - \'http\': Standard REST API requests (most common)\n   - \'graph_ql\': GraphQL API requests with queries in the request body\n3. For \'http\', the standard HTTP headers and parameters are used.\n4. For \'graph_ql\', the request body should contain a GraphQL query string.\n5. Must match the API type you\'re connecting to.'
        },
        parameters: {
          type: 'object',
          additionalProperties: {
            type: 'string'
          },
          description: '1. OPTIONAL: Query parameters as key-value pairs.\n2. Alternative to embedding parameters directly in the relativeURI.\n3. Parameters defined here will be appended to the URL as ?key1=value1&key2=value2.\n4. Useful for keeping the relativeURI clean and readable.\n5. For delta exports, you may use parameters or include them in relativeURI, but not both.\n6. Values are strings only - numbers and booleans must be converted to strings.\n7. Examples:\n   - {"limit": "100", "status": "active"}\n   - {"modified_after": "{{dateFormat \\"YYYY-MM-DD\\" lastExportDateTime \\"YYYY-MM-DD\\" \\"UTC\\"}}"}\n   - {"fields": "id,name,email,created_at,updated_at"}'
        },
        body: {
          type: 'string',
          description: '1. OPTIONAL: Request body content for POST/PUT requests.\n2. Required when method is POST or PUT and the API expects a request body.\n3. For REST APIs: typically JSON format represented as a string.\n4. For GraphQL: contains the query string and variables.\n5. Can include handlebars expressions for dynamic values like lastExportDateTime.\n6. The body is sent as-is, so must be properly formatted for the API.\n7. IMPORTANT: For POST requests with delta export, include dateFormat in the body if needed.\n8. Examples:\n   - Simple JSON: \'{"status": "active", "limit": 100}\'\n   - With date filter: \'{"filters": {"created_after": "{{dateFormat \\"YYYY-MM-DD\\" lastExportDateTime \\"YYYY-MM-DD\\" \\"UTC\\"}}"}}\'  \n   - GraphQL: \'{"query": "{ orders(first: 50, createdAt: {min: \\"{{dateFormat \\"YYYY-MM-DD\\" lastExportDateTime \\"YYYY-MM-DD\\" \\"UTC\\"}}\\"}) { edges { node { id orderNumber } } } }"}\'\n   - Complex structure: \'{"search": {"filters": [{"field": "lastModifiedDate", "operator": "greaterThan", "value": "{{dateFormat \\"YYYY-MM-DDTHH:mm:ss\\" lastExportDateTime \\"YYYY-MM-DDTHH:mm:ss\\" \\"UTC\\"}}\"}, {"field": "status", "operator": "equals", "value": "active"}]}}\''
        },
        isRest: {
          type: 'boolean',
          description: '1. OPTIONAL: Indicates if this endpoint follows REST conventions.\n2. Set to true for standard REST APIs (most common).\n3. Set to false for non-REST APIs like SOAP, GraphQL, or custom API protocols.\n4. Affects how the system handles certain HTTP behaviors and error responses.\n5. Default: true'
        },
        response: {
          type: 'object',
          description: '1. REQUIRED: Configuration for parsing and extracting data from the API response.\n2. Defines how to locate the actual data records within potentially complex response structures.\n3. IMPORTANT: For pagination configuration, use http.paging instead of putting pagination details here.\n4. Critical for APIs that nest data records within wrapper objects or metadata.\n5. Determines what data is passed to subsequent steps in the integration flow.',
          properties: {
            resourcePath: {
              type: 'string',
              description: '1. REQUIRED: JSON path to the array of records in the response.\n2. Uses dot notation to navigate through nested objects to find the data array.\n3. Leave empty if records are at the root level of the response.\n4. For nested data, specify the exact path to reach the array of records.\n5. If the response is wrapped in a container, this path extracts just the data array.\n6. Works with arrays of objects and can automatically convert arrays of arrays to objects.\n7. Examples:\n   - Empty: Records are at the root\n   - \'data\': Records are in the \'data\' property\n   - \'response.items\': Records are in the \'items\' property within the \'response\' object\n   - \'results.customers\': Records are in the \'customers\' array within the \'results\' object\n   - \'data.orders.edges.node\': For GraphQL responses with connection patterns\n   - \'values\': For spreadsheet-like data that may need header processing'
            },
            twoDArray: {
              type: 'object',
              description: '1. OPTIONAL: Configuration for handling responses with arrays of arrays (tabular data).\n2. Useful for spreadsheet-like data, CSV data converted to JSON, or report-style outputs.\n3. When configured properly, can convert arrays of arrays into usable objects with keys.\n4. Only needed when the response data is structured as an array of arrays.\n5. Examples:\n   - Spreadsheet API responses\n   - CSV data converted to JSON\n   - Database query results in tabular format',
              properties: {
                doNotNormalize: {
                  type: 'boolean',
                  description: '1. REQUIRED (if twoDArray used): Controls whether to keep or flatten nested array structure.\n2. If true: maintains the original array of arrays structure.\n3. If false: flattens arrays into normalized objects with auto-generated numeric keys.\n4. For spreadsheet-like data with headers, set to false to convert to objects.\n5. Default: false (recommended for most use cases)'
                },
                hasHeader: {
                  type: 'boolean',
                  description: '1. REQUIRED (if twoDArray used): Indicates if the first row contains column headers.\n2. If true: uses the first row as property names for all subsequent rows.\n3. If false: assigns numeric properties (0, 1, 2, etc.) to all values.\n4. When true, the transformation is:\n   [["Name", "Age"], ["John", 25], ["Mary", 30]]\n   becomes\n   [{"Name":"John", "Age":25}, {"Name":"Mary", "Age":30}]\n5. When false, the transformation is:\n   [["John", 25], ["Mary", 30]]\n   becomes\n   [{"0":"John", "1":25}, {"0":"Mary", "1":30}]\n6. Default: false'
                }
              },
              required: ['doNotNormalize', 'hasHeader']
            }
          },
          required: ['resourcePath'],
          additionalProperties: false
        },
        paging: {
          type: 'object',
          description: '1. OPTIONAL: Configuration for handling paginated API responses.\n2. Defines how to navigate through multiple pages of results efficiently.\n3. Seven different pagination methods are supported based on API requirements.\n4. Choose the appropriate method based on the API documentation.\n5. Each method has specific configuration options relevant to that pagination style.\n6. For dedicated connectors that Celigo has created, these settings are configured automatically.\n7. For universal connectors, you must configure the correct pagination strategy based on the API documentation.',
          properties: {
            method: {
              type: 'string',
              enum: ['relativeuri', 'body', 'linkheader', 'token', 'url', 'page', 'skip'],
              description: '1. REQUIRED: Specifies which pagination mechanism to use.\n2. Options:\n   - relativeuri: Custom relative URI for next page (used by Stripe, HubSpot)\n   - body: Custom request body for next page (used by Square, Skuvault)\n   - linkheader: Link headers containing next page URL (used by Shopify, GitHub, Zendesk, Recurly)\n   - token: Next page token in response body (used by Amazon, Slack, Klaviyo, Chargebee)\n   - url: Complete next page URL in response body (used by Asana, Reverb, Dynamics Business Central)\n   - page: Page number parameter (used by BigCommerce, eBay, Zoho, DCLcorp)\n   - skip: Skip/offset parameter (used by OpenAir, Acumatica, QBO/Intuit)\n3. Select the method that matches your API documentation.\n4. Review API documentation carefully as terminology for pagination varies across services.'
            },
            // Common properties
            lastPageStatusCode: {
              type: 'number',
              description: '1. OPTIONAL: HTTP status code that indicates the last page has been reached.\n2. Typically 404 (Not Found) when requesting a page beyond available data.\n3. Can also be 204 (No Content) or other codes depending on the API.\n4. This field only needs to be set if the HTTP status code for the last page is not 404.\n5. For example, an API could return a generic 400 status code instead, and then use a field in the HTTP response body to indicate no more pages are available.\n6. Used to detect when pagination should stop.\n7. Check API documentation for the correct code.'
            },
            lastPagePath: {
              type: 'string',
              description: '1. OPTIONAL: JSON path to a field in the HTTP response that indicates pagination is complete.\n2. Used with lastPageValues to determine when to stop requesting more pages.\n3. This field only needs to be set if the API returns a field in the HTTP response body to indicate paging is complete.\n4. For example, if an API returns the field \'errorMessage\' with the value \'No more pages\' to indicate paging is done, then you would set this field to \'errorMessage\'.\n5. Examples:\n   - "meta.hasMore": Check if a hasMore field exists in the meta object\n   - "data.pagination.moreResults": Check a boolean flag in a nested pagination object\n   - "errorMessage": Check for error messages indicating no more data'
            },
            lastPageValues: {
              type: 'array',
              items: { type: 'string' },
              description: '1. OPTIONAL: Values that indicate the last page has been reached when found at lastPagePath.\n2. Multiple values can be specified for different API responses as a comma-separated list.\n3. This field limits the exact values in the HTTP response body field that should be used to determine if paging is complete.\n4. For example, if an API returns the field \'errorMessage\' with the value \'No more pages\' to indicate paging is done, then you would set this field to include "No more pages".\n5. Common examples: ["false", "0", "null", "", "No more pages", "End of results"]\n6. When the value at lastPagePath matches any value in this array, pagination stops.'
            },
            
            // For relativeuri method (Example 1)
            relativeURI: {
              type: 'string',
              description: '1. OPTIONAL: The URI template for subsequent page requests when using method=relativeuri.\n2. While technically optional, this field is RECOMMENDED as a best practice when the pagination method is set to relativeuri.\n3. Can include handlebars expressions like {{export.http.paging.token}}.\n4. Overrides the main relativeURI for all requests after the first.\n5. Used when the API provides an ID or token as part of a page response that is then used in the URL for the next request.\n6. Used by APIs like Stripe and HubSpot.\n7. This field only needs to be set if subsequent page requests require a different relative URI than the primary URI.\n8. Example: "/api/v2/customers?continuation={{export.http.paging.token}}"\n9. Services using this method: Stripe, HubSpot'
            },
            
            // For body method (Example 2)
            body: {
              type: 'string',
              description: '1. OPTIONAL: The request body template for subsequent page requests when using method=body.\n2. While technically optional, this field is RECOMMENDED as a best practice when the pagination method is set to body.\n3. Can include handlebars expressions like {{export.http.paging.token}} or {{add previous_page.last_record.page 1}}.\n4. Overrides the main request body for all requests after the first.\n5. Used when paging is tracked by a value included in the POST request body.\n6. This field only needs to be set if subsequent page requests require a different HTTP request body than the primary body.\n7. You can access values from the previous page using the previous_page.last_record or previous_page.full_response objects.\n8. Example: "{\\"pagination\\": {\\"token\\": \\"{{export.http.paging.token}}\\"}}" or "{\\"page\\": {{add previous_page.last_record.page 1}}, \\"pageSize\\": 100}"\n9. Services using this method: Square, Skuvault'
            },
            
            // For linkheader method (Example 3)
            linkHeaderRelation: {
              type: 'string',
              description: '1. OPTIONAL: Specifies which link relation to follow for the next page when using method=linkheader.\n2. Default value is "next", which works for most APIs.\n3. Some APIs may use different relation names like "nextpage" or "forward".\n4. Used when the API provides links to subsequent pages in the link header of the API response.\n5. By default, integrator.io looks for the next page URL within a dedicated link header value.\n6. Format example: Link: <https://api.example.com/items?page=3>; rel="next"\n7. Only override this value if the API doesn\'t use the standard "next" relation.\n8. Services using this method: Shopify, GitHub, Greenhouse, Liquidplanner, Okta, Square, Zendesk, Recurly'
            },
            
            // For token method (Example 4)
            path: {
              type: 'string',
              description: '1. OPTIONAL: JSON path to the field containing the next page token or URL.\n2. While technically optional, this field is RECOMMENDED as a best practice when using the token or url pagination methods.\n3. Uses dot notation to navigate to the field for JSON (e.g., "data.pagination.nextToken").\n4. Uses XPath for XML responses (e.g., "/result/paging/nextPageToken").\n5. For GraphQL responses, may need to navigate complex structures.\n6. Format depends on the media type/content type of the response.\n7. Paging terminates when no value is found at the specified path (final page reached).\n8. Examples:\n   - "meta.nextToken": Extract token from a meta object\n   - "data.productVariants.pageInfo.endCursor": Extract cursor from GraphQL response\n   - "pagination.nextPage": Extract next page token\n9. Services using this method: Amazon, Slack, Stripe, Klaviyo, Chargebee'
            },
            pathLocation: {
              type: 'string',
              enum: ['body', 'header'],
              description: '1. OPTIONAL: Specifies where to look for the pagination token or URL.\n2. Options:\n   - body: Look in the response body (default)\n   - header: Look in a specific response header\n3. Most APIs return the token/URL in the response body, but some may include it in a custom header.\n4. Only needed if the token is returned in a header rather than the response body.\n5. Default: "body"'
            },
            pathAfterFirstRequest: {
              type: 'string',
              description: '1. OPTIONAL: Alternate path to use after the first request.\n2. Some APIs return the token in a different location after the initial request.\n3. Uses the same dot notation syntax as path.\n4. Only needs to be set if subsequent page requests return a different response structure.\n5. Example: For initial request, token at "meta.pagination.first", subsequent at "meta.pagination.next"'
            },
            initialTokenValue: {
              type: 'string',
              description: '1. OPTIONAL: Initial token value to use for the first request.\n2. This field only needs to be set if the initial export request should contain a specific token value.\n3. For most APIs, this can be left empty and the first request will be made without a token.'
            },
            
            // For page method (Example 6)
            page: {
              type: 'number',
              description: '1. OPTIONAL: The starting page number (typically 1 or 0).\n2. While technically optional, this field is RECOMMENDED as a best practice when the pagination method is set to page.\n3. Some APIs start with page=1, others with page=0.\n4. Check API documentation for the correct starting page.\n5. The page parameter will be automatically incremented for subsequent pages.\n6. Used in relativeURI as {{export.http.paging.page}}.\n7. Example URI: "/api/orders?page={{export.http.paging.page}}&limit=100"\n8. Services using this method: BigCommerce, eBay, Zoho, DCLcorp, BackInStock.org\n9. Default: 1'
            },
            totalPagesPath: {
              type: 'string',
              description: '1. OPTIONAL: JSON path to the field containing the total number of pages.\n2. Some APIs return the total number of pages available in each page response.\n3. This field can be used as a trigger to stop making page requests.\n4. When this page count is met, no more page requests will be made.\n5. If omitted, requests continue until no resources are returned or a lastPageStatusCode response is encountered.\n6. Consider adding this field as a best practice when the API provides total page information.\n7. Example: "pagination.totalPages" or "meta.pageCount"'
            },
            totalResultsPath: {
              type: 'string',
              description: '1. OPTIONAL: JSON path to the field containing the total number of results.\n2. Some APIs return the total number of resources available in each page response.\n3. This field can be used as a trigger to stop making page requests.\n4. When all resources have been retrieved, no more page requests will be made.\n5. If omitted, requests continue until no resources are returned or a lastPageStatusCode response is encountered.\n6. Consider adding this field as a best practice when the API provides total result information.\n7. Example: "pagination.totalItems" or "meta.total"'
            },
            
            // For skip method (Example 7)
            skip: {
              type: 'number',
              description: '1. OPTIONAL: The initial skip/offset value (typically 0).\n2. While technically optional, this field is RECOMMENDED as a best practice when the pagination method is set to skip.\n3. For each subsequent request, this value is increased by the number of records received.\n4. Used with APIs that use skip-take, offset, or limit pagination mechanisms.\n5. Used in relativeURI as {{export.http.paging.skip}}.\n6. Example URI: "/api/customers?offset={{export.http.paging.skip}}&limit=100"\n7. Services using this method: OpenAir, Acumatica, QBO/Intuit QuickBooks, Acton\n8. Default: 0'
            }
          },
          required: ['method']
        }
      },
      required: ['relativeURI', 'method', 'formType']
    },
    asynchronous: {
      type: 'boolean',
      default: true,
      description: '1. OPTIONAL: Controls whether this export runs synchronously or asynchronously.\n2. When true (default): Export runs in the background, allowing immediate response.\n3. When false: Export blocks until completion, suitable for time-sensitive operations.\n4. For most exports, leave as true for better performance and scalability.\n5. Set to false only for exports that must complete before continuing the flow.\n6. Default: true'
    },
    oneToMany: {
      type: 'boolean',
      default: false,
      description: '1. OPTIONAL: Indicates if each exported record can expand to multiple records.\n2. When true: Each source record may generate multiple target records in transformations.\n3. When false (default): One-to-one mapping between source and target records.\n4. Set to true when using transformations that extract arrays into separate records.\n5. Affects how record counts are calculated and reported.\n6. Default: false'
    },
    sandbox: {
      type: 'boolean',
      default: false,
      description: '1. OPTIONAL: Marks this export as a sandbox/test configuration.\n2. When true: Export is considered non-production and for testing only.\n3. When false (default): Export is considered a production configuration.\n4. Useful for development, testing, and UAT environments.\n5. Does not affect functionality but helps with environment management.\n6. Default: false'
    },
    filter: {
      description: '1. OPTIONAL: Configuration for filtering data retrieved from the source application.\n2. Supports script-based filtering using a JavaScript function to filter records.\n3. Example of script-based filter:\n   {\n     "type": "script",\n     "script": {\n       "_scriptId": "67c9cafdb1cb2bdd10dd224a",\n       "function": "filter"\n     }\n   }'
    },
    delta: {
      type: 'object',
      description: '1. OPTIONAL but REQUIRED for type=\'delta\': Configuration for incremental data fetching.\n2. Enables retrieval of only data changed since the last successful export run.\n3. Uses lastExportDateTime to track the timestamp of the last successful export.\n4. Critical for efficient data synchronization of large datasets.\n5. Requires proper API support for filtering by date/time.\n6. Must be configured when export.type is set to \'delta\'.',
      properties: {
        dateFormat: {
          type: 'string',
          description: '1. REQUIRED: Date/time format string using Moment.js syntax.\n2. Defines how lastExportDateTime will be formatted in API requests.\n3. Must match exactly what the API expects for date filtering.\n4. Common formats:\n   - \'YYYY-MM-DDTHH:mm:ssZ\' - ISO8601 with timezone offset\n   - \'YYYY-MM-DD\' - Simple date only\n   - \'MM/DD/YYYY\' - US style date\n   - \'YYYY-MM-DDTHH:mm:ss.SSS\' - With milliseconds\n   - \'X\' - Unix timestamp (seconds)\n   - \'x\' - Unix timestamp (milliseconds)\n5. MUST match the format used in dateFormat helpers in relativeURI or body.\n6. Examples:\n   - For Shopify: \'YYYY-MM-DDTHH:mm:ssZ\'\n   - For NetSuite: \'MM/DD/YYYY HH:mm:ss\'\n   - For Salesforce: \'YYYY-MM-DDTHH:mm:ss.SSSZ\''
        },
        lagOffset: {
          type: 'number',
          description: '1. OPTIONAL: Milliseconds to subtract from lastExportDateTime.\n2. Creates a buffer to account for:\n   - Processing delays in source systems\n   - Clock synchronization differences between systems\n   - Delayed data writes in source applications\n3. Helps prevent missing records due to timing issues.\n4. Common values:\n   - 300000 (5 minutes): Standard buffer for most systems\n   - 900000 (15 minutes): For systems with known delays\n   - 3600000 (1 hour): For mission-critical data where overlap is preferred\n5. Example: With lagOffset=300000, if last export was at 10:00 AM, the next export will use 9:55 AM as the starting point.\n6. Default: 0 (no offset)'
        }
      },
      required: ['dateFormat']
    },
    transform: {
      type: 'object',
      description: '1. OPTIONAL: Transformation rules to reshape API response data.\n2. Powerful functionality to map complex API responses to simpler structures.\n3. Used when:\n   - API responses are deeply nested or complex\n   - Data needs restructuring before sending to downstream systems\n   - Selected fields need to be extracted from verbose responses\n4. Transformations run after data is retrieved but before filtering or sending to subsequent steps.\n5. Complex transformations may impact performance for large datasets.',
      properties: {
        type: {
          type: 'string',
          enum: ['expression'],
          description: 'Type of transform, currently only "expression" is supported'
        },
        expression: {
          type: 'object',
          properties: {
            version: {
              type: 'string',
              enum: ['1'],
              description: 'Version of the transform expression format'
            },
            rules: {
              type: 'array',
              items: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    key: {
                      type: 'string',
                      description: 'Unique identifier for the transform rule (e.g. "SlY70aWYK7p"). Used for tracking and debugging'
                    },
                    extract: {
                      type: 'string',
                      description: 'Source path using dot notation and wildcards. Examples:\n- "*.itemNumber": Get itemNumber from all records\n- "0.orderNumber": Get orderNumber from first record only\n- "items[*].sku": Get sku from all items in all records'
                    },
                    generate: {
                      type: 'string',
                      description: 'Target path with array notation. Examples:\n- "Items[*].itemNumber": Create array of itemNumbers under Items\n- "orderNumber": Create single top-level field\n- "Items[*].Details[*].sku": Create nested arrays'
                    }
                  },
                  required: ['key', 'extract', 'generate']
                }
              }
            }
          },
          required: ['version', 'rules']
        },
        rules: {
          type: 'array',
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                key: {
                  type: 'string',
                  description: 'Unique identifier for the transform rule (e.g. "SlY70aWYK7p"). Used for tracking and debugging'
                },
                extract: {
                  type: 'string',
                  description: 'Source path using dot notation and wildcards. Examples:\n- "*.itemNumber": Get itemNumber from all records\n- "0.orderNumber": Get orderNumber from first record only\n- "items[*].sku": Get sku from all items in all records'
                },
                generate: {
                  type: 'string',
                  description: 'Target path with array notation. Examples:\n- "Items[*].itemNumber": Create array of itemNumbers under Items\n- "orderNumber": Create single top-level field\n- "Items[*].Details[*].sku": Create nested arrays'
                }
              },
              required: ['key', 'extract', 'generate']
            }
          }
        },
        version: {
          type: 'string',
          enum: ['1'],
          description: 'Must match expression.version'
        }
      },
      required: ['type', 'expression', 'rules', 'version']
    },
    adaptorType: {
      type: 'string',
      enum: ['HTTPExport'],
      description: '1. REQUIRED: Identifies this as an HTTP Export configuration.\n2. Must be set to \'HTTPExport\' exactly.\n3. Used by the system to determine how to process this configuration.\n4. Cannot be changed or customized.\n5. This is a system-level identifier.'
    }
  },
  required: ['name', '_connectionId', 'apiIdentifier', 'http', 'adaptorType']
} as unknown as JSONSchema7;

// Export the schema wrapped with jsonSchema helper
export const httpExportJsonSchema = jsonSchema<HttpExportToolArgs>({
  type: 'object',
  properties: {
    action: {
      type: 'string',
      enum: ['create', 'update', 'get', 'list'],
      description: 'Action to perform on HTTP export'
    },
    exportId: {
      description: 'Export ID for update/get operations'
    },
    config: httpExportSchema
  },
  required: ['action']
});