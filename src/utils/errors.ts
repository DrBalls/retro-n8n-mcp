export class N8nApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public code?: string,
    public hint?: string,
    public description?: string,
    public response?: unknown,
  ) {
    super(message);
    this.name = 'N8nApiError';
    Object.setPrototypeOf(this, N8nApiError.prototype);
  }
}

export class N8nConnectionError extends Error {
  constructor(
    message: string,
    public override cause?: Error,
  ) {
    super(message);
    this.name = 'N8nConnectionError';
    Object.setPrototypeOf(this, N8nConnectionError.prototype);
  }
}

export class N8nRateLimitError extends Error {
  constructor(
    message: string,
    public retryAfter?: number,
  ) {
    super(message);
    this.name = 'N8nRateLimitError';
    Object.setPrototypeOf(this, N8nRateLimitError.prototype);
  }
}

export class N8nAuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'N8nAuthenticationError';
    Object.setPrototypeOf(this, N8nAuthenticationError.prototype);
  }
}

export class N8nValidationError extends Error {
  constructor(
    message: string,
    public errors?: unknown[],
  ) {
    super(message);
    this.name = 'N8nValidationError';
    Object.setPrototypeOf(this, N8nValidationError.prototype);
  }
}

export class N8nTimeoutError extends Error {
  constructor(
    message: string,
    public timeout: number,
  ) {
    super(message);
    this.name = 'N8nTimeoutError';
    Object.setPrototypeOf(this, N8nTimeoutError.prototype);
  }
}

// Helper to determine if an error is retryable
export function isRetryableError(error: unknown): boolean {
  if (error instanceof N8nRateLimitError) return true;
  if (error instanceof N8nTimeoutError) return true;
  if (error instanceof N8nConnectionError) return true;
  
  if (error instanceof N8nApiError) {
    // Retry on server errors (5xx) and some client errors
    const retryableStatusCodes = [429, 502, 503, 504];
    return error.statusCode ? retryableStatusCodes.includes(error.statusCode) : false;
  }
  
  return false;
}

// Helper to extract error details from various error formats
export function extractErrorDetails(error: unknown): {
  message: string;
  statusCode?: number;
  code?: string;
} {
  if (error instanceof N8nApiError) {
    return {
      message: error.message,
      ...(error.statusCode !== undefined && { statusCode: error.statusCode }),
      ...(error.code !== undefined && { code: error.code }),
    };
  }
  
  if (error instanceof Error) {
    return { message: error.message };
  }
  
  if (typeof error === 'object' && error !== null) {
    const obj = error as Record<string, unknown>;
    return {
      message: obj['message'] as string || 'Unknown error',
      ...(obj['statusCode'] !== undefined && { statusCode: obj['statusCode'] as number }),
      ...(obj['code'] !== undefined && { code: obj['code'] as string }),
    };
  }
  
  return { message: String(error) };
}