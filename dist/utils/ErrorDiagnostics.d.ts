export interface IDiagnosticResult {
    errorType: string;
    probableCause: string;
    suggestedFixes: string[];
    relatedErrors?: string[];
    documentation?: string;
    confidence: 'high' | 'medium' | 'low';
}
export declare class ErrorDiagnostics {
    private static errorPatterns;
    /**
     * Diagnose an error and provide actionable suggestions
     */
    static diagnose(error: unknown): IDiagnosticResult;
    /**
     * Diagnose authentication errors
     */
    private static diagnoseAuthError;
    /**
     * Diagnose connection errors
     */
    private static diagnoseConnectionError;
    /**
     * Diagnose validation errors
     */
    private static diagnoseValidationError;
    /**
     * Diagnose API errors
     */
    private static diagnoseApiError;
    /**
     * Diagnose errors by pattern matching
     */
    private static diagnoseByPattern;
    /**
     * Initialize common error patterns
     */
    private static initializePatterns;
    /**
     * Get suggested fix priority based on error frequency
     */
    static prioritizeFixes(diagnosis: IDiagnosticResult, errorFrequency: number): string[];
}
//# sourceMappingURL=ErrorDiagnostics.d.ts.map