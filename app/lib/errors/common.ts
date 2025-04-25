/**
 * Common error types used by both client and server
 */
export class ApiError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
  }
}

export class AuthError extends Error {
  constructor(message: string = "Authentication required") {
    super(message);
    this.name = "AuthError";
  }
}

export class NotFoundError extends Error {
  constructor(resource: string = "Resource") {
    super(`${resource} not found`);
    this.name = "NotFoundError";
  }
}

export class ValidationError extends Error {
  fields: Record<string, string>;

  constructor(
    message: string = "Validation failed",
    fields: Record<string, string> = {}
  ) {
    super(message);
    this.name = "ValidationError";
    this.fields = fields;
  }
}
