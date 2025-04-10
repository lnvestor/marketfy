import type { ApiResponse } from '../../../types/responses.js';

// Import connection types
import type { HttpConnection } from './http.js';
import type { FtpConnection } from './ftp.js';
import type { SalesforceConnection } from './salesforce.js';
import type { NetSuiteConnection } from './netsuite.js';

// Export all connection types
export type { 
  HttpConnection,
  FtpConnection,
  SalesforceConnection,
  NetSuiteConnection,
};

// Union type of all possible connection types
export type ConnectionConfig = 
  | HttpConnection 
  | FtpConnection 
  | SalesforceConnection 
  | NetSuiteConnection;

// Connection response type using shared ApiResponse
export type ConnectionResponse<T extends ConnectionConfig> = ApiResponse<T>;
