import { ImportConfig, ImportResponse } from '../shared/types';

// NetSuite-specific interfaces
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
  generate: string;  // Field to generate
  extract?: string;  // Field to extract from
  discardIfEmpty?: boolean;  // Whether to discard if value is empty
  immutable?: boolean;  // Whether field is immutable
  internalId?: boolean;  // Whether field is an internal ID
  lookupName?: string;  // Name of lookup to use
  hardCodedValue?: string;  // Hard-coded value
  dataType?: 'string' | 'number' | 'boolean';  // Data type
}

export interface NetSuiteList {
  generate: string;  // List to generate
  fields: NetSuiteField[];  // Fields in the list
}

export interface NetSuiteMapping {
  fields: NetSuiteField[];  // Top-level fields
  lists: NetSuiteList[];  // Sublists
}

export interface NetSuiteImportConfig extends ImportConfig {
  distributed: true;  // Must be true for NetSuite distributed imports
  apiIdentifier: string;  // API identifier
  ignoreExisting?: boolean;  // Whether to ignore existing records
  ignoreMissing?: boolean;  // Whether to ignore missing records
  oneToMany?: boolean;  // Whether this is a one-to-many import
  lookups?: NetSuiteLookup[];  // Optional lookups
  netsuite_da: {
    restletVersion: 'suiteapp2.0';  // Must be suiteapp2.0
    operation: 'add' | 'update' | 'delete' | 'add_update' | 'attach' | 'detach';  // Operation type
    recordType: string;  // NetSuite record type
    internalIdLookup?: {
      expression: string;  // Search expression for internal ID
    };
    lookups?: NetSuiteLookup[];  // Optional lookups specific to this operation
    mapping: NetSuiteMapping;  // Field and list mappings
  };
  adaptorType: 'NetSuiteDistributedImport';  // Must be NetSuiteDistributedImport
}

export interface NetSuiteImportResponse extends ImportResponse {
  distributed: true;
  apiIdentifier: string;
  ignoreExisting?: boolean;
  ignoreMissing?: boolean;
  oneToMany?: boolean;
  lookups?: NetSuiteLookup[];
  netsuite_da: {
    restletVersion: 'suiteapp2.0';
    operation: 'add' | 'update' | 'delete' | 'add_update' | 'attach' | 'detach';
    recordType: string;
    internalIdLookup?: {
      expression: string;
    };
    lookups?: NetSuiteLookup[];
    mapping: NetSuiteMapping;
  };
  adaptorType: 'NetSuiteDistributedImport';
}

// Tool Request Types
export interface CreateNetSuiteImportRequest {
  name: string;
  config: Omit<NetSuiteImportConfig, 'name'>;
}

export interface UpdateNetSuiteImportRequest {
  importId: string;
  config: Partial<NetSuiteImportConfig>;
}

export interface GetNetSuiteImportRequest {
  importId: string;
}

export interface ListNetSuiteImportsRequest {
  limit?: number;
  offset?: number;
}

// Tool Response Types
export interface ListNetSuiteImportsResponse {
  count: number;
  results: NetSuiteImportResponse[];
}

// Tool Parameter Types
export interface NetSuiteImportToolParameters {
  action: 'create' | 'update' | 'get' | 'list' | 'delete';
  importId?: string;
  config?: NetSuiteImportConfig | Partial<NetSuiteImportConfig>;
  limit?: number;
  offset?: number;
}
