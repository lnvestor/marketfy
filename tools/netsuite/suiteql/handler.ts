import { makeNetSuiteRequest } from '../shared/api';
import { SuiteQLRequest } from './schema';

// Script and deployment IDs for the SuiteQL RESTlet
// These values are from environment variables
const SUITEQL_SCRIPT_ID = process.env.NETSUITE_SUITEQL_SCRIPT_ID || 'customscript_integrivers_suiteql_api';
const SUITEQL_DEPLOY_ID = process.env.NETSUITE_SUITEQL_DEPLOY_ID || 'customdeploy1';

/**
 * Execute a SuiteQL query against NetSuite
 * @param queryData The SuiteQL query request data
 * @returns The query results
 */
export const executeSuiteQLQuery = async (queryData: SuiteQLRequest) => {
  // Clean/validate the request data
  const safeQueryData = {
    query: queryData.query.trim(),
    params: queryData.params || []
  };

  // Make the request to NetSuite SuiteQL RESTlet
  const result = await makeNetSuiteRequest(
    SUITEQL_SCRIPT_ID,
    SUITEQL_DEPLOY_ID,
    safeQueryData
  );

  // Handle and format the response
  if (result.status === 'error') {
    const errorMessage = result.error?.message || 'An unknown error occurred';
    throw new Error(`SuiteQL query error: ${errorMessage}`);
  }

  return result.data;
};