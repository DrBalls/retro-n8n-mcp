import { z } from 'zod';
import { BaseTool, IToolContext, IToolResponse, IToolMetadata } from '../base/Tool.js';
export declare class ListExecutionsTool extends BaseTool {
    name: string;
    description: string;
    inputSchema: z.ZodObject<{
        workflowId: z.ZodOptional<z.ZodString>;
        status: z.ZodOptional<z.ZodEnum<["canceled", "crashed", "error", "new", "running", "success", "unknown", "waiting"]>>;
        limit: z.ZodDefault<z.ZodNumber>;
        cursor: z.ZodOptional<z.ZodString>;
        startDate: z.ZodOptional<z.ZodString>;
        endDate: z.ZodOptional<z.ZodString>;
        includeData: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        limit: number;
        includeData: boolean;
        status?: "success" | "error" | "unknown" | "canceled" | "crashed" | "new" | "running" | "waiting" | undefined;
        workflowId?: string | undefined;
        cursor?: string | undefined;
        startDate?: string | undefined;
        endDate?: string | undefined;
    }, {
        status?: "success" | "error" | "unknown" | "canceled" | "crashed" | "new" | "running" | "waiting" | undefined;
        workflowId?: string | undefined;
        limit?: number | undefined;
        cursor?: string | undefined;
        includeData?: boolean | undefined;
        startDate?: string | undefined;
        endDate?: string | undefined;
    }>;
    execute(params: unknown, context: IToolContext): Promise<IToolResponse>;
    private calculateDuration;
    getMetadata(): IToolMetadata;
}
//# sourceMappingURL=ListExecutionsTool.d.ts.map