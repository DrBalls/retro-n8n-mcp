import { z } from 'zod';
import { BaseTool, IToolContext, IToolResponse, IToolMetadata } from '../base/Tool.js';
export declare class WorkflowMetricsMonitorTool extends BaseTool {
    name: string;
    description: string;
    inputSchema: z.ZodObject<{
        workflowId: z.ZodOptional<z.ZodString>;
        duration: z.ZodDefault<z.ZodNumber>;
        interval: z.ZodDefault<z.ZodNumber>;
        includeHistorical: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        interval: number;
        duration: number;
        includeHistorical: boolean;
        workflowId?: string | undefined;
    }, {
        workflowId?: string | undefined;
        interval?: number | undefined;
        duration?: number | undefined;
        includeHistorical?: boolean | undefined;
    }>;
    execute(params: unknown, context: IToolContext): Promise<IToolResponse>;
    /**
     * Generate comprehensive metrics report
     */
    private generateMetricsReport;
    /**
     * Calculate trends from metrics history
     */
    private calculateTrends;
    /**
     * Calculate trend direction
     */
    private calculateTrendDirection;
    /**
     * Calculate aggregate statistics
     */
    private calculateAggregateStats;
    /**
     * Generate insights from metrics
     */
    private generateInsights;
    /**
     * Format duration to human-readable string
     */
    private formatDuration;
    getMetadata(): IToolMetadata;
}
//# sourceMappingURL=WorkflowMetricsMonitorTool.d.ts.map