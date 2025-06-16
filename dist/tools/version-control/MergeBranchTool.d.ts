import { z } from 'zod';
import { BaseTool, IToolContext, IToolResponse, IToolMetadata } from '../base/Tool.js';
export declare class MergeBranchTool extends BaseTool {
    name: string;
    description: string;
    inputSchema: z.ZodObject<{
        workflowId: z.ZodString;
        sourceBranchName: z.ZodString;
        targetBranchName: z.ZodDefault<z.ZodString>;
        strategy: z.ZodDefault<z.ZodEnum<["auto", "manual", "ours", "theirs"]>>;
        commitMessage: z.ZodOptional<z.ZodString>;
        author: z.ZodOptional<z.ZodString>;
        deleteSourceBranch: z.ZodDefault<z.ZodBoolean>;
        dryRun: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        strategy: "manual" | "auto" | "ours" | "theirs";
        workflowId: string;
        dryRun: boolean;
        sourceBranchName: string;
        targetBranchName: string;
        deleteSourceBranch: boolean;
        commitMessage?: string | undefined;
        author?: string | undefined;
    }, {
        workflowId: string;
        sourceBranchName: string;
        strategy?: "manual" | "auto" | "ours" | "theirs" | undefined;
        dryRun?: boolean | undefined;
        commitMessage?: string | undefined;
        author?: string | undefined;
        targetBranchName?: string | undefined;
        deleteSourceBranch?: boolean | undefined;
    }>;
    private versionControlService;
    execute(params: unknown, context: IToolContext): Promise<IToolResponse>;
    getMetadata(): IToolMetadata;
}
//# sourceMappingURL=MergeBranchTool.d.ts.map