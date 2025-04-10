import { BaseExport, ResponseConfig } from './shared.js';

export interface SalesforceExport extends BaseExport {
    salesforce: {
        type: 'soql';
        api: 'rest';
        soql: {
            query: string;
        };
        response?: ResponseConfig;
    };
    adaptorType: 'SalesforceExport';
}
