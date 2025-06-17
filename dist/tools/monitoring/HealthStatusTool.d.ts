/**
 * Tool for getting health check status
 */
import { z } from 'zod';
import { BaseTool, IToolContext, IToolResponse } from '../base/Tool.js';
export declare class HealthStatusTool extends BaseTool {
    name: string;
    description: string;
    inputSchema: z.ZodObject<{
        checks: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        format: z.ZodDefault<z.ZodEnum<["json", "summary", "detailed"]>>;
    }, "strip", z.ZodTypeAny, {
        format: "json" | "summary" | "detailed";
        checks?: string[] | undefined;
    }, {
        format?: "json" | "summary" | "detailed" | undefined;
        checks?: string[] | undefined;
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
//# sourceMappingURL=HealthStatusTool.d.ts.map