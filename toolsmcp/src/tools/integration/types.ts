// Integration type interfaces based on Celigo API schemas

export interface FlowGrouping {
  name: string;
}

export interface Integration {
  name: string;
  flowGroupings: FlowGrouping[];
}

export type IntegrationInput = Integration;

export interface UpdateIntegrationConfig {
  integrationId: string;
  config: Integration;
}
