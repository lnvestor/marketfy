import { BaseExport, FilterBinaryOperator, FilterUnaryOperator } from './shared.js';

// NetSuite search criteria operators match shared filter operators
export type NetSuiteCriteriaOperator = FilterBinaryOperator | FilterUnaryOperator;

export interface NetSuiteCriteria {
    field: string;
    operator: NetSuiteCriteriaOperator;
    searchValue?: string;  // Optional for unary operators (empty/notempty)
}

export interface NetSuiteRestlet {
    recordType: string;
    searchId: string;
    criteria?: NetSuiteCriteria[];
    restletVersion: 'suiteapp2.0';
    markExportedBatchSize: number;
}

export interface NetSuiteExport extends BaseExport {
    isLookup: boolean;
    pathToMany?: string;  // Required if oneToMany is true and isLookup is false
    netsuite: {
        type: 'restlet';
        skipGrouping: boolean;
        statsOnly: boolean;
        restlet: NetSuiteRestlet;
    };
    adaptorType: 'NetSuiteExport';
}
