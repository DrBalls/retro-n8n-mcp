import { z } from 'zod';
import { BaseTool, IToolContext, IToolResponse, IToolMetadata } from '../base/Tool.js';
export declare class StopDebugTool extends BaseTool {
    name: string;
    description: string;
    inputSchema: z.ZodObject<{
        sessionId: z.ZodString;
        stopExecution: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        sessionId: string;
        stopExecution: boolean;
    }, {
        sessionId: string;
        stopExecution?: boolean | undefined;
    }>;
    execute(params: unknown, context: IToolContext): Promise<IToolResponse>;
    getMetadata(): IToolMetadata;
}
//# sourceMappingURL=StopDebugTool.d.ts.map