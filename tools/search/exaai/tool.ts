import { tool } from 'ai';
import { handleExaSearch, setExaCredentials } from './handler';
import { exaSearchJsonSchema } from './schema';

// Create the ExaAI search tool
export const createExaSearchTool = tool<typeof exaSearchJsonSchema, string>({
  description: `Search the web in real-time using Exa.ai's search API. Get access to the latest information 
from the internet with advanced search capabilities including semantic search, domain filtering, 
and content extraction.

Features:
- Search with natural language queries or keywords
- Filter by domains, dates, and text content
- Get full text, highlights, and summaries
- Access real-time web content through live crawling

Example:
{
  "query": "latest advancements in quantum computing",
  "numResults": 5,
  "type": "semantic",
  "includeDomains": ["nature.com", "science.org"],
  "contents": {
    "text": true,
    "highlights": {
      "numSentences": 3
    },
    "summary": {}
  }
}`,
  parameters: exaSearchJsonSchema,
  execute: async (params) => {
    try {
      console.log('Executing ExaAI search tool:', {
        query: params.query,
        numResults: params.numResults,
        timestamp: new Date().toISOString()
      });

      const result = await handleExaSearch(params);
      
      // Create a simplified version of the result to reduce size
      const simplifiedResults = result.results.map((item: any) => ({
        title: item.title,
        url: item.url,
        publishedDate: item.publishedDate,
        summary: item.summary || null,
        text: item.text ? {
          // Limit text content size
          content: item.text.content?.length > 1000 ? 
            item.text.content.substring(0, 1000) + '...' : 
            item.text.content,
          highlights: item.text.highlights?.slice(0, 3) || []
        } : null
      }));
      
      // Parse result to ensure it's not treated as an error
      return JSON.stringify({
        status: 'success',
        data: {
          query: params.query,
          autoprompt: result.autoprompt || null,
          count: result.count,
          results: simplifiedResults
        }
      });
    } catch (error) {
      console.error('ExaAI search tool execution error:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
      return JSON.stringify({
        status: 'error',
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      });
    }
  }
});