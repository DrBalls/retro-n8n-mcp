/**
 * Tool for querying SLO status
 */
import { z } from 'zod';
import { BaseTool, IToolContext, IToolResponse } from '../base/Tool.js';
export declare class SLOStatusTool extends BaseTool {
    name: string;
    description: string;
    inputSchema: z.ZodObject<{
        sloId: z.ZodOptional<z.ZodString>;
        format: z.ZodDefault<z.ZodEnum<["summary", "detailed", "report"]>>;
        reportPeriod: z.ZodOptional<z.ZodObject<{
            start: z.ZodString;
            end: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            start: string;
            end: string;
        }, {
            start: string;
            end: string;
        }>>;
    }, "strip", z.ZodTypeAny, {
        format: "summary" | "detailed" | "report";
        sloId?: string | undefined;
        reportPeriod?: {
            start: string;
            end: string;
        } | undefined;
    }, {
        sloId?: string | undefined;
        format?: "summary" | "detailed" | "report" | undefined;
        reportPeriod?: {
            start: string;
            end: string;
        } | undefined;
    }>;
    execute(params: unknown, context: IToolContext): Promise<IToolResponse>;
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
//# sourceMappingURL=SLOStatusTool.d.ts.map