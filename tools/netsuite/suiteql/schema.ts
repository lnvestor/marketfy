import { JSONSchema7 } from 'json-schema';
import { jsonSchema } from 'ai';

export type SuiteQLRequest = {
  query: string;
  params?: any[];
};

export const suiteQLSchema: JSONSchema7 = {
  type: "object",
  description: "SuiteQL query with optional parameters for placeholders",
  properties: {
    query: {
      type: "string",
      description: "SuiteQL query string with optional '?' placeholders for parameters"
    },
    params: {
      type: "array",
      description: "Array of parameter values to replace '?' placeholders in the query",
      items: {
        type: ["string", "number", "boolean", "null"]
      }
    }
  },
  required: ["query"]
};

// Export the schema wrapped with jsonSchema helper
export const suiteQLJsonSchema = jsonSchema<SuiteQLRequest>(suiteQLSchema);