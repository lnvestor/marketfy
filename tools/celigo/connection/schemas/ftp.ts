export const ftpConnectionSchema = {
  type: 'object',
  properties: {
    type: {
      type: 'string',
      enum: ['ftp'],
      description: 'Connection type'
    },
    name: {
      type: 'string',
      description: 'Connection name'
    },
    offline: {
      type: 'boolean',
      description: 'Whether the connection is offline'
    },
    sandbox: {
      type: 'boolean',
      description: 'Whether this is a sandbox connection'
    },
    ftp: {
      type: 'object',
      required: [
        'type',
        'hostURI',
        'username',
        'password',
        'port',
        'usePassiveMode',
        'userDirectoryIsRoot',
        'useImplicitFtps',
        'requireSocketReUse'
      ],
      properties: {
        type: {
          type: 'string',
          enum: ['ftp', 'sftp'],
          description: 'FTP protocol type'
        },
        hostURI: {
          type: 'string',
          description: 'Host URI for the FTP server'
        },
        username: {
          type: 'string',
          description: 'FTP username'
        },
        password: {
          type: 'string',
          description: 'FTP password'
        },
        port: {
          type: 'number',
          minimum: 1,
          maximum: 65535,
          description: 'Port number for the FTP server'
        },
        usePassiveMode: {
          type: 'boolean',
          description: 'Whether to use passive mode'
        },
        userDirectoryIsRoot: {
          type: 'boolean',
          description: 'Whether the user directory is the root'
        },
        useImplicitFtps: {
          type: 'boolean',
          description: 'Whether to use implicit FTPS'
        },
        requireSocketReUse: {
          type: 'boolean',
          description: 'Whether to require socket reuse'
        }
      }
    },
    microServices: {
      type: 'object',
      properties: {
        disableNetSuiteWebServices: {
          type: 'boolean',
          description: 'Disable NetSuite web services'
        },
        disableRdbms: {
          type: 'boolean',
          description: 'Disable RDBMS'
        },
        disableDataWarehouse: {
          type: 'boolean',
          description: 'Disable data warehouse'
        }
      }
    },
    queues: {
      type: 'array',
      items: {
        type: 'object',
        required: ['name', 'size'],
        properties: {
          name: {
            type: 'string',
            description: 'Queue name'
          },
          size: {
            type: 'number',
            minimum: 1,
            description: 'Queue size'
          }
        }
      }
    }
  },
  required: ['type', 'name', 'ftp'],
  additionalProperties: false
} as const;
