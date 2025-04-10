import { JSONSchema7 } from 'json-schema';
import { jsonSchema } from 'ai';

export type NetSuiteSavedSearch = {
  type: string;
  title: string;
  settings?: Array<{
    name: string;
    value: string;
  }>;
  filters?: Array<string[] | string>;
  columns?: Array<{
    name: string;
    label?: string;
    sort?: 'ASC' | 'DESC';
    formula?: string;
    join?: string;
    summary?: 'GROUP' | 'SUM';
  }>;
};

export const netSuiteSavedSearchSchema: JSONSchema7 = {
  type: "object",
  description: "NetSuite search.create() options. This object defines the structure passed to NetSuite's search API.",
  properties: {
    type: {
      type: "string",
      description: "NetSuite record type. Can be any valid NetSuite record type identifier. Common examples include:\n- 'salesorder' (Sales Order records)\n- 'customer' (Customer records)\n- 'item' (Inventory and non-inventory items)\n- 'transaction' (All transaction types)\n- 'transferorder' (Transfer Order records)\n- 'inventoryadjustment' (Inventory Adjustment records)\n- 'invoice' (Invoice records)\n- 'purchaseorder' (Purchase Order records)\n- 'vendor' (Vendor records)\n- 'contact' (Contact records)\n- 'employee' (Employee records)\nNote: The actual internal record type (e.g., 'SalesOrd', 'CustInvc') will be used in filters"
    },
    title: {
      type: "string",
      description: "Name of the saved search"
    },
    settings: {
      type: "array",
      description: "Search settings like consolidation type",
      items: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "Setting name (e.g., 'consolidationtype')"
          },
          value: {
            type: "string",
            description: "Setting value (e.g., 'ACCTTYPE')"
          }
        },
        required: ["name", "value"]
      }
    },
    filters: {
      type: "array",
      description: "Search criteria with support for logical operators between conditions",
      items: {
        type: ["array", "string"],
        description: "Filter can be either a condition array or a logical operator string",
        items: {
          type: "string"
        }
      },
      examples: [
        [
          ["type", "anyof", "TrnfrOrd"],
          "AND",
          ["mainline", "is", "T"]
        ],
        [
          ["internalid", "anyof", "21323"],
          "AND",
          ["type", "anyof", "InvtPart", "NonInvtPart"]
        ]
      ]
    },
    columns: {
      type: "array",
      description: "What data to display in search results. Each column represents a field or calculation to show in the results.",
      items: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "Field to display (e.g., 'tranid', 'amount', 'itemid')"
          },
          label: {
            type: "string",
            description: "Column header text in search results"
          },
          sort: {
            type: "string",
            enum: ["ASC", "DESC"],
            description: "Sort direction (ASC or DESC)"
          },
          formula: {
            type: "string",
            description: "Formula for calculated display columns. Note: For filtering data, use formula filters instead."
          },
          join: {
            type: "string",
            description: "Join to get fields from related records",
            examples: ["item", "customer", "applyingTransaction"]
          },
          summary: {
            type: "string",
            enum: ["GROUP", "SUM"],
            description: "Summary function to apply to the column"
          }
        },
        required: ["name"]
      }
    }
  },
  required: ["type", "title"]
};

// Export the schema wrapped with jsonSchema helper
export const netSuiteSavedSearchJsonSchema = jsonSchema<NetSuiteSavedSearch>(netSuiteSavedSearchSchema);
