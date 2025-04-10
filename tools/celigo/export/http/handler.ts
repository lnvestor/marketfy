import axios from 'axios';
import { HTTPExport, HttpExportListItem } from './types';

// Constants
export const CELIGO_API_BASE = 'https://api.integrator.io/v1';

// Credential management
let currentToken: string | null = null;

export const setHttpExportCredentials = (token: string) => {
  console.log('Setting HTTP export credentials:', {
    hasToken: !!token,
    tokenLength: token?.length,
    timestamp: new Date().toISOString()
  });
  currentToken = token;
};

// API handlers
export const createHttpExport = async (config: HTTPExport) => {
  if (!currentToken) {
    throw new Error('No Celigo credentials available');
  }

  const headers = {
    Authorization: `Bearer ${currentToken}`,
    'Content-Type': 'application/json'
  };

  const response = await axios.post(
    `${CELIGO_API_BASE}/exports`,
    config,
    { headers }
  );
  return response.data;
};

export const updateHttpExport = async (exportId: string, config: HTTPExport) => {
  if (!currentToken) {
    throw new Error('No Celigo credentials available');
  }

  const headers = {
    Authorization: `Bearer ${currentToken}`,
    'Content-Type': 'application/json'
  };

  const response = await axios.put(
    `${CELIGO_API_BASE}/exports/${exportId}`,
    config,
    { headers }
  );
  return response.data;
};

export const getHttpExport = async (exportId: string) => {
  if (!currentToken) {
    throw new Error('No Celigo credentials available');
  }

  const headers = {
    Authorization: `Bearer ${currentToken}`,
    'Content-Type': 'application/json'
  };

  const response = await axios.get(
    `${CELIGO_API_BASE}/exports/${exportId}`,
    { headers }
  );
  return response.data;
};

export const listHttpExports = async () => {
  if (!currentToken) {
    throw new Error('No Celigo credentials available');
  }

  const headers = {
    Authorization: `Bearer ${currentToken}`,
    'Content-Type': 'application/json'
  };

  const response = await axios.get<HttpExportListItem[]>(
    `${CELIGO_API_BASE}/exports`,
    {
      headers,
      params: {
        adaptorType: 'HTTPExport'
      }
    }
  );

  return response.data
    .filter(item => item.adaptorType === 'HTTPExport')
    .map(item => ({
      _id: item._id,
      name: item.name
    }));
};
