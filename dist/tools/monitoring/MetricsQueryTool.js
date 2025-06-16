/**
 * Tool for querying metrics data
 */
import { z } from 'zod';
import { BaseTool } from '../base/Tool.js';
export class MetricsQueryTool extends BaseTool {
    name = 'metrics_query';
    description = 'Query metrics data for dashboard and analytics';
    inputSchema = z.object({
        metricNames: z.array(z.string()).optional().describe('Specific metric names to query'),
        timeRange: z.object({
            start: z.string().describe('Start time in ISO format'),
            end: z.string().describe('End time in ISO format')
        }).optional().describe('Time range for the query'),
        aggregation: z.enum(['sum', 'avg', 'min', 'max', 'count']).optional().describe('Aggregation method'),
        groupBy: z.array(z.string()).optional().describe('Labels to group by'),
        format: z.enum(['json', 'prometheus', 'table']).default('json').describe('Output format')
    });
    async execute(params, context) {
        const input = this.validateInput(params);
        if (!context.monitoringService) {
            throw new Error('Monitoring service not configured');
        }
        const monitoring = context.monitoringService;
        const metrics = monitoring.metrics.getAllMetrics();
        // Filter by metric names if specified
        let filteredMetrics = metrics;
        if (input.metricNames && input.metricNames.length > 0) {
            filteredMetrics = metrics.filter(m => input.metricNames.includes(m.name));
        }
        // Format based on requested output
        let output;
        switch (input.format) {
            case 'prometheus':
                output = monitoring.metrics.exportPrometheus();
                break;
            case 'table':
                output = this.formatAsTable(filteredMetrics);
                break;
            case 'json':
            default:
                output = this.formatAsJson(filteredMetrics);
                break;
        }
        return {
            content: [{
                    type: 'text',
                    text: typeof output === 'string' ? output : JSON.stringify(output, null, 2),
                    mimeType: input.format === 'prometheus' ? 'text/plain' : 'application/json'
                }]
        };
    }
    formatAsJson(metrics) {
        return {
            timestamp: new Date().toISOString(),
            metrics: metrics.map(metric => ({
                name: metric.name,
                type: metric.type,
                help: metric.help,
                value: this.getMetricValue(metric),
                labels: metric.labels || [],
                unit: metric.unit
            }))
        };
    }
    formatAsTable(metrics) {
        const rows = metrics.map(metric => ({
            name: metric.name,
            type: metric.type,
            value: this.getMetricValue(metric),
            unit: metric.unit || '-'
        }));
        return {
            headers: ['Metric Name', 'Type', 'Value', 'Unit'],
            rows
        };
    }
    getMetricValue(metric) {
        switch (metric.type) {
            case 'counter':
            case 'gauge':
                return metric.value;
            case 'histogram':
                return {
                    p50: metric.getPercentile ? metric.getPercentile(50) : 0,
                    p90: metric.getPercentile ? metric.getPercentile(90) : 0,
                    p99: metric.getPercentile ? metric.getPercentile(99) : 0
                };
            case 'summary':
                return {
                    quantiles: metric.quantiles?.map((q) => ({
                        quantile: q,
                        value: metric.getQuantile ? metric.getQuantile(q) : 0
                    }))
                };
            default:
                return null;
        }
    }
    getMetadata() {
        return {
            category: 'monitoring',
            subcategory: 'metrics',
            isMutating: false,
            requiresAuth: false,
            rateLimit: { maxCalls: 100, windowMs: 60000 }
        };
    }
}
//# sourceMappingURL=MetricsQueryTool.js.map