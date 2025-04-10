// Flow type interfaces based on Celigo API schemas

interface PageGenerator {
  _exportId: string;  // Always export (source)
  skipRetries: boolean;
}

// Response mapping for exports (lookups)
interface ExportResponseMapping {
  fields: Array<{
    extract: 'data' | `data[${number}]` | `data[${number}].${string}`;
    generate: string;
  }>;
  lists: any[];
}

// Response mapping for imports
interface ImportResponseMapping {
  fields: Array<{
    extract: 'id' | 'statusCode';
    generate: string;
  }>;
  lists: any[];
}

interface Hook {
  function: string;
  _scriptId: string;
}

// Export processor (lookup) with hooks only if not last
interface ExportProcessor {
  type: 'export';
  _exportId: string;
  proceedOnFailure?: boolean;
  responseMapping: ExportResponseMapping;
  hooks?: {
    postResponseMap?: Hook;  // Only valid if not last step
  };
}

// Import processor (never has hooks as it's always last)
interface ImportProcessor {
  type: 'import';
  _importId: string;
  proceedOnFailure?: boolean;
  responseMapping: ImportResponseMapping;
}

type PageProcessor = ExportProcessor | ImportProcessor;

export interface Flow {
  _id?: string;
  name: string;
  _integrationId: string;
  _flowGroupingId: string;
  pageGenerators: PageGenerator[];
  pageProcessors: PageProcessor[];
  free: boolean;
}

export interface FlowConfig {
  name: string;
  _integrationId: string;
  _flowGroupingId: string;
  pageGenerators: PageGenerator[];
  pageProcessors: PageProcessor[];
  free: boolean;
}

export interface UpdateFlowConfig {
  flowId: string;
  config: FlowConfig;
}
