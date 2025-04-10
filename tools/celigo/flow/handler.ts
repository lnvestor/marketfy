import { api } from '../shared/api';
import { validateRequired } from '../shared/validation';
import { FlowConfig, UpdateFlowConfig, PageGenerator, PageProcessor, ExportProcessor, ImportProcessor } from './types';
import { AxiosError } from 'axios';
import { CeligoErrorCode } from '../shared/types';

const CELIGO_API_BASE = '/flows';

interface FlowResponse {
  status: 'success' | 'error';
  data?: Record<string, unknown>;
  error?: string;
  details?: {
    code: CeligoErrorCode;
    message: string;
  };
}

// Type guard for pageGenerator
function isValidPageGenerator(pg: unknown): pg is PageGenerator {
  return typeof pg === 'object' && pg !== null && typeof (pg as PageGenerator)._exportId === 'string';
}

// Type guard for export processor
function isValidExportProcessor(pp: unknown): pp is ExportProcessor {
  if (typeof pp !== 'object' || pp === null) return false;
  const processor = pp as ExportProcessor;
  
  if (processor.type !== 'export' || typeof processor._exportId !== 'string') return false;
  
  // Validate responseMapping
  if (!processor.responseMapping || typeof processor.responseMapping !== 'object') return false;
  if (!Array.isArray(processor.responseMapping.fields) || !Array.isArray(processor.responseMapping.lists)) return false;
  
  // Validate hooks if present
  if (processor.hooks) {
    if (typeof processor.hooks !== 'object') return false;
    if (!processor.hooks.postResponseMap || typeof processor.hooks.postResponseMap !== 'object') return false;
    if (typeof processor.hooks.postResponseMap.function !== 'string' || typeof processor.hooks.postResponseMap._scriptId !== 'string') return false;
  }
  
  return true;
}

// Type guard for import processor
function isValidImportProcessor(pp: unknown): pp is ImportProcessor {
  if (typeof pp !== 'object' || pp === null) return false;
  const processor = pp as ImportProcessor;
  
  if (processor.type !== 'import' || typeof processor._importId !== 'string') return false;
  
  // Validate responseMapping if present
  if (processor.responseMapping) {
    if (typeof processor.responseMapping !== 'object') return false;
    if (!Array.isArray(processor.responseMapping.fields) || !Array.isArray(processor.responseMapping.lists)) return false;
  }
  
  return true;
}

// Type guard for pageProcessor
function isValidPageProcessor(pp: unknown): pp is PageProcessor {
  if (typeof pp !== 'object' || pp === null || !('type' in pp)) return false;
  
  const processor = pp as PageProcessor;
  return processor.type === 'export' ? isValidExportProcessor(processor) : isValidImportProcessor(processor);
}

function formatErrorResponse(error: unknown): FlowResponse {
  if (error instanceof AxiosError) {
    const errorData = error.response?.data;
    const status = error.response?.status;
    const message = errorData?.message || error.message;

    console.error('Flow API error:', {
      status,
      message,
      data: errorData,
      timestamp: new Date().toISOString()
    });

    if (status === 401) {
      return {
        status: 'error',
        error: 'Authentication failed',
        details: {
          code: CeligoErrorCode.InvalidCredentials,
          message: 'Please check your Celigo credentials and ensure the addon is enabled.'
        }
      };
    }

    if (status === 400) {
      return {
        status: 'error',
        error: 'Invalid flow configuration',
        details: {
          code: CeligoErrorCode.InvalidConfig,
          message: typeof errorData === 'object' ? JSON.stringify(errorData, null, 2) : String(message)
        }
      };
    }

    return {
      status: 'error',
      error: `API Error (${status})`,
      details: {
        code: CeligoErrorCode.ApiError,
        message: typeof errorData === 'object' ? JSON.stringify(errorData, null, 2) : String(message)
      }
    };
  }

  console.error('Flow error:', {
    error: error instanceof Error ? error.message : String(error),
    timestamp: new Date().toISOString()
  });

  return {
    status: 'error',
    error: error instanceof Error ? error.message : 'An unknown error occurred',
    details: {
      code: CeligoErrorCode.UnknownError,
      message: error instanceof Error ? error.stack || error.message : String(error)
    }
  };
}

export async function handleUpdateFlow(args: UpdateFlowConfig, token: string): Promise<FlowResponse> {
  try {
    const { flowId, config } = args;

    console.log('Updating flow:', {
      flowId,
      name: config.name,
      integrationId: config._integrationId,
      flowGroupingId: config._flowGroupingId,
      pageGeneratorsCount: config.pageGenerators.length,
      pageProcessorsCount: config.pageProcessors.length,
      timestamp: new Date().toISOString()
    });

    validateRequired(config as unknown as Record<string, unknown>, ['name', '_integrationId', '_flowGroupingId', 'pageGenerators', 'pageProcessors']);

    // Validate pageGenerators have required fields
    if (!config.pageGenerators.every(isValidPageGenerator)) {
      throw new Error('Each pageGenerator must have an _exportId');
    }

    // Validate pageProcessors have required fields based on type
    if (!config.pageProcessors.every(isValidPageProcessor)) {
      throw new Error('Invalid pageProcessor configuration');
    }

    // Map processors with proper type handling
    const pageProcessors = config.pageProcessors.map((pp: PageProcessor) => {
      if (pp.type === 'export') {
        return {
          type: 'export' as const,
          _exportId: pp._exportId,
          proceedOnFailure: pp.proceedOnFailure ?? false,
          responseMapping: {
            fields: pp.responseMapping.fields,
            lists: pp.responseMapping.lists
          },
          ...(pp.hooks ? { hooks: pp.hooks } : {})
        };
      } else {
        return {
          type: 'import' as const,
          _importId: pp._importId,
          proceedOnFailure: pp.proceedOnFailure ?? false,
          ...(pp.responseMapping ? {
            responseMapping: {
              fields: pp.responseMapping.fields,
              lists: pp.responseMapping.lists
            }
          } : {})
        };
      }
    });

    const processedConfig: FlowConfig = {
      name: config.name,
      _integrationId: config._integrationId,
      _flowGroupingId: config._flowGroupingId,
      free: config.free ?? false,
      pageGenerators: config.pageGenerators.map((pg: PageGenerator) => ({
        _exportId: pg._exportId,
        skipRetries: pg.skipRetries ?? false,
      })),
      pageProcessors
    };

    const response = await api.put(
      `${CELIGO_API_BASE}/${flowId}`,
      token,
      processedConfig
    );

    console.log('Flow updated successfully:', {
      flowId,
      name: config.name,
      response: response.data,
      timestamp: new Date().toISOString()
    });

    return {
      status: 'success',
      data: response.data as Record<string, unknown>
    };
  } catch (error) {
    console.error('Failed to update flow:', {
      error: error instanceof Error ? error.message : String(error),
      flowId: args.flowId,
      name: args.config.name,
      timestamp: new Date().toISOString()
    });

    return formatErrorResponse(error);
  }
}

