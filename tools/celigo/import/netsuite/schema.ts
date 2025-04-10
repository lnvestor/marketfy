import { JSONSchema7, JSONSchema7Definition } from 'json-schema';
import { jsonSchema } from 'ai';
import { NetSuiteImportToolParameters } from './types';
import { baseImportSchema } from '../shared/schemas';

// NetSuite lookup schema - Enhanced for AI Agents
const netSuiteLookupSchema: JSONSchema7 = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      description: 'Unique identifier for this lookup that can be referenced in field mappings via lookupName property. For example, "customerLookup" or "itemLookup".'
    },
    recordType: {
      type: 'string',
      description: 'The NetSuite record type to search against. Common types include "customer", "item", "salesorder", "invoice", etc. For custom records, use "customrecord_[id]".'
    },
    resultField: {
      type: 'string',
      description: 'The field from the NetSuite record to return and use in your mapping. This is often "id" for internal IDs or can be any field name from the NetSuite record. For example, "entityid" for a customer record.'
    },
    expression: {
      type: 'string',
      description: 'Search expression defining criteria to find matching records. Uses NetSuite\'s search syntax. Example: "custentity_external_id={{external_id}}" or "itemid={{item_number}}". For complex criteria, can use AND/OR operators like "(itemid={{item_number}}) AND (isinactive=false)".'
    },
    allowFailures: {
      type: 'boolean',
      description: 'When true, the import will continue even if this lookup fails to find matching records. When false, failed lookups will cause the entire record import to fail. Set to true for optional relationships, false for required ones.'
    },
    default: {
      type: ['string', 'null'],
      description: 'Value to use if lookup fails and allowFailures is true. For example, setting default to a specific internal ID ensures a fallback value is used.'
    }
  },
  required: ['name', 'recordType', 'resultField', 'expression', 'allowFailures'],
  description: 'Defines how to find existing records in NetSuite based on search criteria. Lookups are essential for establishing relationships between records and preventing duplicate creation. Use lookups when you need to reference existing NetSuite records by criteria other than internal ID.'
};

// NetSuite field schema - Enhanced for AI Agents
const netSuiteFieldSchema: JSONSchema7 = {
  type: 'object',
  properties: {
    generate: {
      type: 'string',
      description: 'The target NetSuite field to populate. Use standard field names like "companyname" or custom fields like "custbody_order_notes". For sublists, use format "Items : quantity" for line item quantity. NetSuite field IDs can be found in SuiteScript records browser.'
    },
    extract: {
      type: 'string',
      description: 'Source field path to extract data from. Use dot notation for nested fields like "customer.email". For arrays, use [*] to map all elements, like "lines[*].quantity" to map quantities from all line items.'
    },
    discardIfEmpty: {
      type: 'boolean',
      default: false,
      description: 'When true, empty or null values won\'t be sent to NetSuite, keeping existing values intact. Set to true when you want to preserve existing data if no value is provided. Particularly useful for update operations.'
    },
    immutable: {
      type: 'boolean',
      default: false,
      description: 'When true, field will only be set during record creation and not modified during updates. Use for fields that should never change after initial creation, like external IDs or creation dates.'
    },
    internalId: {
      type: 'boolean',
      default: false,
      description: 'When true, indicates the field value is a NetSuite internal ID reference. Set to true when mapping IDs for lookup fields like "customer" or "item", where NetSuite expects an internal ID rather than a display value.'
    },
    lookupName: {
      type: 'string',
      description: 'References a defined lookup by name to resolve values. For example, if you have a lookup named "customerLookup", use that name here to populate this field with the lookup result.'
    },
    hardCodedValue: {
      type: 'string',
      description: 'Static value to always use instead of extracting from source data. Example: Setting hardCodedValue to "123" will always write "123" to the generate field regardless of source data.'
    },
    dataType: {
      type: 'string',
      enum: ['string', 'number', 'boolean'],
      description: 'Forces conversion to specified data type. Use "number" for quantity/amount fields, "boolean" for checkbox fields. NetSuite often requires specific data types for certain fields (e.g., quantity must be number).'
    }
  },
  required: ['generate'],
  description: 'Defines mapping between source data fields and NetSuite record fields. Each field mapping specifies how to transform and validate data before sending to NetSuite. At minimum, specify the "generate" property to identify the target NetSuite field.'
};

