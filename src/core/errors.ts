export class ProspeoError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number,
  ) {
    super(message);
    this.name = 'ProspeoError';
  }
}

export class AuthError extends ProspeoError {
  constructor(message: string) {
    super(message, 'AUTH_ERROR', 401);
    this.name = 'AuthError';
  }
}

export class ValidationError extends ProspeoError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR', 400);
    this.name = 'ValidationError';
  }
}

export class RateLimitError extends ProspeoError {
  constructor(message: string) {
    super(message, 'RATE_LIMIT', 429);
    this.name = 'RateLimitError';
  }
}

export class InsufficientCreditsError extends ProspeoError {
  constructor(message: string) {
    super(message, 'INSUFFICIENT_CREDITS', 400);
    this.name = 'InsufficientCreditsError';
  }
}

export class NoMatchError extends ProspeoError {
  constructor(message: string) {
    super(message, 'NO_MATCH', 400);
    this.name = 'NoMatchError';
  }
}

export class ServerError extends ProspeoError {
  constructor(message: string, statusCode: number = 500) {
    super(message, 'SERVER_ERROR', statusCode);
    this.name = 'ServerError';
  }
}

export function formatError(error: unknown): { message: string; code: string } {
  if (error instanceof ProspeoError) {
    return { message: error.message, code: error.code };
  }
  if (error instanceof Error) {
    if (error.name === 'AbortError' || String(error.message).includes('aborted')) {
      return { message: 'Request timed out — the API did not respond in time', code: 'TIMEOUT' };
    }
    if (error.message.includes('ECONNREFUSED') || error.message.includes('ENOTFOUND')) {
      return { message: `Network error: ${error.message}`, code: 'NETWORK_ERROR' };
    }
    return { message: error.message, code: 'UNKNOWN_ERROR' };
  }
  return { message: String(error), code: 'UNKNOWN_ERROR' };
}