export async function handleGetFlows(token: string): Promise<FlowResponse> {
  try {
    console.log('Listing flows:', {
      timestamp: new Date().toISOString()
    });

    const response = await api.get(
      CELIGO_API_BASE,
      token
    );

    console.log('Flows listed successfully:', {
      count: Array.isArray(response.data) ? response.data.length : 'unknown',
      response: response.data,
      timestamp: new Date().toISOString()
    });

    return {
      status: 'success',
      data: response.data as Record<string, unknown>
    };
  } catch (error) {
    console.error('Failed to list flows:', {
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    });

    return formatErrorResponse(error);
  }
}

export async function handleGetFlowById(args: { _id: string }, token: string): Promise<FlowResponse> {
  try {
    console.log('Getting flow:', {
      flowId: args._id,
      timestamp: new Date().toISOString()
    });

    const response = await api.get(
      `${CELIGO_API_BASE}/${args._id}`,
      token
    );

    console.log('Flow retrieved successfully:', {
      flowId: args._id,
      response: response.data,
      timestamp: new Date().toISOString()
    });

    return {
      status: 'success',
      data: response.data as Record<string, unknown>
    };
  } catch (error) {
    console.error('Failed to get flow:', {
      error: error instanceof Error ? error.message : String(error),
      flowId: args._id,
      timestamp: new Date().toISOString()
    });

    return formatErrorResponse(error);
  }
}

export async function handleCreateFlow(
  args: {
    name: string;
    _integrationId: string;
    _flowGroupingId: string;
    free?: boolean;
    pageGenerators: PageGenerator[];
    pageProcessors: PageProcessor[];
  }, 
  token: string
): Promise<FlowResponse> {
  try {
    console.log('Creating flow:', {
      name: args.name,
      integrationId: args._integrationId,
      flowGroupingId: args._flowGroupingId,
      pageGeneratorsCount: args.pageGenerators.length,
      pageProcessorsCount: args.pageProcessors.length,
      timestamp: new Date().toISOString()
    });

    validateRequired(args as unknown as Record<string, unknown>, ['name', '_integrationId', '_flowGroupingId', 'pageGenerators', 'pageProcessors']);

    // Validate pageGenerators have required fields
    if (!args.pageGenerators.every(isValidPageGenerator)) {
      throw new Error('Each pageGenerator must have an _exportId');
    }

    // Validate pageProcessors have required fields based on type
    if (!args.pageProcessors.every(isValidPageProcessor)) {
      throw new Error('Invalid pageProcessor configuration');
    }

    // Map processors with proper type handling
    const pageProcessors = args.pageProcessors.map((pp: PageProcessor) => {
      if (pp.type === 'export') {
        return {
          type: 'export' as const,
          _exportId: pp._exportId,
          proceedOnFailure: pp.proceedOnFailure ?? false,
          responseMapping: {
            fields: pp.responseMapping.fields,
            lists: pp.responseMapping.lists
          },
          ...(pp.hooks ? { hooks: pp.hooks } : {})
        };
      } else {
        return {
          type: 'import' as const,
          _importId: pp._importId,
          proceedOnFailure: pp.proceedOnFailure ?? false,
          ...(pp.responseMapping ? {
            responseMapping: {
              fields: pp.responseMapping.fields,
              lists: pp.responseMapping.lists
            }
          } : {})
        };
      }
    });

    const flowConfig: FlowConfig = {
      name: args.name,
      _integrationId: args._integrationId,
      _flowGroupingId: args._flowGroupingId,
      free: args.free ?? false,
      pageGenerators: args.pageGenerators.map((pg: PageGenerator) => ({
        _exportId: pg._exportId,
        skipRetries: pg.skipRetries ?? false,
      })),
      pageProcessors
    };

    const response = await api.post(
      CELIGO_API_BASE,
      token,
      flowConfig
    );

    console.log('Flow created successfully:', {
      name: args.name,
      response: response.data,
      timestamp: new Date().toISOString()
    });

    return {
      status: 'success',
      data: response.data as Record<string, unknown>
    };
  } catch (error) {
    console.error('Failed to create flow:', {
      error: error instanceof Error ? error.message : String(error),
      name: args.name,
      timestamp: new Date().toISOString()
    });

    return formatErrorResponse(error);
  }
}
