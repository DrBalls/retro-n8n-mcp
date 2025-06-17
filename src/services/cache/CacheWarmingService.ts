import { CacheWarmingConfig, CachePrefetchConfig } from '../../types/cache.types.js';
import { MultiTierCacheManager } from './MultiTierCacheManager.js';
import { N8nApiClient } from '../N8nApiClient.js';
import { Logger } from '../../utils/Logger.js';

interface WarmingStrategy {
  name: string;
  pattern: string;
  source: 'database' | 'api' | 'precomputed';
  schedule?: string;
  priority: number;
  batchSize: number;
  enabled: boolean;
}

/**
 * Service for warming cache with frequently accessed data and prefetching related data
 */
export class CacheWarmingService {
  private readonly logger = new Logger('CacheWarmingService');
  private readonly cacheManager: MultiTierCacheManager;
  private readonly apiClient?: N8nApiClient;
  private readonly warmingConfig: CacheWarmingConfig;
  private readonly prefetchConfig: CachePrefetchConfig;
  
  private warmingTimers = new Map<string, NodeJS.Timeout>();
  private isRunning = false;
  
  // Statistics
  private stats = {
    totalWarmed: 0,
    totalPrefetched: 0,
    warmingExecutions: 0,
    prefetchExecutions: 0,
    errors: 0,
  };

  constructor(
    cacheManager: MultiTierCacheManager,
    warmingConfig: CacheWarmingConfig,
    prefetchConfig: CachePrefetchConfig,
    apiClient?: N8nApiClient
  ) {
    this.cacheManager = cacheManager;
    this.apiClient = apiClient;
    this.warmingConfig = warmingConfig;
    this.prefetchConfig = prefetchConfig;
  }

  /**
   * Start cache warming service
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;
    this.logger.info('Cache warming service started');

    if (this.warmingConfig.enabled) {
      // Schedule warming strategies
      for (const strategy of this.warmingConfig.strategies) {
        if (strategy.enabled) {
          await this.scheduleWarmingStrategy(strategy);
        }
      }

      // Perform initial warming
      await this.performInitialWarming();
    }
  }

  /**
   * Stop cache warming service
   */
  async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;

    // Clear all timers
    for (const [name, timer] of this.warmingTimers) {
      clearTimeout(timer);
      this.logger.debug('Stopped warming strategy', { name });
    }
    this.warmingTimers.clear();

