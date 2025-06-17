/**
 * Tool for querying analytics data
 */
import { z } from 'zod';
import { BaseTool, IToolContext, IToolResponse } from '../base/Tool.js';
export declare class AnalyticsQueryTool extends BaseTool {
    name: string;
    description: string;
    inputSchema: z.ZodObject<{
        query: z.ZodEnum<["stats", "events", "user_journey", "session_journey"]>;
        filters: z.ZodOptional<z.ZodObject<{
            event: z.ZodOptional<z.ZodString>;
            userId: z.ZodOptional<z.ZodString>;
            sessionId: z.ZodOptional<z.ZodString>;
            start: z.ZodOptional<z.ZodString>;
            end: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            start?: string | undefined;
            end?: string | undefined;
            event?: string | undefined;
            userId?: string | undefined;
            sessionId?: string | undefined;
        }, {
            start?: string | undefined;
            end?: string | undefined;
            event?: string | undefined;
            userId?: string | undefined;
            sessionId?: string | undefined;
        }>>;
        limit: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        limit: number;
        query: "stats" | "events" | "user_journey" | "session_journey";
        filters?: {
            start?: string | undefined;
            end?: string | undefined;
            event?: string | undefined;
            userId?: string | undefined;
            sessionId?: string | undefined;
        } | undefined;
    }, {
        query: "stats" | "events" | "user_journey" | "session_journey";
        limit?: number | undefined;
        filters?: {
            start?: string | undefined;
            end?: string | undefined;
            event?: string | undefined;
            userId?: string | undefined;
            sessionId?: string | undefined;
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
//# sourceMappingURL=AnalyticsQueryTool.d.ts.map