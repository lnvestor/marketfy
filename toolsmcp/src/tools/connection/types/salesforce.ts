export interface SalesforceConnection {
  type: 'salesforce';
  name: string;  // Example shows "salesforce conn"
  offline?: boolean;
  sandbox: boolean;
  salesforce: {
    sandbox: boolean;
    oauth2FlowType: string;  // Example shows "jwtBearerToken"
    packagedOAuth: boolean;
    scope: string[];  // Empty array in example
    concurrencyLevel: number;  // Example shows 5
  };
  microServices: {
    disableNetSuiteWebServices: boolean;
    disableRdbms: boolean;
    disableDataWarehouse: boolean;
  };
  queues?: Array<{
    name: string;  // Example shows "641d2d166621032ce398fd29"
    size: number;  // Example shows 0
  }>;
}
