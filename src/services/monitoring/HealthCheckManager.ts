/**
 * Health check manager implementation
 */

import {
  IHealthCheck,
  IHealthCheckManager,
  IHealthCheckResult,
  HealthStatus
} from '../../types/monitoring.js';

/**
 * Default health check implementations
 */
export class HealthCheck implements IHealthCheck {
  constructor(
    public readonly name: string,
    public readonly description: string | undefined,
    public readonly timeout: number | undefined,
    private readonly checkFn: () => Promise<Omit<IHealthCheckResult, 'name' | 'duration' | 'timestamp'>>
  ) {}

  async check(): Promise<IHealthCheckResult> {
    const startTime = Date.now();
    
    try {
      const timeoutMs = this.timeout || 5000;
      const result = await Promise.race([
        this.checkFn(),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Health check timeout')), timeoutMs)
        )
      ]);

      const duration = Date.now() - startTime;
      
      return {
        name: this.name,
        ...result,
        duration,
        timestamp: new Date()
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      
      return {
        name: this.name,
        status: HealthStatus.UNHEALTHY,
        message: error instanceof Error ? error.message : 'Unknown error',
        duration,
        timestamp: new Date()
      };
    }
  }
}

/**
 * Health check manager implementation
 */
export class HealthCheckManager implements IHealthCheckManager {
  private checks: Map<string, IHealthCheck> = new Map();
  private lastResults: Map<string, IHealthCheckResult> = new Map();
  
  register(check: IHealthCheck): void {
    if (this.checks.has(check.name)) {
      throw new Error(`Health check ${check.name} already registered`);
    }
    
    this.checks.set(check.name, check);
  }

  unregister(name: string): void {
    this.checks.delete(name);
    this.lastResults.delete(name);
  }

  async runCheck(name: string): Promise<IHealthCheckResult> {
    const check = this.checks.get(name);
    if (!check) {
      throw new Error(`Health check ${name} not found`);
    }

    const result = await check.check();
    this.lastResults.set(name, result);
    return result;
  }

  async runAllChecks(): Promise<IHealthCheckResult[]> {
    const results = await Promise.all(
      Array.from(this.checks.values()).map(check => 
        check.check().catch(error => ({
          name: check.name,
          status: HealthStatus.UNHEALTHY,
          message: error instanceof Error ? error.message : 'Check failed',
          duration: 0,
          timestamp: new Date()
        }))
      )
    );

    // Update last results
    results.forEach(result => {
      this.lastResults.set(result.name, result);
    });

    return results;
  }

  async getOverallHealth(): Promise<HealthStatus> {
    const results = await this.runAllChecks();
    
    if (results.length === 0) {
      return HealthStatus.HEALTHY;
    }

    const hasUnhealthy = results.some(r => r.status === HealthStatus.UNHEALTHY);
    const hasDegraded = results.some(r => r.status === HealthStatus.DEGRADED);

    if (hasUnhealthy) {
      return HealthStatus.UNHEALTHY;
    } else if (hasDegraded) {
      return HealthStatus.DEGRADED;
    } else {
      return HealthStatus.HEALTHY;
    }
  }

  getLastResults(): Map<string, IHealthCheckResult> {
    return new Map(this.lastResults);
  }

  /**
   * Create standard health checks
   */
  static createStandardChecks(dependencies: {
    apiClient?: any;
    database?: any;
    redis?: any;
  }): IHealthCheck[] {
    const checks: IHealthCheck[] = [];

    // API connectivity check
    if (dependencies.apiClient) {
      checks.push(new HealthCheck(
        'n8n_api',
        'Check n8n API connectivity',
        3000,
        async () => {
          try {
            const response = await dependencies.apiClient.request('GET', '/');
            return {
              status: HealthStatus.HEALTHY,
              message: 'n8n API is reachable',
              metadata: { 
                version: response.version,
                instanceId: response.instanceId 
              }
            };
          } catch (error) {
            return {
              status: HealthStatus.UNHEALTHY,
              message: `API unreachable: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
          }
        }
      ));
    }

    // Database health check
    if (dependencies.database) {
      checks.push(new HealthCheck(
        'database',
        'Check database connectivity',
        2000,
        async () => {
          try {
            // Assuming database has a ping or similar method
            await dependencies.database.ping();
            return {
              status: HealthStatus.HEALTHY,
              message: 'Database is responsive'
            };
          } catch (error) {
            return {
              status: HealthStatus.UNHEALTHY,
              message: `Database error: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
          }
        }
      ));
    }

    // Redis health check
    if (dependencies.redis) {
      checks.push(new HealthCheck(
        'redis',
        'Check Redis connectivity',
        2000,
        async () => {
          try {
            const pong = await dependencies.redis.ping();
            return {
              status: HealthStatus.HEALTHY,
              message: 'Redis is responsive',
              metadata: { response: pong }
            };
          } catch (error) {
            return {
              status: HealthStatus.DEGRADED, // Degraded because cache is optional
              message: `Redis error: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
          }
        }
      ));
    }

    // Memory usage check
    checks.push(new HealthCheck(
      'memory',
      'Check memory usage',
      1000,
      async () => {
        const usage = process.memoryUsage();
        const heapUsedMB = usage.heapUsed / 1024 / 1024;
        const heapTotalMB = usage.heapTotal / 1024 / 1024;
        const heapPercent = (usage.heapUsed / usage.heapTotal) * 100;

        let status = HealthStatus.HEALTHY;
        let message = 'Memory usage is normal';

        if (heapPercent > 90) {
          status = HealthStatus.UNHEALTHY;
          message = 'Memory usage is critical';
        } else if (heapPercent > 75) {
          status = HealthStatus.DEGRADED;
          message = 'Memory usage is high';
        }

        return {
          status,
          message,
          metadata: {
            heapUsedMB: Math.round(heapUsedMB),
            heapTotalMB: Math.round(heapTotalMB),
            heapPercent: Math.round(heapPercent),
            rss: Math.round(usage.rss / 1024 / 1024),
            external: Math.round(usage.external / 1024 / 1024)
          }
        };
      }
    ));

    // Disk space check (if needed)
    checks.push(new HealthCheck(
      'disk',
      'Check disk space',
      2000,
      async () => {
        // This would need platform-specific implementation
        // For now, return a simple check
        return {
          status: HealthStatus.HEALTHY,
          message: 'Disk space check not implemented',
          metadata: { 
            note: 'Implement platform-specific disk check'
          }
        };
      }
    ));

    return checks;
  }

  /**
   * Format health check results for HTTP response
   */
  formatHttpResponse(results: IHealthCheckResult[]): {
    status: string;
    checks: Record<string, any>;
    timestamp: string;
  } {
    const overallStatus = this.determineOverallStatus(results);
    
    const checks: Record<string, any> = {};
    results.forEach(result => {
      checks[result.name] = {
        status: result.status,
        message: result.message,
        duration: `${result.duration}ms`,
        ...(result.metadata && { metadata: result.metadata })
      };
    });

    return {
      status: overallStatus,
      checks,
      timestamp: new Date().toISOString()
    };
  }

  private determineOverallStatus(results: IHealthCheckResult[]): string {
    if (results.length === 0) return 'healthy';
    
    const hasUnhealthy = results.some(r => r.status === HealthStatus.UNHEALTHY);
    const hasDegraded = results.some(r => r.status === HealthStatus.DEGRADED);

    if (hasUnhealthy) return 'unhealthy';
    if (hasDegraded) return 'degraded';
    return 'healthy';
  }
}