import { ICacheKeyBuilder } from '../../types/cache.types.js';

/**
 * Utility class for building consistent cache keys across the application
 */
export class CacheKeyBuilder implements ICacheKeyBuilder {
  private readonly prefix: string;

  constructor(prefix: string = 'n8n-mcp') {
    this.prefix = prefix;
  }

  /**
   * Build cache key for workflow data
   */
  workflow(id: string): string {
    return `${this.prefix}:workflow:${id}`;
  }

  /**
   * Build cache key for execution data
   */
  execution(id: string): string {
    return `${this.prefix}:execution:${id}`;
  }

  /**
   * Build cache key for credential data
   */
  credential(id: string): string {
    return `${this.prefix}:credential:${id}`;
  }

  /**
   * Build cache key for node definition data
   */
  node(type: string, version: number): string {
    return `${this.prefix}:node:${type}:v${version}`;
  }

  /**
   * Build cache key for user data
   */
  user(id: string): string {
    return `${this.prefix}:user:${id}`;
  }

  /**
   * Build cache key for metrics data
   */
  metrics(type: string, timeframe: string): string {
    return `${this.prefix}:metrics:${type}:${timeframe}`;
  }

  /**
   * Build custom cache key with namespace
   */
  custom(namespace: string, key: string): string {
    return `${this.prefix}:${namespace}:${key}`;
  }

  /**
   * Build cache key for workflow list with filters
   */
  workflowList(filters?: { active?: boolean; tags?: string[]; limit?: number; offset?: number }): string {
    if (!filters) {
      return `${this.prefix}:workflows:all`;
    }

    const parts = ['workflows'];
    if (filters.active !== undefined) {
      parts.push(`active:${filters.active}`);
    }
    if (filters.tags && filters.tags.length > 0) {
      parts.push(`tags:${filters.tags.sort().join(',')}`);
    }
    if (filters.limit !== undefined) {
      parts.push(`limit:${filters.limit}`);
    }
    if (filters.offset !== undefined) {
      parts.push(`offset:${filters.offset}`);
    }

    return `${this.prefix}:${parts.join(':')}`;
  }

  /**
   * Build cache key for execution list with filters
   */
  executionList(workflowId?: string, filters?: { status?: string; limit?: number; offset?: number }): string {
    const parts = ['executions'];
    
    if (workflowId) {
      parts.push(`workflow:${workflowId}`);
    } else {
      parts.push('all');
    }

    if (filters?.status) {
      parts.push(`status:${filters.status}`);
    }
    if (filters?.limit !== undefined) {
      parts.push(`limit:${filters.limit}`);
    }
    if (filters?.offset !== undefined) {
      parts.push(`offset:${filters.offset}`);
    }

    return `${this.prefix}:${parts.join(':')}`;
  }

  /**
   * Build cache key for credential list
   */
  credentialList(type?: string): string {
    if (type) {
      return `${this.prefix}:credentials:type:${type}`;
    }
    return `${this.prefix}:credentials:all`;
  }

  /**
   * Build cache key for workflow execution statistics
   */
  workflowStats(workflowId: string, timeframe: string = '24h'): string {
    return `${this.prefix}:stats:workflow:${workflowId}:${timeframe}`;
  }

  /**
   * Build cache key for server health data
   */
  serverHealth(): string {
    return `${this.prefix}:health:server`;
  }

  /**
   * Build cache key for API connection status
   */
  connectionStatus(): string {
    return `${this.prefix}:connection:status`;
  }

  /**
   * Build cache key for version control data
   */
  version(workflowId: string, versionId: string): string {
    return `${this.prefix}:version:${workflowId}:${versionId}`;
  }

  /**
   * Build cache key for branch data
   */
  branch(workflowId: string, branchName: string): string {
    return `${this.prefix}:branch:${workflowId}:${branchName}`;
  }

  /**
   * Build cache key for version history
   */
  versionHistory(workflowId: string, branchName?: string): string {
    if (branchName) {
      return `${this.prefix}:versions:${workflowId}:${branchName}`;
    }
    return `${this.prefix}:versions:${workflowId}:all`;
  }

