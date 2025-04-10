import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';
import { ExportConfig, UpdateExportConfig } from './types.js';

const CELIGO_API_BASE = 'https://api.integrator.io/v1';

export async function handleGetExports(args: Record<string, unknown> | undefined, bearerToken: string) {
  try {
    const response = await axios.get(
      `${CELIGO_API_BASE}/exports`,
      {
        headers: {
          Authorization: `Bearer ${bearerToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // Extract only name and id from each export
    const data = response.data as Array<{ _id: string; name: string }>;
    const simplifiedExports = data.map(item => ({
      _id: item._id,
      name: item.name
    }));

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(simplifiedExports, null, 2),
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

export async function handleGetExportById(args: { _id: string }, bearerToken: string) {
  try {
    if (!args._id) {
      throw new McpError(
        ErrorCode.InvalidParams,
        'Missing required parameter: _id'
      );
    }

    const response = await axios.get(
      `${CELIGO_API_BASE}/exports/${args._id}`,
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

export async function handleUpdateExport(args: UpdateExportConfig, bearerToken: string) {
  try {
    const { exportId, config } = args;

    // Validate required fields
    if (!exportId || !config) {
      throw new McpError(
        ErrorCode.InvalidParams,
        'Missing required parameters: exportId, config'
      );
    }

    // Update export via Celigo API
    const response = await axios.put(
      `${CELIGO_API_BASE}/exports/${exportId}`,
      config,
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

export async function handleCreateExport(args: ExportConfig, bearerToken: string) {
  try {
    // Validate required fields
    if (!args.name || !args._connectionId || !args.apiIdentifier) {
      throw new McpError(
        ErrorCode.InvalidParams,
        'Missing required parameters: name, _connectionId, or apiIdentifier'
      );
    }

    // Create export via Celigo API
    const response = await axios.post(
      `${CELIGO_API_BASE}/exports`,
      args,
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
