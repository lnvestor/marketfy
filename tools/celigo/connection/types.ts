import { HttpConnection, HttpConnectionResponse } from './http/types';
import { NetSuiteConnection, NetSuiteConnectionResponse } from './netsuite/types';

export type ConnectionConfig = HttpConnection | NetSuiteConnection;

export type ConnectionResponse = (HttpConnectionResponse | NetSuiteConnectionResponse) & {
  _id: string;
  _lastModified: string;
  [key: string]: unknown;
};

export interface ListConnectionsResponse {
  count: number;
  results: ConnectionResponse[];
}
