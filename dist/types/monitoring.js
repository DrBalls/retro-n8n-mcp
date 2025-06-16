/**
 * Type definitions for monitoring and analytics system
 */
import { z } from 'zod';
/**
 * Health check status
 */
export var HealthStatus;
(function (HealthStatus) {
    HealthStatus["HEALTHY"] = "healthy";
    HealthStatus["DEGRADED"] = "degraded";
    HealthStatus["UNHEALTHY"] = "unhealthy";
})(HealthStatus || (HealthStatus = {}));
/**
 * Alert severity levels
 */
export var AlertSeverity;
(function (AlertSeverity) {
    AlertSeverity["INFO"] = "info";
    AlertSeverity["WARNING"] = "warning";
    AlertSeverity["ERROR"] = "error";
    AlertSeverity["CRITICAL"] = "critical";
})(AlertSeverity || (AlertSeverity = {}));
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
//# sourceMappingURL=monitoring.js.map