    this.logger.info('Cache warming service stopped');
  }

  /**
   * Manually trigger warming for a specific strategy
   */
  async warmStrategy(strategyName: string): Promise<number> {
    const strategy = this.warmingConfig.strategies.find(s => s.name === strategyName);
    if (!strategy) {
      throw new Error(`Warming strategy '${strategyName}' not found`);
    }

    if (!strategy.enabled) {
      throw new Error(`Warming strategy '${strategyName}' is disabled`);
    }

    return await this.executeWarmingStrategy(strategy);
  }

  /**
   * Trigger prefetching based on a condition
   */
  async triggerPrefetch(conditionContext: Record<string, any>): Promise<number> {
    if (!this.prefetchConfig.enabled) {
      return 0;
    }

    let totalPrefetched = 0;

    for (const trigger of this.prefetchConfig.triggers) {
      if (!trigger.enabled) {
        continue;
      }

      try {
        // Evaluate trigger condition
        const shouldPrefetch = this.evaluateCondition(trigger.condition, conditionContext);
        if (!shouldPrefetch) {
          continue;
        }

        // Execute prefetch
        const prefetched = await this.executePrefetch(trigger.prefetchKeys, conditionContext);
        totalPrefetched += prefetched;

        this.logger.debug('Prefetch triggered', {
          triggerName: trigger.name,
          prefetched,
          context: conditionContext,
        });

      } catch (error) {
        this.stats.errors++;
        this.logger.error('Error in prefetch trigger', {
          triggerName: trigger.name,
          error,
        });
      }
    }

    if (totalPrefetched > 0) {
      this.stats.totalPrefetched += totalPrefetched;
      this.stats.prefetchExecutions++;
    }

    return totalPrefetched;
  }

  /**
   * Get warming and prefetching statistics
   */
  getStats() {
    return { ...this.stats };
  }

  // Private methods

  private async scheduleWarmingStrategy(strategy: WarmingStrategy): Promise<void> {
    if (strategy.schedule) {
      // Parse cron schedule (simplified implementation)
      const intervalMs = this.parseCronToInterval(strategy.schedule);
      if (intervalMs > 0) {
        const timer = setInterval(async () => {
          try {
            await this.executeWarmingStrategy(strategy);
          } catch (error) {
            this.logger.error('Scheduled warming strategy failed', {
              strategy: strategy.name,
              error,
            });
          }
        }, intervalMs);

        this.warmingTimers.set(strategy.name, timer);
        this.logger.info('Scheduled warming strategy', {
          name: strategy.name,
          schedule: strategy.schedule,
          intervalMs,
        });
      }
    }
  }

  private async performInitialWarming(): Promise<void> {
    this.logger.info('Performing initial cache warming');

    // Sort strategies by priority (higher first)
    const sortedStrategies = [...this.warmingConfig.strategies]
      .filter(s => s.enabled)
      .sort((a, b) => b.priority - a.priority);

    for (const strategy of sortedStrategies) {
      try {
        const warmed = await this.executeWarmingStrategy(strategy);
        this.logger.info('Initial warming completed', {
          strategy: strategy.name,
          warmed,
        });
      } catch (error) {
        this.logger.error('Initial warming failed', {
          strategy: strategy.name,
          error,
        });
      }
    }
  }

  private async executeWarmingStrategy(strategy: WarmingStrategy): Promise<number> {
    const keyBuilder = this.cacheManager.getKeyBuilder();
    let warmed = 0;

    this.logger.debug('Executing warming strategy', { strategy: strategy.name });

    try {
      switch (strategy.source) {
        case 'api':
          warmed = await this.warmFromApi(strategy, keyBuilder);
          break;
        case 'database':
          warmed = await this.warmFromDatabase(strategy, keyBuilder);
          break;
        case 'precomputed':
          warmed = await this.warmFromPrecomputed(strategy, keyBuilder);
          break;
      }

      this.stats.totalWarmed += warmed;
      this.stats.warmingExecutions++;

      this.logger.debug('Warming strategy completed', {
        strategy: strategy.name,
        warmed,
      });

    } catch (error) {
      this.stats.errors++;
      this.logger.error('Warming strategy failed', {
        strategy: strategy.name,
        error,
      });
      throw error;
    }

    return warmed;
  }

  private async warmFromApi(strategy: WarmingStrategy, keyBuilder: any): Promise<number> {
    if (!this.apiClient) {
      throw new Error('API client not available for warming');
    }

    let warmed = 0;

    // Pattern-based warming strategies
    if (strategy.pattern.includes('workflow')) {
      // Warm workflow data
      const workflows = await this.apiClient.getWorkflows() as any[];
      
      for (let i = 0; i < Math.min(workflows.length, strategy.batchSize); i++) {
        const workflow = workflows[i];
        const key = keyBuilder.workflow(workflow.id);
        
        await this.cacheManager.set(key, workflow, {
          tags: ['workflow', `workflow:${workflow.id}`],
        });
        warmed++;
      }
    }

    if (strategy.pattern.includes('execution')) {
      // Warm recent execution data
      const executions = await this.apiClient.getExecutions({ limit: strategy.batchSize }) as any[];
      
      for (const execution of executions) {
        const key = keyBuilder.execution(execution.id);
        
        await this.cacheManager.set(key, execution, {
          tags: ['execution', `execution:${execution.id}`, `workflow:${execution.workflowId}`],
        });
        warmed++;
      }
    }

    return warmed;
  }

  private async warmFromDatabase(strategy: WarmingStrategy, keyBuilder: any): Promise<number> {
    // For now, this is a placeholder since we don't have a database implementation
    // In a real implementation, this would query the database for frequently accessed data
    this.logger.debug('Database warming not implemented yet', { strategy: strategy.name });
    return 0;
  }

  private async warmFromPrecomputed(strategy: WarmingStrategy, keyBuilder: any): Promise<number> {
    let warmed = 0;

    // Warm commonly used computed values
    if (strategy.pattern.includes('health')) {
      // Warm server health data
      const healthKey = keyBuilder.serverHealth();
      const healthData = {
        status: 'healthy',
        timestamp: Date.now(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
      };
      
      await this.cacheManager.set(healthKey, healthData, {
        ttl: 30000, // 30 seconds
        tags: ['health'],
      });
      warmed++;
    }

    if (strategy.pattern.includes('connection')) {
      // Warm connection status
      const connectionKey = keyBuilder.connectionStatus();
      const connectionData = {
        status: this.apiClient ? 'connected' : 'disconnected',
        timestamp: Date.now(),
      };
      
      await this.cacheManager.set(connectionKey, connectionData, {
        ttl: 60000, // 1 minute
        tags: ['connection'],
      });
      warmed++;
    }

    return warmed;
  }

  private async executePrefetch(prefetchKeys: string[], context: Record<string, any>): Promise<number> {
    let prefetched = 0;
    const keyBuilder = this.cacheManager.getKeyBuilder();

    for (const keyPattern of prefetchKeys) {
      try {
        // Resolve key pattern with context variables
        const resolvedKey = this.resolveKeyPattern(keyPattern, context);
        
        // Check if already cached
        const cached = await this.cacheManager.get(resolvedKey);
        if (cached.hit) {
          continue; // Already cached
        }

        // Prefetch based on key type
        if (await this.prefetchByKeyType(resolvedKey, keyBuilder)) {
          prefetched++;
        }

      } catch (error) {
        this.logger.debug('Prefetch failed for key pattern', {
          pattern: keyPattern,
          error,
        });
      }
    }

    return prefetched;
  }

  private async prefetchByKeyType(key: string, keyBuilder: any): Promise<boolean> {
    if (!this.apiClient) {
      return false;
    }

    const parsed = keyBuilder.parseKey(key);

    try {
      switch (parsed.namespace) {
        case 'workflow':
          if (parsed.id) {
            const workflow = await this.apiClient.getWorkflow(parsed.id);
            await this.cacheManager.set(key, workflow, {
              tags: ['workflow', `workflow:${parsed.id}`],
            });
            return true;
          }
          break;

        case 'execution':
          if (parsed.id) {
            const execution = await this.apiClient.getExecution(parsed.id);
            await this.cacheManager.set(key, execution, {
              tags: ['execution', `execution:${parsed.id}`],
            });
            return true;
          }
          break;

        case 'executions':
          // Prefetch execution list
          const executions = await this.apiClient.getExecutions({ limit: 20 });
          await this.cacheManager.set(key, executions, {
            tags: ['executions'],
          });
          return true;

        case 'workflows':
          // Prefetch workflow list
          const workflows = await this.apiClient.getWorkflows();
          await this.cacheManager.set(key, workflows, {
            tags: ['workflows'],
          });
          return true;
      }
    } catch (error) {
      this.logger.debug('Prefetch failed for key', { key, error });
    }

    return false;
  }

  private evaluateCondition(condition: string, context: Record<string, any>): boolean {
    try {
      // Simple condition evaluation (in production, use a proper expression parser)
      // For security, this should be replaced with a sandboxed expression evaluator
      
      // Replace context variables
      let evaluableCondition = condition;
      for (const [key, value] of Object.entries(context)) {
        const regex = new RegExp(`\\b${key}\\b`, 'g');
        evaluableCondition = evaluableCondition.replace(regex, JSON.stringify(value));
      }

      // Basic safety check
      if (evaluableCondition.includes('function') || evaluableCondition.includes('eval')) {
        throw new Error('Unsafe condition');
      }

      return Function(`"use strict"; return (${evaluableCondition})`)();
    } catch (error) {
      this.logger.warn('Failed to evaluate prefetch condition', { condition, error });
      return false;
    }
  }

  private resolveKeyPattern(pattern: string, context: Record<string, any>): string {
    let resolved = pattern;
    
    // Replace context variables in the pattern
    for (const [key, value] of Object.entries(context)) {
      const regex = new RegExp(`\\{${key}\\}`, 'g');
      resolved = resolved.replace(regex, String(value));
    }

    return resolved;
  }

  private parseCronToInterval(cron: string): number {
    // Simplified cron parser - in production, use a proper cron library
    // Supports basic formats like "*/5 * * * *" (every 5 minutes)
    
    const parts = cron.split(' ');
    if (parts.length !== 5) {
      return 0; // Invalid format
    }

    const [minute] = parts;
    
    // Handle "*/N" format
    if (minute.startsWith('*/')) {
      const interval = parseInt(minute.substring(2), 10);
      if (!isNaN(interval) && interval > 0) {
        return interval * 60 * 1000; // Convert to milliseconds
      }
    }

    // Handle fixed intervals
    if (minute === '0') {
      return 60 * 60 * 1000; // Every hour
    }

    return 0; // Unsupported format
  }
}