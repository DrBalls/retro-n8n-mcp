import { z } from 'zod';
import { BaseTool, IToolContext, IToolResponse, IToolMetadata } from '../base/Tool.js';
export declare class StopExecutionTool extends BaseTool {
    name: string;
    description: string;
    inputSchema: z.ZodObject<{
        executionId: z.ZodString;
        force: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        force: boolean;
        executionId: string;
    }, {
        executionId: string;
        force?: boolean | undefined;
    }>;
    execute(params: unknown, context: IToolContext): Promise<IToolResponse>;
    private calculateDuration;
    getMetadata(): IToolMetadata;
}
//# sourceMappingURL=StopExecutionTool.d.ts.map