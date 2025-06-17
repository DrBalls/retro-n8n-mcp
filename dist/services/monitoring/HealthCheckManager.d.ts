/**
 * Health check manager implementation
 */
import { IHealthCheck, IHealthCheckManager, IHealthCheckResult, HealthStatus } from '../../types/monitoring.js';
/**
 * Default health check implementations
 */
export declare class HealthCheck implements IHealthCheck {
    readonly name: string;
    readonly description: string | undefined;
    readonly timeout: number | undefined;
    private readonly checkFn;
    constructor(name: string, description: string | undefined, timeout: number | undefined, checkFn: () => Promise<Omit<IHealthCheckResult, 'name' | 'duration' | 'timestamp'>>);
    check(): Promise<IHealthCheckResult>;
}
/**
 * Health check manager implementation
 */
export declare class HealthCheckManager implements IHealthCheckManager {
    private checks;
    private lastResults;
    register(check: IHealthCheck): void;
    unregister(name: string): void;
    runCheck(name: string): Promise<IHealthCheckResult>;
    runAllChecks(): Promise<IHealthCheckResult[]>;
    getOverallHealth(): Promise<HealthStatus>;
    getLastResults(): Map<string, IHealthCheckResult>;
    /**
     * Create standard health checks
     */
    static createStandardChecks(dependencies: {
        apiClient?: any;
        database?: any;
        redis?: any;
    }): IHealthCheck[];
    /**
     * Format health check results for HTTP response
     */
    formatHttpResponse(results: IHealthCheckResult[]): {
        status: string;
        checks: Record<string, any>;
        timestamp: string;
    };
    private determineOverallStatus;
}
//# sourceMappingURL=HealthCheckManager.d.ts.map