  /**
   * Build cache key for monitoring data
   */
  monitoring(type: string, id?: string): string {
    if (id) {
      return `${this.prefix}:monitoring:${type}:${id}`;
    }
    return `${this.prefix}:monitoring:${type}`;
  }

  /**
   * Build cache key for debug session data
   */
  debugSession(sessionId: string): string {
    return `${this.prefix}:debug:session:${sessionId}`;
  }

  /**
   * Build cache key for batch operation status
   */
  batchOperation(operationId: string): string {
    return `${this.prefix}:batch:${operationId}`;
  }

  /**
   * Extract components from a cache key
   */
  parseKey(key: string): { prefix: string; namespace?: string; id?: string; components: string[] } {
    const parts = key.split(':');
    const prefix = parts[0];
    const namespace = parts.length > 1 ? parts[1] : undefined;
    const id = parts.length > 2 ? parts[2] : undefined;
    
    return {
      prefix,
      namespace,
      id,
      components: parts.slice(1),
    };
  }

  /**
   * Check if a key matches a pattern
   */
  matchesPattern(key: string, pattern: string): boolean {
    // Convert glob pattern to regex
    const regexPattern = pattern
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.')
      .replace(/\[([^\]]+)\]/g, '[$1]');
    
    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(key);
  }

  /**
   * Generate invalidation tags for a key
   */
  generateTags(key: string): string[] {
    const parsed = this.parseKey(key);
    const tags: string[] = [];

    // Add namespace tag
    if (parsed.namespace) {
      tags.push(`namespace:${parsed.namespace}`);
    }

    // Add specific tags based on namespace
    switch (parsed.namespace) {
      case 'workflow':
        if (parsed.id) {
          tags.push(`workflow:${parsed.id}`);
        }
        break;
      case 'execution':
        if (parsed.id) {
          tags.push(`execution:${parsed.id}`);
          // Try to extract workflow ID from execution cache patterns
          if (parsed.components.length > 2 && parsed.components[1] === 'workflow') {
            tags.push(`workflow:${parsed.components[2]}`);
          }
        }
        break;
      case 'credential':
        if (parsed.id) {
          tags.push(`credential:${parsed.id}`);
        }
        break;
      case 'version':
        if (parsed.components.length >= 2) {
          tags.push(`workflow:${parsed.components[1]}`);
          tags.push('version-control');
        }
        break;
      case 'branch':
        if (parsed.components.length >= 2) {
          tags.push(`workflow:${parsed.components[1]}`);
          tags.push('version-control');
        }
        break;
    }

    return tags;
  }

  /**
   * Get all possible invalidation patterns for a workflow
   */
  getWorkflowInvalidationPatterns(workflowId: string): string[] {
    return [
      this.workflow(workflowId),
      `${this.prefix}:executions:workflow:${workflowId}:*`,
      `${this.prefix}:stats:workflow:${workflowId}:*`,
      `${this.prefix}:version:${workflowId}:*`,
      `${this.prefix}:branch:${workflowId}:*`,
      `${this.prefix}:versions:${workflowId}:*`,
      `${this.prefix}:workflows:*`, // Invalidate workflow lists
    ];
  }

  /**
   * Get all possible invalidation patterns for an execution
   */
  getExecutionInvalidationPatterns(executionId: string, workflowId?: string): string[] {
    const patterns = [
      this.execution(executionId),
      `${this.prefix}:executions:*`, // Invalidate execution lists
    ];

    if (workflowId) {
      patterns.push(
        `${this.prefix}:executions:workflow:${workflowId}:*`,
        `${this.prefix}:stats:workflow:${workflowId}:*`
      );
    }

    return patterns;
  }

  /**
   * Get all possible invalidation patterns for a credential
   */
  getCredentialInvalidationPatterns(credentialId: string, type?: string): string[] {
    const patterns = [
      this.credential(credentialId),
      `${this.prefix}:credentials:*`, // Invalidate credential lists
    ];

    if (type) {
      patterns.push(`${this.prefix}:credentials:type:${type}`);
    }

    return patterns;
  }
}