import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
import { 
  createConnectionSchema, 
  updateConnectionSchema,
  getConnectionsSchema,
  getConnectionByIdSchema,
  handleCreateConnection,
  handleUpdateConnection,
  handleGetConnections,
  handleGetConnectionById,
  ConnectionConfig 
} from './connection/index.js';
import { 
  createExportSchema, 
  updateExportSchema,
  getExportsSchema,
  getExportByIdSchema,
  handleCreateExport,
  handleUpdateExport,
  handleGetExports,
  handleGetExportById,
  ExportConfig
} from './export/index.js';
import { 
  createImportSchema, 
  updateImportSchema,
  getImportsSchema,
  getImportByIdSchema,
  handleCreateImport,
  handleUpdateImport,
  handleGetImports,
  handleGetImportById,
  ImportConfig 
} from './import/index.js';
import { 
  createFlowSchema, 
  updateFlowSchema,
  getFlowsSchema,
  getFlowByIdSchema,
  handleCreateFlow, 
  handleUpdateFlow,
  handleGetFlows,
  handleGetFlowById,
  FlowConfig 
} from './flow/index.js';
import { 
  createIntegrationSchema, 
  updateIntegrationSchema,
  getIntegrationsSchema,
  getIntegrationByIdSchema,
  handleCreateIntegration,
  handleUpdateIntegration,
  handleGetIntegrations,
  handleGetIntegrationById,
  Integration
} from './integration/index.js';

export const toolDefinitions = {
  create_connection: {
    description: 'Create a new Celigo connection',
    schema: createConnectionSchema
  },
  update_connection: {
    description: 'Update an existing Celigo connection',
    schema: updateConnectionSchema
  },
  get_connections: {
    description: 'Get all connections',
    schema: getConnectionsSchema
  },
  get_connection_by_id: {
    description: 'Get a specific connection by ID',
    schema: getConnectionByIdSchema
  },
  create_export: {
    description: 'Create a new Celigo export',
    schema: createExportSchema
  },
  update_export: {
    description: 'Update an existing Celigo export',
    schema: updateExportSchema
  },
  get_exports: {
    description: 'Get all exports',
    schema: getExportsSchema
  },
  get_export_by_id: {
    description: 'Get a specific export by ID',
    schema: getExportByIdSchema
  },
  create_import: {
    description: 'Create a new Celigo import',
    schema: createImportSchema
  },
  update_import: {
    description: 'Update an existing Celigo import',
    schema: updateImportSchema
  },
  get_imports: {
    description: 'Get all imports',
    schema: getImportsSchema
  },
  get_import_by_id: {
    description: 'Get a specific import by ID',
    schema: getImportByIdSchema
  },
  create_flow: {
    description: 'Create a new Celigo flow',
    schema: createFlowSchema
  },
  update_flow: {
    description: 'Update an existing Celigo flow',
    schema: updateFlowSchema
  },
  get_flows: {
    description: 'Get all flows',
    schema: getFlowsSchema
  },
  get_flow_by_id: {
    description: 'Get a specific flow by ID',
    schema: getFlowByIdSchema
  },
  create_integration: {
    description: 'Create a new Celigo integration with flow groupings',
    schema: createIntegrationSchema
  },
  update_integration: {
    description: 'Update an existing Celigo integration',
    schema: updateIntegrationSchema
  },
  get_integrations: {
    description: 'Get all integrations',
    schema: getIntegrationsSchema
  },
  get_integration_by_id: {
    description: 'Get a specific integration by ID',
    schema: getIntegrationByIdSchema
  }
};

export const toolList = Object.entries(toolDefinitions).map(([name, def]) => ({
  name,
  description: def.description,
  inputSchema: def.schema,
}));

