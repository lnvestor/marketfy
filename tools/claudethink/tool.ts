import { tool } from 'ai';
import { thinkJsonSchema } from './schema';
import { ThinkParameters } from './schema';

// Create the Claude "think" tool
export const createClaudeThinkTool = tool<typeof thinkJsonSchema, string>({
  description: `Use this tool to perform structured thinking on complex problems. This tool doesn't change any external systems or retrieve new information - it creates a space for you to think systematically.
 
 Use the think tool to:
 
 1. Analyze requirements:
    - Break down user requests into specific requirements
    - Categorize requirements (functional, technical, business, etc.)
    - Identify implicit requirements not directly stated
    - Note constraints or limitations in the requirements
 
 2. Create task lists:
    - Organize requirements into sequential tasks
    - Prioritize tasks based on dependencies and importance
    - Estimate complexity or effort needed for each task
    - Identify blockers or potential risks for specific tasks
 
 3. Evaluate multiple approaches:
    - Consider alternative implementation strategies
    - List pros and cons of each approach
    - Compare approaches against requirements
    - Select optimal solution with justification
 
 4. Review tool results:
    - Analyze output from previous tool calls
    - Verify if results match expectations
    - Extract relevant information from verbose responses
    - Determine next steps based on the results
 
 5. Handle policy compliance:
    - Check if planned actions comply with stated policies
    - Verify required information is collected before proceeding
    - Identify potential exceptions or edge cases
    - Determine if user has proper permissions for actions
 
 When to use the think tool:
 - Before making chains of tool calls with complex dependencies
 - When evaluating complex user requests with multiple requirements
 - After receiving results from other tools that need careful analysis
 - When developing plans that need to follow specific guidelines
 - Before making critical decisions where mistakes would be costly
 
 The thinking you record here will be visible in system logs but won't be displayed to the user directly.`,
  parameters: thinkJsonSchema,
  execute: async (params: ThinkParameters) => {
    try {
      console.log('Claude is thinking:', {
        thoughtLength: params.thought.length,
        timestamp: new Date().toISOString()
      });
      
      // Log a portion of the thought for debugging
      console.log('Thought content:', {
        timestamp: new Date().toISOString(),
        thought: params.thought.substring(0, 200) + (params.thought.length > 200 ? '...' : '')
      });
      
      // Return a JSON string with status and thought details
      return JSON.stringify({
        status: 'success',
        data: {
          message: "Thought recorded",
          thought_length: params.thought.length
        }
      });
    } catch (error) {
      console.error('Claude think tool execution error:', {
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