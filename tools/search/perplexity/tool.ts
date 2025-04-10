import { tool } from 'ai';
import { handlePerplexitySearch, setPerplexityCredentials } from './handler';
import { perplexityJsonSchema } from './schema';

// Create the Perplexity search tool
export const createPerplexitySearchTool = tool<typeof perplexityJsonSchema, string>({
  description: `Search and answer questions using Perplexity's Sonar API. Get up-to-date, accurate information
with citations from reliable sources across the web.

Features:
- Ask questions in natural language
- Get AI-generated responses based on real-time web data
- Receive citations for facts and information
- Process multiple messages in a conversation

Example:
{
  "messages": [
    {
      "role": "system",
      "content": "You are a helpful assistant that provides accurate, up-to-date information."
    },
    {
      "role": "user",
      "content": "What are the latest developments in fusion energy research?"
    }
  ]
}`,
  parameters: perplexityJsonSchema,
  execute: async (params) => {
    try {
      console.log('Executing Perplexity search tool:', {
        messageCount: params.messages.length,
        firstMessage: params.messages[0]?.content ? (params.messages[0].content.substring(0, 50) + '...') : 'No content',
        timestamp: new Date().toISOString()
      });

      const result = await handlePerplexitySearch(params);
      
      // Format the response with the answer and citations if available
      let formattedResponse = result.choices[0].message.content;
      
      // Process and append citations if available
      if (result.citations && result.citations.length > 0) {
        formattedResponse += '\n\n**Sources:**\n';
        const uniqueCitations = new Map();
        
        // Deduplicate citations by URL
        result.citations.forEach(citation => {
          if (!uniqueCitations.has(citation.url)) {
            uniqueCitations.set(citation.url, citation);
          }
        });
        
        // Add numbered citations
        Array.from(uniqueCitations.values()).forEach((citation, index) => {
          const citationText = citation.text ? citation.text.substring(0, 50) + '...' : 'Source';
          formattedResponse += `${index + 1}. [${citationText}](${citation.url})\n`;
        });
      }
      
      // Return a JSON string with status and formatted response
      return JSON.stringify({
        status: 'success',
        data: {
          response: formattedResponse,
          model: result.model,
          finish_reason: result.choices[0].finish_reason,
          citation_count: result.citations?.length || 0
        }
      });
    } catch (error) {
      console.error('Perplexity search tool execution error:', {
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