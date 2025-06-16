import { z } from 'zod';
import { BaseTool, IToolContext, IToolResponse, IToolMetadata } from '../base/Tool.js';
import { DebugSessionManager } from '../../services/DebugSessionManager.js';
declare global {
    var debugSessionManager: DebugSessionManager | undefined;
}
export declare class StartDebugSessionTool extends BaseTool {
    name: string;
    description: string;
    inputSchema: z.ZodObject<{
        workflowId: z.ZodString;
        executionId: z.ZodOptional<z.ZodString>;
        executionData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        breakpoints: z.ZodOptional<z.ZodArray<z.ZodObject<{
            nodeId: z.ZodString;
            condition: z.ZodOptional<z.ZodString>;
            enabled: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            enabled: boolean;
            nodeId: string;
            condition?: string | undefined;
        }, {
            nodeId: string;
            enabled?: boolean | undefined;
            condition?: string | undefined;
        }>, "many">>;
        watchExpressions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        workflowId: string;
        executionData?: Record<string, any> | undefined;
        executionId?: string | undefined;
        breakpoints?: {
            enabled: boolean;
            nodeId: string;
            condition?: string | undefined;
        }[] | undefined;
        watchExpressions?: string[] | undefined;
    }, {
        workflowId: string;
        executionData?: Record<string, any> | undefined;
        executionId?: string | undefined;
        breakpoints?: {
            nodeId: string;
            enabled?: boolean | undefined;
            condition?: string | undefined;
        }[] | undefined;
        watchExpressions?: string[] | undefined;
    }>;
    execute(params: unknown, context: IToolContext): Promise<IToolResponse>;
    getMetadata(): IToolMetadata;
}
//# sourceMappingURL=StartDebugSessionTool.d.ts.map