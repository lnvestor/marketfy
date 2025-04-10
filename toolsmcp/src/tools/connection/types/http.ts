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
  microServices: {
    disableNetSuiteWebServices: boolean;
    disableRdbms: boolean;
    disableDataWarehouse: boolean;
  };
  queues?: Array<{
    name: string;
    size: number;
  }>;
}
