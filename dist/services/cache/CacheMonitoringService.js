import { Logger } from '../../utils/Logger.js';
import { EventEmitter } from 'events';
/**
 * Service for monitoring cache performance, health, and generating alerts
 */
export class CacheMonitoringService extends EventEmitter {
    logger = new Logger('CacheMonitoringService');
    cacheManager;
    monitoringInterval;
    metricsHistory = [];
    activeAlerts = new Map();
    eventHistory = [];
    invalidationHistory = [];
    // Configuration
    config = {
        metricsIntervalMs: 60000, // 1 minute
        historyRetentionMs: 24 * 60 * 60 * 1000, // 24 hours
        eventHistoryLimit: 1000,
        invalidationHistoryLimit: 100,
    };
    // Default alert rules
    alertRules = [
        {
            name: 'low_hit_rate',
            condition: 'overall.hitRate < threshold',
            threshold: 50, // Below 50%
            severity: 'medium',
            enabled: true,
        },
        {
            name: 'high_error_rate',
            condition: 'performance.errorRate > threshold',
            threshold: 5, // Above 5%
            severity: 'high',
            enabled: true,
        },
        {
            name: 'high_latency',
            condition: 'performance.averageResponseTimeMs > threshold',
            threshold: 100, // Above 100ms
            severity: 'medium',
            enabled: true,
        },
        {
            name: 'memory_layer_unhealthy',
            condition: 'health.memoryLayer === false',
            threshold: 1,
            severity: 'critical',
            enabled: true,
        },
        {
            name: 'redis_layer_unhealthy',
            condition: 'health.redisLayer === false',
            threshold: 1,
            severity: 'high',
            enabled: true,
        },
        {
            name: 'low_throughput',
            condition: 'performance.throughputPerSecond < threshold',
            threshold: 10, // Below 10 requests/second
            severity: 'low',
            enabled: true,
        },
    ];
    constructor(cacheManager) {
        super();
        this.cacheManager = cacheManager;
        // Listen to cache events
        this.cacheManager.on('cache:event', (event) => {
            this.recordEvent(event);
        });
        this.cacheManager.on('cache:invalidation', (invalidation) => {
            this.recordInvalidation(invalidation);
        });
    }
    /**
     * Start monitoring cache performance
     */
    start() {
        if (this.monitoringInterval) {
            return;
        }
        this.monitoringInterval = setInterval(async () => {
            try {
                await this.collectMetrics();
                await this.evaluateAlerts();
                this.cleanupHistory();
            }
            catch (error) {
                this.logger.error('Error in monitoring cycle', { error });
            }
        }, this.config.metricsIntervalMs);
        this.logger.info('Cache monitoring service started', {
            intervalMs: this.config.metricsIntervalMs,
        });
    }
    /**
     * Stop monitoring
     */
    stop() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = undefined;
        }
        this.logger.info('Cache monitoring service stopped');
    }
    /**
     * Get current cache metrics
     */
    async getCurrentMetrics() {
        return await this.cacheManager.getStats();
    }
    /**
     * Get metrics history
     */
    getMetricsHistory(since) {
        const sinceTimestamp = since || (Date.now() - this.config.historyRetentionMs);
        return this.metricsHistory.filter(m => m.timestamp >= sinceTimestamp);
    }
    /**
     * Get active alerts
     */
    getActiveAlerts() {
        return Array.from(this.activeAlerts.values()).filter(alert => !alert.resolved);
    }
    /**
     * Get all alerts (including resolved ones)
     */
    getAllAlerts(since) {
        const sinceTimestamp = since || (Date.now() - this.config.historyRetentionMs);
        return Array.from(this.activeAlerts.values())
            .filter(alert => alert.timestamp >= sinceTimestamp)
            .sort((a, b) => b.timestamp - a.timestamp);
    }
    /**
     * Get recent cache events
     */
    getEvents(limit, type) {
        let events = this.eventHistory;
        if (type) {
            events = events.filter(e => e.type === type);
        }
        if (limit) {
            events = events.slice(-limit);
        }
        return events.sort((a, b) => b.timestamp - a.timestamp);
    }
    /**
     * Get recent invalidation history
     */
    getInvalidationHistory(limit) {
        const history = limit ? this.invalidationHistory.slice(-limit) : this.invalidationHistory;
        return history.sort((a, b) => b.timestamp - a.timestamp);
    }
    /**
     * Add custom alert rule
     */
    addAlertRule(rule) {
        const existingIndex = this.alertRules.findIndex(r => r.name === rule.name);
        if (existingIndex >= 0) {
            this.alertRules[existingIndex] = rule;
        }
        else {
            this.alertRules.push(rule);
        }
        this.logger.info('Alert rule added/updated', { rule: rule.name });
    }
    /**
     * Remove alert rule
     */
    removeAlertRule(name) {
        const index = this.alertRules.findIndex(r => r.name === name);
        if (index >= 0) {
            this.alertRules.splice(index, 1);
            this.logger.info('Alert rule removed', { rule: name });
            return true;
        }
        return false;
    }
    /**
     * Get alert rules
     */
    getAlertRules() {
        return [...this.alertRules];
    }
    /**
     * Manually resolve an alert
     */
    resolveAlert(alertId) {
        const alert = this.activeAlerts.get(alertId);
        if (alert && !alert.resolved) {
            alert.resolved = true;
            alert.resolvedAt = Date.now();
            this.emit('alert:resolved', alert);
            this.logger.info('Alert manually resolved', { alertId, rule: alert.rule });
            return true;
        }
        return false;
    }
    /**
     * Generate performance summary
     */
    async getPerformanceSummary(timeframeMs = 3600000) {
        const since = Date.now() - timeframeMs;
        const metrics = this.getMetricsHistory(since);
        if (metrics.length === 0) {
            const current = await this.getCurrentMetrics();
            return {
                averageHitRate: current.overall.hitRate,
                averageLatency: current.performance.averageResponseTimeMs,
                totalRequests: current.overall.totalRequests,
                totalErrors: current.overall.errors,
                peakThroughput: current.performance.throughputPerSecond,
                alertCount: this.getActiveAlerts().length,
                healthScore: this.calculateHealthScore(current),
            };
        }
        const averageHitRate = metrics.reduce((sum, m) => sum + m.overall.hitRate, 0) / metrics.length;
        const averageLatency = metrics.reduce((sum, m) => sum + m.performance.averageResponseTimeMs, 0) / metrics.length;
        const totalRequests = metrics[metrics.length - 1].overall.totalRequests - metrics[0].overall.totalRequests;
        const totalErrors = metrics[metrics.length - 1].overall.errors - metrics[0].overall.errors;
        const peakThroughput = Math.max(...metrics.map(m => m.performance.throughputPerSecond));
        const alertCount = this.getActiveAlerts().length;
        const healthScore = metrics.reduce((sum, m) => sum + this.calculateHealthScore(m), 0) / metrics.length;
        return {
            averageHitRate,
            averageLatency,
            totalRequests,
            totalErrors,
            peakThroughput,
            alertCount,
            healthScore,
        };
    }
    // Private methods
    async collectMetrics() {
        try {
            const metrics = await this.cacheManager.getStats();
            this.metricsHistory.push(metrics);
            this.emit('metrics:collected', metrics);
            this.logger.debug('Cache metrics collected', {
                hitRate: metrics.overall.hitRate.toFixed(2),
                totalItems: metrics.overall.totalItems,
                throughput: metrics.performance.throughputPerSecond.toFixed(2),
            });
        }
        catch (error) {
            this.logger.error('Failed to collect cache metrics', { error });
        }
    }
    async evaluateAlerts() {
        if (this.metricsHistory.length === 0) {
            return;
        }
        const latestMetrics = this.metricsHistory[this.metricsHistory.length - 1];
        for (const rule of this.alertRules) {
            if (!rule.enabled) {
                continue;
            }
            try {
                const shouldAlert = this.evaluateAlertCondition(rule, latestMetrics);
                const existingAlert = Array.from(this.activeAlerts.values())
                    .find(alert => alert.rule === rule.name && !alert.resolved);
                if (shouldAlert && !existingAlert) {
                    // Create new alert
                    this.createAlert(rule, latestMetrics);
                }
                else if (!shouldAlert && existingAlert) {
                    // Resolve existing alert
                    existingAlert.resolved = true;
                    existingAlert.resolvedAt = Date.now();
                    this.emit('alert:resolved', existingAlert);
                }
            }
            catch (error) {
                this.logger.error('Error evaluating alert rule', { rule: rule.name, error });
            }
        }
    }
    evaluateAlertCondition(rule, metrics) {
        try {
            // Create evaluation context
            const context = {
                overall: metrics.overall,
                performance: metrics.performance,
                health: metrics.health,
                memory: metrics.memory,
                redis: metrics.redis,
                database: metrics.database,
                threshold: rule.threshold,
            };
            // Simple condition evaluation (replace with proper expression parser in production)
            let condition = rule.condition;
            // Replace context variables
            for (const [key, value] of Object.entries(context)) {
                if (typeof value === 'object') {
                    for (const [subKey, subValue] of Object.entries(value || {})) {
                        const regex = new RegExp(`\\b${key}\\.${subKey}\\b`, 'g');
                        condition = condition.replace(regex, JSON.stringify(subValue));
                    }
                }
                else {
                    const regex = new RegExp(`\\b${key}\\b`, 'g');
                    condition = condition.replace(regex, JSON.stringify(value));
                }
            }
            // Safety check
            if (condition.includes('function') || condition.includes('eval')) {
                throw new Error('Unsafe condition');
            }
            return Function(`"use strict"; return (${condition})`)();
        }
        catch (error) {
            this.logger.warn('Failed to evaluate alert condition', { rule: rule.name, error });
            return false;
        }
    }
    createAlert(rule, metrics) {
        const alert = {
            id: `${rule.name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            rule: rule.name,
            severity: rule.severity,
            message: this.generateAlertMessage(rule, metrics),
            timestamp: Date.now(),
            resolved: false,
            metadata: {
                hitRate: metrics.overall.hitRate,
                errorRate: metrics.performance.errorRate,
                latency: metrics.performance.averageResponseTimeMs,
                health: metrics.health,
            },
        };
        this.activeAlerts.set(alert.id, alert);
        this.emit('alert:created', alert);
        this.logger.warn('Cache alert created', {
            rule: rule.name,
            severity: rule.severity,
            message: alert.message,
        });
    }
    generateAlertMessage(rule, metrics) {
        switch (rule.name) {
            case 'low_hit_rate':
                return `Cache hit rate is below threshold: ${metrics.overall.hitRate.toFixed(2)}% < ${rule.threshold}%`;
            case 'high_error_rate':
                return `Error rate is above threshold: ${metrics.performance.errorRate.toFixed(2)}% > ${rule.threshold}%`;
            case 'high_latency':
                return `Average response time is above threshold: ${metrics.performance.averageResponseTimeMs.toFixed(2)}ms > ${rule.threshold}ms`;
            case 'memory_layer_unhealthy':
                return 'Memory cache layer is unhealthy';
            case 'redis_layer_unhealthy':
                return 'Redis cache layer is unhealthy';
            case 'low_throughput':
                return `Throughput is below threshold: ${metrics.performance.throughputPerSecond.toFixed(2)} req/s < ${rule.threshold} req/s`;
            default:
                return `Alert triggered: ${rule.name}`;
        }
    }
    recordEvent(event) {
        this.eventHistory.push(event);
        // Limit event history size
        if (this.eventHistory.length > this.config.eventHistoryLimit) {
            this.eventHistory = this.eventHistory.slice(-this.config.eventHistoryLimit);
        }
    }
    recordInvalidation(invalidation) {
        this.invalidationHistory.push(invalidation);
        // Limit invalidation history size
        if (this.invalidationHistory.length > this.config.invalidationHistoryLimit) {
            this.invalidationHistory = this.invalidationHistory.slice(-this.config.invalidationHistoryLimit);
        }
    }
    cleanupHistory() {
        const cutoff = Date.now() - this.config.historyRetentionMs;
        // Cleanup metrics history
        this.metricsHistory = this.metricsHistory.filter(m => m.timestamp >= cutoff);
        // Cleanup event history
        this.eventHistory = this.eventHistory.filter(e => e.timestamp >= cutoff);
        // Cleanup invalidation history
        this.invalidationHistory = this.invalidationHistory.filter(i => i.timestamp >= cutoff);
        // Cleanup resolved alerts
        for (const [id, alert] of this.activeAlerts) {
            if (alert.resolved && alert.resolvedAt && alert.resolvedAt < cutoff) {
                this.activeAlerts.delete(id);
            }
        }
    }
    calculateHealthScore(metrics) {
        let score = 100;
        // Deduct points for poor performance
        if (metrics.overall.hitRate < 50) {
            score -= 30;
        }
        else if (metrics.overall.hitRate < 70) {
            score -= 15;
        }
        if (metrics.performance.errorRate > 5) {
            score -= 25;
        }
        else if (metrics.performance.errorRate > 1) {
            score -= 10;
        }
        if (metrics.performance.averageResponseTimeMs > 100) {
            score -= 20;
        }
        else if (metrics.performance.averageResponseTimeMs > 50) {
            score -= 10;
        }
        // Deduct points for unhealthy layers
        if (!metrics.health.memoryLayer) {
            score -= 40;
        }
        if (metrics.health.redisLayer === false) {
            score -= 20;
        }
        if (metrics.health.databaseLayer === false) {
            score -= 10;
        }
        return Math.max(0, score);
    }
}
//# sourceMappingURL=CacheMonitoringService.js.map