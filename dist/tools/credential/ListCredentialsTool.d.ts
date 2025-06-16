import { z } from 'zod';
import { BaseTool, IToolContext, IToolResponse, IToolMetadata } from '../base/Tool.js';
export declare class ListCredentialsTool extends BaseTool {
    name: string;
    description: string;
    inputSchema: z.ZodObject<{
        type: z.ZodOptional<z.ZodString>;
        search: z.ZodOptional<z.ZodString>;
        tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        includeData: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        type?: string | undefined;
        tags?: string[] | undefined;
        search?: string | undefined;
        includeData?: boolean | undefined;
    }, {
        type?: string | undefined;
        tags?: string[] | undefined;
        search?: string | undefined;
        includeData?: boolean | undefined;
    }>;
    execute(params: unknown, context: IToolContext): Promise<IToolResponse>;
    getMetadata(): IToolMetadata;
}
//# sourceMappingURL=ListCredentialsTool.d.ts.map