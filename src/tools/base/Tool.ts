import { z } from 'zod';
import { Tool as McpTool } from '@modelcontextprotocol/sdk/types.js';
import { zodToJsonSchema } from '../../utils/zodToJsonSchema.js';
import { ErrorHandler, IErrorContext } from '../../utils/ErrorHandler.js';
import { ErrorDiagnostics } from '../../utils/ErrorDiagnostics.js';
import { N8nValidationError } from '../../utils/errors.js';

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
   * Real-time monitoring service instance (if available)
   */
  monitoringService?: any; // Will be RealtimeMonitoringService

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
  category: 'workflow' | 'execution' | 'credential' | 'system' | 'utility' | 'debug' | 'monitoring' | 'visualization' | 'version-control' | 'batch';

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
   * Validate input parameters with enhanced error handling
   */
  protected validateInput<T>(params: unknown): T {
    try {
      return this.inputSchema.parse(params) as T;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = new N8nValidationError(
          'Input validation failed',
          error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message,
            code: e.code
          }))
        );
        throw validationError;
      }
      throw error;
    }
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
   * Create an error response with diagnostics
   */
  protected createErrorResponse(error: string | Error, metadata?: Record<string, unknown>): IToolResponse {
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
  protected async executeWithErrorHandling<T>(
    operation: () => Promise<T>,
    context: IErrorContext
  ): Promise<T> {
    try {
      return await ErrorHandler.retry(operation, {
        ...context,
        tool: this.name
      });
    } catch (error) {
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
  private zodToJsonSchema(schema: z.ZodSchema<any>): any {
    return zodToJsonSchema(schema);
  }
}