import { createGoogleTrendsTool, setGoogleTrendsCredentials } from './tool';
import { GoogleTrendsParameters } from './schema';
import { GoogleTrendsApiResponse } from './types';

// Export the tool and types
export {
  // Main tool
  createGoogleTrendsTool,
  
  // Credential setter
  setGoogleTrendsCredentials,
  
  // Types
  GoogleTrendsParameters,
  GoogleTrendsApiResponse
};