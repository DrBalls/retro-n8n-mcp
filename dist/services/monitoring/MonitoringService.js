/**
 * Main monitoring service that orchestrates all monitoring components
 */
import { MetricRegistry } from './MetricRegistry.js';
import { HealthCheckManager } from './HealthCheckManager.js';
import { AnalyticsTracker } from './AnalyticsTracker.js';
import { AlertManager } from './AlertManager.js';
import { SLOManager } from './SLOManager.js';
import { TelemetryTracer } from './TelemetryTracer.js';
import { EventEmitter } from 'events';
import express from 'express';
/**
 * Monitoring service implementation
 */
export class MonitoringService extends EventEmitter {
    metrics;
    health;
    analytics;
    alerts;
    slos;
    telemetry;
    config;
    startTime;
    metricsServer;
    metricsPort;
    // Standard metrics
    requestsTotal;
    requestsSuccessful;
    requestsFast;
    errorsTotal;
    responseTimeHistogram;
    activeConnections;
    rateLimitExceeded;
    operationsTotal;
    operationsSuccessful;
    constructor(config = {}) {
        super();
        this.config = config;
        this.startTime = new Date();
        // Initialize components
        this.metrics = new MetricRegistry();
        this.health = new HealthCheckManager();
        this.analytics = new AnalyticsTracker(config.analytics);
        this.alerts = new AlertManager(this.metrics, config.alerts);
        this.slos = new SLOManager(this.metrics, config.slo);
        this.telemetry = new TelemetryTracer({
            exporter: config.telemetry?.exporter || 'console',
            serviceName: config.telemetry?.serviceName || 'n8n-mcp-server'
        });
        // Register standard metrics
        this.registerStandardMetrics();
        // Register standard alerts
        if (config.alerts?.enabled) {
            this.registerStandardAlerts();
        }
        // Register standard SLOs
        if (config.slo?.enabled) {
            this.registerStandardSLOs();
        }
        // Set up component event handlers
        this.setupEventHandlers();
    }
    async start() {
        this.emit('monitoring:starting');
        // Start metrics server if enabled
        if (this.config.metrics?.enabled) {
            await this.startMetricsServer();
        }
        // Start analytics tracking
        this.analytics.identify('system', {
            version: '1.0.0',
            startTime: this.startTime
        });
        this.analytics.track('monitoring:started');
        this.emit('monitoring:started');
    }
    async stop() {
        this.emit('monitoring:stopping');
        // Stop all components
        this.analytics.stop();
        this.alerts.stop();
        this.slos.stop();
        this.telemetry.stop();
        // Stop metrics server
        if (this.metricsServer) {
            await new Promise((resolve) => {
                this.metricsServer.listen().close(() => resolve());
            });
        }
        this.analytics.track('monitoring:stopped');
        await this.analytics.flush();
        this.emit('monitoring:stopped');
    }
    getStatus() {
        const uptime = Date.now() - this.startTime.getTime();
        const metrics = this.metrics.getAllMetrics().length;
        const activeAlerts = this.alerts.getActiveAlerts().length;
        const sloViolations = this.slos.getAllStatuses()
            .filter(status => status.current < status.slo.target).length;
        return {
            uptime,
            metrics,
            activeAlerts,
            sloViolations
        };
    }
    registerStandardMetrics() {
        // Request metrics
        this.requestsTotal = this.metrics.registerCounter({
            name: 'mcp_requests_total',
            help: 'Total number of MCP requests',
            labels: ['method', 'tool']
        });
        this.requestsSuccessful = this.metrics.registerCounter({
            name: 'mcp_requests_successful_total',
            help: 'Total number of successful MCP requests',
            labels: ['method', 'tool']
        });
        this.requestsFast = this.metrics.registerCounter({
            name: 'mcp_requests_fast_total',
            help: 'Total number of requests completed under 1 second',
            labels: ['method', 'tool']
        });
        // Error metrics
        this.errorsTotal = this.metrics.registerCounter({
            name: 'mcp_errors_total',
            help: 'Total number of errors',
            labels: ['type', 'tool']
        });
        // Performance metrics
        this.responseTimeHistogram = this.metrics.registerHistogram({
            name: 'mcp_response_time_ms',
            help: 'Response time in milliseconds',
            labels: ['method', 'tool'],
            buckets: [10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000]
        });
        // Connection metrics
        this.activeConnections = this.metrics.registerGauge({
            name: 'mcp_active_connections',
            help: 'Number of active connections'
        });
        // Rate limit metrics
        this.rateLimitExceeded = this.metrics.registerCounter({
            name: 'mcp_rate_limit_exceeded_total',
            help: 'Total number of rate limit exceeded events',
            labels: ['limit_type']
        });
        // Operation metrics
        this.operationsTotal = this.metrics.registerCounter({
            name: 'mcp_operations_total',
            help: 'Total number of operations',
            labels: ['operation', 'status']
        });
        this.operationsSuccessful = this.metrics.registerCounter({
            name: 'mcp_operations_successful_total',
            help: 'Total number of successful operations',
            labels: ['operation']
        });
        // Process metrics
        this.metrics.registerGauge({
            name: 'process_heap_bytes',
            help: 'Process heap size in bytes'
        });
        this.metrics.registerGauge({
            name: 'process_cpu_usage',
            help: 'Process CPU usage percentage'
        });
        // n8n API metrics
        this.metrics.registerGauge({
            name: 'n8n_api_up',
            help: 'n8n API availability (1 = up, 0 = down)'
        });
        // Update process metrics periodically
        setInterval(() => {
            const memUsage = process.memoryUsage();
            const heapGauge = this.metrics.getMetric('process_heap_bytes');
            if (heapGauge) {
                heapGauge.set(memUsage.heapUsed);
            }
            const cpuUsage = process.cpuUsage();
            const cpuGauge = this.metrics.getMetric('process_cpu_usage');
            if (cpuGauge) {
                // Simple CPU percentage calculation
                const cpuPercent = (cpuUsage.user + cpuUsage.system) / 1000000;
                cpuGauge.set(cpuPercent);
            }
        }, 5000);
    }
    registerStandardAlerts() {
        const standardAlerts = AlertManager.createStandardAlerts();
        standardAlerts.forEach(alert => {
            this.alerts.registerAlert(alert);
        });
    }
    registerStandardSLOs() {
        const standardSLOs = SLOManager.createStandardSLOs();
        standardSLOs.forEach(slo => {
            this.slos.registerSLO(slo);
        });
    }
    setupEventHandlers() {
        // Alert events
        this.alerts.on('alert:firing', (instance) => {
            this.analytics.track('alert:firing', {
                alertId: instance.alert.id,
                alertName: instance.alert.name,
                severity: instance.alert.severity,
                value: instance.value
            });
            this.emit('alert:firing', instance);
        });
        this.alerts.on('alert:resolved', (instance) => {
            this.analytics.track('alert:resolved', {
                alertId: instance.alert.id,
                alertName: instance.alert.name,
                duration: instance.resolvedAt.getTime() - instance.firedAt.getTime()
            });
            this.emit('alert:resolved', instance);
        });
        // SLO events
        this.slos.on('slo:violated', (status) => {
            this.analytics.track('slo:violated', {
                sloId: status.slo.id,
                sloName: status.slo.name,
                current: status.current,
                target: status.slo.target
            });
            this.emit('slo:violated', status);
        });
        this.slos.on('slo:warning', (status) => {
            this.analytics.track('slo:warning', {
                sloId: status.slo.id,
                sloName: status.slo.name,
                burnRate: status.burnRate
            });
            this.emit('slo:warning', status);
        });
    }
    async startMetricsServer() {
        const app = express();
        this.metricsPort = this.config.metrics?.port || 9090;
        const metricsPath = this.config.metrics?.path || '/metrics';
        // Metrics endpoint
        app.get(metricsPath, (req, res) => {
            res.set('Content-Type', 'text/plain; version=0.0.4');
            res.send(this.metrics.exportPrometheus());
        });
        // Health endpoint
        if (this.config.health?.enabled) {
            const healthPath = this.config.health.path || '/health';
            app.get(healthPath, async (req, res) => {
                try {
                    const results = await this.health.runAllChecks();
                    const response = this.health.formatHttpResponse(results);
                    const statusCode = response.status === 'healthy' ? 200 :
                        response.status === 'degraded' ? 200 : 503;
                    res.status(statusCode).json(response);
                }
                catch (error) {
                    res.status(500).json({
                        status: 'error',
                        message: error instanceof Error ? error.message : 'Health check failed'
                    });
                }
            });
        }
        // Start server
        await new Promise((resolve) => {
            this.metricsServer = app.listen(this.metricsPort, () => {
                console.log(`Metrics server listening on port ${this.metricsPort}`);
                resolve();
            });
        });
    }
    /**
     * Helper methods for recording metrics
     */
    recordRequest(tool, method = 'call') {
        this.requestsTotal?.increment({ method, tool });
    }
    recordSuccess(tool, method = 'call', duration) {
        this.requestsSuccessful?.increment({ method, tool });
        this.operationsSuccessful?.increment({ operation: tool });
        if (duration < 1000) {
            this.requestsFast?.increment({ method, tool });
        }
        this.responseTimeHistogram?.observe(duration, { method, tool });
    }
    recordError(tool, errorType) {
        this.errorsTotal?.increment({ type: errorType, tool });
        this.operationsTotal?.increment({ operation: tool, status: 'error' });
    }
    recordRateLimit(limitType) {
        this.rateLimitExceeded?.increment({ limit_type: limitType });
    }
    incrementConnections() {
        this.activeConnections?.increment();
    }
    decrementConnections() {
        this.activeConnections?.decrement();
    }
    setApiStatus(up) {
        const apiGauge = this.metrics.getMetric('n8n_api_up');
        if (apiGauge) {
            apiGauge.set(up ? 1 : 0);
        }
    }
    /**
     * Create default monitoring configuration
     */
    static createDefaultConfig(dependencies) {
        return {
            metrics: {
                enabled: true,
                port: 9090,
                path: '/metrics',
                defaultLabels: {
                    service: 'n8n-mcp-server',
                    environment: process.env.NODE_ENV || 'development'
                }
            },
            health: {
                enabled: true,
                path: '/health',
                checks: HealthCheckManager.createStandardChecks(dependencies || {})
            },
            analytics: {
                enabled: true,
                provider: 'internal',
                flushInterval: 30000
            },
            alerts: {
                enabled: true,
                evaluationInterval: 60000
            },
            slo: {
                enabled: true,
                evaluationInterval: 60000
            },
            telemetry: {
                enabled: true,
                exporter: 'console',
                serviceName: 'n8n-mcp-server'
            }
        };
    }
}
//# sourceMappingURL=MonitoringService.js.map