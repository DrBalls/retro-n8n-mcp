import { z } from 'zod';
import { BaseTool, IToolContext, IToolResponse, IToolMetadata } from '../base/Tool.js';
export declare class StepDebugTool extends BaseTool {
    name: string;
    description: string;
    inputSchema: z.ZodObject<{
        sessionId: z.ZodString;
        stepType: z.ZodEnum<["over", "into", "out"]>;
    }, "strip", z.ZodTypeAny, {
        sessionId: string;
        stepType: "over" | "into" | "out";
    }, {
        sessionId: string;
        stepType: "over" | "into" | "out";
    }>;
    execute(params: unknown, context: IToolContext): Promise<IToolResponse>;
    getMetadata(): IToolMetadata;
}
//# sourceMappingURL=StepDebugTool.d.ts.map