/**
 * Main monitoring service that orchestrates all monitoring components
 */
import { IMonitoringService, IMonitoringConfig } from '../../types/monitoring.js';
import { MetricRegistry } from './MetricRegistry.js';
import { HealthCheckManager } from './HealthCheckManager.js';
import { AnalyticsTracker } from './AnalyticsTracker.js';
import { AlertManager } from './AlertManager.js';
import { SLOManager } from './SLOManager.js';
import { TelemetryTracer } from './TelemetryTracer.js';
import { EventEmitter } from 'events';
/**
 * Monitoring service implementation
 */
export declare class MonitoringService extends EventEmitter implements IMonitoringService {
    readonly metrics: MetricRegistry;
    readonly health: HealthCheckManager;
    readonly analytics: AnalyticsTracker;
    readonly alerts: AlertManager;
    readonly slos: SLOManager;
    readonly telemetry: TelemetryTracer;
    private config;
    private startTime;
    private metricsServer?;
    private metricsPort?;
    private requestsTotal?;
    private requestsSuccessful?;
    private requestsFast?;
    private errorsTotal?;
    private responseTimeHistogram?;
    private activeConnections?;
    private rateLimitExceeded?;
    private operationsTotal?;
    private operationsSuccessful?;
    constructor(config?: IMonitoringConfig);
    start(): Promise<void>;
    stop(): Promise<void>;
    getStatus(): {
        uptime: number;
        metrics: number;
        activeAlerts: number;
        sloViolations: number;
    };
    private registerStandardMetrics;
    private registerStandardAlerts;
    private registerStandardSLOs;
    private setupEventHandlers;
    private startMetricsServer;
    /**
     * Helper methods for recording metrics
     */
    recordRequest(tool: string, method?: string): void;
    recordSuccess(tool: string, method: string | undefined, duration: number): void;
    recordError(tool: string, errorType: string): void;
    recordRateLimit(limitType: string): void;
    incrementConnections(): void;
    decrementConnections(): void;
    setApiStatus(up: boolean): void;
    /**
     * Create default monitoring configuration
     */
    static createDefaultConfig(dependencies?: {
        apiClient?: any;
        database?: any;
        redis?: any;
    }): IMonitoringConfig;
}
//# sourceMappingURL=MonitoringService.d.ts.map