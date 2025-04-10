import { handleCreateConnection, handleUpdateConnection, handleGetConnection, handleListConnections, handleDeleteConnection } from '../handler';
import { NetSuiteConnection, NetSuiteConnectionResponse, ListNetSuiteConnectionsResponse } from './types';

export async function handleCreateNetSuiteConnection(
  config: NetSuiteConnection,
  token: string
): Promise<NetSuiteConnectionResponse> {
  return handleCreateConnection(config, token);
}

export async function handleUpdateNetSuiteConnection(
  connectionId: string,
  config: Partial<NetSuiteConnection>,
  token: string
): Promise<NetSuiteConnectionResponse> {
  return handleUpdateConnection(connectionId, config, token);
}

export async function handleGetNetSuiteConnection(
  connectionId: string,
  token: string
): Promise<NetSuiteConnectionResponse> {
  return handleGetConnection(connectionId, token);
}

export async function handleListNetSuiteConnections(
  token: string,
  limit?: number,
  offset?: number
): Promise<ListNetSuiteConnectionsResponse> {
  return handleListConnections(token, 'netsuite', limit, offset);
}

export async function handleDeleteNetSuiteConnection(
  connectionId: string,
  token: string
): Promise<void> {
  return handleDeleteConnection(connectionId, token);
}
