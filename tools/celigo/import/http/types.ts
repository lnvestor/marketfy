import { ImportConfig, ImportResponse } from '../shared/types';

type HttpMethod = 'POST' | 'PUT';
type FormType = 'http' | 'graph_ql';

export interface HttpImportConfig extends ImportConfig {
  http: {
    relativeURI: string[];
    method: HttpMethod[];
    body: string[] | Array<Record<string, any>>;
    batchSize?: number;
    sendPostMappedData: boolean;
    formType: FormType | 'rest';
    isRest?: boolean;
  };
  adaptorType: 'HTTPImport';
  ignoreExisting?: boolean;
  ignoreMissing?: boolean;
  oneToMany?: boolean;
  sandbox?: boolean;
}

export interface HttpImportResponse extends ImportResponse {
  http: {
    relativeURI: string[];
    method: HttpMethod[];
    body: string[] | Array<Record<string, any>>;
    batchSize?: number;
    sendPostMappedData: boolean;
    formType: FormType | 'rest';
    isRest?: boolean;
  };
  adaptorType: 'HTTPImport';
  ignoreExisting?: boolean;
  ignoreMissing?: boolean;
  oneToMany?: boolean;
  sandbox?: boolean;
}

// Tool Request Types
export interface CreateHttpImportRequest {
  name: string;
  config: Omit<HttpImportConfig, 'name'>;
}

export interface UpdateHttpImportRequest {
  importId: string;
  config: Partial<HttpImportConfig>;
}

export interface GetHttpImportRequest {
  importId: string;
}

export interface ListHttpImportsRequest {
  limit?: number;
  offset?: number;
}

// Tool Response Types
export interface ListHttpImportsResponse {
  count: number;
  results: HttpImportResponse[];
}

// Tool Parameter Types
export interface HttpImportToolParameters {
  action: 'create' | 'update' | 'get' | 'list' | 'delete';
  importId?: string;
  config?: HttpImportConfig | Partial<HttpImportConfig>;
  limit?: number;
  offset?: number;
}
