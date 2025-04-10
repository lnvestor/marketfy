// Common error codes from Celigo API
export type CeligoErrorCode = 
  | 'missing_required_field'
  | 'invalid_field'
  | 'enum'
  | 'validation_failed'
  | string;  // Allow for other error codes

// Individual error object
export interface CeligoError {
  field: string;
  code: CeligoErrorCode;
  message: string;
}

// Error response from API
export interface CeligoErrorResponse {
  errors: CeligoError[];
}
