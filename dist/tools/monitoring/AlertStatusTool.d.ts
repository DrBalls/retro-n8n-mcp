/**
 * Tool for managing alerts
 */
import { z } from 'zod';
import { BaseTool, IToolContext, IToolResponse } from '../base/Tool.js';
export declare class AlertStatusTool extends BaseTool {
    name: string;
    description: string;
    inputSchema: z.ZodObject<{
        action: z.ZodEnum<["list", "acknowledge", "silence", "stats"]>;
        alertId: z.ZodOptional<z.ZodString>;
        duration: z.ZodOptional<z.ZodNumber>;
        reason: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        action: "list" | "stats" | "acknowledge" | "silence";
        reason?: string | undefined;
        duration?: number | undefined;
        alertId?: string | undefined;
    }, {
        action: "list" | "stats" | "acknowledge" | "silence";
        reason?: string | undefined;
        duration?: number | undefined;
        alertId?: string | undefined;
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
//# sourceMappingURL=AlertStatusTool.d.ts.map