export interface NetSuiteConnection {
  _id?: string;  // Example shows "650393c40668ef795a81d752"
  type: 'netsuite';
  name: string;  // Example shows "NetSuite - Prod (PRIMARY)"
  netsuite: {
    wsdlVersion: string;  // Example shows "2020.2"
    concurrencyLevel: number;  // Example shows 1
  };
  microServices: {
    disableRdbms: boolean;  // Only this field shown in example
  };
  // Note: No offline, sandbox, or queues in NetSuite example
}
