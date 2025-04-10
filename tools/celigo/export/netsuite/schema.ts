import { JSONSchema7 } from 'json-schema';
import { jsonSchema } from 'ai';
import { NetSuiteExportToolArgs } from './types';

// Main NetSuite Export schema
export const netsuiteExportSchema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "title": "NetSuite Export Schema",
  "description": "Schema for NetSuite export configuration without oneOf/anyOf/allOf constructs",
  "properties": {
    "name": {
      "type": "string",
      "description": "Export name"
    },
    "_connectionId": {
      "type": "string",
      "description": "Connection ID"
    },
    "apiIdentifier": {
      "type": "string",
      "description": "API identifier"
    },
    "type": {
      "type": "string",
      "enum": ["delta"],
      "description": "Export type. Use 'delta' for incremental data fetching based on lastExportDateTime"
    },
    "netsuite": {
      "type": "object",
      "description": "NetSuite-specific configuration",
      "properties": {
        "type": {
          "type": "string",
          "const": "restlet",
          "description": "NetSuite export type"
        },
        "skipGrouping": {
          "type": "boolean",
          "default": true,
          "description": "Whether to skip grouping of results"
        },
        "statsOnly": {
          "type": "boolean",
          "default": false,
          "description": "Whether to return only statistics"
        },
        "restlet": {
          "type": "object",
          "description": "NetSuite restlet configuration",
          "properties": {
            "recordType": {
              "type": "string",
              "description": "NetSuite record type"
            },
            "searchId": {
              "type": "string",
              "description": "Search ID"
            },
            "criteria": {
              "type": "array",
              "description": "Search criteria",
              "items": {
                "type": "object",
                "properties": {
                  "field": {
                    "type": "string",
                    "description": "Search field"
                  },
                  "operator": {
                    "type": "string",
                    "enum": [
                      "equals",
                      "notequals",
                      "greaterthan",
                      "greaterthanorequals",
                      "lessthan",
                      "lessthanorequals",
                      "startswith",
                      "endswith",
                      "contains",
                      "doesnotcontain",
                      "empty",
                      "notempty",
                      "matches"
                    ],
                    "description": "Search operator (matches shared filter operators)"
                  },
                  "searchValue": {
                    "type": "string",
                    "description": "Search value"
                  }
                },
                "required": ["field", "operator"],
                "additionalProperties": false
              }
            },
            "markExportedBatchSize": {
              "type": "integer",
              "default": 100,
              "description": "Batch size for marking records as exported"
            },
            "restletVersion": {
              "type": "string",
              "const": "suiteapp2.0",
              "description": "Version of the NetSuite restlet"
            }
          },
          "required": ["recordType", "searchId"],
          "additionalProperties": false
        }
      },
      "required": ["type", "restlet"],
      "additionalProperties": false
    },
    "isLookup": {
      "type": "boolean",
      "default": false,
      "description": "Whether this export is a lookup"
    },
    "pathToMany": {
      "type": "string",
      "description": "Path to the many records (required if oneToMany is true and isLookup is false)"
    },
    "asynchronous": {
      "type": "boolean",
      "default": true,
      "description": "Whether the export is asynchronous"
    },
    "oneToMany": {
      "type": "boolean",
      "default": false,
      "description": "Whether the export returns multiple records"
    },
    "sandbox": {
      "type": "boolean",
      "default": false,
      "description": "Whether to use the sandbox environment"
    },
    "delta": {
      "type": "object",
      "description": "Delta configuration for incremental exports",
      "properties": {
        "dateFormat": {
          "type": "string",
          "description": "Date format for delta tracking using Moment.js format (e.g. 'YYYY-MM-DDTHH:mm:ss')"
        },
        "lagOffset": {
          "type": "integer",
          "description": "Lag offset in milliseconds to account for processing delays. Example: 300000 (5 minutes). Applied to lastExportDateTime"
        }
      },
      "required": ["dateFormat"],
      "additionalProperties": false
    },
    "transform": {
      "type": "object",
      "description": "Transform configuration",
      "properties": {
        "type": {
          "type": "string",
          "const": "expression",
          "description": "Type of transform, currently only 'expression' is supported"
        },
        "expression": {
          "type": "object",
          "properties": {
            "version": {
              "type": "string",
              "const": "1",
              "description": "Version of the transform expression format"
            },
            "rules": {
              "type": "array",
              "items": {
                "type": "array",
                "prefixItems": [
                  {
                    "type": "object",
                    "properties": {
                      "key": {
                        "type": "string",
                        "description": "Unique identifier for the transform rule (e.g. 'SlY70aWYK7p'). Used for tracking and debugging"
                      },
                      "extract": {
                        "type": "string",
                        "description": "Source path using dot notation and wildcards. Examples:\n" +
                          "- '*.itemNumber': Get itemNumber from all records\n" +
                          "- '0.orderNumber': Get orderNumber from first record only\n" +
                          "- 'items[*].sku': Get sku from all items in all records"
                      },
                      "generate": {
                        "type": "string",
                        "description": "Target path with array notation. Examples:\n" +
                          "- 'Items[*].itemNumber': Create array of itemNumbers under Items\n" +
                          "- 'orderNumber': Create single top-level field\n" +
                          "- 'Items[*].Details[*].sku': Create nested arrays"
                      }
                    },
                    "required": ["key", "extract", "generate"],
                    "additionalProperties": false
                  }
                ]
              }
            }
          },
          "required": ["version", "rules"],
          "additionalProperties": false
        },
        "rules": {
          "type": "array",
          "items": {
            "type": "array",
            "prefixItems": [
              {
                "type": "object",
                "properties": {
                  "key": {
                    "type": "string",
                    "description": "Unique identifier for the transform rule"
                  },
                  "extract": {
                    "type": "string",
                    "description": "Source path using dot notation and wildcards"
                  },
                  "generate": {
                    "type": "string",
                    "description": "Target path with array notation"
                  }
                },
                "required": ["key", "extract", "generate"],
                "additionalProperties": false
              }
            ]
          }
        },
        "version": {
          "type": "string",
          "const": "1",
          "description": "Must match expression.version"
        }
      },
      "required": ["type", "expression", "rules", "version"],
      "additionalProperties": false
    },
    "filter": {
      "description": "1. OPTIONAL: Configuration for filtering data retrieved from the source application.\n2. Supports script-based filtering using a JavaScript function to filter records.\n3. Example of script-based filter:\n   {\n     \"type\": \"script\",\n     \"script\": {\n       \"_scriptId\": \"67c9cafdb1cb2bdd10dd224a\",\n       \"function\": \"filter\"\n     }\n   }"
    },
    "adaptorType": {
      "type": "string",
      "const": "NetSuiteExport",
      "description": "Type of adaptor"
    }
  },
  "required": ["name", "_connectionId", "apiIdentifier", "netsuite", "adaptorType"]
} as unknown as JSONSchema7;

// Export the schema wrapped with jsonSchema helper
export const netsuiteExportJsonSchema = jsonSchema<NetSuiteExportToolArgs>({
  type: 'object',
  properties: {
    action: {
      type: 'string',
      enum: ['create', 'update', 'get', 'list'],
      description: 'Action to perform on NetSuite export'
    },
    exportId: {
      description: 'Export ID for update/get operations'
    },
    config: netsuiteExportSchema
  },
  required: ['action']
});