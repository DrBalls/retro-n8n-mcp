/**
 * Type definitions for monitoring and analytics system
 */
import { z } from 'zod';
/**
 * Core metric types
 */
export type MetricType = 'counter' | 'gauge' | 'histogram' | 'summary';
/**
 * Metric data point
 */
export interface IMetricDataPoint {
    timestamp: Date;
    value: number;
    labels?: Record<string, string>;
}
/**
 * Base metric interface
 */
export interface IMetric {
    name: string;
    type: MetricType;
    help: string;
    labels?: string[];
    unit?: string;
}
/**
 * Counter metric (monotonically increasing)
 */
export interface ICounterMetric extends IMetric {
    type: 'counter';
    value: number;
    increment(labels?: Record<string, string>, value?: number): void;
}
/**
 * Gauge metric (can go up and down)
 */
export interface IGaugeMetric extends IMetric {
    type: 'gauge';
    value: number;
    set(value: number, labels?: Record<string, string>): void;
    increment(labels?: Record<string, string>, value?: number): void;
    decrement(labels?: Record<string, string>, value?: number): void;
}
/**
 * Histogram metric (track distributions)
 */
export interface IHistogramMetric extends IMetric {
    type: 'histogram';
    buckets: number[];
    observe(value: number, labels?: Record<string, string>): void;
    getPercentile(percentile: number): number;
}
/**
 * Summary metric (similar to histogram but with quantiles)
 */
export interface ISummaryMetric extends IMetric {
    type: 'summary';
    quantiles: number[];
    observe(value: number, labels?: Record<string, string>): void;
}
/**
 * Metric registry interface
 */
export interface IMetricRegistry {
    registerCounter(metric: Omit<ICounterMetric, 'type' | 'value' | 'increment'>): ICounterMetric;
    registerGauge(metric: Omit<IGaugeMetric, 'type' | 'value' | 'set' | 'increment' | 'decrement'>): IGaugeMetric;
    registerHistogram(metric: Omit<IHistogramMetric, 'type' | 'buckets' | 'observe' | 'getPercentile'> & {
        buckets?: number[];
    }): IHistogramMetric;
    registerSummary(metric: Omit<ISummaryMetric, 'type' | 'quantiles' | 'observe'> & {
        quantiles?: number[];
    }): ISummaryMetric;
    getMetric(name: string): IMetric | undefined;
    getAllMetrics(): IMetric[];
    reset(): void;
}
/**
 * Health check status
 */
export declare enum HealthStatus {
    HEALTHY = "healthy",
    DEGRADED = "degraded",
    UNHEALTHY = "unhealthy"
}
/**
 * Health check result
 */
export interface IHealthCheckResult {
    name: string;
    status: HealthStatus;
    message?: string;
    duration: number;
    timestamp: Date;
    metadata?: Record<string, any>;
}
/**
 * Health check interface
 */
export interface IHealthCheck {
    name: string;
    description?: string;
    timeout?: number;
    check(): Promise<IHealthCheckResult>;
}
/**
 * Health check manager interface
 */
export interface IHealthCheckManager {
    register(check: IHealthCheck): void;
    unregister(name: string): void;
    runCheck(name: string): Promise<IHealthCheckResult>;
    runAllChecks(): Promise<IHealthCheckResult[]>;
    getOverallHealth(): Promise<HealthStatus>;
}
/**
 * Analytics event
 */
export interface IAnalyticsEvent {
    event: string;
    timestamp: Date;
    properties?: Record<string, any>;
    userId?: string;
    sessionId?: string;
    context?: {
        ip?: string;
        userAgent?: string;
        referrer?: string;
        [key: string]: any;
    };
}
/**
 * Analytics tracker interface
 */
export interface IAnalyticsTracker {
    track(event: string, properties?: Record<string, any>): void;
    identify(userId: string, traits?: Record<string, any>): void;
    page(name?: string, properties?: Record<string, any>): void;
    flush(): Promise<void>;
}
/**
 * Alert severity levels
 */
export declare enum AlertSeverity {
    INFO = "info",
    WARNING = "warning",
    ERROR = "error",
    CRITICAL = "critical"
}
/**
 * Alert definition
 */
