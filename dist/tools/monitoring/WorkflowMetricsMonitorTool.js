import { z } from 'zod';
import { BaseTool } from '../base/Tool.js';
import { RealtimeMonitoringService } from '../../services/RealtimeMonitoringService.js';
export class WorkflowMetricsMonitorTool extends BaseTool {
    name = 'monitor_workflow_metrics';
    description = 'Monitor real-time performance metrics and statistics for workflows';
    inputSchema = z.object({
        workflowId: z.string()
            .optional()
            .describe('Specific workflow ID to monitor (omit for all workflows)'),
        duration: z.number()
            .min(1000)
            .max(3600000)
            .default(60000)
            .describe('Monitoring duration in milliseconds'),
        interval: z.number()
            .min(5000)
            .max(300000)
            .default(30000)
            .describe('Metrics update interval in milliseconds'),
        includeHistorical: z.boolean()
            .default(true)
            .describe('Include historical execution data in initial metrics')
    });
    async execute(params, context) {
        const input = this.validateInput(params);
        if (!context.apiClient) {
            throw new Error('n8n API client not configured');
        }
        // Initialize monitoring service if not provided
        let monitoringService;
        let shouldCleanup = false;
        if (context.monitoringService) {
            monitoringService = context.monitoringService;
        }
        else {
            shouldCleanup = true;
            monitoringService = new RealtimeMonitoringService({
                apiClient: context.apiClient,
                protocol: 'polling'
            });
            await monitoringService.start();
        }
        const workflowIds = new Set();
        try {
            const metricsHistory = [];
            const startTime = Date.now();
            // Determine which workflows to monitor
            if (input.workflowId) {
                workflowIds.add(input.workflowId);
            }
            else {
                // Get all active workflows
                const workflows = await context.apiClient.request('GET', '/workflows', {
                    params: { active: true, limit: 100 }
                });
                workflows.forEach((w) => workflowIds.add(w.id));
            }
            // Set up monitoring for each workflow
            const monitoringPromises = Array.from(workflowIds).map(async (workflowId) => {
                try {
                    await monitoringService.monitorWorkflowMetrics(workflowId, {
                        interval: input.interval,
                        includePastExecutions: input.includeHistorical
                    });
                }
                catch (error) {
                    console.error('Failed to start monitoring for workflow', { workflowId, error });
                }
            });
            await Promise.all(monitoringPromises);
            // Collect metrics updates
            await new Promise((resolve) => {
                const timeout = setTimeout(() => {
                    resolve();
                }, input.duration);
                const metricsHandler = (metrics) => {
                    metricsHistory.push({
                        timestamp: new Date().toISOString(),
                        elapsedTime: Date.now() - startTime,
                        ...metrics
                    });
                };
                monitoringService.on('workflow:metrics:update', metricsHandler);
                // Clean up on completion
                const cleanup = () => {
                    clearTimeout(timeout);
                    monitoringService.off('workflow:metrics:update', metricsHandler);
                    resolve();
                };
                // Also resolve if monitoring stops
                monitoringService.once('stopped', cleanup);
            });
            // Get final metrics for all workflows
            const finalMetrics = await Promise.all(Array.from(workflowIds).map(async (workflowId) => {
                const metrics = await monitoringService.getWorkflowMetrics(workflowId);
                return metrics || { workflowId, error: 'No metrics available' };
            }));
            // Generate comprehensive report
            const report = this.generateMetricsReport(Array.from(workflowIds), metricsHistory, finalMetrics, Date.now() - startTime);
            return {
                content: [{
                        type: 'text',
                        text: JSON.stringify(report, null, 2),
                        mimeType: 'application/json'
                    }]
            };
        }
        finally {
            // Stop monitoring
            if (shouldCleanup) {
                monitoringService.stop();
            }
            else {
                // Just stop monitoring the specific workflows
                workflowIds.forEach(id => {
                    const timer = monitoringService.pollingTimers.get(`metrics:${id}`);
                    if (timer) {
                        clearInterval(timer);
                        monitoringService.pollingTimers.delete(`metrics:${id}`);
                    }
                });
            }
        }
    }
    /**
     * Generate comprehensive metrics report
     */
    generateMetricsReport(workflowIds, metricsHistory, finalMetrics, duration) {
        const report = {
            timestamp: new Date().toISOString(),
            monitoringDuration: duration,
            workflowCount: workflowIds.length,
            totalUpdates: metricsHistory.length,
            workflows: {}
        };
        // Organize metrics by workflow
        workflowIds.forEach(workflowId => {
            const workflowHistory = metricsHistory.filter(m => m.workflowId === workflowId);
            const finalMetric = finalMetrics.find(m => m.workflowId === workflowId);
            report.workflows[workflowId] = {
                updateCount: workflowHistory.length,
                currentMetrics: finalMetric,
                history: workflowHistory,
                trends: this.calculateTrends(workflowHistory)
            };
        });
        // Calculate aggregate statistics
        report.aggregateStats = this.calculateAggregateStats(finalMetrics);
        // Identify top performers and issues
        report.insights = this.generateInsights(finalMetrics, metricsHistory);
        return report;
    }
    /**
     * Calculate trends from metrics history
     */
    calculateTrends(history) {
        if (history.length < 2) {
            return { dataPoints: history.length, trendsAvailable: false };
        }
        const trends = {
            dataPoints: history.length,
            trendsAvailable: true
        };
        // Execution count trend
        const executionCounts = history.map(h => h.executionCount);
        trends.executionCountTrend = this.calculateTrendDirection(executionCounts);
        // Success rate trend
        const successRates = history.map(h => h.successRate);
        trends.successRateTrend = this.calculateTrendDirection(successRates);
        // Average duration trend
        const durations = history.map(h => h.averageDuration);
        trends.durationTrend = this.calculateTrendDirection(durations);
        // Active executions over time
        const activeExecutions = history.map(h => h.activeExecutions || 0);
        trends.maxConcurrentExecutions = Math.max(...activeExecutions);
        trends.averageConcurrentExecutions =
            activeExecutions.reduce((a, b) => a + b, 0) / activeExecutions.length;
        return trends;
    }
    /**
     * Calculate trend direction
     */
    calculateTrendDirection(values) {
        if (values.length < 2)
            return 'stable';
        const firstHalf = values.slice(0, Math.floor(values.length / 2));
        const secondHalf = values.slice(Math.floor(values.length / 2));
        const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
        const changePct = ((secondAvg - firstAvg) / firstAvg) * 100;
        if (changePct > 10)
            return 'increasing';
        if (changePct < -10)
            return 'decreasing';
        return 'stable';
    }
    /**
     * Calculate aggregate statistics
     */
    calculateAggregateStats(metrics) {
        const validMetrics = metrics.filter(m => !m.error);
        if (validMetrics.length === 0) {
            return { error: 'No valid metrics available' };
        }
        const totalExecutions = validMetrics.reduce((sum, m) => sum + (m.executionCount || 0), 0);
        const totalSuccess = validMetrics.reduce((sum, m) => sum + Math.round((m.executionCount || 0) * (m.successRate || 0) / 100), 0);
        return {
            totalWorkflows: validMetrics.length,
            totalExecutions,
            totalSuccess,
            overallSuccessRate: totalExecutions > 0 ? (totalSuccess / totalExecutions) * 100 : 0,
            averageExecutionsPerWorkflow: totalExecutions / validMetrics.length,
            averageDurationAcrossWorkflows: validMetrics.reduce((sum, m) => sum + (m.averageDuration || 0), 0) / validMetrics.length,
            totalActiveExecutions: validMetrics.reduce((sum, m) => sum + (m.activeExecutions || 0), 0)
        };
    }
    /**
     * Generate insights from metrics
     */
    generateInsights(finalMetrics, history) {
        const validMetrics = finalMetrics.filter(m => !m.error);
        if (validMetrics.length === 0) {
            return { error: 'No metrics available for insights' };
        }
        const insights = {
            topPerformers: [],
            needsAttention: [],
            recommendations: []
        };
        // Sort by success rate
        const bySuccessRate = [...validMetrics].sort((a, b) => (b.successRate || 0) - (a.successRate || 0));
        // Top performers
        insights.topPerformers = bySuccessRate
            .slice(0, 3)
            .filter(m => m.successRate >= 90)
            .map(m => ({
            workflowId: m.workflowId,
            successRate: m.successRate,
            executionCount: m.executionCount
        }));
        // Needs attention (low success rate or high failure count)
        insights.needsAttention = bySuccessRate
            .slice(-3)
            .filter(m => m.successRate < 70)
            .map(m => ({
            workflowId: m.workflowId,
            successRate: m.successRate,
            failureCount: Math.round(m.executionCount * (100 - m.successRate) / 100)
        }));
        // Performance issues (slow executions)
        const byDuration = [...validMetrics].sort((a, b) => (b.averageDuration || 0) - (a.averageDuration || 0));
        const slowWorkflows = byDuration
            .slice(0, 3)
            .filter(m => m.averageDuration > 30000) // Over 30 seconds
            .map(m => ({
            workflowId: m.workflowId,
            averageDuration: m.averageDuration,
            humanReadable: this.formatDuration(m.averageDuration)
        }));
        if (slowWorkflows.length > 0) {
            insights.performanceIssues = slowWorkflows;
        }
        // Generate recommendations
        if (insights.needsAttention.length > 0) {
            insights.recommendations.push('Review workflows with low success rates for error patterns');
        }
        if (slowWorkflows.length > 0) {
            insights.recommendations.push('Optimize slow-running workflows by reviewing node configurations');
        }
        const highVolumeWorkflows = validMetrics.filter(m => m.executionCount > 100);
        if (highVolumeWorkflows.length > 0) {
            insights.recommendations.push('Consider implementing caching or batching for high-volume workflows');
        }
        return insights;
    }
    /**
     * Format duration to human-readable string
     */
    formatDuration(ms) {
        if (ms < 1000)
            return `${ms}ms`;
        if (ms < 60000)
            return `${(ms / 1000).toFixed(1)}s`;
        return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
    }
    getMetadata() {
        return {
            category: 'monitoring',
            isMutating: false,
            requirements: ['n8n API access'],
            tags: ['workflow', 'metrics', 'monitoring', 'statistics', 'performance']
        };
    }
}
//# sourceMappingURL=WorkflowMetricsMonitorTool.js.map