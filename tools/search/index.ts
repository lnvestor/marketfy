import { createExaSearchTool, setExaCredentials } from './exaai';
import { createPerplexitySearchTool, setPerplexityCredentials } from './perplexity';

// Export tools
export {
  // ExaAI search tool
  createExaSearchTool,
  // Perplexity search tool
  createPerplexitySearchTool
};

// Export credential setters
export const setSearchCredentials = (provider: 'exa' | 'perplexity' | 'all', apiKey: string | null) => {
  if (!apiKey) {
    // Clear all credentials
    setExaCredentials(null);
    setPerplexityCredentials(null);
    return;
  }
  
  // Set provider-specific credentials
  if (provider === 'exa' || provider === 'all') {
    setExaCredentials(apiKey);
  }
  
  if (provider === 'perplexity' || provider === 'all') {
    setPerplexityCredentials(apiKey);
  }
};