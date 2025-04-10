import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';
import { FlowConfig, UpdateFlowConfig } from './types.js';

const CELIGO_API_BASE = 'https://api.integrator.io/v1';

// Type guard for pageGenerator
function isValidPageGenerator(pg: any): pg is { _exportId: string; skipRetries?: boolean } {
  return typeof pg === 'object' && pg !== null && typeof pg._exportId === 'string';
}

// Type guard for pageProcessor
function isValidPageProcessor(pp: any): pp is { 
  type: 'export' | 'import'; 
  _exportId?: string; 
  _importId?: string;
  responseMapping?: { fields: any[]; lists: any[] };
} {
  if (typeof pp !== 'object' || pp === null || !pp.type) return false;
  
  if (pp.type === 'export') {
    return typeof pp._exportId === 'string' && 
           typeof pp.responseMapping === 'object' && 
           pp.responseMapping !== null;
  }
  
  if (pp.type === 'import') {
    return typeof pp._importId === 'string';
  }
  
  return false;
}

export async function handleUpdateFlow(args: UpdateFlowConfig, bearerToken: string) {
  try {
    const { flowId, config } = args;

    // Validate required fields
    if (!flowId || !config) {
      throw new McpError(
        ErrorCode.InvalidParams,
        'Missing required parameters: flowId, config'
      );
    }

    // Validate config fields
    if (!config.name || !config._integrationId || !config._flowGroupingId || 
        !config.pageGenerators || !config.pageGenerators.length ||
        !config.pageProcessors || !Array.isArray(config.pageProcessors)) {
      throw new McpError(
        ErrorCode.InvalidParams,
        'Missing required parameters in config: name, _integrationId, _flowGroupingId, pageGenerators, or pageProcessors'
      );
    }

    // Validate pageGenerators have required fields
    if (!config.pageGenerators.every(isValidPageGenerator)) {
      throw new McpError(
        ErrorCode.InvalidParams,
        'Each pageGenerator must have an _exportId'
      );
    }

    // Validate pageProcessors have required fields based on type
    if (!config.pageProcessors.every(isValidPageProcessor)) {
      throw new McpError(
        ErrorCode.InvalidParams,
        'Invalid pageProcessor configuration'
      );
    }

    // Map processors with proper type handling
    const pageProcessors = config.pageProcessors.map((pp: any) => {
      if (pp.type === 'export') {
        return {
          type: 'export' as const,
          _exportId: pp._exportId,
          proceedOnFailure: pp.proceedOnFailure ?? false,
          responseMapping: {
            fields: pp.responseMapping?.fields || [],
            lists: pp.responseMapping?.lists || []
          },
          ...(pp.hooks ? { hooks: pp.hooks } : {})
        };
      } else {
        return {
          type: 'import' as const,
          _importId: pp._importId,
          proceedOnFailure: pp.proceedOnFailure ?? false,
          responseMapping: {
            fields: pp.responseMapping?.fields || [],
            lists: pp.responseMapping?.lists || []
          }
        };
      }
    });

    const processedConfig: FlowConfig = {
      name: config.name,
      _integrationId: config._integrationId,
      _flowGroupingId: config._flowGroupingId,
      free: config.free ?? false,
      pageGenerators: config.pageGenerators.map((pg: any) => ({
        _exportId: pg._exportId,
        skipRetries: pg.skipRetries ?? false,
      })),
      pageProcessors
    };

    console.log('Updating flow with config:', JSON.stringify(processedConfig, null, 2));

    // Update flow via Celigo API
    const response = await axios.put(
      `${CELIGO_API_BASE}/flows/${flowId}`,
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

export async function handleGetFlows(args: any, bearerToken: string) {
  try {
    // Get all flows via Celigo API
    const response = await axios.get(
      `${CELIGO_API_BASE}/flows`,
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

export async function handleGetFlowById(args: { _id: string }, bearerToken: string) {
  try {
    if (!args._id) {
      throw new McpError(
        ErrorCode.InvalidParams,
        'Flow ID is required for get_flow_by_id. Please provide a valid _id parameter.'
      );
    }

    // Get flow by ID via Celigo API
    const response = await axios.get(
      `${CELIGO_API_BASE}/flows/${args._id}`,
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

export async function handleCreateFlow(
  args: {
    name: string;
    _integrationId: string;
    _flowGroupingId: string;
    free?: boolean;
    pageGenerators: any[];
    pageProcessors: any[];
  }, 
  bearerToken: string
) {
  try {
    // Validate required fields
    if (!args.name || !args._integrationId || !args._flowGroupingId || 
        !args.pageGenerators || !args.pageGenerators.length ||
        !args.pageProcessors || !Array.isArray(args.pageProcessors)) {
      throw new McpError(
        ErrorCode.InvalidParams,
        'Missing required parameters: name, _integrationId, _flowGroupingId, pageGenerators, or pageProcessors'
      );
    }

    // Validate pageGenerators have required fields
    if (!args.pageGenerators.every(isValidPageGenerator)) {
      throw new McpError(
        ErrorCode.InvalidParams,
        'Each pageGenerator must have an _exportId'
      );
    }

    // Validate pageProcessors have required fields based on type
    if (!args.pageProcessors.every(isValidPageProcessor)) {
      throw new McpError(
        ErrorCode.InvalidParams,
        'Invalid pageProcessor configuration'
      );
    }

    // Create flow config with proper defaults
    // Map processors with proper type handling
    const pageProcessors = args.pageProcessors.map((pp: any) => {
      if (pp.type === 'export') {
        return {
          type: 'export' as const,
          _exportId: pp._exportId,
          proceedOnFailure: pp.proceedOnFailure ?? false,
          responseMapping: {
            fields: pp.responseMapping?.fields || [],
            lists: pp.responseMapping?.lists || []
          },
          ...(pp.hooks ? { hooks: pp.hooks } : {})
        };
      } else {
        return {
          type: 'import' as const,
          _importId: pp._importId,
          proceedOnFailure: pp.proceedOnFailure ?? false,
          responseMapping: {
            fields: pp.responseMapping?.fields || [],
            lists: pp.responseMapping?.lists || []
          }
        };
      }
    });

    const flowConfig: FlowConfig = {
      name: args.name,
      _integrationId: args._integrationId,
      _flowGroupingId: args._flowGroupingId,
      free: args.free ?? false,
      pageGenerators: args.pageGenerators.map((pg: any) => ({
        _exportId: pg._exportId,
        skipRetries: pg.skipRetries ?? false,
      })),
      pageProcessors
    };

    console.log('Creating flow with config:', JSON.stringify(flowConfig, null, 2));

    // Create flow via Celigo API
    const response = await axios.post(
      `${CELIGO_API_BASE}/flows`,
      flowConfig,
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
