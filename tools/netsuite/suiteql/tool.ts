import { tool } from 'ai';
import { suiteQLJsonSchema } from './schema';
import { executeSuiteQLQuery } from './handler';

export const createSuiteQLTool = tool<typeof suiteQLJsonSchema, string>({
  description: `Execute a SuiteQL query against NetSuite. SuiteQL is a SQL-like query language for NetSuite data. Example:
{
  "query": "SELECT ID, FirstName, LastName, Title FROM Employee WHERE Title LIKE ? ORDER BY LastName, FirstName",
  "params": [ "Sales%" ]
}`,
  parameters: suiteQLJsonSchema,
  execute: async (queryData) => {
    console.log('Executing SuiteQL query:', {
      query: queryData.query,
      paramsCount: queryData.params?.length || 0,
      timestamp: new Date().toISOString()
    });

    try {
      const result = await executeSuiteQLQuery(queryData);
      return JSON.stringify(result);
    } catch (error) {
      console.error('SuiteQL execution error:', {
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