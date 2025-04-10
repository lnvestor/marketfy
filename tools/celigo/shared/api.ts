import axios, { AxiosError } from 'axios';
import { CeligoErrorCode, ErrorResponse, ApiResponse } from './types';

export const CELIGO_API_BASE = 'https://api.integrator.io/v1';

export const createHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json'
});

interface CeligoErrorData {
  message?: string;
  code?: string;
  details?: unknown;
  [key: string]: unknown;
}

function formatErrorDetails(error: unknown): string {
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;
  if (typeof error === 'object' && error !== null) {
    try {
      return JSON.stringify(error, null, 2);
    } catch {
      return Object.prototype.toString.call(error);
    }
  }
  return String(error);
}

export async function makeRequest<T, D = Record<string, unknown>>(
  method: 'get' | 'post' | 'put' | 'delete',
  endpoint: string,
  token: string,
  data?: D
): Promise<ApiResponse<T>> {
  try {
    console.log(`Making ${method.toUpperCase()} request to ${endpoint}`, {
      hasData: !!data,
      timestamp: new Date().toISOString()
    });

    const response = await axios({
      method,
      url: `${CELIGO_API_BASE}${endpoint}`,
      headers: createHeaders(token),
      data
    });

    console.log(`${method.toUpperCase()} request successful`, {
      endpoint,
      status: response.status,
      timestamp: new Date().toISOString()
    });

    return {
      data: response.data,
      status: response.status
    };
  } catch (error) {
    console.error(`${method.toUpperCase()} request failed`, {
      endpoint,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    });

    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<CeligoErrorData>;
      const errorData = axiosError.response?.data;

      // Log detailed error information
      console.error('Detailed API error:', {
        status: axiosError.response?.status,
        statusText: axiosError.response?.statusText,
        data: errorData,
        timestamp: new Date().toISOString()
      });

      if (axiosError.response?.status === 401) {
        throw createErrorResponse(
          CeligoErrorCode.InvalidCredentials,
          'Invalid or expired token. Please check your Celigo credentials.'
        );
      }

      if (axiosError.response?.status === 404) {
        throw createErrorResponse(
          CeligoErrorCode.ConnectionNotFound,
          'Resource not found. Please verify the requested resource exists.'
        );
      }

      if (axiosError.response?.status === 400) {
        throw createErrorResponse(
          CeligoErrorCode.InvalidConfig,
          `Invalid request: ${formatErrorDetails(errorData)}`
        );
      }

      throw createErrorResponse(
        CeligoErrorCode.ApiError,
        `API Error (${axiosError.response?.status}): ${formatErrorDetails(errorData)}`
      );
    }

    if (error instanceof Error && error.message.includes('Network')) {
      throw createErrorResponse(
        CeligoErrorCode.NetworkError,
        'Network error occurred. Please check your internet connection.'
      );
    }

    throw createErrorResponse(
      CeligoErrorCode.UnknownError,
      `Unexpected error: ${formatErrorDetails(error)}`
    );
  }
}

export function createErrorResponse(
  code: CeligoErrorCode,
  message: string
): ErrorResponse {
  return {
    status: 'error',
    error: message,
    details: {
      code,
      message
    }
  };
}

// Helper functions for common API operations
export const api = {
  async get<T>(endpoint: string, token: string): Promise<ApiResponse<T>> {
    return makeRequest<T>('get', endpoint, token);
  },

  async post<T, D = Record<string, unknown>>(
    endpoint: string, 
    token: string, 
    data: D
  ): Promise<ApiResponse<T>> {
    return makeRequest<T, D>('post', endpoint, token, data);
  },

  async put<T, D = Record<string, unknown>>(
    endpoint: string, 
    token: string, 
    data: D
  ): Promise<ApiResponse<T>> {
    return makeRequest<T, D>('put', endpoint, token, data);
  },

  async delete<T>(endpoint: string, token: string): Promise<ApiResponse<T>> {
    return makeRequest<T>('delete', endpoint, token);
  }
};
