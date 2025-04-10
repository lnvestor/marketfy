import { jsonSchema } from 'ai';
import { JSONSchema7 } from 'json-schema';
import { FlowToolArgs } from '../types';

// Define the schema with Draft 2020-12 format
const $schema = "https://json-schema.org/draft/2020-12/schema";

// Page generator schema
const pageGeneratorSchema: JSONSchema7 = {
  type: 'object',
  properties: {
    _exportId: {
      type: 'string',
      description: 'Export ID for source data'
    },
    skipRetries: {
      type: 'boolean',
      description: 'Whether to skip retries for this step',
      default: false
    }
  },
  required: ['_exportId'],
  additionalProperties: false
};

// Export processor response field schema
const exportResponseFieldSchema: JSONSchema7 = {
  type: 'object',
  properties: {
    extract: {
      type: 'string',
      description: 'Path to extract data from',
      pattern: '^(data$|data\\[\\d+\\]$|data\\[\\d+\\]\\.[a-zA-Z0-9_.]+$)'
    },
    generate: {
      type: 'string',
      description: 'Variable name to generate'
    }
  },
  required: ['extract', 'generate'],
  additionalProperties: false
};

// Import processor response field schema
const importResponseFieldSchema: JSONSchema7 = {
  type: 'object',
  properties: {
    extract: {
      type: 'string',
      enum: ['id', 'statusCode'],
      description: 'Field to extract from import response'
    },
    generate: {
      type: 'string',
      description: 'Variable name to generate'
    }
  },
  required: ['extract', 'generate'],
  additionalProperties: false
};

// Export processor response mapping schema
const exportResponseMappingSchema: JSONSchema7 = {
  type: 'object',
  properties: {
    fields: {
      type: 'array',
      items: exportResponseFieldSchema,
      minItems: 1
    },
    lists: {
      type: 'array',
      description: 'List mappings',
      default: []
    }
  },
  required: ['fields', 'lists'],
  additionalProperties: false
};

// Import processor response mapping schema
const importResponseMappingSchema: JSONSchema7 = {
  type: 'object',
  properties: {
    fields: {
      type: 'array',
      items: importResponseFieldSchema
    },
    lists: {
      type: 'array',
      description: 'List mappings',
      default: []
    }
  },
  required: ['fields', 'lists'],
  additionalProperties: false
};

// Hook schema
const hookSchema: JSONSchema7 = {
  type: 'object',
  properties: {
    postResponseMap: {
      type: 'object',
      properties: {
        function: {
          type: 'string',
          description: 'Hook function name'
        },
        _scriptId: {
          type: 'string',
          description: 'Script ID for the hook'
        }
      },
      required: ['function', '_scriptId'],
      additionalProperties: false
    }
  },
  additionalProperties: false,
  description: 'Post-processing hooks (not allowed in last step)'
};

// Export processor schema
const exportProcessorSchema: JSONSchema7 = {
  type: 'object',
  properties: {
    type: {
      type: 'string',
      const: 'export',
      description: 'Export processor type (lookup operation)'
    },
    _exportId: {
      type: 'string',
      description: 'Export ID for lookup operation'
    },
    proceedOnFailure: {
      type: 'boolean',
      default: false,
      description: 'Whether to continue on failure'
    },
    responseMapping: exportResponseMappingSchema,
    hooks: hookSchema
  },
  required: ['type', '_exportId', 'responseMapping'],
  additionalProperties: false
};

// Import processor schema
const importProcessorSchema: JSONSchema7 = {
  type: 'object',
  properties: {
    type: {
      type: 'string',
      const: 'import',
      description: 'Import processor type (action operation)'
    },
    _importId: {
      type: 'string',
      description: 'Import ID for action operation'
    },
    proceedOnFailure: {
      type: 'boolean',
      default: false,
      description: 'Whether to continue on failure'
    },
    responseMapping: importResponseMappingSchema
  },
  required: ['type', '_importId'],
  additionalProperties: false
};

// Page processor schema (oneOf approach for Draft 2020-12)
const pageProcessorSchema: JSONSchema7 = {
  type: 'object',
  oneOf: [
    exportProcessorSchema,
    importProcessorSchema
  ]
};

// Flow configuration schema
const flowConfigSchema: JSONSchema7 = {
  $schema,
  type: 'object',
  properties: {
    name: {
      type: 'string',
      description: 'Flow name'
    },
    _integrationId: {
      type: 'string',
      description: 'ID of the integration this flow belongs to'
    },
    _flowGroupingId: {
      type: 'string',
      description: 'ID of the flow grouping this flow belongs to'
    },
    free: {
      type: 'boolean',
      description: 'Whether the flow is free',
      default: false
    },
    pageGenerators: {
      type: 'array',
      description: 'Initial export operations (source)',
      items: pageGeneratorSchema,
      minItems: 1
    },
    pageProcessors: {
      type: 'array',
      description: 'Sequence of lookups (exports) and actions (imports)',
      items: pageProcessorSchema
    }
  },
  required: ['name', '_integrationId', '_flowGroupingId', 'pageGenerators', 'pageProcessors'],
  additionalProperties: false,
  description: 'Schema for Flow configuration in Celigo integrator.io',
  examples: [
    {
      name: "Example Flow",
      _integrationId: "integration123",
      _flowGroupingId: "group123",
      free: false,
      pageGenerators: [
        {
          _exportId: "export123",
          skipRetries: false
        }
      ],
      pageProcessors: [
        {
          type: "export",
          _exportId: "lookup123",
          responseMapping: {
            fields: [
              {
                extract: "data[0].field",
                generate: "lookupResult"
              }
            ],
            lists: []
          },
          hooks: {
            postResponseMap: {
              function: "processLookup",
              _scriptId: "script123"
            }
          }
        },
        {
          type: "import",
          _importId: "import123",
          responseMapping: {
            fields: [
              {
                extract: "id",
                generate: "importId"
              }
            ],
            lists: []
          }
        }
      ]
    }
  ]
};

// Flow tool schema - removed oneOf at top level
export const flowToolSchema: JSONSchema7 = {
  $schema,
  type: 'object',
  description: 'Manage Celigo flows',
  properties: {
    action: {
      type: 'string',
      enum: ['create', 'update', 'get', 'list'],
      description: 'Action to perform'
    },
    flowId: {
      type: 'string',
      description: 'Flow ID (required for update)'
    },
    config: flowConfigSchema,
    _id: {
      type: 'string',
      description: 'Flow ID (required for get)'
    }
  },
  required: ['action'],
  additionalProperties: false
};

// Export the schema wrapped with jsonSchema helper
export const flowToolJsonSchema = jsonSchema<FlowToolArgs>(flowToolSchema);
