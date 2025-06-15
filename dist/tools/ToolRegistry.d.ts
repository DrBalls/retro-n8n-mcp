import { EventEmitter } from 'events';
import { ITool, IToolContext } from './base/Tool.js';
import { Tool as McpTool } from '@modelcontextprotocol/sdk/types.js';
/**
 * Tool registration options
 */
export interface IToolRegistrationOptions {
    /**
     * Whether to override existing tool with same name
     */
    override?: boolean;
    /**
     * Dependencies required by this tool
     */
    dependencies?: string[];
    /**
     * Priority for tool discovery (higher = more important)
     */
    priority?: number;
}
/**
 * Tool registry events
 */
export interface IToolRegistryEvents {
    'tool:registered': (tool: ITool) => void;
    'tool:unregistered': (toolName: string) => void;
    'tool:executed': (toolName: string, duration: number) => void;
    'tool:error': (toolName: string, error: Error) => void;
}
/**
 * Tool execution statistics
 */
interface IToolStats {
    executions: number;
    errors: number;
    totalDuration: number;
    averageDuration: number;
    lastExecuted?: Date;
    lastError?: Date;
}
/**
 * Registry for managing MCP tools
 */
export declare class ToolRegistry extends EventEmitter {
    private tools;
    private toolMetadata;
    private toolStats;
    private dependencies;
    private context;
    constructor(context?: IToolContext);
    /**
     * Register a tool
     */
    register(tool: ITool, options?: IToolRegistrationOptions): void;
    /**
     * Register multiple tools at once
     */
    registerMany(tools: Array<{
        tool: ITool;
        options?: IToolRegistrationOptions;
    }>): void;
    /**
     * Unregister a tool
     */
    unregister(toolName: string): boolean;
    /**
     * Get a tool by name
     */
    get(toolName: string): ITool | undefined;
    /**
     * Check if a tool exists
     */
    has(toolName: string): boolean;
    /**
     * Get all registered tools
     */
    getAll(): ITool[];
    /**
     * Get all tool names
     */
    getNames(): string[];
    /**
     * Get tools by category
     */
    getByCategory(category: string): ITool[];
    /**
     * Get tools by tag
     */
    getByTag(tag: string): ITool[];
    /**
     * Search tools by name or description
     */
    search(query: string): ITool[];
    /**
     * Execute a tool
     */
    execute(toolName: string, params: unknown, context?: Partial<IToolContext>): Promise<any>;
    /**
     * Get tool statistics
     */
    getStats(toolName: string): IToolStats | undefined;
    /**
     * Get all tool statistics
     */
    getAllStats(): Map<string, IToolStats>;
    /**
     * Convert all tools to MCP format
     */
    toMcpTools(): McpTool[];
    /**
     * Get tools that depend on a given tool
     */
    private getDependents;
    /**
     * Generate a unique request ID
     */
    private generateRequestId;
    /**
     * Update the global context
     */
    updateContext(context: Partial<IToolContext>): void;
    /**
     * Get the current context
     */
    getContext(): IToolContext;
    /**
     * Clear all tools
     */
    clear(): void;
}
export {};
//# sourceMappingURL=ToolRegistry.d.ts.map