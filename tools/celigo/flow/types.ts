import { BaseConfig, CeligoErrorCode } from '../shared/types';

export interface PageGenerator {
  _exportId: string;  // Always export (source)
  skipRetries?: boolean;  // Optional since it has default value
}

// Response mapping for exports (lookups)
export interface ExportResponseMapping {
  fields: Array<{
    extract: string;  // Pattern: ^(data$|data\[\d+\]$|data\[\d+\]\.[a-zA-Z0-9_.]+$)
    generate: string;
  }>;
  lists: Array<{
    extract: string;
    generate: string;
  }>;
}

// Response mapping for imports
export interface ImportResponseMapping {
  fields: Array<{
    extract: 'id' | 'statusCode';
    generate: string;
  }>;
  lists: Array<{
    extract: string;
    generate: string;
  }>;
}

export interface Hook {
  function: string;
  _scriptId: string;
}

// Export processor (lookup) with hooks only if not last
export interface ExportProcessor {
  type: 'export';
  _exportId: string;
  proceedOnFailure?: boolean;
  responseMapping: ExportResponseMapping;
  hooks?: {
    postResponseMap: Hook;  // Required when hooks is present
  };
}

// Import processor (never has hooks as it's always last)
export interface ImportProcessor {
  type: 'import';
  _importId: string;
  proceedOnFailure?: boolean;
  responseMapping?: ImportResponseMapping;  // Optional for import processors
}

export type PageProcessor = ExportProcessor | ImportProcessor;

export interface FlowConfig extends BaseConfig {
  _integrationId: string;
  _flowGroupingId: string;
  pageGenerators: PageGenerator[];
  pageProcessors: PageProcessor[];
  free?: boolean;  // Optional since it has default value
}

export interface UpdateFlowConfig {
  flowId: string;
  config: FlowConfig;
}

export interface FlowToolArgs {
  action: 'create' | 'update' | 'get' | 'list';
  flowId?: string;
  config?: FlowConfig;
  _id?: string;
}

export interface FlowResponse {
  status: 'success' | 'error';
  data?: { [key: string]: unknown };
  error?: string;
  details?: {
    code: CeligoErrorCode;
    message: string;
  };
}
