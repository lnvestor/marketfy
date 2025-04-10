// Connection type interfaces based on Celigo API schemas
export interface MicroServices {
  disableNetSuiteWebServices: boolean;
  disableRdbms: boolean;
  disableDataWarehouse: boolean;
}

export interface NetSuiteMicroServices {
  disableRdbms: boolean;
}

export interface NetSuiteSettings {
  wsdlVersion: string;
  concurrencyLevel: number;
}

export interface NetSuiteConnection {
  type: 'netsuite';
  name: string;
  netsuite: NetSuiteSettings;
  microServices: NetSuiteMicroServices;
}

export interface HttpConnection {
  type: 'http';
  name: string;
  offline?: boolean;
  sandbox: boolean;
  http: {
    formType: 'http' | 'graph_ql';
    mediaType: 'json';
    baseURI: string;
    unencrypted?: {
      field: string;
    };
    encrypted?: string;
    auth: {
      type: 'basic';
      basic: {
        username: string;
        password: string;
      };
    };
    ping?: {
      relativeURI: string;
      method: string;
    };
  };
  microServices: MicroServices;
  queues?: Array<{ name: string; size: number }>;
}

export interface FtpConnection {
  type: 'ftp';
  name: string;
  offline: boolean;
  sandbox: boolean;
  ftp: {
    type: 'ftp' | 'sftp';
    hostURI: string;
    username: string;
    password: string;
    port: number;
    usePassiveMode: boolean;
    userDirectoryIsRoot: boolean;
    useImplicitFtps: boolean;
    requireSocketReUse: boolean;
  };
  microServices: MicroServices;
}

export interface SalesforceConnection {
  type: 'salesforce';
  name: string;
  offline: boolean;
  sandbox: boolean;
  salesforce: {
    sandbox: boolean;
    oauth2FlowType: string;
    packagedOAuth: boolean;
    scope: string[];
    concurrencyLevel: number;
  };
  microServices: MicroServices;
  queues?: Array<{ name: string; size: number }>;
}

export type ConnectionConfig = HttpConnection | FtpConnection | SalesforceConnection | NetSuiteConnection;

export interface UpdateConnectionConfig {
  connectionId: string;
  config: ConnectionConfig;
}
