// Types for NetSuite Export
export interface DeltaConfig {
  dateFormat: string;
  lagOffset?: number;
}

// Transform types
export interface TransformRule {
  key: string;
  extract: string;
  generate: string;
}

export interface Transform {
  type: 'expression';
  expression: {
    version: '1';
    rules: TransformRule[][];
  };
  rules: TransformRule[][];
  version: '1';
}

// Script filter configuration
export interface ScriptFilter {
  type: 'script';
  script: {
    _scriptId: string;
    function: string;
  };
}

// Expression filter (legacy)
export interface ExpressionFilter {
  type?: 'expression';
  expression?: any;
  rules?: any;
  version?: string;
}

// Union type for filter
export type Filter = ScriptFilter | ExpressionFilter | any;

// NetSuite Restlet config
export interface RestletConfig {
  recordType: string;
  searchId: string;
  criteria?: {
    field: string;
    operator: string;
    searchValue?: string;
  }[];
  markExportedBatchSize?: number;
  restletVersion: 'suiteapp2.0';
}

// NetSuite configuration
export interface NetSuiteConfig {
  type: 'restlet';
  skipGrouping?: boolean;
  statsOnly?: boolean;
  restlet: RestletConfig;
}

// Main NetSuite Export interface
export interface NetSuiteExport {
  name: string;
  _connectionId: string;
  apiIdentifier: string;
  type?: 'delta';
  netsuite: NetSuiteConfig;
  isLookup?: boolean;
  pathToMany?: string;
  asynchronous?: boolean;
  oneToMany?: boolean;
  sandbox?: boolean;
  delta?: DeltaConfig;
  transform?: Transform;
  filter?: Filter;
  adaptorType: 'NetSuiteExport';
}

// Tool arguments interface
export interface NetSuiteExportToolArgs {
  action: 'create' | 'update' | 'get' | 'list';
  exportId?: string;
  config?: NetSuiteExport;
}

// Response interfaces
export interface NetSuiteExportListItem {
  _id: string;
  name: string;
  adaptorType: string;
}