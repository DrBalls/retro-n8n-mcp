import { z } from 'zod';
import { BaseTool, IToolContext, IToolResponse, IToolMetadata } from '../base/Tool.js';
export declare class RealtimeExecutionMonitorTool extends BaseTool {
    name: string;
    description: string;
    inputSchema: z.ZodObject<{
        executionId: z.ZodString;
        protocol: z.ZodOptional<z.ZodEnum<["websocket", "sse", "polling"]>>;
        duration: z.ZodDefault<z.ZodNumber>;
        includeProgress: z.ZodDefault<z.ZodBoolean>;
        updateInterval: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        executionId: string;
        duration: number;
        includeProgress: boolean;
        updateInterval: number;
        protocol?: "websocket" | "sse" | "polling" | undefined;
    }, {
        executionId: string;
        protocol?: "websocket" | "sse" | "polling" | undefined;
        duration?: number | undefined;
        includeProgress?: boolean | undefined;
        updateInterval?: number | undefined;
    }>;
    execute(params: unknown, context: IToolContext): Promise<IToolResponse>;
    /**
     * Generate execution summary
     */
    private generateSummary;
    /**
     * Extract node progress information
     */
    private extractNodeProgress;
    getMetadata(): IToolMetadata;
}
//# sourceMappingURL=RealtimeExecutionMonitorTool.d.ts.map