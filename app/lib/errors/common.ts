/**
 * Common error types used by both client and server
 */
import { NextRequest, NextResponse } from 'next/server';
import { ApiError, AuthError, NotFoundError, ValidationError } from './types';

type ApiHandler = (req?: NextRequest | undefined, ...args: unknown[]) => Promise<NextResponse>;

/**
 * Higher-order function for consistent API error handling
 */
export function withErrorHandling(handler: ApiHandler) {
  return async (req?: NextRequest, ...args: unknown[]) => {
    try {
      return await handler(req, ...args);
    } catch (err) {
      console.error('API Error:', err);

      if (err instanceof AuthError) {
        return NextResponse.json(
          { error: err.message || 'Authentication required' },
          { status: 401 }
        );
      }

      if (err instanceof ValidationError) {
        return NextResponse.json(
          {
            error: err.message || 'Validation failed',
            fields: err.fields,
          },
          { status: 400 }
        );
      }

      if (err instanceof NotFoundError) {
        return NextResponse.json({ error: err.message || 'Resource not found' }, { status: 404 });
      }

      if (err instanceof ApiError) {
        return NextResponse.json({ error: err.message || 'API Error' }, { status: err.statusCode });
      }

      // Unknown errors
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  };
}

export { ApiError, AuthError, NotFoundError, ValidationError };
