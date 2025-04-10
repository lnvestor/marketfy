export * from './shared.js';
export * from './http.js';
export * from './netsuite.js';
export * from './salesforce.js';
export * from './rdbms.js';

import { HTTPExport } from './http.js';
import { NetSuiteExport } from './netsuite.js';
import { SalesforceExport } from './salesforce.js';
import { RDBMSExport } from './rdbms.js';

export type ExportConfig = HTTPExport | RDBMSExport | SalesforceExport | NetSuiteExport;

export interface UpdateExportConfig {
    exportId: string;
    config: ExportConfig;
}
