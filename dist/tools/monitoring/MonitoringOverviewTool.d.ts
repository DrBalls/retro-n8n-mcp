/**
 * Tool for getting overall monitoring system status
 */
import { z } from 'zod';
import { BaseTool, IToolContext, IToolResponse } from '../base/Tool.js';
export declare class MonitoringOverviewTool extends BaseTool {
    name: string;
    description: string;
    inputSchema: z.ZodObject<{
        sections: z.ZodOptional<z.ZodArray<z.ZodEnum<["status", "health", "metrics", "alerts", "slos", "analytics", "telemetry"]>, "many">>;
    }, "strip", z.ZodTypeAny, {
        sections?: ("status" | "health" | "metrics" | "analytics" | "alerts" | "slos" | "telemetry")[] | undefined;
    }, {
        sections?: ("status" | "health" | "metrics" | "analytics" | "alerts" | "slos" | "telemetry")[] | undefined;
    }>;
    execute(params: unknown, context: IToolContext): Promise<IToolResponse>;
    private formatDuration;
    getMetadata(): {
        category: "monitoring";
        subcategory: string;
        isMutating: boolean;
        requiresAuth: boolean;
        rateLimit: {
            requests: number;
            window: number;
        };
    };
}
//# sourceMappingURL=MonitoringOverviewTool.d.ts.map