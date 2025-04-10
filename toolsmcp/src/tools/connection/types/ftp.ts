export interface FtpConnection {
  type: 'ftp';
  name: string;
  offline?: boolean;
  sandbox: boolean;
  ftp: {
    type: 'ftp' | 'sftp';  // Support both FTP and SFTP
    hostURI: string;
    username: string;
    password: string;
    port?: number;  // Optional, default: 21
    usePassiveMode?: boolean;
    userDirectoryIsRoot?: boolean;
    useImplicitFtps?: boolean;
    requireSocketReUse?: boolean;
  };
  microServices: {
    disableNetSuiteWebServices: boolean;
    disableRdbms: boolean;
    disableDataWarehouse: boolean;
  };
  // No queues in FTP example
}
