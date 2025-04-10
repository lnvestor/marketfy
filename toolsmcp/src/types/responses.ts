import type { CeligoErrorResponse } from './errors.js';

// Generic success/error response type
export type ApiResponse<T> = 
  | ({ success: true } & T)  // Success case includes the data
  | ({ success: false } & CeligoErrorResponse);  // Error case includes errors

/*
Example error response:
{
    "success": false,
    "errors": [
        {
            "field": "netsuite",
            "code": "missing_required_field",
            "message": "netsuite subschema not defined"
        }
    ]
}

Example success response:
{
    "success": true,
    "type": "netsuite",
    "name": "NetSuite - Prod",
    ...rest of the data
}
*/
