import { z } from 'zod';
import { BaseTool, IToolContext, IToolResponse, IToolMetadata } from '../base/Tool.js';
export declare class WatchDebugTool extends BaseTool {
    name: string;
    description: string;
    inputSchema: z.ZodObject<{
        sessionId: z.ZodString;
        action: z.ZodEnum<["add", "remove", "evaluate", "list"]>;
        expression: z.ZodOptional<z.ZodString>;
        watchId: z.ZodOptional<z.ZodString>;
        nodeId: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        sessionId: string;
        action: "list" | "add" | "remove" | "evaluate";
        nodeId?: string | undefined;
        expression?: string | undefined;
        watchId?: string | undefined;
    }, {
        sessionId: string;
        action: "list" | "add" | "remove" | "evaluate";
        nodeId?: string | undefined;
        expression?: string | undefined;
        watchId?: string | undefined;
    }>;
    execute(params: unknown, context: IToolContext): Promise<IToolResponse>;
    getMetadata(): IToolMetadata;
}
//# sourceMappingURL=WatchDebugTool.d.ts.map