import axios, { AxiosError } from 'axios';
import { NetSuiteApiConfig, NetSuiteCredentials, NetSuiteApiResponse } from './types';

let currentCredentials: NetSuiteCredentials | null = null;

export const setNetSuiteCredentials = (credentials: NetSuiteCredentials | null) => {
  if (credentials) {
    console.log('NetSuite credentials set:', {
      account_id: credentials.account_id,
      hasToken: !!credentials.token
    });
  } else {
    console.log('NetSuite credentials cleared');
  }
  currentCredentials = credentials;
};

export const getNetSuiteConfig = (): NetSuiteApiConfig | null => {
  if (!currentCredentials) {
    return null;
  }

  // Format account ID correctly - replace all underscores with hyphens and convert to lowercase
  const formattedAccountId = currentCredentials.account_id?.replace(/_/g, '-').toLowerCase() || '';
  
  return {
    baseUrl: `https://${formattedAccountId}.restlets.api.netsuite.com/app/site/hosting/restlet.nl`,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${currentCredentials.token}`,
      'Accept': 'application/json'
    }
  };
};

export const makeNetSuiteRequest = async <T>(
  script: string,
  deploy: string,
  data?: unknown
): Promise<NetSuiteApiResponse<T>> => {
  const config = getNetSuiteConfig();
  
  if (!config) {
    return {
      status: 'error',
      error: {
        code: 'NO_CREDENTIALS',
        message: 'Missing NetSuite credentials. Please ensure NetSuite is connected and enabled.'
      }
    };
  }

  try {
    const response = await axios({
      method: 'post',
      url: config.baseUrl,
      headers: config.headers,
      params: {
        script,
        deploy
      },
      data
    });

    return {
      status: 'success',
      data: response.data
    };
  } catch (error) {
    console.error('NetSuite API error:', error);

    if (error instanceof AxiosError) {
      return {
        status: 'error',
        error: {
          code: error.response?.status?.toString() || 'UNKNOWN',
          message: error.message,
          details: error.response?.data
        }
      };
    }

    return {
      status: 'error',
      error: {
        code: 'UNKNOWN',
        message: error instanceof Error ? error.message : 'An unknown error occurred'
      }
    };
  }
};