// NetSuite list schema - Enhanced for AI Agents
const netSuiteListSchema: JSONSchema7 = {
  type: 'object',
  properties: {
    generate: {
      type: 'string',
      description: 'The NetSuite sublist/line item to populate. Common sublists include "item" for transaction line items, "addressbook" for customer addresses, or custom sublists like "recmachcustrecord_custom_sublist". Each sublist contains multiple fields mapped through the fields array.'
    },
    fields: {
      type: 'array',
      items: netSuiteFieldSchema,
      description: 'Array of field mappings specific to this sublist. Each mapping defines how to populate a field within the line item. For example, map "item", "quantity", "rate", etc. for Sales Order line items. Line-specific lookups can be used here.'
    },
    replaceAllLines: {
      type: 'boolean',
      default: false,
      description: 'When true, all existing lines in the sublist will be removed and replaced with the new data. Use when source data contains complete lists rather than just changes. For example, set to true when importing a complete Sales Order with all line items.'
    },
    keyFieldName: {
      type: 'string',
      description: 'Field name to use as the key identifier when finding existing lines to update. For example, use "item" to match lines by item, or "lineuniquekey" for line IDs. Custom fields like "custcol_external_line_id" can also be used as keys.'
    }
  },
  required: ['generate', 'fields'],
  description: 'Defines mapping for NetSuite sublists/line items, which represent one-to-many relationships within records. Examples include line items on transactions (Sales Orders, Invoices), address book entries for customers, or custom record sublists.'
};

// NetSuite mapping schema - Enhanced for AI Agents
const netSuiteMappingSchema: JSONSchema7 = {
  type: 'object',
  properties: {
    fields: {
      type: 'array',
      items: netSuiteFieldSchema,
      description: 'Array of field mappings for the main record (header-level fields). Maps standard fields like "tranid" for transaction number, "entity" for customer reference, and custom fields like "custbody_order_notes".'
    },
    lists: {
      type: 'array',
      items: netSuiteListSchema,
      description: 'Array of sublist mappings for line items and other one-to-many relationships. Common examples include mapping "item" sublist for Sales Order line items or "addressbook" for customer addresses. Each sublist contains its own field mappings.'
    }
  },
  required: ['fields', 'lists'],
  description: 'Overall mapping configuration defining how to transform source data into NetSuite records. Contains both top-level field mappings and sublist mappings for line items. The structure mirrors NetSuite\'s record hierarchy with header fields and line items.'
};

