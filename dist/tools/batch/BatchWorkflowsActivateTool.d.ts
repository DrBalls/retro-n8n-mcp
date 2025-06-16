import { z } from 'zod';
import { BaseTool, IToolContext, IToolResponse, IToolMetadata } from '../base/Tool.js';
export declare class BatchWorkflowsActivateTool extends BaseTool {
    name: string;
    description: string;
    inputSchema: z.ZodObject<{
        workflowIds: z.ZodArray<z.ZodString, "many">;
        options: z.ZodOptional<z.ZodObject<{
            stopOnError: z.ZodDefault<z.ZodBoolean>;
            skipValidation: z.ZodDefault<z.ZodBoolean>;
            concurrency: z.ZodDefault<z.ZodNumber>;
            testRun: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            concurrency: number;
            stopOnError: boolean;
            skipValidation: boolean;
            testRun: boolean;
        }, {
            concurrency?: number | undefined;
            stopOnError?: boolean | undefined;
            skipValidation?: boolean | undefined;
            testRun?: boolean | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        workflowIds: string[];
        options?: {
            concurrency: number;
            stopOnError: boolean;
            skipValidation: boolean;
            testRun: boolean;
        } | undefined;
    }, {
        workflowIds: string[];
        options?: {
            concurrency?: number | undefined;
            stopOnError?: boolean | undefined;
            skipValidation?: boolean | undefined;
            testRun?: boolean | undefined;
        } | undefined;
    }>;
    execute(params: unknown, context: IToolContext): Promise<IToolResponse>;
    getMetadata(): IToolMetadata;
}
//# sourceMappingURL=BatchWorkflowsActivateTool.d.ts.map