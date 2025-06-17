import { ICacheKeyBuilder } from '../../types/cache.types.js';
/**
 * Utility class for building consistent cache keys across the application
 */
export declare class CacheKeyBuilder implements ICacheKeyBuilder {
    private readonly prefix;
    constructor(prefix?: string);
    /**
     * Build cache key for workflow data
     */
    workflow(id: string): string;
    /**
     * Build cache key for execution data
     */
    execution(id: string): string;
    /**
     * Build cache key for credential data
     */
    credential(id: string): string;
    /**
     * Build cache key for node definition data
     */
    node(type: string, version: number): string;
    /**
     * Build cache key for user data
     */
    user(id: string): string;
    /**
     * Build cache key for metrics data
     */
    metrics(type: string, timeframe: string): string;
    /**
     * Build custom cache key with namespace
     */
    custom(namespace: string, key: string): string;
    /**
     * Build cache key for workflow list with filters
     */
    workflowList(filters?: {
        active?: boolean;
        tags?: string[];
        limit?: number;
        offset?: number;
    }): string;
    /**
     * Build cache key for execution list with filters
     */
    executionList(workflowId?: string, filters?: {
        status?: string;
        limit?: number;
        offset?: number;
    }): string;
    /**
     * Build cache key for credential list
     */
    credentialList(type?: string): string;
    /**
     * Build cache key for workflow execution statistics
     */
    workflowStats(workflowId: string, timeframe?: string): string;
    /**
     * Build cache key for server health data
     */
    serverHealth(): string;
    /**
     * Build cache key for API connection status
     */
    connectionStatus(): string;
    /**
     * Build cache key for version control data
     */
    version(workflowId: string, versionId: string): string;
    /**
     * Build cache key for branch data
     */
    branch(workflowId: string, branchName: string): string;
    /**
     * Build cache key for version history
     */
    versionHistory(workflowId: string, branchName?: string): string;
    /**
     * Build cache key for monitoring data
     */
    monitoring(type: string, id?: string): string;
    /**
     * Build cache key for debug session data
     */
    debugSession(sessionId: string): string;
    /**
     * Build cache key for batch operation status
     */
    batchOperation(operationId: string): string;
    /**
     * Extract components from a cache key
     */
    parseKey(key: string): {
        prefix: string;
        namespace?: string;
        id?: string;
        components: string[];
    };
    /**
     * Check if a key matches a pattern
     */
    matchesPattern(key: string, pattern: string): boolean;
    /**
     * Generate invalidation tags for a key
     */
    generateTags(key: string): string[];
    /**
     * Get all possible invalidation patterns for a workflow
     */
    getWorkflowInvalidationPatterns(workflowId: string): string[];
    /**
     * Get all possible invalidation patterns for an execution
     */
    getExecutionInvalidationPatterns(executionId: string, workflowId?: string): string[];
    /**
     * Get all possible invalidation patterns for a credential
     */
    getCredentialInvalidationPatterns(credentialId: string, type?: string): string[];
}
//# sourceMappingURL=CacheKeyBuilder.d.ts.map