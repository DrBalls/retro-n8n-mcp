import { z } from 'zod';
import { BaseTool, IToolContext, IToolResponse, IToolMetadata } from '../base/Tool.js';
export declare class MonitorExecutionTool extends BaseTool {
    name: string;
    description: string;
    inputSchema: z.ZodObject<{
        executionId: z.ZodString;
        pollInterval: z.ZodDefault<z.ZodNumber>;
        maxDuration: z.ZodDefault<z.ZodNumber>;
        includeNodeProgress: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        executionId: string;
        pollInterval: number;
        maxDuration: number;
        includeNodeProgress: boolean;
    }, {
        executionId: string;
        pollInterval?: number | undefined;
        maxDuration?: number | undefined;
        includeNodeProgress?: boolean | undefined;
    }>;
    execute(params: unknown, context: IToolContext): Promise<IToolResponse>;
    private getExecutionSummary;
    private calculateDuration;
    getMetadata(): IToolMetadata;
}
//# sourceMappingURL=MonitorExecutionTool.d.ts.map