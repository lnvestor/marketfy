export interface CeligoCredentials {
  token: string;
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

export interface ErrorResponse {
  status: 'error';
  error: string;
  details?: {
    code: string;
    message: string;
  };
}

export interface MicroServices {
  disableNetSuiteWebServices: boolean;
  disableRdbms: boolean;
  disableDataWarehouse: boolean;
}

export interface BaseConfig {
  name: string;
  offline?: boolean;
  sandbox?: boolean;
  microServices?: MicroServices;
  queues?: Array<{ name: string; size: number }>;
}

// Common error codes
export enum CeligoErrorCode {
  InvalidCredentials = 'INVALID_CREDENTIALS',
  ConnectionNotFound = 'CONNECTION_NOT_FOUND',
  InvalidConfig = 'INVALID_CONFIG',
  ApiError = 'API_ERROR',
  NetworkError = 'NETWORK_ERROR',
  UnknownError = 'UNKNOWN_ERROR'
}
