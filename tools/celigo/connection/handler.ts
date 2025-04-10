import { api, CeligoErrorCode, createErrorResponse } from '../shared';
import { ConnectionConfig, ConnectionResponse, ListConnectionsResponse } from './types';
import {
  validateHttpConfig,
  validateNetSuiteConfig,
  validateMicroServices,
  validateQueues
} from '../shared/validation';

function toRecord<T>(obj: T): Record<string, unknown> {
  return obj as unknown as Record<string, unknown>;
}

export async function handleCreateConnection(
  config: ConnectionConfig,
  token: string
): Promise<ConnectionResponse> {
  try {
    // Validate connection config based on type
    switch (config.type) {
      case 'http':
        validateHttpConfig(toRecord(config.http));
        break;
      case 'netsuite':
        validateNetSuiteConfig(toRecord(config.netsuite));
        break;
    }

    // Validate common fields
    if (config.microServices) {
      validateMicroServices(toRecord(config));
    }
    if (config.queues) {
      validateQueues(toRecord(config));
    }

    // Create connection via Celigo API
    const response = await api.post<ConnectionResponse>(
      '/connections',
      token,
      toRecord(config)
    );
    return response.data;
  } catch (error) {
    throw createErrorResponse(
      CeligoErrorCode.ApiError,
      error instanceof Error ? error.message : 'Failed to create connection'
    );
  }
}

export async function handleUpdateConnection(
  connectionId: string,
  config: Partial<ConnectionConfig>,
  token: string
): Promise<ConnectionResponse> {
  try {
    // Validate connection config based on type
    if (config.type === 'http' && config.http) {
      validateHttpConfig(toRecord(config.http));
    } else if (config.type === 'netsuite' && config.netsuite) {
      validateNetSuiteConfig(toRecord(config.netsuite));
    }

    // Validate common fields if present
    if (config.microServices) {
      validateMicroServices(toRecord(config));
    }
    if (config.queues) {
      validateQueues(toRecord(config));
    }

    // Update connection via Celigo API
    const response = await api.put<ConnectionResponse>(
      `/connections/${connectionId}`,
      token,
      toRecord(config)
    );
    return response.data;
  } catch (error) {
    throw createErrorResponse(
      CeligoErrorCode.ApiError,
      error instanceof Error ? error.message : 'Failed to update connection'
    );
  }
}

export async function handleGetConnection(
  connectionId: string,
  token: string
): Promise<ConnectionResponse> {
  try {
    const response = await api.get<ConnectionResponse>(
      `/connections/${connectionId}`,
      token
    );
    return response.data;
  } catch (error) {
    throw createErrorResponse(
      CeligoErrorCode.ApiError,
      error instanceof Error ? error.message : 'Failed to get connection'
    );
  }
}

export async function handleListConnections(
  token: string,
  type?: string,
  limit?: number,
  offset?: number
): Promise<ListConnectionsResponse> {
  try {
    let url = '/connections';
    const params: string[] = [];

    if (type) {
      params.push(`type=${type}`);
    }
    if (limit) {
      params.push(`limit=${limit}`);
    }
    if (offset) {
      params.push(`offset=${offset}`);
    }

    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }

    const response = await api.get<ListConnectionsResponse>(url, token);
    return response.data;
  } catch (error) {
    throw createErrorResponse(
      CeligoErrorCode.ApiError,
      error instanceof Error ? error.message : 'Failed to list connections'
    );
  }
}

export async function handleDeleteConnection(
  connectionId: string,
  token: string
): Promise<void> {
  try {
    await api.delete(`/connections/${connectionId}`, token);
  } catch (error) {
    throw createErrorResponse(
      CeligoErrorCode.ApiError,
      error instanceof Error ? error.message : 'Failed to delete connection'
    );
  }
}
