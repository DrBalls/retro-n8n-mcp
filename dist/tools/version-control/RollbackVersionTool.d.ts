import { z } from 'zod';
import { BaseTool, IToolContext, IToolResponse, IToolMetadata } from '../base/Tool.js';
export declare class RollbackVersionTool extends BaseTool {
    name: string;
    description: string;
    inputSchema: z.ZodObject<{
        workflowId: z.ZodString;
        targetVersionId: z.ZodString;
        branchName: z.ZodDefault<z.ZodString>;
        commitMessage: z.ZodOptional<z.ZodString>;
        author: z.ZodOptional<z.ZodString>;
        createBackup: z.ZodDefault<z.ZodBoolean>;
        dryRun: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        workflowId: string;
        createBackup: boolean;
        dryRun: boolean;
        branchName: string;
        targetVersionId: string;
        commitMessage?: string | undefined;
        author?: string | undefined;
    }, {
        workflowId: string;
        targetVersionId: string;
        createBackup?: boolean | undefined;
        dryRun?: boolean | undefined;
        branchName?: string | undefined;
        commitMessage?: string | undefined;
        author?: string | undefined;
    }>;
    private versionControlService;
    execute(params: unknown, context: IToolContext): Promise<IToolResponse>;
    getMetadata(): IToolMetadata;
}
//# sourceMappingURL=RollbackVersionTool.d.ts.map