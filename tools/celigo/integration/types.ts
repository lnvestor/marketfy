export interface FlowGrouping {
  name: string;
  [key: string]: unknown;
}

export interface Integration {
  name: string;
  flowGroupings: FlowGrouping[];
  [key: string]: unknown;
}

export interface GetIntegrationByIdArgs {
  _id: string;
}

export interface CreateIntegrationArgs {
  name: string;
  flowGroupings: FlowGrouping[];
}

export interface UpdateIntegrationArgs {
  integrationId: string;
  config: Integration;
}

export type GetIntegrationsArgs = Record<string, never>;

export type IntegrationToolArgs = {
  action: 'create' | 'update' | 'get' | 'list';
  integrationId?: string;
  config?: Integration;
  _id?: string;
};

export type IntegrationResponse = {
  status: 'success' | 'error';
  data?: unknown;
  error?: string;
  details?: {
    code: string;
    message: string;
  };
};
