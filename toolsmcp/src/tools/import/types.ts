// Import type interfaces based on Celigo API schemas

// Error response interface for NetSuite imports
export interface NetSuiteImportError {
  errors: Array<{
    field: string;
    code: string;
    message: string;
  }>;
}

export interface NetSuiteLookup {
  name: string;
  recordType: string;
  resultField: string;
  expression: string;
  allowFailures: boolean;
  default?: string | null;
}

export interface NetSuiteField {
  generate: string;
  extract?: string;
  discardIfEmpty?: boolean;
  immutable?: boolean;
  internalId?: boolean;
  lookupName?: string;
  hardCodedValue?: string;
  dataType?: 'string' | 'number' | 'boolean';
}

export interface NetSuiteList {
  generate: string;
  fields: NetSuiteField[];
}

export interface NetSuiteMapping {
  fields: NetSuiteField[];
  lists: NetSuiteList[];
}

export interface NetSuiteImport {
  name: string;
  _connectionId: string;
  distributed: true;
  apiIdentifier: string;
  ignoreExisting: boolean;
  ignoreMissing: boolean;
  oneToMany: boolean;
  lookups: NetSuiteLookup[];
  netsuite_da: {
    restletVersion: 'suiteapp2.0';
    operation: 'add' | 'update' | 'delete';
    recordType: string;
    internalIdLookup?: {
      expression: string;
    };
    lookups: NetSuiteLookup[];
    mapping: NetSuiteMapping;
  };
  filter: {
    type: 'expression';
    expression: {
      rules: (string | string[])[];
      version: string;  // Must be "1" based on error example
    };
    rules: (string | string[])[];
    version: string;    // Must be "1" based on error example
  };
  adaptorType: 'NetSuiteDistributedImport';
}

export interface HttpImport {
  name: string;
  _connectionId: string;
  apiIdentifier: string;
  ignoreExisting: boolean;
  ignoreMissing: boolean;
  oneToMany: boolean;
  sandbox: boolean;
  http: {
    relativeURI: string[];
    method: string[];
    body: string[];
    batchSize: number;
    sendPostMappedData: boolean;
    formType: 'http' | 'graph_ql';
  };
  adaptorType: 'HTTPImport';
}

export interface FtpImport {
  name: string;
  _connectionId: string;
  apiIdentifier: string;
  oneToMany: boolean;
  sandbox: boolean;
  file: {
    fileName: string;
    skipAggregation: boolean;
    type: 'csv';
    csv: {
      rowDelimiter: string;
      columnDelimiter: string;
      includeHeader: boolean;
      wrapWithQuotes: boolean;
      replaceTabWithSpace: boolean;
      replaceNewlineWithSpace: boolean;
      truncateLastRowDelimiter: boolean;
    };
  };
  ftp: {
    directoryPath: string;
    fileName: string;
  };
  adaptorType: 'FTPImport';
}

export interface RdbmsImport {
  name: string;
  _connectionId: string;
  apiIdentifier: string;
  ignoreExisting: boolean;
  ignoreMissing: boolean;
  oneToMany: boolean;
  sandbox: boolean;
  rdbms: {
    query: string[];
    queryType: ('INSERT' | 'UPDATE' | 'DELETE')[];
  };
  adaptorType: 'RDBMSImport';
}

export type ImportConfig = HttpImport | FtpImport | RdbmsImport | NetSuiteImport;

export interface UpdateImportConfig {
  importId: string;
  config: ImportConfig;
}
