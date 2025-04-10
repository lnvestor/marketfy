import { api } from '../shared/api';
import { validateRequired } from '../shared/validation';
import { IntegrationResponse, Integration } from './types';
import { AxiosError } from 'axios';
import { CeligoErrorCode } from '../shared/types';

const CELIGO_API_BASE = '/integrations';

function formatErrorResponse(error: unknown): IntegrationResponse {
  if (error instanceof AxiosError) {
    const errorData = error.response?.data;
    const status = error.response?.status;
    const message = errorData?.message || error.message;

    console.error('Integration API error:', {
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
        error: 'Invalid integration configuration',
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

  console.error('Integration error:', {
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

export async function handleCreateIntegration(
  config: Integration,
  token: string
): Promise<IntegrationResponse> {
  try {
    console.log('Creating integration:', {
      name: config.name,
      flowGroupingsCount: config.flowGroupings.length,
      timestamp: new Date().toISOString()
    });

    validateRequired(config, ['name', 'flowGroupings']);
    
    const response = await api.post<Integration>(
      CELIGO_API_BASE,
      token,
      config
    );

    console.log('Integration created successfully:', {
      name: config.name,
      response: response.data,
      timestamp: new Date().toISOString()
    });

    return {
      status: 'success',
      data: response.data
    };
  } catch (error) {
    console.error('Failed to create integration:', {
      error: error instanceof Error ? error.message : String(error),
      name: config.name,
      timestamp: new Date().toISOString()
    });

    return formatErrorResponse(error);
  }
}

export async function handleUpdateIntegration(
  integrationId: string,
  config: Integration,
  token: string
): Promise<IntegrationResponse> {
  try {
    console.log('Updating integration:', {
      integrationId,
      name: config.name,
      flowGroupingsCount: config.flowGroupings.length,
      timestamp: new Date().toISOString()
    });

    validateRequired(config, ['name', 'flowGroupings']);
    
    const response = await api.put<Integration>(
      `${CELIGO_API_BASE}/${integrationId}`,
      token,
      config
    );

    console.log('Integration updated successfully:', {
      integrationId,
      name: config.name,
      response: response.data,
      timestamp: new Date().toISOString()
    });

    return {
      status: 'success',
      data: response.data
    };
  } catch (error) {
    console.error('Failed to update integration:', {
      error: error instanceof Error ? error.message : String(error),
      integrationId,
      name: config.name,
      timestamp: new Date().toISOString()
    });

    return formatErrorResponse(error);
  }
}

export async function handleGetIntegration(
  integrationId: string,
  token: string
): Promise<IntegrationResponse> {
  try {
    console.log('Getting integration:', {
      integrationId,
      timestamp: new Date().toISOString()
    });

    const response = await api.get<Integration>(
      `${CELIGO_API_BASE}/${integrationId}`,
      token
    );

    console.log('Integration retrieved successfully:', {
      integrationId,
      response: response.data,
      timestamp: new Date().toISOString()
    });

    return {
      status: 'success',
      data: response.data
    };
  } catch (error) {
    console.error('Failed to get integration:', {
      error: error instanceof Error ? error.message : String(error),
      integrationId,
      timestamp: new Date().toISOString()
    });

    return formatErrorResponse(error);
  }
}

export async function handleListIntegrations(
  token: string
): Promise<IntegrationResponse> {
  try {
    console.log('Listing integrations:', {
      timestamp: new Date().toISOString()
    });

    const response = await api.get<Integration[]>(
      CELIGO_API_BASE,
      token
    );

    console.log('Integrations listed successfully:', {
      count: Array.isArray(response.data) ? response.data.length : 'unknown',
      response: response.data,
      timestamp: new Date().toISOString()
    });

    return {
      status: 'success',
      data: response.data
    };
  } catch (error) {
    console.error('Failed to list integrations:', {
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    });

    return formatErrorResponse(error);
  }
}
