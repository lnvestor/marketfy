import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';

export type AxiosError<T = any> = {
  response?: {
    data?: T;
    status?: number;
    statusText?: string;
  };
  config?: {
    method?: string;
    url?: string;
    data?: string;
  };
  message: string;
};

export interface CeligoError {
  field: string;
  code: string;
  message: string;
}

export interface CeligoErrorResponse {
  errors: CeligoError[];
}

export function handleError(error: any) {
  try {
    // Check if this is an Axios error
    const axiosError = error as AxiosError<CeligoErrorResponse | { message: string }>;
    if (axiosError.response?.data) {
      // Format common error information
      const statusInfo = axiosError.response?.status ? 
        `Status ${axiosError.response.status}: ${axiosError.response.statusText || 'Unknown Error'}` : 
        'Unknown Status';

      // Format request information
      const method = axiosError.config?.method?.toUpperCase() || 'UNKNOWN';
      const url = axiosError.config?.url || 'unknown URL';
      // Try to format request body as pretty JSON if possible
      let requestBody = '';
      if (axiosError.config?.data) {
        try {
          const jsonBody = JSON.parse(axiosError.config.data);
          requestBody = `\nRequest Body:\n${JSON.stringify(jsonBody, null, 2)}`;
        } catch {
          // If not valid JSON, use as-is
          requestBody = `\nRequest Body: ${axiosError.config.data}`;
        }
      }
      const requestInfo = `${method} ${url}${requestBody}`;

      // Handle standard Celigo error format
      if ('errors' in axiosError.response.data) {
        const celigoErrors = axiosError.response.data.errors;
        const errorDetails = celigoErrors?.map((err: CeligoError) => ({
          field: err.field,
          code: err.code,
          message: err.message
        }));

        // Log the detailed error
        console.error('[Celigo API Error]', errorDetails);

        const errorMessages = errorDetails?.map(err => 
          `- ${err.field}: ${err.message} (${err.code})`
        ).join('\n');

        // Return formatted Celigo error response
        return {
          content: [{
            type: 'text',
            text: `Celigo API Error\n${statusInfo}\nRequest: ${requestInfo}\n\nDetails:\n${errorMessages}`
          }],
          isError: true
        };
      } 
      // Handle simple message format
      else if ('message' in axiosError.response.data) {
        return {
          content: [{
            type: 'text',
            text: `Celigo API Error\n${statusInfo}\nRequest: ${requestInfo}\n\nDetails:\n- ${axiosError.response.data.message}`
          }],
          isError: true
        };
      }
    }

    // Convert other errors to McpError if needed
    if (!(error instanceof McpError)) {
      if (error instanceof Error) {
        error = new McpError(
          ErrorCode.InternalError,
          `Internal server error: ${error.message}`
        );
      } else {
        error = new McpError(
          ErrorCode.InternalError,
          'Unknown internal server error'
        );
      }
    }

    // Log the error with context
    if (error instanceof McpError) {
      console.error('[MCP Error]', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
    } else {
      console.error('[MCP Error]', error);
    }

    // Return formatted error response
    return {
      content: [{
        type: 'text',
        text: `Error: ${error.message}`
      }],
      isError: true
    };
  } catch (e) {
    // Fallback error handling if error processing fails
    console.error('[Error Handler Failed]', e);
    return {
      content: [{
        type: 'text',
        text: 'An unexpected error occurred while processing the error response'
      }],
      isError: true
    };
  }
}
