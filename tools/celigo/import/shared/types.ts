import { BaseConfig } from '../../shared';

// Common types used across different import types
export interface ImportResponse {
  _id: string;
  _lastModified: string;
  [key: string]: unknown;
}

export interface ListImportsResponse {
  count: number;
  results: ImportResponse[];
}

// Base import config that all specific import types extend
export interface ImportConfig extends BaseConfig {
  name: string;
  _connectionId: string;
  apiIdentifier: string;
  ignoreExisting?: boolean;
  ignoreMissing?: boolean;
  oneToMany?: boolean;
  sandbox?: boolean;
  adaptorType: 'HTTPImport' | 'NetSuiteDistributedImport';
}

// Update config used by all import types
export interface UpdateImportConfig {
  importId: string;
  config: ImportConfig;
}

// Tool parameter types
export interface ImportToolParameters {
  action: 'create' | 'update' | 'get' | 'list' | 'delete';
  importId?: string;
  config?: ImportConfig;
  limit?: number;
  offset?: number;
}
