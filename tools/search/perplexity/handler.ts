import axios from 'axios';
import { PerplexityParameters, PerplexityResponse } from './types';

let apiKey: string | null = null;

export function setPerplexityCredentials(key: string | null) {
  console.log('Setting Perplexity search credentials:', {
    hasKey: !!key,
    keyLength: key?.length,
    keyPreview: key && key.length > 8 ? `${key.substring(0, 4)}...${key.substring(key.length - 4)}` : null,
    timestamp: new Date().toISOString()
  });
  apiKey = key;
  console.log('Perplexity search credentials set successfully', {
    timestamp: new Date().toISOString(),
    status: 'success',
    keyStatus: key ? 'valid' : 'missing'
  });
}

export async function handlePerplexitySearch(params: PerplexityParameters): Promise<PerplexityResponse> {
  // Check for API key from either environment variable or passed credentials
  const effectiveApiKey = process.env.PERPLEXITY_API_KEY || apiKey;
  
  if (!effectiveApiKey) {
    throw new Error('Perplexity API key not configured. Please ensure the Perplexity addon is enabled and properly configured or set the PERPLEXITY_API_KEY environment variable.');
  }

  console.log('Executing Perplexity search:', {
    firstMessageContent: params.messages[0]?.content || 'No content',
    messageCount: params.messages.length,
    timestamp: new Date().toISOString()
  });

  try {
    const perplexityModel = process.env.PERPLEXITY_MODEL || 'sonar-pro';
    
    const response = await axios({
      method: 'post',
      url: 'https://api.perplexity.ai/chat/completions',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${effectiveApiKey}`
      },
      data: {
        model: perplexityModel,
        messages: params.messages
      }
    });

    return response.data as PerplexityResponse;
  } catch (error: any) {
    console.error('Perplexity search error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
    
    // Provide more detailed error information from API response if available
    if (error.response) {
      throw new Error(`Perplexity search failed: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
    }
    
    throw new Error(`Perplexity search failed: ${error.message}`);
  }
}