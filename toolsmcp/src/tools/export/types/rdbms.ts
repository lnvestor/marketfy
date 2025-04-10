import { BaseExport, ResponseConfig } from './shared.js';

export interface RDBMSExport extends BaseExport {
    rdbms: {
        query: string;
        response?: ResponseConfig;
    };
    adaptorType: 'RDBMSExport';
}
