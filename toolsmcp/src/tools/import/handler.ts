import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';
import { ImportConfig, UpdateImportConfig } from './types.js';

const CELIGO_API_BASE = 'https://api.integrator.io/v1';

export async function handleUpdateImport(args: UpdateImportConfig, bearerToken: string) {
  try {
    const { importId, config } = args;

    // Validate required fields
    if (!importId || !config) {
      throw new McpError(
        ErrorCode.InvalidParams,
        'Missing required parameters: importId, config'
      );
    }

    // Fix http property if it's a stringified JSON and this is an HTTPImport
    let processedConfig = { ...config };
    if (processedConfig.adaptorType === 'HTTPImport' && typeof processedConfig.http === 'string') {
      try {
        processedConfig.http = JSON.parse(processedConfig.http);
      } catch (e) {
        throw new McpError(
          ErrorCode.InvalidParams,
          'Invalid http property: must be an object or valid JSON string'
        );
      }
    }

    // Remove any backtick quotes from property names
    processedConfig = JSON.parse(
      JSON.stringify(processedConfig).replace(/`/g, '"')
    );

    // Update import via Celigo API
    const response = await axios.put(
      `${CELIGO_API_BASE}/imports/${importId}`,
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

export async function handleGetImports(args: any, bearerToken: string) {
  try {
    // Get all imports via Celigo API
    const response = await axios.get(
      `${CELIGO_API_BASE}/imports`,
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

export async function handleGetImportById(args: { _id: string }, bearerToken: string) {
  try {
    if (!args._id) {
      throw new McpError(
        ErrorCode.InvalidParams,
        'Import ID is required for get_import_by_id. Please provide a valid _id parameter.'
      );
    }

    // Get import by ID via Celigo API
    const response = await axios.get(
      `${CELIGO_API_BASE}/imports/${args._id}`,
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

export async function handleCreateImport(args: ImportConfig, bearerToken: string) {
  try {
    // Validate required fields
    if (!args.name || !args._connectionId || !args.apiIdentifier) {
      throw new McpError(
        ErrorCode.InvalidParams,
        'Missing required parameters: name, _connectionId, or apiIdentifier'
      );
    }

    // Fix http property if it's a stringified JSON and this is an HTTPImport
    let processedArgs = { ...args };
    if (processedArgs.adaptorType === 'HTTPImport' && typeof processedArgs.http === 'string') {
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

    // Create import via Celigo API
    const response = await axios.post(
      `${CELIGO_API_BASE}/imports`,
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
