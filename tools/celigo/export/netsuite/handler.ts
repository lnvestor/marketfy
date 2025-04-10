import axios from 'axios';
import { NetSuiteExport, NetSuiteExportListItem } from './types';

// Constants
export const CELIGO_API_BASE = 'https://api.integrator.io/v1';

// Credential management
let currentToken: string | null = null;

export const setNetSuiteExportCredentials = (token: string) => {
  console.log('Setting NetSuite export credentials:', {
    hasToken: !!token,
    tokenLength: token?.length,
    timestamp: new Date().toISOString()
  });
  currentToken = token;
};

// API handlers
export const createNetSuiteExport = async (config: NetSuiteExport) => {
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

export const updateNetSuiteExport = async (exportId: string, config: NetSuiteExport) => {
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

export const getNetSuiteExport = async (exportId: string) => {
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

export const listNetSuiteExports = async () => {
  if (!currentToken) {
    throw new Error('No Celigo credentials available');
  }

  const headers = {
    Authorization: `Bearer ${currentToken}`,
    'Content-Type': 'application/json'
  };

  const response = await axios.get<NetSuiteExportListItem[]>(
    `${CELIGO_API_BASE}/exports`,
    {
      headers,
      params: {
        adaptorType: 'NetSuiteExport'
      }
    }
  );

  return response.data
    .filter(item => item.adaptorType === 'NetSuiteExport')
    .map(item => ({
      _id: item._id,
      name: item.name
    }));
};