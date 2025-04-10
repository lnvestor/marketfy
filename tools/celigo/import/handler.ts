import axios, { AxiosError } from 'axios';
import { ImportConfig, ImportResponse } from './shared/types';

const CELIGO_API_BASE = 'https://api.integrator.io/v1';

interface CeligoErrorResponse {
  message: string;
}

interface CeligoDetailedErrorResponse {
  errors?: Array<{
    field: string;
    code: string;
    message: string;
  }>;
  message?: string;
}

export async function handleCreateImport(
  config: ImportConfig,
  token: string
): Promise<ImportResponse> {
  try {
    // Validate required fields
    if (!config.name || !config._connectionId || !config.apiIdentifier) {
      throw new Error('Missing required parameters: name, _connectionId, or apiIdentifier');
    }
    
    // Log request configuration for debugging
    console.log('Creating import with config:', {
      name: config.name,
      apiIdentifier: config.apiIdentifier,
      adaptorType: config.adaptorType,
    });

    // Create import via Celigo API
    const response = await axios.post(
      `${CELIGO_API_BASE}/imports`,
      config,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<CeligoDetailedErrorResponse>;
        const errorData = axiosError.response?.data;
        
        console.error('Celigo API error details:', {
          status: axiosError.response?.status,
          statusText: axiosError.response?.statusText,
          data: JSON.stringify(errorData)
        });
        
        // Handle the structured error format that Celigo uses
        if (errorData && errorData.errors && Array.isArray(errorData.errors)) {
          const errors = errorData.errors;
          const suggestedFixes = [];
          
          // Process each error and provide helpful suggestions
          errors.forEach(err => {
            if (err.code === 'missing_required_field') {
              // Handle common missing fields
              if (err.field === 'http.response.resourcePath') {
                suggestedFixes.push(`- Add "http.recordPath" to specify where to find records in the response`);
              } else if (err.field.includes('pagination')) {
                suggestedFixes.push(`- Add "http.pagination" configuration for this request`);
              } else {
                suggestedFixes.push(`- Missing required field: ${err.field} - ${err.message}`);
              }
            } else {
              suggestedFixes.push(`- ${err.message || `Error with ${err.field}: ${err.code}`}`);
            }
          });
          
          if (suggestedFixes.length > 0) {
            throw new Error(`Celigo API error: ${errors[0].message || 'Request failed'}. Try these fixes:\n${suggestedFixes.join('\n')}`);
          }
        }
        
        throw new Error(`Celigo API error: ${axiosError.response?.data?.message || error.message}`);
      }
      throw error;
    }
    throw new Error('Unknown error occurred');
  }
}

export async function handleUpdateImport(
  importId: string,
  config: Partial<ImportConfig>,
  token: string
): Promise<ImportResponse> {
  try {
    // Validate required fields
    if (!importId || !config) {
      throw new Error('Missing required parameters: importId, config');
    }

    // Update import via Celigo API
    const response = await axios.put(
      `${CELIGO_API_BASE}/imports/${importId}`,
      config,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<CeligoErrorResponse>;
        throw new Error(`Celigo API error: ${axiosError.response?.data?.message || error.message}`);
      }
      throw error;
    }
    throw new Error('Unknown error occurred');
  }
}

export async function handleGetImportById(
  importId: string,
  token: string
): Promise<ImportResponse> {
  try {
    if (!importId) {
      throw new Error('Import ID is required');
    }

    // Get import by ID via Celigo API
    const response = await axios.get(
      `${CELIGO_API_BASE}/imports/${importId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<CeligoErrorResponse>;
        throw new Error(`Celigo API error: ${axiosError.response?.data?.message || error.message}`);
      }
      throw error;
    }
    throw new Error('Unknown error occurred');
  }
}

export async function handleGetImports(
  token: string,
  limit?: number,
  offset?: number
): Promise<ImportResponse[]> {
  try {
    // Build query parameters
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());

    // Get imports via Celigo API
    const response = await axios.get(
      `${CELIGO_API_BASE}/imports${params.toString() ? `?${params.toString()}` : ''}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<CeligoErrorResponse>;
        throw new Error(`Celigo API error: ${axiosError.response?.data?.message || error.message}`);
      }
      throw error;
    }
    throw new Error('Unknown error occurred');
  }
}

export async function handleDeleteImport(
  importId: string,
  token: string
): Promise<void> {
  try {
    if (!importId) {
      throw new Error('Import ID is required');
    }

    // Delete import via Celigo API
    await axios.delete(
      `${CELIGO_API_BASE}/imports/${importId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    if (error instanceof Error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<CeligoErrorResponse>;
        throw new Error(`Celigo API error: ${axiosError.response?.data?.message || error.message}`);
      }
      throw error;
    }
    throw new Error('Unknown error occurred');
  }
}
