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
export class ToolRegistry extends EventEmitter {
  private tools: Map<string, ITool> = new Map();
  private toolMetadata: Map<string, IToolRegistrationOptions> = new Map();
  private toolStats: Map<string, IToolStats> = new Map();
  private dependencies: Map<string, Set<string>> = new Map();
  private context: IToolContext;

  constructor(context: IToolContext = {}) {
    super();
    this.context = context;
  }

  /**
   * Register a tool
   */
  register(tool: ITool, options: IToolRegistrationOptions = {}): void {
    const { override = false, dependencies = [] } = options;

    // Check if tool already exists
    if (this.tools.has(tool.name) && !override) {
      throw new Error(`Tool '${tool.name}' is already registered`);
    }

    // Validate dependencies
    for (const dep of dependencies) {
      if (!this.tools.has(dep)) {
        throw new Error(`Dependency '${dep}' for tool '${tool.name}' is not registered`);
      }
    }

    // Check if tool is available
    if (tool.isAvailable && !tool.isAvailable()) {
      throw new Error(`Tool '${tool.name}' is not available`);
    }

    // Register the tool
    this.tools.set(tool.name, tool);
    this.toolMetadata.set(tool.name, options);
    
    // Initialize stats
    this.toolStats.set(tool.name, {
      executions: 0,
      errors: 0,
      totalDuration: 0,
      averageDuration: 0,
    });

    // Update dependencies
    if (dependencies.length > 0) {
      this.dependencies.set(tool.name, new Set(dependencies));
    }

    // Emit registration event
    this.emit('tool:registered', tool);
  }

  /**
   * Register multiple tools at once
   */
  registerMany(tools: Array<{ tool: ITool; options?: IToolRegistrationOptions }>): void {
    // Sort by priority to handle dependencies
    const sorted = tools.sort((a, b) => {
      const priorityA = a.options?.priority || 0;
      const priorityB = b.options?.priority || 0;
      return priorityB - priorityA;
    });

    for (const { tool, options } of sorted) {
      this.register(tool, options);
    }
  }

  /**
   * Unregister a tool
   */
  unregister(toolName: string): boolean {
    const tool = this.tools.get(toolName);
    if (!tool) {
      return false;
    }

    // Check if other tools depend on this one
    const dependents = this.getDependents(toolName);
    if (dependents.length > 0) {
      throw new Error(
        `Cannot unregister '${toolName}': tools depend on it: ${dependents.join(', ')}`
      );
    }

    // Remove the tool
    this.tools.delete(toolName);
    this.toolMetadata.delete(toolName);
    this.toolStats.delete(toolName);
    this.dependencies.delete(toolName);

    // Emit unregistration event
    this.emit('tool:unregistered', toolName);
    return true;
  }

  /**
   * Get a tool by name
   */
  get(toolName: string): ITool | undefined {
    return this.tools.get(toolName);
  }

  /**
   * Check if a tool exists
   */
  has(toolName: string): boolean {
    return this.tools.has(toolName);
  }

  /**
   * Get all registered tools
   */
  getAll(): ITool[] {
    return Array.from(this.tools.values());
  }

  /**
   * Get all tool names
   */
  getNames(): string[] {
    return Array.from(this.tools.keys());
  }

  /**
   * Get tools by category
   */
  getByCategory(category: string): ITool[] {
    return this.getAll().filter(tool => {
      const metadata = tool.getMetadata?.();
      return metadata?.category === category;
    });
  }

  /**
   * Get tools by tag
   */
  getByTag(tag: string): ITool[] {
    return this.getAll().filter(tool => {
      const metadata = tool.getMetadata?.();
      return metadata?.tags?.includes(tag) || false;
    });
  }

  /**
   * Search tools by name or description
   */
  search(query: string): ITool[] {
    const lowerQuery = query.toLowerCase();
    return this.getAll().filter(tool => {
      return (
        tool.name.toLowerCase().includes(lowerQuery) ||
        tool.description.toLowerCase().includes(lowerQuery)
      );
    });
  }

  /**
   * Execute a tool
   */
  async execute(toolName: string, params: unknown, context?: Partial<IToolContext>): Promise<any> {
    const tool = this.tools.get(toolName);
    if (!tool) {
      throw new Error(`Tool '${toolName}' not found`);
    }

    // Check if tool is available
    if (tool.isAvailable) {
      const available = await tool.isAvailable();
      if (!available) {
        throw new Error(`Tool '${toolName}' is not available`);
      }
    }

    // Merge contexts
    const executionContext: IToolContext = {
      ...this.context,
      ...context,
      requestId: context?.requestId || this.generateRequestId(),
    };

    // Track execution
    const startTime = Date.now();
    const stats = this.toolStats.get(toolName)!;

    try {
      // Execute the tool
      const result = await tool.execute(params, executionContext);
      
      // Update stats
      const duration = Date.now() - startTime;
      stats.executions++;
      stats.totalDuration += duration;
      stats.averageDuration = stats.totalDuration / stats.executions;
      stats.lastExecuted = new Date();

      // Emit execution event
      this.emit('tool:executed', toolName, duration);

      return result;
    } catch (error) {
      // Update error stats
      stats.errors++;
      stats.lastError = new Date();

      // Emit error event
      this.emit('tool:error', toolName, error as Error);

      throw error;
    }
  }

  /**
   * Get tool statistics
   */
  getStats(toolName: string): IToolStats | undefined {
    return this.toolStats.get(toolName);
  }

  /**
   * Get all tool statistics
   */
  getAllStats(): Map<string, IToolStats> {
    return new Map(this.toolStats);
  }

  /**
   * Convert all tools to MCP format
   */
  toMcpTools(): McpTool[] {
    return this.getAll()
      .filter(tool => !tool.isAvailable || tool.isAvailable())
      .map(tool => tool.toMcpTool());
  }

  /**
   * Get tools that depend on a given tool
   */
  private getDependents(toolName: string): string[] {
    const dependents: string[] = [];
    
    for (const [name, deps] of this.dependencies) {
      if (deps.has(toolName)) {
        dependents.push(name);
      }
    }

    return dependents;
  }

  /**
   * Generate a unique request ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Update the global context
   */
  updateContext(context: Partial<IToolContext>): void {
    this.context = { ...this.context, ...context };
  }

  /**
   * Get the current context
   */
  getContext(): IToolContext {
    return { ...this.context };
  }

  /**
   * Clear all tools
   */
  clear(): void {
    this.tools.clear();
    this.toolMetadata.clear();
    this.toolStats.clear();
    this.dependencies.clear();
    this.removeAllListeners();
  }
}