import { z } from 'zod';
import { BaseTool, IToolContext, IToolResponse, IToolMetadata } from '../base/Tool.js';
export declare class GetExecutionTool extends BaseTool {
    name: string;
    description: string;
    inputSchema: z.ZodObject<{
        executionId: z.ZodString;
        includeData: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        executionId: string;
        includeData: boolean;
    }, {
        executionId: string;
        includeData?: boolean | undefined;
    }>;
    execute(params: unknown, context: IToolContext): Promise<IToolResponse>;
    getMetadata(): IToolMetadata;
}
//# sourceMappingURL=GetExecutionTool.d.ts.map