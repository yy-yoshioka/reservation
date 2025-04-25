// Server-side error handling utilities - no 'use client' directive

import {
  ApiError,
  ValidationError,
  AuthError,
  NotFoundError,
} from "@/app/lib/errors/common";
import { NextResponse } from "next/server";

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
    error: "An unknown error occurred",
    statusCode: 500,
  };
}

/**
 * Create a safe wrapper for API handlers to catch and format errors
 */
export function withErrorHandling<
  Args extends unknown[],
  ReturnType extends Response
>(
  handler: (...args: Args) => Promise<ReturnType>
): (...args: Args) => Promise<ReturnType | NextResponse> {
  return async (...args: Args) => {
    try {
      return await handler(...args);
    } catch (error) {
      const { error: errorMessage, statusCode } = formatErrorResponse(error);

      return NextResponse.json({ error: errorMessage }, { status: statusCode });
    }
  };
}
