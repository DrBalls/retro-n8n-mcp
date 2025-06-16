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
  registerHistogram(metric: Omit<IHistogramMetric, 'type' | 'buckets' | 'observe' | 'getPercentile'> & { buckets?: number[] }): IHistogramMetric;
  registerSummary(metric: Omit<ISummaryMetric, 'type' | 'quantiles' | 'observe'> & { quantiles?: number[] }): ISummaryMetric;
  
  getMetric(name: string): IMetric | undefined;
  getAllMetrics(): IMetric[];
  reset(): void;
}

/**
 * Health check status
 */
export enum HealthStatus {
  HEALTHY = 'healthy',
  DEGRADED = 'degraded',
  UNHEALTHY = 'unhealthy'
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
export enum AlertSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
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
  target: number; // percentage (e.g., 99.9)
  window: 'rolling' | 'calendar';
  windowDuration: number; // in seconds
  indicator: {
    good: string; // metric query for good events
    total: string; // metric query for total events
  };
}

/**
 * SLO status
 */
export interface ISLOStatus {
  slo: ISLO;
  current: number; // current percentage
  errorBudget: number; // remaining error budget
  burnRate: number; // rate of error budget consumption
  prediction?: {
    willViolate: boolean;
    timeToViolation?: number; // seconds
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
export const MetricDataPointSchema = z.object({
  timestamp: z.date(),
  value: z.number(),
  labels: z.record(z.string()).optional()
});

export const HealthCheckResultSchema = z.object({
  name: z.string(),
  status: z.enum(['healthy', 'degraded', 'unhealthy']),
  message: z.string().optional(),
  duration: z.number(),
  timestamp: z.date(),
  metadata: z.record(z.any()).optional()
});

export const AnalyticsEventSchema = z.object({
  event: z.string(),
  timestamp: z.date(),
  properties: z.record(z.any()).optional(),
  userId: z.string().optional(),
  sessionId: z.string().optional(),
  context: z.object({
    ip: z.string().optional(),
    userAgent: z.string().optional(),
    referrer: z.string().optional()
  }).optional()
});

export const AlertSchema = z.object({
  id: z.string(),
  name: z.string(),
  condition: z.string(),
  severity: z.enum(['info', 'warning', 'error', 'critical']),
  message: z.string(),
  threshold: z.number().optional(),
  duration: z.number().optional(),
  labels: z.record(z.string()).optional(),
  annotations: z.record(z.string()).optional()
});

export const SLOSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  target: z.number().min(0).max(100),
  window: z.enum(['rolling', 'calendar']),
  windowDuration: z.number().positive(),
  indicator: z.object({
    good: z.string(),
    total: z.string()
  })
});