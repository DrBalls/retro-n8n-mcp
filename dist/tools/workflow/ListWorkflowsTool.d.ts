import { z } from 'zod';
import { BaseTool, IToolContext, IToolResponse, IToolMetadata } from '../base/Tool.js';
/**
 * Tool for listing workflows from n8n
 */
export declare class ListWorkflowsTool extends BaseTool {
    readonly name = "workflow_list";
    readonly description = "List workflows from n8n with optional filters";
    readonly inputSchema: z.ZodObject<{
        active: z.ZodOptional<z.ZodBoolean>;
        limit: z.ZodDefault<z.ZodNumber>;
        cursor: z.ZodOptional<z.ZodString>;
        tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        limit: number;
        active?: boolean | undefined;
        tags?: string[] | undefined;
        cursor?: string | undefined;
    }, {
        active?: boolean | undefined;
        tags?: string[] | undefined;
        limit?: number | undefined;
        cursor?: string | undefined;
    }>;
    execute(params: unknown, context: IToolContext): Promise<IToolResponse>;
    isAvailable(): boolean;
    getMetadata(): IToolMetadata;
}
//# sourceMappingURL=ListWorkflowsTool.d.ts.map