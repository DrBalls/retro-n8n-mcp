import { z } from 'zod';
import { BaseTool, IToolContext, IToolResponse, IToolMetadata } from '../base/Tool.js';
export declare class CreateCredentialTool extends BaseTool {
    name: string;
    description: string;
    inputSchema: z.ZodObject<{
        name: z.ZodString;
        type: z.ZodString;
        data: z.ZodRecord<z.ZodString, z.ZodUnknown>;
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
        type: string;
        name: string;
        data: Record<string, unknown>;
        tags?: string[] | undefined;
        nodesAccess?: {
            nodeType: string;
            date?: string | undefined;
        }[] | undefined;
    }, {
        type: string;
        name: string;
        data: Record<string, unknown>;
        tags?: string[] | undefined;
        nodesAccess?: {
            nodeType: string;
            date?: string | undefined;
        }[] | undefined;
    }>;
    execute(params: unknown, context: IToolContext): Promise<IToolResponse>;
    getMetadata(): IToolMetadata;
}
//# sourceMappingURL=CreateCredentialTool.d.ts.map