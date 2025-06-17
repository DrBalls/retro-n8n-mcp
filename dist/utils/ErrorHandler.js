import { Logger } from './Logger.js';
import { N8nApiError, N8nConnectionError, N8nRateLimitError, N8nAuthenticationError, N8nValidationError, N8nTimeoutError, isRetryableError, extractErrorDetails } from './errors.js';
export class ErrorHandler {
    static logger = new Logger('error');
    static errorCounts = new Map();
    static lastErrors = new Map();
    /**
     * Handle an error with context and recovery strategies
     */
    static async handle(error, context = {}) {
        const errorDetails = extractErrorDetails(error);
        const errorKey = this.generateErrorKey(errorDetails, context);
        // Track error occurrences
        this.trackError(errorKey, error);
        // Log the error with context
        this.logger.error(`Error in ${context.operation || 'unknown operation'}`, {
            ...errorDetails,
            ...context
        });
        // Determine recovery strategy
        const strategy = this.determineRecoveryStrategy(error, context);
        // Log recovery strategy
        this.logger.info('Recovery strategy determined', {
            errorKey,
            strategy: {
                shouldRetry: strategy.shouldRetry,
                retryDelay: strategy.retryDelay
            }
        });
        return strategy;
    }
    /**
     * Determine the appropriate recovery strategy for an error
     */
    static determineRecoveryStrategy(error, context) {
        // Rate limit errors
        if (error instanceof N8nRateLimitError) {
            return {
                shouldRetry: true,
                retryDelay: error.retryAfter || 60000, // Default to 1 minute
                userMessage: 'Rate limit reached. Please wait before trying again.',
                developerMessage: `Rate limited. Retry after ${error.retryAfter || 60000}ms`
            };
        }
        // Authentication errors
        if (error instanceof N8nAuthenticationError) {
            return {
                shouldRetry: false,
                userMessage: 'Authentication failed. Please check your API credentials.',
                developerMessage: 'Invalid API key or authentication method',
                alternativeAction: async () => {
                    // Could trigger re-authentication flow
                    this.logger.warn('Authentication failed - manual intervention required');
                }
            };
        }
        // Connection errors
        if (error instanceof N8nConnectionError) {
            const attempt = context.attempt || 1;
            const maxAttempts = context.maxAttempts || 3;
            return {
                shouldRetry: attempt < maxAttempts,
                retryDelay: Math.min(1000 * Math.pow(2, attempt - 1), 30000), // Exponential backoff
                userMessage: 'Connection error. Retrying...',
                developerMessage: `Connection failed on attempt ${attempt}/${maxAttempts}`
            };
        }
        // Timeout errors
        if (error instanceof N8nTimeoutError) {
            return {
                shouldRetry: true,
                retryDelay: 5000,
                userMessage: 'Request timed out. Retrying with longer timeout...',
                developerMessage: `Timeout after ${error.timeout}ms`,
                alternativeAction: async () => {
                    // Could increase timeout for next attempt
                    this.logger.info('Increasing timeout for retry');
                }
            };
        }
        // Validation errors
        if (error instanceof N8nValidationError) {
            return {
                shouldRetry: false,
                userMessage: 'Invalid input data. Please check your parameters.',
                developerMessage: `Validation failed: ${error.message}`,
                alternativeAction: async () => {
                    // Could suggest corrections based on validation errors
                    if (error.errors && error.errors.length > 0) {
                        this.logger.info('Validation errors:', { errors: error.errors });
                    }
                }
            };
        }
        // API errors
        if (error instanceof N8nApiError) {
            // 4xx errors - client errors, usually not retryable
            if (error.statusCode && error.statusCode >= 400 && error.statusCode < 500) {
                return {
                    shouldRetry: false,
                    userMessage: error.hint || 'Invalid request. Please check your input.',
                    developerMessage: error.description || error.message
                };
            }
            // 5xx errors - server errors, usually retryable
            if (error.statusCode && error.statusCode >= 500) {
                return {
                    shouldRetry: true,
                    retryDelay: 5000,
                    userMessage: 'Server error. Retrying...',
                    developerMessage: `Server returned ${error.statusCode}: ${error.message}`
                };
            }
        }
        // Generic retryable errors
        if (isRetryableError(error)) {
            return {
                shouldRetry: true,
                retryDelay: 3000,
                userMessage: 'Temporary error. Retrying...',
                developerMessage: 'Error is retryable based on error type'
            };
        }
        // Default strategy for unknown errors
        return {
            shouldRetry: false,
            userMessage: 'An unexpected error occurred.',
            developerMessage: error instanceof Error ? error.message : String(error)
        };
    }
    /**
     * Generate a unique key for error tracking
     */
    static generateErrorKey(errorDetails, context) {
        const parts = [
            errorDetails.code || 'unknown',
            context.operation || 'unknown',
            context.resourceType || 'unknown'
        ];
        return parts.join(':');
    }
    /**
     * Track error occurrences for pattern detection
     */
    static trackError(errorKey, error) {
        const count = this.errorCounts.get(errorKey) || 0;
        this.errorCounts.set(errorKey, count + 1);
        if (error instanceof Error) {
            this.lastErrors.set(errorKey, error);
        }
        // Alert on repeated errors
        if (count > 5) {
            this.logger.warn(`Error pattern detected: ${errorKey} occurred ${count + 1} times`);
        }
    }
    /**
     * Get error statistics
     */
    static getErrorStats() {
        const stats = {};
        this.errorCounts.forEach((count, key) => {
            stats[key] = {
                count,
                lastError: this.lastErrors.get(key)?.message
            };
        });
        return stats;
    }
    /**
     * Clear error tracking (useful for testing)
     */
    static clearErrorTracking() {
        this.errorCounts.clear();
        this.lastErrors.clear();
    }
    /**
     * Create a contextual error with additional information
     */
    static createContextualError(error, context) {
        const errorDetails = extractErrorDetails(error);
        const contextStr = Object.entries(context)
            .map(([key, value]) => `${key}=${value}`)
            .join(', ');
        const message = `${errorDetails.message} [Context: ${contextStr}]`;
        if (error instanceof N8nApiError) {
            return new N8nApiError(message, error.statusCode, error.code, error.hint, error.description, error.response);
        }
        if (error instanceof Error) {
            const contextualError = new Error(message);
            contextualError.name = error.name;
            contextualError.stack = error.stack;
            return contextualError;
        }
        return new Error(message);
    }
    /**
     * Retry an operation with exponential backoff
     */
    static async retry(operation, context = {}, maxAttempts = 3) {
        let lastError;
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                return await operation();
            }
            catch (error) {
                lastError = error;
                const strategy = await this.handle(error, {
                    ...context,
                    attempt,
                    maxAttempts
                });
                if (!strategy.shouldRetry || attempt === maxAttempts) {
                    throw this.createContextualError(error, {
                        ...context,
                        finalAttempt: attempt,
                        strategyMessage: strategy.developerMessage
                    });
                }
                // Execute alternative action if provided
                if (strategy.alternativeAction) {
                    await strategy.alternativeAction();
                }
                // Wait before retry
                if (strategy.retryDelay) {
                    await new Promise(resolve => setTimeout(resolve, strategy.retryDelay));
                }
            }
        }
        throw lastError;
    }
}
//# sourceMappingURL=ErrorHandler.js.map