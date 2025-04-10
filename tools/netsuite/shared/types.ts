export interface NetSuiteCredentials {
  account_id: string;
  token: string;
}

export interface NetSuiteApiConfig {
  baseUrl: string;
  headers: {
    'Content-Type': string;
    'Authorization': string;
    'Accept': string;
  };
}

export interface NetSuiteApiError {
  code: string;
  message: string;
  details?: unknown;
}

export interface NetSuiteApiResponse<T = unknown> {
  status: 'success' | 'error';
  data?: T;
  error?: NetSuiteApiError;
}
