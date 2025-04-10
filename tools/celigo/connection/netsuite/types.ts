import { BaseConfig, MicroServices } from '../../shared';

export interface NetSuiteConfig {
  wsdlVersion: string;
  concurrencyLevel: number;
}

export interface NetSuiteMicroServices extends MicroServices {
  disableRdbms: boolean;
}

export interface NetSuiteConnection extends BaseConfig {
  type: 'netsuite';
  netsuite: NetSuiteConfig;
  microServices: NetSuiteMicroServices;
}

// Tool Request Types
export interface CreateNetSuiteConnectionRequest {
  name: string;
  config: Omit<NetSuiteConnection, 'type' | 'name'>;
}

export interface UpdateNetSuiteConnectionRequest {
  connectionId: string;
  config: Partial<NetSuiteConnection>;
}

export interface GetNetSuiteConnectionRequest {
  connectionId: string;
}

export interface ListNetSuiteConnectionsRequest {
  limit?: number;
  offset?: number;
}

// Tool Response Types
export interface NetSuiteConnectionResponse {
  _id: string;
  _lastModified: string;
  [key: string]: unknown;
}

export interface ListNetSuiteConnectionsResponse {
  count: number;
  results: NetSuiteConnectionResponse[];
}

// Tool Parameter Types
export interface NetSuiteConnectionToolParameters {
  action: 'create' | 'update' | 'get' | 'list' | 'delete';
  connectionId?: string;
  config?: NetSuiteConnection | Partial<NetSuiteConnection>;
  limit?: number;
  offset?: number;
}
