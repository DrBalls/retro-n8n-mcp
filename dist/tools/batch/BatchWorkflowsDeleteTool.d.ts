import { z } from 'zod';
import { BaseTool, IToolContext, IToolResponse, IToolMetadata } from '../base/Tool.js';
export declare class BatchWorkflowsDeleteTool extends BaseTool {
    name: string;
    description: string;
    inputSchema: z.ZodObject<{
        workflowIds: z.ZodArray<z.ZodString, "many">;
        options: z.ZodOptional<z.ZodObject<{
            stopOnError: z.ZodDefault<z.ZodBoolean>;
            force: z.ZodDefault<z.ZodBoolean>;
            skipActiveCheck: z.ZodDefault<z.ZodBoolean>;
            concurrency: z.ZodDefault<z.ZodNumber>;
            dryRun: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            concurrency: number;
            force: boolean;
            stopOnError: boolean;
            skipActiveCheck: boolean;
            dryRun: boolean;
        }, {
            concurrency?: number | undefined;
            force?: boolean | undefined;
            stopOnError?: boolean | undefined;
            skipActiveCheck?: boolean | undefined;
            dryRun?: boolean | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        workflowIds: string[];
        options?: {
            concurrency: number;
            force: boolean;
            stopOnError: boolean;
            skipActiveCheck: boolean;
            dryRun: boolean;
        } | undefined;
    }, {
        workflowIds: string[];
        options?: {
            concurrency?: number | undefined;
            force?: boolean | undefined;
            stopOnError?: boolean | undefined;
            skipActiveCheck?: boolean | undefined;
            dryRun?: boolean | undefined;
        } | undefined;
    }>;
    execute(params: unknown, context: IToolContext): Promise<IToolResponse>;
    getMetadata(): IToolMetadata;
}
//# sourceMappingURL=BatchWorkflowsDeleteTool.d.ts.map