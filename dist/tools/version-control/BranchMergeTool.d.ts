import { z } from 'zod';
import { BaseTool, IToolContext, IToolResponse, IToolMetadata } from '../base/Tool.js';
/**
 * Tool for merging branches with conflict detection and resolution
 * Implements Git-like merge functionality with multiple strategies
 */
export declare class BranchMergeTool extends BaseTool {
    name: string;
    description: string;
    private logger;
    private versionManager;
    inputSchema: z.ZodObject<{
        workflowId: z.ZodString;
        sourceBranch: z.ZodString;
        targetBranch: z.ZodDefault<z.ZodString>;
        message: z.ZodOptional<z.ZodString>;
        author: z.ZodOptional<z.ZodString>;
        strategy: z.ZodDefault<z.ZodEnum<["auto", "manual", "ours", "theirs"]>>;
        autoResolve: z.ZodDefault<z.ZodBoolean>;
        deleteSourceBranch: z.ZodDefault<z.ZodBoolean>;
        createBackup: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        strategy: "manual" | "auto" | "ours" | "theirs";
        workflowId: string;
        createBackup: boolean;
        deleteSourceBranch: boolean;
        autoResolve: boolean;
        sourceBranch: string;
        targetBranch: string;
        message?: string | undefined;
        author?: string | undefined;
    }, {
        workflowId: string;
        sourceBranch: string;
        message?: string | undefined;
        strategy?: "manual" | "auto" | "ours" | "theirs" | undefined;
        createBackup?: boolean | undefined;
        author?: string | undefined;
        deleteSourceBranch?: boolean | undefined;
        autoResolve?: boolean | undefined;
        targetBranch?: string | undefined;
    }>;
    execute(params: unknown, context: IToolContext): Promise<IToolResponse>;
    private formatConflictValue;
    private generateMergeRecommendations;
    private getErrorSuggestions;
    getMetadata(): IToolMetadata;
}
//# sourceMappingURL=BranchMergeTool.d.ts.map