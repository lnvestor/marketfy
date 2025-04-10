// Shared configurations for all export types

export interface TwoDArrayConfig {
    doNotNormalize: boolean;    // Whether to normalize the array data
    hasHeader: boolean;         // Whether the array has a header row
}

// Response config should only have resourcePath and twoDArray
export interface ResponseConfig {
    resourcePath: string;       // Path to the resource in response
    twoDArray?: TwoDArrayConfig;
}

export interface DeltaConfig {
    dateFormat: string;         // e.g. "YYYY-MM-DDTHH:mm:ss[Z]"
    lagOffset?: number;         // Optional: e.g. 300000 for 5 minutes
}

export interface TransformRule {
    key: string;               // Unique identifier for the rule (e.g. "SlY70aWYK7p")
    extract: string;           // Source path using dot notation and wildcards (e.g. "*.itemNumber", "0.orderNumber")
    generate: string;          // Target path with array notation (e.g. "Items[*].itemNumber", "orderNumber")
}

export interface TransformConfig {
    type: 'expression';
    expression: {
        version: '1';
        rules: TransformRule[][];  // Array of arrays of transform rules
    };
    rules: TransformRule[][];      // Exact duplicate of expression.rules
    version: '1';                  // Must match expression.version
}

// Filter types
export type FilterLogicalOperator = 'and' | 'or';

export type FilterUnaryOperator = 'empty' | 'notempty';

export type FilterBinaryOperator = 
    | 'equals' 
    | 'notequals'
    | 'greaterthan' 
    | 'greaterthanorequals'
    | 'lessthan'
    | 'lessthanorequals'
    | 'startswith'
    | 'endswith'
    | 'contains'
    | 'doesnotcontain'
    | 'matches';

export type FilterOperator = FilterLogicalOperator | FilterUnaryOperator | FilterBinaryOperator;

export type FilterTypeOperator = 'string' | 'number' | 'boolean';

export type FilterExtractPath = ['extract', string];  // e.g. ['extract', 'id']

export type FilterTypeCast = [FilterTypeOperator, FilterExtractPath];  // e.g. ['string', ['extract', 'id']]

export type FilterValue = string | number | boolean;

// Filter rules array elements can be:
// 1. Operator (first element)
// 2. Type cast array
// 3. Value (for binary operators)
export type FilterRuleElement = FilterOperator | FilterTypeCast | FilterValue;

export interface FilterConfig {
    type: 'expression';
    expression: {
        rules: FilterRuleElement[];  // Flattened array of elements
        version: '1';
    };
    rules: FilterRuleElement[];      // Exact duplicate of expression.rules
    version: '1';                    // Must match expression.version
}

// Base export interface with shared fields
export interface BaseExport {
    name: string;
    _connectionId: string;
    apiIdentifier: string;
    asynchronous: boolean;
    oneToMany: boolean;
    sandbox: boolean;
    type?: 'delta';
    delta?: DeltaConfig;
    transform?: TransformConfig;
    filter?: FilterConfig;
}
