import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';
import { ConnectionConfig, UpdateConnectionConfig, HttpConnection } from './types.js';

const CELIGO_API_BASE = 'https://api.integrator.io/v1';

export async function handleUpdateConnection(args: UpdateConnectionConfig, bearerToken: string) {
  try {
    const { connectionId, config } = args;

    // Validate required fields
    if (!connectionId || !config) {
      throw new McpError(
        ErrorCode.InvalidParams,
        'Missing required parameters: connectionId, config'
      );
    }

    // Fix http property if it's a stringified JSON for HTTP connections
    let processedConfig = { ...config };
    if (processedConfig.type === 'http') {
      if (typeof (processedConfig as HttpConnection).http === 'string') {
        try {
          (processedConfig as HttpConnection).http = JSON.parse((processedConfig as any).http);
        } catch (e) {
          throw new McpError(
            ErrorCode.InvalidParams,
            'Invalid http property: must be an object or valid JSON string'
          );
        }
      }
    }

    // Remove any backtick quotes from property names
    processedConfig = JSON.parse(
      JSON.stringify(processedConfig).replace(/`/g, '"')
    );

    // Update connection via Celigo API
    const response = await axios.put(
      `${CELIGO_API_BASE}/connections/${connectionId}`,
      processedConfig,
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
          text: JSON.stringify(response.data, null, 2),
        },
      ],
    };
  } catch (error) {
    if (error instanceof Error) {
      const axiosError = error as any;
      if (axiosError.response) {
        throw new McpError(
          ErrorCode.InternalError,
          `Celigo API error: ${axiosError.response?.data?.message || error.message}`
        );
      }
      throw new McpError(ErrorCode.InternalError, error.message);
    }
    throw new McpError(ErrorCode.InternalError, 'Unknown error occurred');
  }
}

export async function handleGetConnections(args: any, bearerToken: string) {
  try {
    // Get all connections via Celigo API
    const response = await axios.get(
      `${CELIGO_API_BASE}/connections`,
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
          text: JSON.stringify(response.data, null, 2),
        },
      ],
    };
  } catch (error) {
    if (error instanceof Error) {
      const axiosError = error as any;
      if (axiosError.response) {
        throw new McpError(
          ErrorCode.InternalError,
          `Celigo API error: ${axiosError.response?.data?.message || error.message}`
        );
      }
      throw new McpError(ErrorCode.InternalError, error.message);
    }
    throw new McpError(ErrorCode.InternalError, 'Unknown error occurred');
  }
}

export async function handleGetConnectionById(args: { _id: string }, bearerToken: string) {
  try {
    if (!args._id) {
      throw new McpError(
        ErrorCode.InvalidParams,
        'Connection ID is required for get_connection_by_id. Please provide a valid _id parameter.'
      );
    }

    // Get connection by ID via Celigo API
    const response = await axios.get(
      `${CELIGO_API_BASE}/connections/${args._id}`,
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
          text: JSON.stringify(response.data, null, 2),
        },
      ],
    };
  } catch (error) {
    if (error instanceof Error) {
      const axiosError = error as any;
      if (axiosError.response) {
        throw new McpError(
          ErrorCode.InternalError,
          `Celigo API error: ${axiosError.response?.data?.message || error.message}`
        );
      }
      throw new McpError(ErrorCode.InternalError, error.message);
    }
    throw new McpError(ErrorCode.InternalError, 'Unknown error occurred');
  }
}

export async function handleCreateConnection(args: any, bearerToken: string) {
  try {
    // Validate required fields
    if (!args.type || !args.name) {
      throw new McpError(
        ErrorCode.InvalidParams,
        'Missing required parameters: type, name'
      );
    }

    // Fix http property if it's a stringified JSON
    let processedArgs = { ...args };
    if (typeof processedArgs.http === 'string') {
      try {
        processedArgs.http = JSON.parse(processedArgs.http);
      } catch (e) {
        throw new McpError(
          ErrorCode.InvalidParams,
          'Invalid http property: must be an object or valid JSON string'
        );
      }
    }

    // Remove any backtick quotes from property names
    processedArgs = JSON.parse(
      JSON.stringify(processedArgs).replace(/`/g, '"')
    );

    // Create connection via Celigo API
    const response = await axios.post(
      `${CELIGO_API_BASE}/connections`,
      processedArgs,
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
          text: JSON.stringify(response.data, null, 2),
        },
      ],
    };
  } catch (error) {
    if (error instanceof Error) {
      const axiosError = error as any;
      if (axiosError.response) {
        throw new McpError(
          ErrorCode.InternalError,
          `Celigo API error: ${axiosError.response?.data?.message || error.message}`
        );
      }
      throw new McpError(ErrorCode.InternalError, error.message);
    }
    throw new McpError(ErrorCode.InternalError, 'Unknown error occurred');
  }
}
