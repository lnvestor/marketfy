export const getImportsSchema = {
  type: 'object',
  properties: {},
  required: [],
  additionalProperties: false,
  description: 'Get all imports (no parameters required)'
};

export const getImportByIdSchema = {
  type: 'object',
  properties: {
    _id: {
      type: 'string',
      description: 'Import ID'
    }
  },
  required: ['_id']
};

export const createImportSchema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      description: 'Import name',
    },
    _connectionId: {
      type: 'string',
      description: 'Connection ID',
    },
    distributed: {
      type: 'boolean',
      description: 'Whether this is a distributed import',
    },
    apiIdentifier: {
      type: 'string',
      description: 'API identifier',
    },
    ignoreExisting: {
      type: 'boolean',
      default: false,
    },
    ignoreMissing: {
      type: 'boolean',
      default: false,
    },
    oneToMany: {
      type: 'boolean',
      default: false,
    },
    lookups: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'Lookup name',
          },
          recordType: {
            type: 'string',
            description: 'NetSuite record type',
          },
          resultField: {
            type: 'string',
            description: 'Field to return from lookup',
          },
          expression: {
            type: 'string',
            description: 'Search expression',
          },
          allowFailures: {
            type: 'boolean',
            description: 'Whether to allow lookup failures',
          },
          default: {
            type: ['string', 'null'],
            description: 'Default value if lookup fails',
          },
        },
        required: ['name', 'recordType', 'resultField', 'expression', 'allowFailures'],
      },
    },
    netsuite_da: {
      type: 'object',
      properties: {
        restletVersion: {
          type: 'string',
          enum: ['suiteapp2.0'],
          default: 'suiteapp2.0',
        },
        operation: {
          type: 'string',
          enum: ['add', 'update', 'delete'],
          description: 'Operation type',
        },
        recordType: {
          type: 'string',
          description: 'NetSuite record type',
        },
        internalIdLookup: {
          type: 'object',
          properties: {
            expression: {
              type: 'string',
              description: 'Search expression for internal ID',
            },
          },
          required: ['expression'],
        },
        lookups: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                description: 'Lookup name',
              },
              recordType: {
                type: 'string',
                description: 'NetSuite record type',
              },
              resultField: {
                type: 'string',
                description: 'Field to return from lookup',
              },
              expression: {
                type: 'string',
                description: 'Search expression',
              },
              allowFailures: {
                type: 'boolean',
                description: 'Whether to allow lookup failures',
              },
              default: {
                type: ['string', 'null'],
                description: 'Default value if lookup fails',
              },
            },
            required: ['name', 'recordType', 'resultField', 'expression', 'allowFailures'],
          },
        },
        mapping: {
          type: 'object',
          properties: {
            fields: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  generate: {
                    type: 'string',
                    description: 'Field to generate',
                  },
                  extract: {
                    type: 'string',
                    description: 'Field to extract from',
                  },
                  discardIfEmpty: {
                    type: 'boolean',
                    default: false,
                  },
                  immutable: {
                    type: 'boolean',
                    default: false,
                  },
                  internalId: {
                    type: 'boolean',
                    default: false,
                  },
                  lookupName: {
                    type: 'string',
                    description: 'Name of lookup to use',
                  },
                  hardCodedValue: {
                    type: 'string',
                    description: 'Hard-coded value',
                  },
                  dataType: {
                    type: 'string',
                    enum: ['string', 'number', 'boolean'],
                    description: 'Data type',
                  },
                },
                required: ['generate'],
              },
            },
            lists: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  generate: {
                    type: 'string',
                    description: 'List to generate',
                  },
                  fields: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        generate: {
                          type: 'string',
                          description: 'Field to generate',
                        },
                        extract: {
                          type: 'string',
                          description: 'Field to extract from',
                        },
                        discardIfEmpty: {
                          type: 'boolean',
                          default: false,
                        },
                        immutable: {
                          type: 'boolean',
                          default: false,
                        },
                        internalId: {
                          type: 'boolean',
                          default: false,
                        },
                        hardCodedValue: {
                          type: 'string',
                          description: 'Hard-coded value',
                        },
                        dataType: {
                          type: 'string',
                          enum: ['string', 'number', 'boolean'],
                          description: 'Data type',
                        },
                      },
                      required: ['generate'],
                    },
                  },
                },
                required: ['generate', 'fields'],
              },
            },
          },
          required: ['fields', 'lists'],
        },
      },
      required: ['restletVersion', 'operation', 'recordType', 'mapping'],
    },
    filter: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          const: 'expression',
        },
        expression: {
          type: 'object',
          properties: {
            rules: {
              type: 'array',
              items: {
                type: ['string', 'array'],
              },
              examples: [
                ['equals', ['string', ['extract', 'results']], 'true']
              ],
            },
            version: {
              type: 'string',
              const: '1',  // Must be exactly "1"
            },
          },
          required: ['rules', 'version'],
        },
        rules: {
          type: 'array',
          items: {
            type: ['string', 'array'],
          },
          examples: [
            ['equals', ['string', ['extract', 'results']], 'true']
          ],
        },
        version: {
          type: 'string',
          const: '1',  // Must be exactly "1"
        },
      },
      required: ['type', 'expression', 'rules', 'version'],
    },
    adaptorType: {
      type: 'string',
      enum: ['HTTPImport', 'FTPImport', 'RDBMSImport', 'NetSuiteDistributedImport'],
      description: 'Type of import adaptor',
    },
  },
  required: ['name', '_connectionId', 'apiIdentifier', 'adaptorType'],
  allOf: [
    {
      if: {
        properties: { adaptorType: { const: 'HTTPImport' } },
      },
      then: {
        required: ['http'],
      },
    },
    {
      if: {
        properties: { adaptorType: { const: 'FTPImport' } },
      },
      then: {
        required: ['ftp', 'file'],
      },
    },
    {
      if: {
        properties: { adaptorType: { const: 'RDBMSImport' } },
      },
      then: {
        required: ['rdbms'],
      },
    },
    {
      if: {
        properties: { adaptorType: { const: 'NetSuiteDistributedImport' } },
      },
      then: {
        required: ['distributed', 'netsuite_da', 'filter'],
      },
    },
  ],
};

export const updateImportSchema = {
  type: 'object',
  properties: {
    importId: {
      type: 'string',
      description: 'ID of the import to update'
    },
    config: createImportSchema
  },
  required: ['importId', 'config']
};
