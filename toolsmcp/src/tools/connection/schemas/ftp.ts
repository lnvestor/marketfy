export const ftpConnectionSchema = {
  type: 'object',
  properties: {
    type: {
      type: 'string',
      const: 'ftp',
      description: 'Connection type',
    },
    name: {
      type: 'string',
      description: 'Connection name',
    },
    offline: {
      type: 'boolean',
      description: 'Whether the connection is offline',
    },
    sandbox: {
      type: 'boolean',
      description: 'Whether to use sandbox environment',
    },
    ftp: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: ['ftp', 'sftp'],
          description: 'FTP type',
        },
        hostURI: {
          type: 'string',
          description: 'FTP host URI',
        },
        username: {
          type: 'string',
          description: 'FTP username',
        },
        password: {
          type: 'string',
          description: 'FTP password',
        },
        port: {
          type: 'number',
          description: 'FTP port (default: 21)',
        },
        usePassiveMode: {
          type: 'boolean',
          description: 'Use passive mode',
        },
        userDirectoryIsRoot: {
          type: 'boolean',
          description: 'User directory is root',
        },
        useImplicitFtps: {
          type: 'boolean',
          description: 'Use implicit FTPS',
        },
        requireSocketReUse: {
          type: 'boolean',
          description: 'Require socket reuse',
        },
      },
      required: ['type', 'hostURI', 'username', 'password'],
    },
    microServices: {
      type: 'object',
      properties: {
        disableNetSuiteWebServices: {
          type: 'boolean',
          default: false,
        },
        disableRdbms: {
          type: 'boolean',
          default: false,
        },
        disableDataWarehouse: {
          type: 'boolean',
          default: false,
        },
      },
      required: ['disableNetSuiteWebServices', 'disableRdbms', 'disableDataWarehouse'],
    },
  },
  required: ['type', 'name', 'ftp', 'microServices'],
};
