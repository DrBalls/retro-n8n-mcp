/**
 * Tool for querying SLO status
 */
import { z } from 'zod';
import { BaseTool } from '../base/Tool.js';
export class SLOStatusTool extends BaseTool {
    name = 'slo_status';
    description = 'Get current SLO status and error budget information';
    inputSchema = z.object({
        sloId: z.string().optional().describe('Specific SLO ID to query'),
        format: z.enum(['summary', 'detailed', 'report']).default('summary').describe('Output format'),
        reportPeriod: z.object({
            start: z.string().describe('Start time in ISO format'),
            end: z.string().describe('End time in ISO format')
        }).optional().describe('Period for error budget report')
    });
    async execute(params, context) {
        const input = this.validateInput(params);
        if (!context.monitoringService) {
            throw new Error('Monitoring service not configured');
        }
        const monitoring = context.monitoringService;
        let output;
        if (input.sloId) {
            // Query specific SLO
            const status = monitoring.slos.getStatus(input.sloId);
            if (!status) {
                throw new Error(`SLO ${input.sloId} not found`);
            }
            switch (input.format) {
                case 'report':
                    if (!input.reportPeriod) {
                        throw new Error('reportPeriod required for report format');
                    }
                    output = monitoring.slos.getErrorBudgetReport(input.sloId, new Date(input.reportPeriod.start), new Date(input.reportPeriod.end));
                    break;
                case 'detailed':
                    output = {
                        slo: {
                            id: status.slo.id,
                            name: status.slo.name,
                            description: status.slo.description,
                            target: status.slo.target,
                            window: status.slo.window,
                            windowDuration: status.slo.windowDuration
                        },
                        status: {
                            current: status.current,
                            errorBudget: status.errorBudget,
                            burnRate: status.burnRate,
                            isViolated: status.current < status.slo.target
                        },
                        prediction: status.prediction,
                        timestamp: new Date().toISOString()
                    };
                    break;
                case 'summary':
                default:
                    output = {
                        sloId: status.slo.id,
                        name: status.slo.name,
                        current: status.current,
                        target: status.slo.target,
                        errorBudgetRemaining: status.errorBudget,
                        status: status.current >= status.slo.target ? 'healthy' : 'violated'
                    };
                    break;
            }
        }
        else {
            // Query all SLOs
            const allStatuses = monitoring.slos.getAllStatuses();
            switch (input.format) {
                case 'detailed':
                    output = {
                        slos: allStatuses.map(status => ({
                            slo: {
                                id: status.slo.id,
                                name: status.slo.name,
                                target: status.slo.target
                            },
                            current: status.current,
                            errorBudget: status.errorBudget,
                            burnRate: status.burnRate,
                            prediction: status.prediction
                        })),
                        summary: {
                            total: allStatuses.length,
                            healthy: allStatuses.filter(s => s.current >= s.slo.target).length,
                            violated: allStatuses.filter(s => s.current < s.slo.target).length,
                            atRisk: allStatuses.filter(s => s.burnRate > 1.5).length
                        }
                    };
                    break;
                case 'summary':
                default:
                    output = {
                        slos: allStatuses.map(status => ({
                            id: status.slo.id,
                            name: status.slo.name,
                            current: status.current,
                            target: status.slo.target,
                            status: status.current >= status.slo.target ? 'healthy' : 'violated'
                        })),
                        timestamp: new Date().toISOString()
                    };
                    break;
            }
        }
        return {
            content: [{
                    type: 'text',
                    text: JSON.stringify(output, null, 2),
                    mimeType: 'application/json'
                }]
        };
    }
    getMetadata() {
        return {
            category: 'monitoring',
            subcategory: 'slo',
            isMutating: false,
            requiresAuth: false,
            rateLimit: { maxCalls: 100, windowMs: 60000 }
        };
    }
}
//# sourceMappingURL=SLOStatusTool.js.map