export interface IAlert {
    id: string;
    name: string;
    condition: string;
    severity: AlertSeverity;
    message: string;
    threshold?: number;
    duration?: number;
    labels?: Record<string, string>;
    annotations?: Record<string, string>;
}
/**
 * Alert instance
 */
export interface IAlertInstance {
    alert: IAlert;
    status: 'firing' | 'resolved';
    firedAt: Date;
    resolvedAt?: Date;
    value?: number;
    labels?: Record<string, string>;
}
/**
 * Alert manager interface
 */
export interface IAlertManager {
    registerAlert(alert: IAlert): void;
    unregisterAlert(id: string): void;
    evaluate(): Promise<IAlertInstance[]>;
    getActiveAlerts(): IAlertInstance[];
    acknowledge(alertId: string): void;
    silence(alertId: string, duration: number): void;
}
/**
 * SLO (Service Level Objective) definition
 */
export interface ISLO {
    id: string;
    name: string;
    description?: string;
    target: number;
    window: 'rolling' | 'calendar';
    windowDuration: number;
    indicator: {
        good: string;
        total: string;
    };
}
/**
 * SLO status
 */
export interface ISLOStatus {
    slo: ISLO;
    current: number;
    errorBudget: number;
    burnRate: number;
    prediction?: {
        willViolate: boolean;
        timeToViolation?: number;
    };
}
/**
 * SLO manager interface
 */
export interface ISLOManager {
    registerSLO(slo: ISLO): void;
    unregisterSLO(id: string): void;
    getStatus(id: string): ISLOStatus | undefined;
    getAllStatuses(): ISLOStatus[];
    getErrorBudgetReport(id: string, start: Date, end: Date): any;
}
/**
 * Telemetry span
 */
export interface ITelemetrySpan {
    traceId: string;
    spanId: string;
    parentSpanId?: string;
    operation: string;
    startTime: Date;
    endTime?: Date;
    duration?: number;
    status: 'ok' | 'error';
    attributes?: Record<string, any>;
    events?: Array<{
        name: string;
        timestamp: Date;
        attributes?: Record<string, any>;
    }>;
}
/**
 * Telemetry tracer interface
 */
export interface ITelemetryTracer {
    startSpan(operation: string, parentSpan?: ITelemetrySpan): ITelemetrySpan;
    endSpan(span: ITelemetrySpan): void;
    addEvent(span: ITelemetrySpan, name: string, attributes?: Record<string, any>): void;
    setAttribute(span: ITelemetrySpan, key: string, value: any): void;
    setStatus(span: ITelemetrySpan, status: 'ok' | 'error'): void;
}
/**
 * Monitoring configuration
 */
export interface IMonitoringConfig {
    metrics?: {
        enabled: boolean;
        port?: number;
        path?: string;
        defaultLabels?: Record<string, string>;
    };
    health?: {
        enabled: boolean;
        path?: string;
        checks?: IHealthCheck[];
    };
    analytics?: {
        enabled: boolean;
        provider?: 'internal' | 'segment' | 'mixpanel';
        apiKey?: string;
        flushInterval?: number;
    };
    alerts?: {
        enabled: boolean;
        evaluationInterval?: number;
        notificationChannels?: Array<{
            type: 'email' | 'slack' | 'webhook';
            config: Record<string, any>;
        }>;
    };
    slo?: {
        enabled: boolean;
        evaluationInterval?: number;
    };
    telemetry?: {
        enabled: boolean;
        exporter?: 'console' | 'jaeger' | 'zipkin';
        endpoint?: string;
        serviceName?: string;
    };
}
/**
 * Monitoring service interface
 */
export interface IMonitoringService {
    metrics: IMetricRegistry;
    health: IHealthCheckManager;
    analytics: IAnalyticsTracker;
    alerts: IAlertManager;
    slos: ISLOManager;
    telemetry: ITelemetryTracer;
    start(): Promise<void>;
    stop(): Promise<void>;
    getStatus(): {
        uptime: number;
        metrics: number;
        activeAlerts: number;
        sloViolations: number;
    };
}
/**
 * Zod schemas for validation
 */
