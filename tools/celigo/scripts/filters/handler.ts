import { api } from '../../shared/api';
import { ScriptConfig, ScriptResponse } from './types';

// Current token management
let currentToken: string | null = null;

export const setFilterScriptCredentials = (token: string) => {
  console.log('Setting filter script credentials:', {
    hasToken: !!token,
    tokenLength: token?.length,
    timestamp: new Date().toISOString()
  });
  currentToken = token;
};

// API handlers
export const createFilterScript = async (config: ScriptConfig) => {
  if (!currentToken) {
    throw new Error('No Celigo credentials available');
  }

  // Create the script via API
  const response = await api.post<ScriptResponse>('/scripts', currentToken, config);
  return response.data;
};

export const updateFilterScript = async (scriptId: string, config: ScriptConfig) => {
  if (!currentToken) {
    throw new Error('No Celigo credentials available');
  }

  // Update the script via API
  const response = await api.put<ScriptResponse>(`/scripts/${scriptId}`, currentToken, config);
  return response.data;
};

export const getFilterScript = async (scriptId: string) => {
  if (!currentToken) {
    throw new Error('No Celigo credentials available');
  }

  // Get the script via API
  const response = await api.get<ScriptResponse>(`/scripts/${scriptId}`, currentToken);
  return response.data;
};

export const deleteFilterScript = async (scriptId: string) => {
  if (!currentToken) {
    throw new Error('No Celigo credentials available');
  }

  // Delete the script via API
  const response = await api.delete<any>(`/scripts/${scriptId}`, currentToken);
  return response.data;
};