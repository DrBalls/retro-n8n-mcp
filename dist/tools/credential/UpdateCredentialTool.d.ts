import { z } from 'zod';
import { BaseTool, IToolContext, IToolResponse, IToolMetadata } from '../base/Tool.js';
export declare class UpdateCredentialTool extends BaseTool {
    name: string;
    description: string;
    inputSchema: z.ZodObject<{
        id: z.ZodString;
        name: z.ZodOptional<z.ZodString>;
        data: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        nodesAccess: z.ZodOptional<z.ZodArray<z.ZodObject<{
            nodeType: z.ZodString;
            date: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            nodeType: string;
            date?: string | undefined;
        }, {
            nodeType: string;
            date?: string | undefined;
        }>, "many">>;
        tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name?: string | undefined;
        tags?: string[] | undefined;
        data?: Record<string, unknown> | undefined;
        nodesAccess?: {
            nodeType: string;
            date?: string | undefined;
        }[] | undefined;
    }, {
        id: string;
        name?: string | undefined;
        tags?: string[] | undefined;
        data?: Record<string, unknown> | undefined;
        nodesAccess?: {
            nodeType: string;
            date?: string | undefined;
        }[] | undefined;
    }>;
    execute(params: unknown, context: IToolContext): Promise<IToolResponse>;
    getMetadata(): IToolMetadata;
}
//# sourceMappingURL=UpdateCredentialTool.d.ts.map