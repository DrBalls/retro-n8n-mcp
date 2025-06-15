import { zodToJsonSchema } from '../../utils/zodToJsonSchema.js';
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
     * Validate input parameters
     */
    validateInput(params) {
        return this.inputSchema.parse(params);
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
     * Create an error response
     */
    createErrorResponse(error, metadata) {
        const errorMessage = error instanceof Error ? error.message : error;
        return {
            content: [{ type: 'text', text: `Error: ${errorMessage}` }],
            isError: true,
            ...(metadata && { metadata }),
        };
    }
    /**
     * Convert Zod schema to JSON Schema for MCP
     */
    zodToJsonSchema(schema) {
        return zodToJsonSchema(schema);
    }
}
//# sourceMappingURL=Tool.js.map