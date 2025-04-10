// Shared schema definitions
export const twoDArraySchema = {
  type: 'object',
  properties: {
    doNotNormalize: {
      type: 'boolean',
      description: 'Whether to normalize the array data. If true, keeps original structure; if false, flattens nested arrays'
    },
    hasHeader: {
      type: 'boolean',
      description: 'Whether the array has a header row. If true, first row contains column names'
    }
  },
  required: ['doNotNormalize', 'hasHeader']
};

// Response schema - IMPORTANT: Pagination must be at HTTP level, not in response
export const responseSchema = {
  type: 'object',
  description: 'Response configuration. NOTE: For pagination, use http.paging instead of adding pagination here.',
  properties: {
    resourcePath: {
      type: 'string',
      description: 'Path to the resource in response. Use dot notation for nested objects (e.g. "data.items", "results.orders")'
    },
    twoDArray: twoDArraySchema
  },
  required: ['resourcePath'],
  additionalProperties: false  // Prevents pagination or other fields in response
};

export const deltaSchema = {
  type: 'object',
  properties: {
    dateFormat: {
      type: 'string',
      description: 'Date format for delta tracking using Moment.js format (e.g. "YYYY-MM-DDTHH:mm:ss"). Must match format used in relativeURI\'s dateFormat helper'
    },
    lagOffset: {
      type: 'number',
      description: 'Lag offset in milliseconds to account for processing delays. Example: 300000 (5 minutes). Applied to lastExportDateTime'
    }
  },
  required: ['dateFormat']  // lagOffset is optional
};

export const transformRuleSchema = {
  type: 'object',
  properties: {
    key: {
      type: 'string',
      description: 'Unique identifier for the transform rule (e.g. "SlY70aWYK7p"). Used for tracking and debugging'
    },
    extract: {
      type: 'string',
      description: 'Source path using dot notation and wildcards. Examples:\n' +
        '- "*.itemNumber": Get itemNumber from all records\n' +
        '- "0.orderNumber": Get orderNumber from first record only\n' +
        '- "items[*].sku": Get sku from all items in all records'
    },
    generate: {
      type: 'string',
      description: 'Target path with array notation. Examples:\n' +
        '- "Items[*].itemNumber": Create array of itemNumbers under Items\n' +
        '- "orderNumber": Create single top-level field\n' +
        '- "Items[*].Details[*].sku": Create nested arrays'
    }
  },
  required: ['key', 'extract', 'generate']
};

export const transformSchema = {
  type: 'object',
  properties: {
    type: {
      type: 'string',
      const: 'expression',
      description: 'Type of transform, currently only "expression" is supported'
    },
    expression: {
      type: 'object',
      properties: {
        version: {
          type: 'string',
          const: '1',
          description: 'Version of the transform expression format'
        },
        rules: {
          type: 'array',
          items: {
            type: 'array',
            items: transformRuleSchema,
            description: 'Array of transform rules that should be applied together'
          },
          description: 'Array of rule groups. Each group contains related transformations'
        }
      },
      required: ['version', 'rules']
    },
    rules: {
      type: 'array',
      items: {
        type: 'array',
        items: transformRuleSchema,
        description: 'Array of transform rules that should be applied together'
      },
      description: 'Exact duplicate of expression.rules. Must match exactly for validation'
    },
    version: {
      type: 'string',
      const: '1',
      description: 'Must match expression.version'
    }
  },
  required: ['type', 'expression', 'rules', 'version']
};

// Filter type casting schema
const filterExtractSchema = {
  type: 'array',
  items: [
    { type: 'string', const: 'extract' },
    { type: 'string', description: 'Path to extract (e.g. "itemNumber", "facilityInventory.length")' }
  ],
  minItems: 2,
  maxItems: 2
};

const filterTypeCastSchema = {
  type: 'array',
  items: [
    {
      type: 'string',
      enum: ['string', 'number', 'boolean'],
      description: 'Type to cast the extracted value to'
    },
    filterExtractSchema
  ],
  minItems: 2,
  maxItems: 2
};

// Filter operators
const filterOperators = {
  type: 'string',
  enum: [
    // Logical operators
    'and', 'or',
    // Unary operators
    'empty', 'notempty',
    // Binary operators
    'equals', 'notequals',
    'greaterthan', 'greaterthanorequals',
    'lessthan', 'lessthanorequals',
    'startswith', 'endswith',
    'contains', 'doesnotcontain',
    'matches'
  ]
};

// Filter value schema
const filterValueSchema = {
  oneOf: [
    { type: 'string' },
    { type: 'number' },
    { type: 'boolean' }
  ]
};

// Filter rules array schema
const filterRulesSchema = {
  type: 'array',
  items: {
    oneOf: [
      // First element: operator
      filterOperators,
      // Second element: type cast + extract
      filterTypeCastSchema,
      // Third element (optional): value for binary operators
      filterValueSchema
    ]
  },
  description: 'Filter rules. Examples:\n' +
    '1. Unary operation:\n' +
    '   "notempty", ["string", ["extract", "id"]]\n' +
    '2. Binary operation:\n' +
    '   "equals", ["string", ["extract", "status"]], "active"\n' +
    '3. Logical group:\n' +
    '   "and",\n' +
    '   ["notempty", ["string", ["extract", "id"]]],\n' +
    '   ["equals", ["string", ["extract", "status"]], "active"]'
};

export const filterSchema = {
  type: 'object',
  properties: {
    type: {
      type: 'string',
      const: 'expression'
    },
    expression: {
      type: 'object',
      properties: {
        rules: filterRulesSchema,
        version: {
          type: 'string',
          const: '1'
        }
      },
      required: ['rules', 'version']
    },
    rules: filterRulesSchema,   // Exact duplicate of expression.rules
    version: {
      type: 'string',
      const: '1'
    }
  },
  required: ['type', 'expression', 'rules', 'version']
};
