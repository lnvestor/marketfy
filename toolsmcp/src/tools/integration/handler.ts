import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
import { IntegrationInput, UpdateIntegrationConfig } from './types.js';
import { createIntegrationSchema, updateIntegrationSchema } from './schema.js';
import { z } from 'zod';
import axios from 'axios';

const CELIGO_API_BASE = 'https://api.integrator.io/v1';

// Create a Zod schema for runtime validation
const runtimeSchema = z.object({
  name: z.string(),
  flowGroupings: z.array(z.object({
    name: z.string()
  }).strict())
}).strict();

export async function handleUpdateIntegration(args: UpdateIntegrationConfig, bearerToken: string): Promise<{
  content: Array<{
    type: string;
    text: string;
  }>;
}> {
  try {
    const { integrationId, config } = args;

    // Validate and parse config
    const validatedConfig = runtimeSchema.parse(config);

    // Update integration via Celigo API
    const response = await axios.put(
      `${CELIGO_API_BASE}/integrations/${integrationId}`,
      validatedConfig,
      {
        headers: {
          Authorization: `Bearer ${bearerToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(response.data, null, 2)
        }
      ]
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new McpError(
        ErrorCode.InvalidParams,
        `Invalid integration parameters: ${error.errors.map(e => e.message).join(', ')}`
      );
    }
    throw new McpError(
      ErrorCode.InternalError,
      `Failed to update integration: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

export async function handleGetIntegrations(args: any, bearerToken: string): Promise<{
  content: Array<{
    type: string;
    text: string;
  }>;
}> {
  try {
    // Get all integrations via Celigo API
    const response = await axios.get(
      `${CELIGO_API_BASE}/integrations`,
      {
        headers: {
          Authorization: `Bearer ${bearerToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(response.data, null, 2)
        }
      ]
    };
  } catch (error) {
    throw new McpError(
      ErrorCode.InternalError,
      `Failed to get integrations: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

export async function handleGetIntegrationById(args: { _id: string }, bearerToken: string): Promise<{
  content: Array<{
    type: string;
    text: string;
  }>;
}> {
  try {
    if (!args._id) {
      throw new McpError(
        ErrorCode.InvalidParams,
        'Integration ID is required for get_integration_by_id. Please provide a valid _id parameter.'
      );
    }

    // Get integration by ID via Celigo API
    const response = await axios.get(
      `${CELIGO_API_BASE}/integrations/${args._id}`,
      {
        headers: {
          Authorization: `Bearer ${bearerToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(response.data, null, 2)
        }
      ]
    };
  } catch (error) {
    throw new McpError(
      ErrorCode.InternalError,
      `Failed to get integration: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

export async function handleCreateIntegration(params: Record<string, unknown>, bearerToken: string): Promise<{
  content: Array<{
    type: string;
    text: string;
  }>;
}> {
  try {
    // Validate and parse input
    const validatedParams = runtimeSchema.parse(params);

    // Create integration via Celigo API
    const response = await axios.post(
      `${CELIGO_API_BASE}/integrations`,
      validatedParams,
      {
        headers: {
          Authorization: `Bearer ${bearerToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(response.data, null, 2)
        }
      ]
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new McpError(
        ErrorCode.InvalidParams,
        `Invalid integration parameters: ${error.errors.map(e => e.message).join(', ')}`
      );
    }
    throw new McpError(
      ErrorCode.InternalError,
      `Failed to create integration: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
