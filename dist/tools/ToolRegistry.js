import { EventEmitter } from 'events';
/**
 * Registry for managing MCP tools
 */
export class ToolRegistry extends EventEmitter {
    tools = new Map();
    toolMetadata = new Map();
    toolStats = new Map();
    dependencies = new Map();
    context;
    constructor(context = {}) {
        super();
        this.context = context;
    }
    /**
     * Register a tool
     */
    register(tool, options = {}) {
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
    registerMany(tools) {
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
    unregister(toolName) {
        const tool = this.tools.get(toolName);
        if (!tool) {
            return false;
        }
        // Check if other tools depend on this one
        const dependents = this.getDependents(toolName);
        if (dependents.length > 0) {
            throw new Error(`Cannot unregister '${toolName}': tools depend on it: ${dependents.join(', ')}`);
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
    get(toolName) {
        return this.tools.get(toolName);
    }
    /**
     * Check if a tool exists
     */
    has(toolName) {
        return this.tools.has(toolName);
    }
    /**
     * Get all registered tools
     */
    getAll() {
        return Array.from(this.tools.values());
    }
    /**
     * Get all tool names
     */
    getNames() {
        return Array.from(this.tools.keys());
    }
    /**
     * Get tools by category
     */
    getByCategory(category) {
        return this.getAll().filter(tool => {
            const metadata = tool.getMetadata?.();
            return metadata?.category === category;
        });
    }
    /**
     * Get tools by tag
     */
    getByTag(tag) {
        return this.getAll().filter(tool => {
            const metadata = tool.getMetadata?.();
            return metadata?.tags?.includes(tag) || false;
        });
    }
    /**
     * Search tools by name or description
     */
    search(query) {
        const lowerQuery = query.toLowerCase();
        return this.getAll().filter(tool => {
            return (tool.name.toLowerCase().includes(lowerQuery) ||
                tool.description.toLowerCase().includes(lowerQuery));
        });
    }
    /**
     * Execute a tool
     */
    async execute(toolName, params, context) {
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
        const executionContext = {
            ...this.context,
            ...context,
            requestId: context?.requestId || this.generateRequestId(),
        };
        // Track execution
        const startTime = Date.now();
        const stats = this.toolStats.get(toolName);
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
        }
        catch (error) {
            // Update error stats
            stats.errors++;
            stats.lastError = new Date();
            // Emit error event
            this.emit('tool:error', toolName, error);
            throw error;
        }
    }
    /**
     * Get tool statistics
     */
    getStats(toolName) {
        return this.toolStats.get(toolName);
    }
    /**
     * Get all tool statistics
     */
    getAllStats() {
        return new Map(this.toolStats);
    }
    /**
     * Convert all tools to MCP format
     */
    toMcpTools() {
        return this.getAll()
            .filter(tool => !tool.isAvailable || tool.isAvailable())
            .map(tool => tool.toMcpTool());
    }
    /**
     * Get tools that depend on a given tool
     */
    getDependents(toolName) {
        const dependents = [];
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
    generateRequestId() {
        return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    /**
     * Update the global context
     */
    updateContext(context) {
        this.context = { ...this.context, ...context };
    }
    /**
     * Get the current context
     */
    getContext() {
        return { ...this.context };
    }
    /**
     * Clear all tools
     */
    clear() {
        this.tools.clear();
        this.toolMetadata.clear();
        this.toolStats.clear();
        this.dependencies.clear();
        this.removeAllListeners();
    }
}
//# sourceMappingURL=ToolRegistry.js.map