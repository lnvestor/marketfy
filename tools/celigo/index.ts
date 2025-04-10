import { createIntegrationTool, setCredentials as setIntegrationCredentials } from './integration/tool';
import { createFlowTool, setCredentials as setFlowCredentials } from './flow';
import { createHttpConnectionTool, setHttpCredentials } from './connection/http';
import { createNetSuiteConnectionTool, setNetSuiteCredentials } from './connection/netsuite';
import { createHttpImportTool, setHttpImportCredentials } from './import/http';
import { createNetSuiteImportTool, setNetSuiteImportCredentials } from './import/netsuite';
import { createHttpExportTool, setHttpExportCredentials } from './export/http';
import { createNetSuiteExportTool, setNetSuiteExportCredentials } from './export/netsuite';
import { createFilterScriptTool, setFilterScriptCredentials } from './scripts';

// Export tools
export {
  // Legacy tools (to be deprecated)
  createIntegrationTool,
  createFlowTool,
  
  // Connection tools
  createHttpConnectionTool,
  createNetSuiteConnectionTool,
  
  // Export tools
  createHttpExportTool,
  createNetSuiteExportTool,

  // Import tools
  createHttpImportTool,
  createNetSuiteImportTool,
  
  // Script tools
  createFilterScriptTool,
  setFilterScriptCredentials
};

// Export credential setters
export const setCredentials = (token: string | null) => {
  if (!token) {
    // Clear all credentials
    setIntegrationCredentials('');
    setFlowCredentials('');
    setHttpCredentials('');
    setNetSuiteCredentials('');
    setHttpImportCredentials('');
    setNetSuiteImportCredentials('');
    setHttpExportCredentials('');
    setNetSuiteExportCredentials('');
    setFilterScriptCredentials('');
    return;
  }
  // Set credentials for legacy tools
  setIntegrationCredentials(token);
  setFlowCredentials(token);
  
  // Set credentials for connection tools
  setHttpCredentials(token);
  setNetSuiteCredentials(token);
  
  // Set credentials for import tools
  setHttpImportCredentials(token);
  setNetSuiteImportCredentials(token);
  
  // Set credentials for export tools
  setHttpExportCredentials(token);
  setNetSuiteExportCredentials(token);
  
  // Set credentials for script tools
  setFilterScriptCredentials(token);
};
