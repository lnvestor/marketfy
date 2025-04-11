import { tool } from 'ai';
import { handleGoogleTrendsSearch, setGoogleTrendsCredentials } from './handler';
import { googleTrendsJsonSchema } from './schema';

// Create the Google Trends tool
export const createGoogleTrendsTool = tool<typeof googleTrendsJsonSchema, string>({
  description: `Search Google Trends to analyze the popularity of search terms and topics over time.
  
Features:
- Track interest over time for up to 5 search terms
- Compare the popularity of terms across different regions
- Discover related topics and queries that are rising in popularity
- Filter by region, time period, and categories
- Get data from different Google properties (web, news, YouTube, etc.)

Example uses:
- Research product market trends for e-commerce
- Identify seasonal interest patterns in specific industries
- Compare brand popularity across different countries
- Discover emerging topics related to your business
- Analyze keyword popularity for content strategy

Note: This tool requires a SerpAPI key to be set first.`,
  parameters: googleTrendsJsonSchema,
  execute: async (params) => {
    try {
      console.log('Executing Google Trends tool:', {
        query: params.q || 'No query specified',
        dataType: params.data_type || 'TIMESERIES (default)',
        geo: params.geo || 'Worldwide (default)',
        timestamp: new Date().toISOString()
      });

      // Execute the Google Trends search
      const result = await handleGoogleTrendsSearch(params);
      
      // Format the results based on the data type
      let formattedResult: any = {
        status: 'success',
        search_parameters: result.search_parameters,
        data: {}
      };
      
      // Add the specific data section based on data_type
      if (result.interest_over_time) {
        formattedResult.data.interest_over_time = result.interest_over_time;
      }
      
      if (result.compared_breakdown_by_region) {
        formattedResult.data.compared_breakdown_by_region = result.compared_breakdown_by_region;
      }
      
      if (result.interest_by_region) {
        formattedResult.data.interest_by_region = result.interest_by_region;
      }
      
      if (result.related_topics) {
        formattedResult.data.related_topics = result.related_topics;
      }
      
      if (result.related_queries) {
        formattedResult.data.related_queries = result.related_queries;
      }
      
      return JSON.stringify(formattedResult, null, 2);
    } catch (error) {
      console.error('Google Trends tool execution error:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
      
      return JSON.stringify({
        status: 'error',
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      }, null, 2);
    }
  }
});

// Export the credential setter
export { setGoogleTrendsCredentials };