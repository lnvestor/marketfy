import { GoogleTrendsParameters } from './schema';
import { GoogleTrendsApiResponse, GoogleTrendsConfig } from './types';

// Configuration for the Google Trends API
const config: GoogleTrendsConfig = {
  apiKey: process.env.SERPAPI_KEY || null,
  baseUrl: 'https://serpapi.com/search.json'
};

/**
 * Set the SerpAPI key for Google Trends
 */
export function setGoogleTrendsCredentials(apiKey: string | null): void {
  config.apiKey = apiKey || process.env.SERPAPI_KEY || null;
  console.log(`Google Trends credentials ${config.apiKey ? 'set' : 'cleared'}`);
}

/**
 * Handle Google Trends search query
 */
export async function handleGoogleTrendsSearch(params: GoogleTrendsParameters): Promise<GoogleTrendsApiResponse> {
  // Attempt to use environment variable if key not set directly
  const apiKey = config.apiKey || process.env.SERPAPI_KEY;
  
  if (!apiKey) {
    throw new Error('Google Trends API key is not set. Please set SERPAPI_KEY environment variable or use setGoogleTrendsCredentials() before using this tool.');
  }
  
  // Update config to ensure the key is available for this request
  config.apiKey = apiKey;

  const startTime = Date.now();
  
  // Prepare the query parameters
  const queryParams = new URLSearchParams();
  queryParams.append('engine', 'google_trends');
  queryParams.append('api_key', config.apiKey);
  
  // Add optional parameters if provided
  if (params.q) queryParams.append('q', params.q);
  if (params.data_type) queryParams.append('data_type', params.data_type);
  if (params.geo) queryParams.append('geo', params.geo);
  if (params.hl) queryParams.append('hl', params.hl);
  if (params.region) queryParams.append('region', params.region);
  if (params.date) queryParams.append('date', params.date);
  if (params.tz) queryParams.append('tz', params.tz);
  if (params.cat) queryParams.append('cat', params.cat);
  
  // Handle gprop parameter - convert "web" to empty string for the API
  if (params.gprop) {
    // If "web" was selected, use empty string which is what the API expects for web search
    const gpropValue = params.gprop === "web" ? "" : params.gprop;
    queryParams.append('gprop', gpropValue);
  }
  
  if (params.include_low_search_volume !== undefined) {
    queryParams.append('include_low_search_volume', params.include_low_search_volume.toString());
  }

  // Set a timeout of 15 seconds for the API request
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);
  
  try {
    // Make the API request
    const response = await fetch(`${config.baseUrl}?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    
    // Check if the request was successful
    if (!response.ok) {
      console.error(`Google Trends API error: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      throw new Error(`Google Trends API returned status ${response.status}: ${errorText}`);
    }
    
    // Parse the response
    const data = await response.json() as GoogleTrendsApiResponse;
    
    // Log execution time
    const executionTime = Date.now() - startTime;
    console.log(`Google Trends search executed in ${executionTime}ms`);
    
    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Google Trends API request timed out after 15 seconds');
    }
    
    throw error;
  }
}