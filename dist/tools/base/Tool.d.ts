import { z } from 'zod';
import { Tool as McpTool } from '@modelcontextprotocol/sdk/types.js';
import { IErrorContext } from '../../utils/ErrorHandler.js';
/**
 * Base interface for all n8n MCP tools
 */
export interface ITool {
    /**
     * Unique identifier for the tool
     */
    readonly name: string;
    /**
     * Human-readable description of what the tool does
     */
    readonly description: string;
    /**
     * Zod schema for validating input parameters
     */
    readonly inputSchema: z.ZodSchema<any>;
    /**
     * Execute the tool with validated parameters
     */
    execute(params: unknown, context: IToolContext): Promise<IToolResponse>;
    /**
     * Convert to MCP tool definition
     */
    toMcpTool(): McpTool;
    /**
     * Optional method to check if tool is available
     */
    isAvailable?(): boolean | Promise<boolean>;
    /**
     * Optional method to get tool metadata
     */
    getMetadata?(): IToolMetadata;
}
/**
 * Context provided to tools during execution
 */
export interface IToolContext {
    /**
     * n8n API client instance (if available)
     */
    apiClient?: any;
    /**
     * Real-time monitoring service instance (if available)
     */
    monitoringService?: any;
    /**
     * Request ID for tracing
     */
    requestId?: string;
    /**
     * User information if available
     */
    user?: {
        id: string;
        name?: string;
    };
    /**
     * Additional context data
     */
    metadata?: Record<string, unknown>;
}
/**
 * Standard tool response format
 */
export interface IToolResponse {
    content: Array<{
        type: 'text' | 'image' | 'resource';
        text?: string;
        data?: unknown;
        mimeType?: string;
    }>;
    isError?: boolean;
    metadata?: Record<string, unknown>;
}
/**
 * Tool metadata for discovery and documentation
 */
export interface IToolMetadata {
    /**
     * Tool category for organization
     */
    category: 'workflow' | 'execution' | 'credential' | 'system' | 'utility';
    /**
     * Required permissions or features
     */
    requirements?: string[];
    /**
     * Tags for search and filtering
     */
    tags?: string[];
    /**
     * Version of the tool
     */
    version?: string;
    /**
     * Whether this tool modifies data
     */
    isMutating?: boolean;
    /**
     * Rate limit information
     */
    rateLimit?: {
        requests: number;
        window: number;
    };
}
/**
 * Base abstract class for tools
 */
export declare abstract class BaseTool implements ITool {
    abstract readonly name: string;
    abstract readonly description: string;
    abstract readonly inputSchema: z.ZodSchema<any>;
    abstract execute(params: unknown, context: IToolContext): Promise<IToolResponse>;
    /**
     * Convert to MCP tool definition
     */
    toMcpTool(): McpTool;
    /**
     * Validate input parameters with enhanced error handling
     */
    protected validateInput<T>(params: unknown): T;
    /**
     * Create a standard text response
     */
    protected createTextResponse(text: string, metadata?: Record<string, unknown>): IToolResponse;
    /**
     * Create an error response with diagnostics
     */
    protected createErrorResponse(error: string | Error, metadata?: Record<string, unknown>): IToolResponse;
    /**
     * Execute with error handling and recovery
     */
    protected executeWithErrorHandling<T>(operation: () => Promise<T>, context: IErrorContext): Promise<T>;
    /**
     * Convert Zod schema to JSON Schema for MCP
     */
    private zodToJsonSchema;
}
//# sourceMappingURL=Tool.d.ts.map