export async function handleToolRequest(toolName: string, args: any, bearerToken: string) {
  switch (toolName) {
    case 'create_connection':
      return await handleCreateConnection(args, bearerToken);

    case 'update_connection':
      validateUpdateArgs(args, 'connection');
      return await handleUpdateConnection({
        connectionId: args.connectionId,
        config: args.config as ConnectionConfig
      }, bearerToken);

    case 'get_connections':
      return await handleGetConnections(args, bearerToken);

    case 'get_connection_by_id':
      if (!args?._id) {
        throw new McpError(
          ErrorCode.InvalidParams,
          'Connection ID is required for get_connection_by_id. Please provide a valid _id parameter in the arguments.'
        );
      }
      return await handleGetConnectionById(args as { _id: string }, bearerToken);

    case 'create_export':
      validateCreateArgs(args, 'export');
      return await handleCreateExport(args as ExportConfig, bearerToken);

    case 'update_export':
      validateUpdateArgs(args, 'export');
      return await handleUpdateExport({
        exportId: args.exportId,
        config: args.config as ExportConfig
      }, bearerToken);

    case 'get_exports':
      return await handleGetExports(args, bearerToken);

    case 'get_export_by_id':
      if (!args?._id) {
        throw new McpError(
          ErrorCode.InvalidParams,
          'Export ID is required for get_export_by_id. Please provide a valid _id parameter in the arguments.'
        );
      }
      return await handleGetExportById(args as { _id: string }, bearerToken);

    case 'create_import':
      validateCreateArgs(args, 'import');
      return await handleCreateImport(args as ImportConfig, bearerToken);

    case 'update_import':
      validateUpdateArgs(args, 'import');
      return await handleUpdateImport({
        importId: args.importId,
        config: args.config as ImportConfig
      }, bearerToken);

    case 'get_imports':
      return await handleGetImports(args, bearerToken);

    case 'get_import_by_id':
      if (!args?._id) {
        throw new McpError(
          ErrorCode.InvalidParams,
          'Import ID is required for get_import_by_id. Please provide a valid _id parameter in the arguments.'
        );
      }
      return await handleGetImportById(args as { _id: string }, bearerToken);

    case 'create_flow':
      validateCreateFlowArgs(args);
      return await handleCreateFlow(args as FlowConfig, bearerToken);

    case 'update_flow':
      validateUpdateArgs(args, 'flow');
      return await handleUpdateFlow({
        flowId: args.flowId,
        config: args.config as FlowConfig
      }, bearerToken);

    case 'get_flows':
      return await handleGetFlows(args, bearerToken);

    case 'get_flow_by_id':
      if (!args?._id) {
        throw new McpError(
          ErrorCode.InvalidParams,
          'Flow ID is required for get_flow_by_id. Please provide a valid _id parameter in the arguments.'
        );
      }
      return await handleGetFlowById(args as { _id: string }, bearerToken);

    case 'create_integration':
      if (!args) {
        throw new McpError(
          ErrorCode.InvalidParams,
          'Arguments are required for create_integration. Please provide the integration configuration including name and flowGroupings.'
        );
      }
      return await handleCreateIntegration(args, bearerToken);

    case 'update_integration':
      validateUpdateArgs(args, 'integration');
      return await handleUpdateIntegration({
        integrationId: args.integrationId,
        config: args.config as Integration
      }, bearerToken);

    case 'get_integrations':
      return await handleGetIntegrations(args, bearerToken);

    case 'get_integration_by_id':
      if (!args?._id) {
        throw new McpError(
          ErrorCode.InvalidParams,
          'Integration ID is required for get_integration_by_id. Please provide a valid _id parameter in the arguments.'
        );
      }
      return await handleGetIntegrationById(args as { _id: string }, bearerToken);

    default:
      throw new McpError(
        ErrorCode.MethodNotFound,
        `Unknown tool: ${toolName}. Available tools are: ${Object.keys(toolDefinitions).join(', ')}`
      );
  }
}

function validateCreateArgs(args: any, type: 'export' | 'import') {
  if (!args) {
    throw new McpError(
      ErrorCode.InvalidParams,
      `Arguments are required for create_${type}. Please provide the ${type} configuration.`
    );
  }

  if (
    typeof args.name !== 'string' ||
    typeof args._connectionId !== 'string' ||
    typeof args.apiIdentifier !== 'string'
  ) {
    throw new McpError(
      ErrorCode.InvalidParams,
      `Invalid create_${type} arguments: Please ensure all required fields have correct types:\n` +
      '- name: string\n' +
      '- _connectionId: string\n' +
      '- apiIdentifier: string'
    );
  }
}

function validateUpdateArgs(args: any, type: 'connection' | 'export' | 'import' | 'flow' | 'integration') {
  if (!args) {
    throw new McpError(
      ErrorCode.InvalidParams,
      `Arguments are required for update_${type}. Please provide the ${type} ID and updated configuration.`
    );
  }

  const idField = `${type}Id`;
  if (
    typeof args[idField] !== 'string' ||
    !args.config ||
    typeof args.config !== 'object'
  ) {
    throw new McpError(
      ErrorCode.InvalidParams,
      `Invalid update_${type} arguments: Please ensure all required fields have correct types:\n` +
      `- ${idField}: string\n` +
      `- config: object (${type} configuration)`
    );
  }
}

function validateCreateFlowArgs(args: any) {
  if (!args) {
    throw new McpError(
      ErrorCode.InvalidParams,
      'Arguments are required for create_flow. Please provide the required flow configuration including name, _integrationId, _flowGroupingId, pageGenerators, and pageProcessors.'
    );
  }

  if (
    typeof args.name !== 'string' ||
    typeof args._integrationId !== 'string' ||
    typeof args._flowGroupingId !== 'string' ||
    !Array.isArray(args.pageGenerators) ||
    !Array.isArray(args.pageProcessors) ||
    (args.free !== undefined && typeof args.free !== 'boolean')
  ) {
    throw new McpError(
      ErrorCode.InvalidParams,
      'Invalid flow arguments: Please ensure all required fields have correct types:\n' +
      '- name: string\n' +
      '- _integrationId: string\n' +
      '- _flowGroupingId: string\n' +
      '- pageGenerators: array\n' +
      '- pageProcessors: array\n' +
      '- free: boolean (optional)'
    );
  }
}
