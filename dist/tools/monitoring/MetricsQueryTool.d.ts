/**
 * Tool for querying metrics data
 */
import { z } from 'zod';
import { BaseTool, IToolContext, IToolResponse } from '../base/Tool.js';
export declare class MetricsQueryTool extends BaseTool {
    name: string;
    description: string;
    inputSchema: z.ZodObject<{
        metricNames: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        timeRange: z.ZodOptional<z.ZodObject<{
            start: z.ZodString;
            end: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            start: string;
            end: string;
        }, {
            start: string;
            end: string;
        }>>;
        aggregation: z.ZodOptional<z.ZodEnum<["sum", "avg", "min", "max", "count"]>>;
        groupBy: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        format: z.ZodDefault<z.ZodEnum<["json", "prometheus", "table"]>>;
    }, "strip", z.ZodTypeAny, {
        format: "json" | "prometheus" | "table";
        timeRange?: {
            start: string;
            end: string;
        } | undefined;
        metricNames?: string[] | undefined;
        aggregation?: "min" | "max" | "count" | "sum" | "avg" | undefined;
        groupBy?: string[] | undefined;
    }, {
        timeRange?: {
            start: string;
            end: string;
        } | undefined;
        metricNames?: string[] | undefined;
        aggregation?: "min" | "max" | "count" | "sum" | "avg" | undefined;
        groupBy?: string[] | undefined;
        format?: "json" | "prometheus" | "table" | undefined;
    }>;
    execute(params: unknown, context: IToolContext): Promise<IToolResponse>;
    private formatAsJson;
    private formatAsTable;
    private getMetricValue;
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
//# sourceMappingURL=MetricsQueryTool.d.ts.map