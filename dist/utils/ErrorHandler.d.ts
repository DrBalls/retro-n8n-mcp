export interface IErrorContext {
    operation?: string;
    resourceType?: string;
    resourceId?: string;
    attempt?: number;
    maxAttempts?: number;
    [key: string]: unknown;
}
export interface IErrorRecoveryStrategy {
    shouldRetry: boolean;
    retryDelay?: number;
    alternativeAction?: () => Promise<unknown>;
    userMessage: string;
    developerMessage: string;
}
export declare class ErrorHandler {
    private static logger;
    private static errorCounts;
    private static lastErrors;
    /**
     * Handle an error with context and recovery strategies
     */
    static handle(error: unknown, context?: IErrorContext): Promise<IErrorRecoveryStrategy>;
    /**
     * Determine the appropriate recovery strategy for an error
     */
    private static determineRecoveryStrategy;
    /**
     * Generate a unique key for error tracking
     */
    private static generateErrorKey;
    /**
     * Track error occurrences for pattern detection
     */
    private static trackError;
    /**
     * Get error statistics
     */
    static getErrorStats(): Record<string, unknown>;
    /**
     * Clear error tracking (useful for testing)
     */
    static clearErrorTracking(): void;
    /**
     * Create a contextual error with additional information
     */
    static createContextualError(error: unknown, context: IErrorContext): Error;
    /**
     * Retry an operation with exponential backoff
     */
    static retry<T>(operation: () => Promise<T>, context?: IErrorContext, maxAttempts?: number): Promise<T>;
}
//# sourceMappingURL=ErrorHandler.d.ts.map