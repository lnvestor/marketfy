// Export type interfaces based on Celigo API schemas

// Shared configurations
interface TwoDArrayConfig {
    doNotNormalize: boolean;    // Whether to normalize the array data
    hasHeader: boolean;         // Whether the array has a header row
}

interface ResponseConfig {
    resourcePath: string;       // Path to the resource in response
    twoDArray?: TwoDArrayConfig;
}

interface DeltaConfig {
    dateFormat: string;         // e.g. "YYYY-MM-DDTHH:mm:ss"
    lagOffset: number;          // e.g. 300000 for 5 minutes
}

interface TransformRule {
    key: string;               // Unique identifier for the rule (e.g. "SlY70aWYK7p")
    extract: string;           // Source path using dot notation and wildcards (e.g. "*.itemNumber", "0.orderNumber")
    generate: string;          // Target path with array notation (e.g. "Items[*].itemNumber", "orderNumber")
}

interface TransformConfig {
    type: 'expression';
    expression: {
        version: '1';
        rules: TransformRule[][];  // Array of arrays of transform rules
    };
    rules: TransformRule[][];      // Exact duplicate of expression.rules
    version: '1';                  // Must match expression.version
}

export interface NetSuiteCriteria {
    field: string;
    operator: string;
    searchValue: string;
}

export interface NetSuiteRestlet {
    recordType: string;
    searchId: string;
    criteria?: NetSuiteCriteria[];
    restletVersion: 'suiteapp2.0';
    markExportedBatchSize: number;
}

export interface InputFilter {
    type: 'expression';
    expression: {
        rules: (string | string[])[];
        version: '1';  // Must be exactly "1"
    };
    rules: (string | string[])[];
    version: '1';    // Must be exactly "1"
}

export interface NetSuiteExport {
    name: string;
    _connectionId: string;
    apiIdentifier: string;
    asynchronous: boolean;
    isLookup: boolean;
    oneToMany: boolean;
    pathToMany?: string;  // Required if oneToMany is true and isLookup is false
    netsuite: {
        type: 'restlet';
        skipGrouping: boolean;
        statsOnly: boolean;
        restlet: NetSuiteRestlet;
    };
    inputFilter?: InputFilter;  // Optional for lookups
    delta?: DeltaConfig;
    transform?: TransformConfig;
    adaptorType: 'NetSuiteExport';
}

export interface HttpExport {
    name: string;
    _connectionId: string;
    apiIdentifier: string;
    asynchronous: boolean;
    oneToMany: boolean;
    sandbox: boolean;
    type?: 'delta';            // Indicates this is a delta-based export
    http: {
        relativeURI: string;   // For delta exports, must include {{dateFormat "format" lastExportDateTime "format" "timezone"}}
        method: 'GET' | 'POST' | 'PUT' | 'DELETE';
        formType: 'http' | 'graph_ql';
        body?: string;
        isRest?: boolean;
        parameters?: Record<string, string>;
        response?: ResponseConfig;
    };
    filter?: {
        type: 'expression';
        expression: {
            rules: (string | (string | string[])[])[];
            version: '1';
        };
        rules: (string | (string | string[])[])[];
        version: '1';
    };
    delta?: DeltaConfig;
    transform?: TransformConfig;
    adaptorType: 'HTTPExport';
}

export interface RdbmsExport {
    name: string;
    _connectionId: string;
    apiIdentifier: string;
    asynchronous: boolean;
    oneToMany: boolean;
    sandbox: boolean;
    rdbms: {
        query: string;
        response?: ResponseConfig;
    };
    delta?: DeltaConfig;
    transform?: TransformConfig;
    adaptorType: 'RDBMSExport';
}

export interface SalesforceExport {
    name: string;
    _connectionId: string;
    apiIdentifier: string;
    asynchronous: boolean;
    oneToMany: boolean;
    sandbox: boolean;
    salesforce: {
        type: 'soql';
        api: 'rest';
        soql: {
            query: string;
        };
        response?: ResponseConfig;
    };
    delta?: DeltaConfig;
    transform?: TransformConfig;
    adaptorType: 'SalesforceExport';
}

export type ExportConfig = HttpExport | RdbmsExport | SalesforceExport | NetSuiteExport;

export interface UpdateExportConfig {
    exportId: string;
    config: ExportConfig;
}
