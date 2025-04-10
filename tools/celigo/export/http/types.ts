// Types for HTTP Export
export interface TwoDArray {
  doNotNormalize: boolean;
  hasHeader: boolean;
}

export interface ResponseConfig {
  resourcePath: string;
  twoDArray?: TwoDArray;
}

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

// Filter type removed completely

// HTTP Paging types
export type PagingMethod = 'relativeuri' | 'body' | 'linkheader' | 'token' | 'url' | 'page' | 'skip';

// Base paging interface with common properties
export interface BasePaging {
  method: PagingMethod;
  lastPageStatusCode?: number;
  lastPagePath?: string;
  lastPageValues?: string[];
}

// Method-specific paging interfaces
export interface RelativeUriPaging extends BasePaging {
  method: 'relativeuri';
  relativeURI: string;
}

export interface BodyPaging extends BasePaging {
  method: 'body';
  body: string;
}

export interface LinkHeaderPaging extends BasePaging {
  method: 'linkheader';
  linkHeaderRelation?: string;
}

export interface TokenPaging extends BasePaging {
  method: 'token';
  path: string;
  pathLocation?: 'body' | 'header';
  pathAfterFirstRequest?: string;
  initialTokenValue?: string;
}

export interface UrlPaging extends BasePaging {
  method: 'url';
  path: string;
  pathLocation?: 'body' | 'header';
}

export interface PagePaging extends BasePaging {
  method: 'page';
  page: number;
  totalPagesPath?: string;
  totalResultsPath?: string;
}

export interface SkipPaging extends BasePaging {
  method: 'skip';
  skip: number;
  totalPagesPath?: string;
  totalResultsPath?: string;
}

// Union type for all paging methods
export type Paging = 
  | RelativeUriPaging
  | BodyPaging
  | LinkHeaderPaging
  | TokenPaging
  | UrlPaging
  | PagePaging
  | SkipPaging;

export interface HTTPConfig {
  relativeURI: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  formType: 'http' | 'graph_ql';
  parameters?: Record<string, string>;
  body?: string;
  isRest?: boolean;
  response?: ResponseConfig;
  paging?: Paging;
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
export type FilterConfig = ScriptFilter | ExpressionFilter | any;

export interface HTTPExport {
  name: string;
  _connectionId: string;
  apiIdentifier: string;
  type?: 'delta';
  http: HTTPConfig;
  asynchronous?: boolean;
  oneToMany?: boolean;
  sandbox?: boolean;
  filter?: FilterConfig;
  delta?: DeltaConfig;
  transform?: Transform;
  adaptorType: 'HTTPExport';
}

// Tool arguments interface
export interface HttpExportToolArgs {
  action: 'create' | 'update' | 'get' | 'list';
  exportId?: string;
  config?: HTTPExport;
}

// Response interfaces
export interface HttpExportListItem {
  _id: string;
  name: string;
  adaptorType: string;
}
