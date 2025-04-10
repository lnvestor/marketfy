import { JSONSchema7 } from 'json-schema';
import { jsonSchema } from 'ai';

// Define the ThinkParameters type
export interface ThinkParameters {
  thought: string;
}

// Define the JSON schema
export const thinkSchema: JSONSchema7 = {
  type: "object",
  properties: {
    thought: {
      type: "string",
      description: "A thought to think about in detail. Use this to analyze complex problems, evaluate options, or verify compliance with policies."
    }
  },
  required: ["thought"]
} as const;

// Export the schema wrapped with jsonSchema helper
export const thinkJsonSchema = jsonSchema<ThinkParameters>(thinkSchema);