// NetSuite-specific import schema
export const netsuiteImportSchema: JSONSchema7 = {
  type: 'object',
  properties: {
    name: (baseImportSchema as JSONSchema7).properties?.name as JSONSchema7Definition,
    _connectionId: (baseImportSchema as JSONSchema7).properties?._connectionId as JSONSchema7Definition,
    apiIdentifier: (baseImportSchema as JSONSchema7).properties?.apiIdentifier as JSONSchema7Definition,
    distributed: {
      type: 'boolean',
      const: true,
      description: 'Must be true for NetSuite distributed imports'
    },
    ignoreExisting: {
      type: 'boolean',
      default: false,
      description: 'When true, records that already exist in NetSuite (based on lookup criteria) will be skipped. This is applicable for "Add", "Update", "Add/Update" operations. For "Add" operations, enabling this prevents creating duplicate records. For "Update" and "Add/Update" operations, enabling this would skip updates to existing records. REQUIRED when using internalIdLookup or external lookups.'
    },
    ignoreMissing: {
      type: 'boolean',
      default: false,
      description: 'When true, errors for records that do not exist in NetSuite will be suppressed. This is particularly useful for "Delete" operations to prevent errors when attempting to delete records that have already been removed.'
    },
    oneToMany: {
      type: 'boolean',
      default: false,
      description: 'When true, allows one source record to create or update multiple NetSuite records. This is useful when you need to map a single record from your source system to multiple related records in NetSuite.'
    },
    lookups: {
      type: 'array',
      items: netSuiteLookupSchema,
      description: 'Global lookups available to all field mappings. Define reusable lookups here for finding NetSuite records based on criteria. For example, define a customer lookup that finds NetSuite customers by email address or an item lookup that finds items by SKU.'
    },
    netsuite_da: {
      type: 'object',
      properties: {
        restletVersion: {
          type: 'string',
          const: 'suiteapp2.0',
          description: 'NetSuite restlet version - must be suiteapp2.0 for compatibility with current SuiteApp implementation.'
        },
        operation: {
          type: 'string',
          enum: ['add', 'update', 'delete', 'add_update', 'attach', 'detach'],
          description: 'Operation type: "add" creates new records; "update" modifies existing records; "delete" removes records; "add_update" creates or modifies based on existence; "attach" creates relationships between records; "detach" removes relationships.'
        },
        recordType: {
          type: 'string',
          description: 'NetSuite record type to operate on. Standard types include "customer", "salesorder", "invoice", "item". For custom records, use "customrecord_[id]". Find record types in NetSuite\'s Records Catalog.'
        },
        internalIdLookup: {
          type: 'object',
          properties: {
            expression: {
              type: 'string',
              description: 'Search expression to find existing records for update/delete operations. For example, "externalid={{source_id}}" finds records by external ID, or "(tranid={{order_number}}) AND (subsidiary={{subsidiary_id}})" finds orders by number and subsidiary.'
            }
          },
          required: ['expression'],
          description: 'Lookup configuration to find existing NetSuite records by criteria. Required for update, delete, and add_update operations. Defines how to match source records with existing NetSuite records. When using this, the ignoreExisting property MUST be specified in the parent configuration.'
        },
        lookups: {
          type: 'array',
          items: netSuiteLookupSchema,
          description: 'Operation-specific lookups that only apply to this particular import operation. Use when lookups should be scoped to just this operation instead of being available globally.'
        },
        mapping: {
          ...netSuiteMappingSchema,
          description: 'Detailed mapping configuration defining how source data maps to NetSuite fields and sublists. Includes both header-level fields and line items.'
        }
      },
      required: ['restletVersion', 'operation', 'recordType', 'mapping'],
      description: 'NetSuite distributed adaptor configuration containing operation settings, record type, lookup criteria, and field mappings. This is the core configuration that defines how data is processed in NetSuite.'
    },
    adaptorType: {
      type: 'string',
      const: 'NetSuiteDistributedImport',
      description: 'Type of import adaptor - must be NetSuiteDistributedImport for distributed imports that leverage SuiteScript capabilities.'
    }
  },
  required: [
    'name',
    '_connectionId',
    'distributed',
    'apiIdentifier',
    'adaptorType',
    'netsuite_da'
  ],
  additionalProperties: false,
  description: 'Configuration schema for NetSuite Distributed Import in Celigo integrator.io. Defines how to import data into NetSuite records, including operations, lookups, and field mappings. Supports various operations like Add, Update, Delete, with options for handling existing records and line items.'
};

// NetSuite import tool schema
export const netsuiteImportToolSchema: JSONSchema7 = {
  type: 'object',
  description: 'Create and manage NetSuite imports in Celigo',
  properties: {
    action: {
      type: 'string',
      enum: ['create', 'update', 'get', 'list', 'delete'],
      description: 'Action to perform'
    },
    importId: {
      type: 'string',
      description: 'Import ID (required for update/get/delete)'
    },
    config: netsuiteImportSchema,
    limit: {
      type: 'number',
      minimum: 1,
      description: 'Maximum number of imports to return (for list action)'
    },
    offset: {
      type: 'number',
      minimum: 0,
      description: 'Number of imports to skip (for list action)'
    }
  },
  required: ['action'],
  additionalProperties: false
};

// Export the schema wrapped with jsonSchema helper
export const netsuiteImportToolJsonSchema = jsonSchema<NetSuiteImportToolParameters>(netsuiteImportToolSchema);
