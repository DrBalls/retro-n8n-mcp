import { z } from 'zod';
import { BaseTool, IToolContext, IToolResponse, IToolMetadata } from '../base/Tool.js';
export declare class InspectDebugTool extends BaseTool {
    name: string;
    description: string;
    inputSchema: z.ZodObject<{
        sessionId: z.ZodString;
        inspectType: z.ZodDefault<z.ZodEnum<["variable", "node", "timeline", "state", "all"]>>;
        variableName: z.ZodOptional<z.ZodString>;
        nodeId: z.ZodOptional<z.ZodString>;
        timeRange: z.ZodOptional<z.ZodObject<{
            start: z.ZodOptional<z.ZodString>;
            end: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            start?: string | undefined;
            end?: string | undefined;
        }, {
            start?: string | undefined;
            end?: string | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        sessionId: string;
        inspectType: "node" | "all" | "state" | "timeline" | "variable";
        nodeId?: string | undefined;
        variableName?: string | undefined;
        timeRange?: {
            start?: string | undefined;
            end?: string | undefined;
        } | undefined;
    }, {
        sessionId: string;
        nodeId?: string | undefined;
        inspectType?: "node" | "all" | "state" | "timeline" | "variable" | undefined;
        variableName?: string | undefined;
        timeRange?: {
            start?: string | undefined;
            end?: string | undefined;
        } | undefined;
    }>;
    execute(params: unknown, context: IToolContext): Promise<IToolResponse>;
    getMetadata(): IToolMetadata;
}
//# sourceMappingURL=InspectDebugTool.d.ts.map