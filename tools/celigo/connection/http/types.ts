import { BaseConfig, MicroServices } from '../../shared';

export interface HttpAuth {
  type: 'basic' | 'token';
  basic?: {
    username: string;
    password: string;
  };
  token?: {
    token: string;
    location: 'header' | 'body' | 'url';
    headerName: string;
    scheme: string;
    paramName: string;
  };
}

export interface HttpConfig {
  formType: 'http' | 'graph_ql';
  mediaType: 'json';
  baseURI: string;
  unencrypted?: {
    field: string;
  };
  encrypted?: string;
  auth: HttpAuth;
  ping?: {
    relativeURI: string;
    method: string;
  };
}

export interface HttpConnection extends BaseConfig {
  type: 'http';
  http: HttpConfig;
  microServices: MicroServices;
}

// Tool Request Types
export interface CreateHttpConnectionRequest {
  name: string;
  config: Omit<HttpConnection, 'type' | 'name'>;
}

export interface UpdateHttpConnectionRequest {
  connectionId: string;
  config: Partial<HttpConnection>;
}

export interface GetHttpConnectionRequest {
  connectionId: string;
}

export interface ListHttpConnectionsRequest {
  limit?: number;
  offset?: number;
}

// Tool Response Types
export interface HttpConnectionResponse {
  _id: string;
  _lastModified: string;
  [key: string]: unknown;
}

export interface ListHttpConnectionsResponse {
  count: number;
  results: HttpConnectionResponse[];
}

// Tool Parameter Types
export interface HttpConnectionToolParameters {
  action: 'create' | 'update' | 'get' | 'list' | 'delete';
  connectionId?: string;
  config?: HttpConnection | Partial<HttpConnection>;
  limit?: number;
  offset?: number;
}
