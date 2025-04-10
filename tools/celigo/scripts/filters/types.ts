import { ApiResponse } from '../../shared/types';

// Script configuration
export interface ScriptConfig {
  name: string;
  content: string;
  sandbox?: boolean;
  postResponseHookToProcessOnChildRecord?: boolean;
}

// Filter script tool arguments
export interface FilterScriptToolArgs {
  action: 'create' | 'update' | 'get' | 'delete';
  scriptId?: string;
  config?: ScriptConfig;
}

// Script response from API
export interface ScriptResponse {
  _id: string;
  name: string;
  content: string;
  lastModified: string;
  createdAt: string;
  sandbox: boolean;
  postResponseHookToProcessOnChildRecord: boolean;
}

// API response with script
export type ScriptApiResponse = ApiResponse<ScriptResponse>;