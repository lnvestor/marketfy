import { handleCreateConnection, handleUpdateConnection, handleGetConnection, handleListConnections, handleDeleteConnection } from '../handler';
import { HttpConnection, HttpConnectionResponse, ListHttpConnectionsResponse } from './types';

export async function handleCreateHttpConnection(
  config: HttpConnection,
  token: string
): Promise<HttpConnectionResponse> {
  return handleCreateConnection(config, token);
}

export async function handleUpdateHttpConnection(
  connectionId: string,
  config: Partial<HttpConnection>,
  token: string
): Promise<HttpConnectionResponse> {
  return handleUpdateConnection(connectionId, config, token);
}

export async function handleGetHttpConnection(
  connectionId: string,
  token: string
): Promise<HttpConnectionResponse> {
  return handleGetConnection(connectionId, token);
}

export async function handleListHttpConnections(
  token: string,
  limit?: number,
  offset?: number
): Promise<ListHttpConnectionsResponse> {
  return handleListConnections(token, 'http', limit, offset);
}

export async function handleDeleteHttpConnection(
  connectionId: string,
  token: string
): Promise<void> {
  return handleDeleteConnection(connectionId, token);
}
