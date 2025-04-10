import axios from 'axios';
import { ExaSearchParameters, ExaSearchResponse } from './types';

let apiKey: string | null = null;

export function setExaCredentials(key: string | null) {
  console.log('Setting Exa.ai search credentials:', {
    hasKey: !!key,
    keyLength: key?.length,
    keyPreview: key ? `${key.substring(0, 4)}...${key.substring(key.length - 4)}` : null,
    timestamp: new Date().toISOString()
  });
  apiKey = key;
  console.log('Exa.ai search credentials set successfully', {
    timestamp: new Date().toISOString(),
    status: 'success',
    keyStatus: key ? 'valid' : 'missing'
  });
}

export async function handleExaSearch(params: ExaSearchParameters): Promise<ExaSearchResponse> {
  // Check for API key from either environment variable or passed credentials
  const effectiveApiKey = process.env.EXA_API_KEY || apiKey;
  
  if (!effectiveApiKey) {
    throw new Error('Exa.ai API key not configured. Please ensure the ExaAI addon is enabled and properly configured or set the EXA_API_KEY environment variable.');
  }

  console.log('Executing Exa.ai search:', {
    query: params.query,
    usingEnvKey: !!process.env.EXA_API_KEY,
    timestamp: new Date().toISOString()
  });

  try {
    const response = await axios({
      method: 'post',
      url: 'https://api.exa.ai/search',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': effectiveApiKey
      },
      data: params
    });

    return response.data as ExaSearchResponse;
  } catch (error: any) {
    console.error('Exa.ai search error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
    
    // Provide more detailed error information from API response if available
    if (error.response) {
      throw new Error(`Exa.ai search failed: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
    }
    
    throw new Error(`Exa.ai search failed: ${error.message}`);
  }
}