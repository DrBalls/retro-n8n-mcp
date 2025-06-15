export declare class N8nApiError extends Error {
    statusCode?: number | undefined;
    code?: string | undefined;
    hint?: string | undefined;
    description?: string | undefined;
    response?: unknown | undefined;
    constructor(message: string, statusCode?: number | undefined, code?: string | undefined, hint?: string | undefined, description?: string | undefined, response?: unknown | undefined);
}
export declare class N8nConnectionError extends Error {
    cause?: Error | undefined;
    constructor(message: string, cause?: Error | undefined);
}
export declare class N8nRateLimitError extends Error {
    retryAfter?: number | undefined;
    constructor(message: string, retryAfter?: number | undefined);
}
export declare class N8nAuthenticationError extends Error {
    constructor(message: string);
}
export declare class N8nValidationError extends Error {
    errors?: unknown[] | undefined;
    constructor(message: string, errors?: unknown[] | undefined);
}
export declare class N8nTimeoutError extends Error {
    timeout: number;
    constructor(message: string, timeout: number);
}
export declare function isRetryableError(error: unknown): boolean;
export declare function extractErrorDetails(error: unknown): {
    message: string;
    statusCode?: number;
    code?: string;
};
//# sourceMappingURL=errors.d.ts.map