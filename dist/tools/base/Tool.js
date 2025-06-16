import { z } from 'zod';
import { zodToJsonSchema } from '../../utils/zodToJsonSchema.js';
import { ErrorHandler } from '../../utils/ErrorHandler.js';
import { ErrorDiagnostics } from '../../utils/ErrorDiagnostics.js';
import { N8nValidationError } from '../../utils/errors.js';
/**
 * Base abstract class for tools
 */
export class BaseTool {
    /**
     * Convert to MCP tool definition
     */
    toMcpTool() {
        return {
            name: this.name,
            description: this.description,
            inputSchema: this.zodToJsonSchema(this.inputSchema),
        };
    }
    /**
     * Validate input parameters with enhanced error handling
     */
    validateInput(params) {
        try {
            return this.inputSchema.parse(params);
        }
        catch (error) {
            if (error instanceof z.ZodError) {
                const validationError = new N8nValidationError('Input validation failed', error.errors.map(e => ({
                    field: e.path.join('.'),
                    message: e.message,
                    code: e.code
                })));
                throw validationError;
            }
            throw error;
        }
    }
    /**
     * Create a standard text response
     */
    createTextResponse(text, metadata) {
        return {
            content: [{ type: 'text', text }],
            ...(metadata && { metadata }),
        };
    }
    /**
     * Create an error response with diagnostics
     */
    createErrorResponse(error, metadata) {
        const errorObj = error instanceof Error ? error : new Error(error);
        const diagnosis = ErrorDiagnostics.diagnose(errorObj);
        const errorInfo = {
            error: errorObj.message,
            diagnosis: {
                type: diagnosis.errorType,
                cause: diagnosis.probableCause,
                fixes: diagnosis.suggestedFixes,
                confidence: diagnosis.confidence
            },
            ...(metadata || {})
        };
        return {
            content: [{
                    type: 'text',
                    text: JSON.stringify(errorInfo, null, 2),
                    mimeType: 'application/json'
                }],
            isError: true,
            metadata: errorInfo
        };
    }
    /**
     * Execute with error handling and recovery
     */
    async executeWithErrorHandling(operation, context) {
        try {
            return await ErrorHandler.retry(operation, {
                ...context,
                tool: this.name
            });
        }
        catch (error) {
            const diagnosis = ErrorDiagnostics.diagnose(error);
            // Log diagnostic information
            console.error(`Tool ${this.name} error:`, {
                error: error instanceof Error ? error.message : error,
                diagnosis: diagnosis,
                context: context
            });
            throw error;
        }
    }
    /**
     * Convert Zod schema to JSON Schema for MCP
     */
    zodToJsonSchema(schema) {
        return zodToJsonSchema(schema);
    }
}
//# sourceMappingURL=Tool.js.map