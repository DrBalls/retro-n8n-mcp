import { z } from 'zod';
import { BaseTool, IToolContext, IToolResponse, IToolMetadata } from '../base/Tool.js';
export declare class ReplayExecutionTool extends BaseTool {
    name: string;
    description: string;
    inputSchema: z.ZodObject<{
        executionId: z.ZodString;
        modifyData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        waitForCompletion: z.ZodDefault<z.ZodBoolean>;
        timeout: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        waitForCompletion: boolean;
        executionId: string;
        timeout?: number | undefined;
        modifyData?: Record<string, unknown> | undefined;
    }, {
        executionId: string;
        timeout?: number | undefined;
        waitForCompletion?: boolean | undefined;
        modifyData?: Record<string, unknown> | undefined;
    }>;
    execute(params: unknown, context: IToolContext): Promise<IToolResponse>;
    private calculateDuration;
    getMetadata(): IToolMetadata;
}
//# sourceMappingURL=ReplayExecutionTool.d.ts.map