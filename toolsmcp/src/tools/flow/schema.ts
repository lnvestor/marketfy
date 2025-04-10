export const getFlowsSchema = {
  type: 'object',
  properties: {},
  required: [],
  additionalProperties: false,
  description: 'Get all flows (no parameters required)'
};

export const getFlowByIdSchema = {
  type: 'object',
  properties: {
    _id: {
      type: 'string',
      description: 'Flow ID'
    }
  },
  required: ['_id']
};

export const createFlowSchema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      description: 'Flow name',
    },
    _integrationId: {
      type: 'string',
      description: 'ID of the integration this flow belongs to',
    },
    _flowGroupingId: {
      type: 'string',
      description: 'ID of the flow grouping this flow belongs to',
    },
    free: {
      type: 'boolean',
      description: 'Whether the flow is free',
      default: false,
    },
    pageGenerators: {
      type: 'array',
      description: 'Initial export operations (source)',
      items: {
        type: 'object',
        properties: {
          _exportId: {
            type: 'string',
            description: 'Export ID for source data',
          },
          skipRetries: {
            type: 'boolean',
            description: 'Whether to skip retries for this step',
            default: false,
          },
        },
        required: ['_exportId', 'skipRetries'],
      },
      minItems: 1,
    },
    pageProcessors: {
      type: 'array',
      description: 'Sequence of lookups and actions',
      items: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            enum: ['export', 'import'],
            description: 'Type of operation (export=lookup, import=action)',
          },
          _exportId: {
            type: 'string',
            description: 'Export ID for lookup operations',
          },
          _importId: {
            type: 'string',
            description: 'Import ID for import operations',
          },
          proceedOnFailure: {
            type: 'boolean',
            description: 'Whether to continue on failure',
          },
          responseMapping: {
            type: 'object',
            properties: {
              fields: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    extract: {
                      type: 'string',
                      description: 'Path to extract data from',
                      oneOf: [
                        { pattern: '^data$' },
                        { pattern: '^data\\[0\\]$' },
                        { pattern: '^data\\[0\\]\\.[a-zA-Z0-9_.]+$' },
                        { pattern: '^id$' },
                        { pattern: '^statusCode$' }
                      ],
                    },
                    generate: {
                      type: 'string',
                      description: 'Variable name to generate',
                    },
                  },
                  required: ['extract', 'generate'],
                },
              },
              lists: {
                type: 'array',
                description: 'List mappings',
                default: [],
              },
            },
            required: ['fields', 'lists'],
          }
        },
        required: ['type'],
        allOf: [
          // Type-specific requirements
          {
            if: { properties: { type: { const: 'export' } } },
            then: { 
              required: ['_exportId', 'responseMapping'],
              properties: {
                responseMapping: {
                  properties: {
                    fields: { minItems: 1 }
                  }
                }
              }
            }
          },
          {
            if: { properties: { type: { const: 'import' } } },
            then: { 
              required: ['_importId']
            }
          },
          // Last step validation
          {
            if: {
              $data: '/pageProcessors/-' // If last item
            },
            then: {
              properties: {
                type: true,
                _exportId: true,
                _importId: true
              },
              additionalProperties: false
            }
          }
        ],
      },
    }
  },
  required: ['name', '_integrationId', '_flowGroupingId', 'pageGenerators', 'pageProcessors', 'free'],
};

export const updateFlowSchema = {
  type: 'object',
  properties: {
    flowId: {
      type: 'string',
      description: 'ID of the flow to update'
    },
    config: createFlowSchema
  },
  required: ['flowId', 'config']
};
