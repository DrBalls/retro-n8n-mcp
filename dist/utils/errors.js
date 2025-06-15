export class N8nApiError extends Error {
    statusCode;
    code;
    hint;
    description;
    response;
    constructor(message, statusCode, code, hint, description, response) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.hint = hint;
        this.description = description;
        this.response = response;
        this.name = 'N8nApiError';
        Object.setPrototypeOf(this, N8nApiError.prototype);
    }
}
export class N8nConnectionError extends Error {
    cause;
    constructor(message, cause) {
        super(message);
        this.cause = cause;
        this.name = 'N8nConnectionError';
        Object.setPrototypeOf(this, N8nConnectionError.prototype);
    }
}
export class N8nRateLimitError extends Error {
    retryAfter;
    constructor(message, retryAfter) {
        super(message);
        this.retryAfter = retryAfter;
        this.name = 'N8nRateLimitError';
        Object.setPrototypeOf(this, N8nRateLimitError.prototype);
    }
}
export class N8nAuthenticationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'N8nAuthenticationError';
        Object.setPrototypeOf(this, N8nAuthenticationError.prototype);
    }
}
export class N8nValidationError extends Error {
    errors;
    constructor(message, errors) {
        super(message);
        this.errors = errors;
        this.name = 'N8nValidationError';
        Object.setPrototypeOf(this, N8nValidationError.prototype);
    }
}
export class N8nTimeoutError extends Error {
    timeout;
    constructor(message, timeout) {
        super(message);
        this.timeout = timeout;
        this.name = 'N8nTimeoutError';
        Object.setPrototypeOf(this, N8nTimeoutError.prototype);
    }
}
// Helper to determine if an error is retryable
export function isRetryableError(error) {
    if (error instanceof N8nRateLimitError)
        return true;
    if (error instanceof N8nTimeoutError)
        return true;
    if (error instanceof N8nConnectionError)
        return true;
    if (error instanceof N8nApiError) {
        // Retry on server errors (5xx) and some client errors
        const retryableStatusCodes = [429, 502, 503, 504];
        return error.statusCode ? retryableStatusCodes.includes(error.statusCode) : false;
    }
    return false;
}
// Helper to extract error details from various error formats
export function extractErrorDetails(error) {
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
        const obj = error;
        return {
            message: obj['message'] || 'Unknown error',
            ...(obj['statusCode'] !== undefined && { statusCode: obj['statusCode'] }),
            ...(obj['code'] !== undefined && { code: obj['code'] }),
        };
    }
    return { message: String(error) };
}
//# sourceMappingURL=errors.js.map