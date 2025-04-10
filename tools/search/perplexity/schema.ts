import { JSONSchema7 } from 'json-schema';
import { jsonSchema } from 'ai';
import { PerplexityParameters } from './types';

export const perplexitySchema: JSONSchema7 = {
  type: "object",
  properties: {
    messages: {
      type: "array",
      items: {
        type: "object",
        properties: {
          role: {
            type: "string",
            description: "Role of the message (system, user, assistant)",
            enum: ["system", "user", "assistant"]
          },
          content: {
            type: "string",
            description: "Content of the message"
          }
        },
        required: ["role", "content"]
      },
      description: "Array of conversation messages to be sent to the Perplexity model"
    }
  },
  required: ["messages"]
} as const;

// Export the schema wrapped with jsonSchema helper
export const perplexityJsonSchema = jsonSchema<PerplexityParameters>(perplexitySchema);