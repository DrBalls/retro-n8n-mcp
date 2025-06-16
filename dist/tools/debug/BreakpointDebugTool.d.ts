import { z } from 'zod';
import { BaseTool, IToolContext, IToolResponse, IToolMetadata } from '../base/Tool.js';
export declare class BreakpointDebugTool extends BaseTool {
    name: string;
    description: string;
    inputSchema: z.ZodObject<{
        sessionId: z.ZodString;
        action: z.ZodEnum<["add", "remove", "enable", "disable", "list"]>;
        breakpointId: z.ZodOptional<z.ZodString>;
        nodeId: z.ZodOptional<z.ZodString>;
        condition: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        sessionId: string;
        action: "list" | "add" | "remove" | "enable" | "disable";
        condition?: string | undefined;
        nodeId?: string | undefined;
        breakpointId?: string | undefined;
    }, {
        sessionId: string;
        action: "list" | "add" | "remove" | "enable" | "disable";
        condition?: string | undefined;
        nodeId?: string | undefined;
        breakpointId?: string | undefined;
    }>;
    execute(params: unknown, context: IToolContext): Promise<IToolResponse>;
    getMetadata(): IToolMetadata;
}
//# sourceMappingURL=BreakpointDebugTool.d.ts.map