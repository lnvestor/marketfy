import { tool } from 'ai';
import { makeNetSuiteRequest } from '../shared/api';
import { netSuiteSavedSearchJsonSchema } from './schema';
import type { NetSuiteSavedSearch } from './schema';

export const createSavedSearchTool = tool<typeof netSuiteSavedSearchJsonSchema, string>({
  description: `Create a NetSuite saved search. Example:
{
  "type": "salesorder",
  "title": "Recent Sales Orders",
  "columns": [
    { "name": "tranid", "label": "Transaction ID" },
    { "name": "amount", "label": "Amount", "sort": "DESC" }
  ],
  "filters": [
    ["type", "anyof", "SalesOrd"],
    "AND",
    ["mainline", "is", "T"]
  ],
  "settings": [
    { "name": "consolidationtype", "value": "ACCTTYPE" }
  ]
}`,
  parameters: netSuiteSavedSearchJsonSchema,
  execute: async (savedSearch: NetSuiteSavedSearch) => {
    console.log('Creating saved search:', savedSearch);

    const result = await makeNetSuiteRequest(
      'customscriptcustomscript_saved_search_ly',
      '1',
      savedSearch
    );

    if (result.status === 'error') {
      const errorMessage = result.error?.message || 'An unknown error occurred';
      throw new Error(errorMessage);
    }

    return JSON.stringify(result.data);
  }
});
