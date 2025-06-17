import { MultiTierCacheManager } from './MultiTierCacheManager.js';
import { CacheMetrics, CacheEvent, CacheInvalidation } from '../../types/cache.types.js';
import { EventEmitter } from 'events';
interface AlertRule {
    name: string;
    condition: string;
    threshold: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
    enabled: boolean;
}
interface Alert {
    id: string;
    rule: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    timestamp: number;
    resolved: boolean;
    resolvedAt?: number;
    metadata?: Record<string, unknown>;
}
/**
 * Service for monitoring cache performance, health, and generating alerts
 */
export declare class CacheMonitoringService extends EventEmitter {
    private readonly logger;
    private readonly cacheManager;
    private monitoringInterval?;
    private metricsHistory;
    private activeAlerts;
    private eventHistory;
    private invalidationHistory;
    private readonly config;
    private alertRules;
    constructor(cacheManager: MultiTierCacheManager);
    /**
     * Start monitoring cache performance
     */
    start(): void;
    /**
     * Stop monitoring
     */
    stop(): void;
    /**
     * Get current cache metrics
     */
    getCurrentMetrics(): Promise<CacheMetrics>;
    /**
     * Get metrics history
     */
    getMetricsHistory(since?: number): CacheMetrics[];
    /**
     * Get active alerts
     */
    getActiveAlerts(): Alert[];
    /**
     * Get all alerts (including resolved ones)
     */
    getAllAlerts(since?: number): Alert[];
    /**
     * Get recent cache events
     */
    getEvents(limit?: number, type?: string): CacheEvent[];
    /**
     * Get recent invalidation history
     */
    getInvalidationHistory(limit?: number): CacheInvalidation[];
    /**
     * Add custom alert rule
     */
    addAlertRule(rule: AlertRule): void;
    /**
     * Remove alert rule
     */
    removeAlertRule(name: string): boolean;
    /**
     * Get alert rules
     */
    getAlertRules(): AlertRule[];
    /**
     * Manually resolve an alert
     */
    resolveAlert(alertId: string): boolean;
    /**
     * Generate performance summary
     */
    getPerformanceSummary(timeframeMs?: number): Promise<{
        averageHitRate: number;
        averageLatency: number;
        totalRequests: number;
        totalErrors: number;
        peakThroughput: number;
        alertCount: number;
        healthScore: number;
    }>;
    private collectMetrics;
    private evaluateAlerts;
    private evaluateAlertCondition;
    private createAlert;
    private generateAlertMessage;
    private recordEvent;
    private recordInvalidation;
    private cleanupHistory;
    private calculateHealthScore;
}
export {};
//# sourceMappingURL=CacheMonitoringService.d.ts.map