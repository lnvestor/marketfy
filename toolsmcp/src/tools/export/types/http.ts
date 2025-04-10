import { BaseExport, ResponseConfig } from './shared.js';

// HTTP Paging configuration
export type HTTPPagingMethod = 'page' | 'linkheader';

export interface HTTPPagePaging {
    method: 'page';
    page: number;    // Used in relativeURI as {{export.http.paging.page}}
}

export interface HTTPLinkHeaderPaging {
    method: 'linkheader';
    lastPageStatusCode: number;  // e.g. 404 when last page is reached
    linkHeaderRelation?: string; // e.g. "next", "prev", etc.
}

export type HTTPPagingConfig = HTTPPagePaging | HTTPLinkHeaderPaging;

export interface HTTPExport extends BaseExport {
    http: {
        relativeURI: string;   // For delta exports: {{dateFormat "format" lastExportDateTime "format" "timezone"}}
                              // For page paging: {{export.http.paging.page}}
        method: 'GET' | 'POST' | 'PUT' | 'DELETE';
        formType: 'http' | 'graph_ql';
        body?: string;
        isRest?: boolean;
        parameters?: Record<string, string>;
        response?: ResponseConfig;
        paging?: HTTPPagingConfig;  // Pagination at HTTP level only
    };
    adaptorType: 'HTTPExport';
}
