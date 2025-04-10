import { JSONSchema7 } from 'json-schema';
import { jsonSchema } from 'ai';
import { ExaSearchParameters } from './types';

export const exaSearchSchema: JSONSchema7 = {
  type: "object",
  properties: {
    query: {
      type: "string",
      description: "Search query text"
    },
    useAutoprompt: {
      type: "boolean",
      default: true
    },
    type: {
      type: "string",
      enum: ["auto", "keyword", "neural", "magic"],
      default: "auto"
    },
    category: {
      type: "string",
      description: "Content category to search"
    },
    numResults: {
      type: "integer",
      minimum: 1,
      maximum: 100,
      default: 10
    },
    includeDomains: {
      type: "array",
      items: {
        type: "string"
      }
    },
    excludeDomains: {
      type: "array", 
      items: {
        type: "string"
      }
    },
    startCrawlDate: {
      type: "string",
      format: "date-time"
    },
    endCrawlDate: {
      type: "string",
      format: "date-time"
    },
    startPublishedDate: {
      type: "string",
      format: "date-time"
    },
    endPublishedDate: {
      type: "string",
      format: "date-time"
    },
    includeText: {
      type: "array",
      items: {
        type: "string"
      }
    },
    excludeText: {
      type: "array",
      items: {
        type: "string"
      }
    },
    contents: {
      type: "object",
      properties: {
        text: {
          type: "boolean",
          default: true
        },
        highlights: {
          type: "object",
          properties: {
            numSentences: {
              type: "integer",
              minimum: 1
            },
            highlightsPerUrl: {
              type: "integer",
              minimum: 1
            },
            query: {
              type: "string"
            }
          }
        },
        summary: {
          type: "object",
          properties: {
            query: {
              type: "string"
            }
          }
        },
        livecrawl: {
          type: "string",
          enum: ["always", "fallback", "never"],
          default: "always"
        },
        livecrawlTimeout: {
          type: "integer",
          minimum: 100
        },
        subpages: {
          type: "integer",
          minimum: 0
        },
        subpageTarget: {
          type: "string",
          enum: ["sources", "links"]
        },
        extras: {
          type: "object",
          properties: {
            links: {
              type: "integer",
              minimum: 0
            },
            imageLinks: {
              type: "integer",
              minimum: 0
            }
          }
        }
      }
    }
  },
  required: ["query"]
} as const;

// Export the schema wrapped with jsonSchema helper
export const exaSearchJsonSchema = jsonSchema<ExaSearchParameters>(exaSearchSchema);