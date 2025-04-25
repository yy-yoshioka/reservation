'use client';

import { ApiError, ValidationError, AuthError, NotFoundError } from '@/app/lib/errors/common';

/**
 * Error handling utilities for client components
 */

/**
 * Format error for API responses
 */
export function formatErrorResponse(error: unknown) {
  if (error instanceof ApiError) {
    return {
      error: error.message,
      statusCode: error.statusCode,
    };
  }

  if (error instanceof ValidationError) {
    return {
      error: error.message,
      fields: error.fields,
      statusCode: 400,
    };
  }

  if (error instanceof AuthError) {
    return {
      error: error.message,
      statusCode: 401,
    };
  }

  if (error instanceof NotFoundError) {
    return {
      error: error.message,
      statusCode: 404,
    };
  }

  if (error instanceof Error) {
    return {
      error: error.message,
      statusCode: 500,
    };
  }

  return {
    error: 'An unknown error occurred',
    statusCode: 500,
  };
}

/**
 * Create a safe wrapper for API handlers to catch and format errors
 */
export function withErrorHandling<T extends (...args: unknown[]) => Promise<Response>>(
  handler: T
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await handler(...args);
    } catch (error) {
      const { error: errorMessage, statusCode } = formatErrorResponse(error);

      return new Response(JSON.stringify({ error: errorMessage }), {
        status: statusCode,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }) as T;
}

/**
 * Validate required fields in an object
 */
export function validateRequired(data: Record<string, unknown>, requiredFields: string[]): void {
  const missingFields: Record<string, string> = {};

  for (const field of requiredFields) {
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      missingFields[field] = `${field} is required`;
    }
  }

  if (Object.keys(missingFields).length > 0) {
    throw new ValidationError('Validation failed', missingFields);
  }
}

// Re-export error classes
export { ApiError, ValidationError, AuthError, NotFoundError };
