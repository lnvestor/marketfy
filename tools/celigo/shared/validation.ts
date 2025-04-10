import { CeligoErrorCode } from './types';
import { createErrorResponse } from './api';

export function validateRequired<T extends Record<string, unknown>>(
  data: T,
  fields: string[]
): void {
  const missing = fields.filter(field => !data[field]);
  if (missing.length > 0) {
    throw createErrorResponse(
      CeligoErrorCode.InvalidConfig,
      `Missing required fields: ${missing.join(', ')}`
    );
  }
}

export function validateEnum<T extends string>(
  value: unknown,
  allowedValues: readonly T[],
  fieldName: string
): void {
  if (!value || !allowedValues.includes(value as T)) {
    throw createErrorResponse(
      CeligoErrorCode.InvalidConfig,
      `Invalid ${fieldName}. Must be one of: ${allowedValues.join(', ')}`
    );
  }
}

export function validateHttpConfig(config: Record<string, unknown>): void {
  // Validate required HTTP fields
  validateRequired(config, ['formType', 'mediaType', 'baseURI', 'auth']);

  // Validate form type
  validateEnum(
    config.formType,
    ['http', 'graph_ql'] as const,
    'formType'
  );

  // Validate media type
  validateEnum(
    config.mediaType,
    ['json'] as const,
    'mediaType'
  );

  // Validate auth
  const auth = config.auth as Record<string, unknown>;
  if (!auth || typeof auth !== 'object') {
    throw createErrorResponse(
      CeligoErrorCode.InvalidConfig,
      'Invalid auth configuration'
    );
  }

  validateRequired(auth, ['type']);
  validateEnum(
    auth.type,
    ['basic', 'token'] as const,
    'auth.type'
  );

  if (auth.type === 'basic') {
    const basic = auth.basic as Record<string, unknown>;
    if (!basic || typeof basic !== 'object') {
      throw createErrorResponse(
        CeligoErrorCode.InvalidConfig,
        'Invalid basic auth configuration'
      );
    }
    validateRequired(basic, ['username', 'password']);
  } else if (auth.type === 'token') {
    const token = auth.token as Record<string, unknown>;
    if (!token || typeof token !== 'object') {
      throw createErrorResponse(
        CeligoErrorCode.InvalidConfig,
        'Invalid token auth configuration'
      );
    }
    validateRequired(token, ['token', 'location']);
    validateEnum(
      token.location,
      ['header', 'body', 'url'] as const,
      'auth.token.location'
    );
    
    if (token.location === 'header') {
      validateRequired(token, ['headerName']);
    } else {
      validateRequired(token, ['paramName']);
    }
  }
}

export function validateNetSuiteConfig(config: Record<string, unknown>): void {
  // Validate required NetSuite fields
  validateRequired(config, ['wsdlVersion', 'concurrencyLevel']);

  // Validate concurrency level
  const concurrencyLevel = config.concurrencyLevel as number;
  if (typeof concurrencyLevel !== 'number' || concurrencyLevel < 1) {
    throw createErrorResponse(
      CeligoErrorCode.InvalidConfig,
      'concurrencyLevel must be a positive number'
    );
  }
}

export function validateMicroServices(config: Record<string, unknown>): void {
  const microServices = config.microServices;
  if (microServices && typeof microServices === 'object') {
    const ms = microServices as Record<string, unknown>;
    Object.entries(ms).forEach(([key, value]) => {
      if (typeof value !== 'boolean') {
        throw createErrorResponse(
          CeligoErrorCode.InvalidConfig,
          `Invalid microServices.${key}: must be a boolean`
        );
      }
    });
  }
}

export function validateQueues(config: Record<string, unknown>): void {
  const queues = config.queues;
  if (queues) {
    if (!Array.isArray(queues)) {
      throw createErrorResponse(
        CeligoErrorCode.InvalidConfig,
        'queues must be an array'
      );
    }

    queues.forEach((queue, index) => {
      if (typeof queue !== 'object' || !queue) {
        throw createErrorResponse(
          CeligoErrorCode.InvalidConfig,
          `Invalid queue at index ${index}`
        );
      }

      validateRequired(queue as Record<string, unknown>, ['name', 'size']);

      const size = (queue as Record<string, unknown>).size;
      if (typeof size !== 'number' || size < 1) {
        throw createErrorResponse(
          CeligoErrorCode.InvalidConfig,
          `Invalid queue size at index ${index}: must be a positive number`
        );
      }
    });
  }
}
