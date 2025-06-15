import { z } from 'zod';
import { Tool as McpTool } from '@modelcontextprotocol/sdk/types.js';
import { zodToJsonSchema } from '../../utils/zodToJsonSchema.js';

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
  apiClient?: any; // Will be N8nApiClient

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
    window: number; // in seconds
  };
}

/**
 * Base abstract class for tools
 */
export abstract class BaseTool implements ITool {
  abstract readonly name: string;
  abstract readonly description: string;
  abstract readonly inputSchema: z.ZodSchema<any>;

  abstract execute(params: unknown, context: IToolContext): Promise<IToolResponse>;

  /**
   * Convert to MCP tool definition
   */
  toMcpTool(): McpTool {
    return {
      name: this.name,
      description: this.description,
      inputSchema: this.zodToJsonSchema(this.inputSchema),
    };
  }

  /**
   * Validate input parameters
   */
  protected validateInput<T>(params: unknown): T {
    return this.inputSchema.parse(params) as T;
  }

  /**
   * Create a standard text response
   */
  protected createTextResponse(text: string, metadata?: Record<string, unknown>): IToolResponse {
    return {
      content: [{ type: 'text', text }],
      ...(metadata && { metadata }),
    };
  }

  /**
   * Create an error response
   */
  protected createErrorResponse(error: string | Error, metadata?: Record<string, unknown>): IToolResponse {
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
  private zodToJsonSchema(schema: z.ZodSchema<any>): any {
    return zodToJsonSchema(schema);
  }
}