export declare const MetricDataPointSchema: z.ZodObject<{
    timestamp: z.ZodDate;
    value: z.ZodNumber;
    labels: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    value: number;
    timestamp: Date;
    labels?: Record<string, string> | undefined;
}, {
    value: number;
    timestamp: Date;
    labels?: Record<string, string> | undefined;
}>;
export declare const HealthCheckResultSchema: z.ZodObject<{
    name: z.ZodString;
    status: z.ZodEnum<["healthy", "degraded", "unhealthy"]>;
    message: z.ZodOptional<z.ZodString>;
    duration: z.ZodNumber;
    timestamp: z.ZodDate;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    status: "healthy" | "degraded" | "unhealthy";
    timestamp: Date;
    name: string;
    duration: number;
    message?: string | undefined;
    metadata?: Record<string, any> | undefined;
}, {
    status: "healthy" | "degraded" | "unhealthy";
    timestamp: Date;
    name: string;
    duration: number;
    message?: string | undefined;
    metadata?: Record<string, any> | undefined;
}>;
export declare const AnalyticsEventSchema: z.ZodObject<{
    event: z.ZodString;
    timestamp: z.ZodDate;
    properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    userId: z.ZodOptional<z.ZodString>;
    sessionId: z.ZodOptional<z.ZodString>;
    context: z.ZodOptional<z.ZodObject<{
        ip: z.ZodOptional<z.ZodString>;
        userAgent: z.ZodOptional<z.ZodString>;
        referrer: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        ip?: string | undefined;
        userAgent?: string | undefined;
        referrer?: string | undefined;
    }, {
        ip?: string | undefined;
        userAgent?: string | undefined;
        referrer?: string | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    timestamp: Date;
    event: string;
    properties?: Record<string, any> | undefined;
    userId?: string | undefined;
    sessionId?: string | undefined;
    context?: {
        ip?: string | undefined;
        userAgent?: string | undefined;
        referrer?: string | undefined;
    } | undefined;
}, {
    timestamp: Date;
    event: string;
    properties?: Record<string, any> | undefined;
    userId?: string | undefined;
    sessionId?: string | undefined;
    context?: {
        ip?: string | undefined;
        userAgent?: string | undefined;
        referrer?: string | undefined;
    } | undefined;
}>;
export declare const AlertSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    condition: z.ZodString;
    severity: z.ZodEnum<["info", "warning", "error", "critical"]>;
    message: z.ZodString;
    threshold: z.ZodOptional<z.ZodNumber>;
    duration: z.ZodOptional<z.ZodNumber>;
    labels: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    annotations: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    message: string;
    name: string;
    id: string;
    condition: string;
    severity: "error" | "info" | "warning" | "critical";
    labels?: Record<string, string> | undefined;
    duration?: number | undefined;
    threshold?: number | undefined;
    annotations?: Record<string, string> | undefined;
}, {
    message: string;
    name: string;
    id: string;
    condition: string;
    severity: "error" | "info" | "warning" | "critical";
    labels?: Record<string, string> | undefined;
    duration?: number | undefined;
    threshold?: number | undefined;
    annotations?: Record<string, string> | undefined;
}>;
export declare const SLOSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    target: z.ZodNumber;
    window: z.ZodEnum<["rolling", "calendar"]>;
    windowDuration: z.ZodNumber;
    indicator: z.ZodObject<{
        good: z.ZodString;
        total: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        good: string;
        total: string;
    }, {
        good: string;
        total: string;
    }>;
}, "strip", z.ZodTypeAny, {
    target: number;
    name: string;
    id: string;
    window: "rolling" | "calendar";
    windowDuration: number;
    indicator: {
        good: string;
        total: string;
    };
    description?: string | undefined;
}, {
    target: number;
    name: string;
    id: string;
    window: "rolling" | "calendar";
    windowDuration: number;
    indicator: {
        good: string;
        total: string;
    };
    description?: string | undefined;
}>;
//# sourceMappingURL=monitoring.d.ts.map