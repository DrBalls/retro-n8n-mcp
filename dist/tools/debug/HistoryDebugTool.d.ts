import { z } from 'zod';
import { BaseTool, IToolContext, IToolResponse, IToolMetadata } from '../base/Tool.js';
export declare class HistoryDebugTool extends BaseTool {
    name: string;
    description: string;
    inputSchema: z.ZodObject<{
        limit: z.ZodDefault<z.ZodNumber>;
        workflowId: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        limit: number;
        workflowId?: string | undefined;
    }, {
        limit?: number | undefined;
        workflowId?: string | undefined;
    }>;
    execute(params: unknown, context: IToolContext): Promise<IToolResponse>;
    getMetadata(): IToolMetadata;
}
//# sourceMappingURL=HistoryDebugTool.d.ts.map