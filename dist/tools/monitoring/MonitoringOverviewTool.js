/**
 * Tool for getting overall monitoring system status
 */
import { z } from 'zod';
import { BaseTool } from '../base/Tool.js';
export class MonitoringOverviewTool extends BaseTool {
    name = 'monitoring_overview';
    description = 'Get comprehensive overview of the monitoring system status';
    inputSchema = z.object({
        sections: z.array(z.enum(['status', 'health', 'metrics', 'alerts', 'slos', 'analytics', 'telemetry']))
            .optional()
            .describe('Specific sections to include in overview')
    });
    async execute(params, context) {
        const input = this.validateInput(params);
        if (!context.monitoringService) {
            throw new Error('Monitoring service not configured');
        }
        const monitoring = context.monitoringService;
        const sections = input.sections || ['status', 'health', 'metrics', 'alerts', 'slos'];
        const overview = {
            timestamp: new Date().toISOString()
        };
        // Status section
        if (sections.includes('status')) {
            const status = monitoring.getStatus();
            overview.status = {
                uptime: this.formatDuration(status.uptime),
                uptimeMs: status.uptime,
                metrics: status.metrics,
                activeAlerts: status.activeAlerts,
                sloViolations: status.sloViolations
            };
        }
        // Health section
        if (sections.includes('health')) {
            const overallHealth = await monitoring.health.getOverallHealth();
            const lastResults = monitoring.health.getLastResults();
            overview.health = {
                overall: overallHealth,
                checks: Array.from(lastResults.entries()).map(([name, result]) => ({
                    name,
                    status: result.status,
                    lastChecked: result.timestamp
                }))
            };
        }
        // Metrics section
        if (sections.includes('metrics')) {
            const metrics = monitoring.metrics.getAllMetrics();
            overview.metrics = {
                total: metrics.length,
                byType: {
                    counter: metrics.filter(m => m.type === 'counter').length,
                    gauge: metrics.filter(m => m.type === 'gauge').length,
                    histogram: metrics.filter(m => m.type === 'histogram').length,
                    summary: metrics.filter(m => m.type === 'summary').length
                },
                topMetrics: metrics.slice(0, 5).map(m => ({
                    name: m.name,
                    type: m.type,
                    help: m.help
                }))
            };
        }
        // Alerts section
        if (sections.includes('alerts')) {
            const alertStats = monitoring.alerts.getStats();
            overview.alerts = alertStats;
        }
        // SLOs section
        if (sections.includes('slos')) {
            const sloStatuses = monitoring.slos.getAllStatuses();
            overview.slos = {
                total: sloStatuses.length,
                healthy: sloStatuses.filter(s => s.current >= s.slo.target).length,
                violated: sloStatuses.filter(s => s.current < s.slo.target).length,
                atRisk: sloStatuses.filter(s => s.burnRate > 1.5).length,
                details: sloStatuses.map(s => ({
                    id: s.slo.id,
                    name: s.slo.name,
                    current: Math.round(s.current * 100) / 100,
                    target: s.slo.target,
                    errorBudget: Math.round(s.errorBudget * 100) / 100
                }))
            };
        }
        // Analytics section
        if (sections.includes('analytics')) {
            const analyticsStats = monitoring.analytics.getEventStats();
            overview.analytics = {
                summary: analyticsStats['summary'],
                topEvents: analyticsStats['topEvents'].slice(0, 5)
            };
        }
        // Telemetry section
        if (sections.includes('telemetry')) {
            const telemetryStats = monitoring.telemetry.getStats();
            overview.telemetry = telemetryStats;
        }
        return {
            content: [{
                    type: 'text',
                    text: JSON.stringify(overview, null, 2),
                    mimeType: 'application/json'
                }]
        };
    }
    formatDuration(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        if (days > 0) {
            return `${days}d ${hours % 24}h`;
        }
        else if (hours > 0) {
            return `${hours}h ${minutes % 60}m`;
        }
        else if (minutes > 0) {
            return `${minutes}m ${seconds % 60}s`;
        }
        else {
            return `${seconds}s`;
        }
    }
    getMetadata() {
        return {
            category: 'monitoring',
            subcategory: 'overview',
            isMutating: false,
            requiresAuth: false,
            rateLimit: { requests: 100, window: 60 }
        };
    }
}
//# sourceMappingURL=MonitoringOverviewTool.js.map