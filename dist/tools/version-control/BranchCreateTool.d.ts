import { z } from 'zod';
import { BaseTool, IToolContext, IToolResponse, IToolMetadata } from '../base/Tool.js';
/**
 * Tool for creating a new branch from an existing branch or version
 * Implements Git-like branching functionality
 */
export declare class BranchCreateTool extends BaseTool {
    name: string;
    description: string;
    private logger;
    private versionManager;
    inputSchema: z.ZodObject<{
        workflowId: z.ZodString;
        branchName: z.ZodString;
        fromBranch: z.ZodDefault<z.ZodString>;
        fromVersionId: z.ZodOptional<z.ZodString>;
        author: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        autoSwitch: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        workflowId: string;
        branchName: string;
        fromBranch: string;
        autoSwitch: boolean;
        description?: string | undefined;
        author?: string | undefined;
        fromVersionId?: string | undefined;
    }, {
        workflowId: string;
        branchName: string;
        description?: string | undefined;
        author?: string | undefined;
        fromVersionId?: string | undefined;
        fromBranch?: string | undefined;
        autoSwitch?: boolean | undefined;
    }>;
    execute(params: unknown, context: IToolContext): Promise<IToolResponse>;
    private generateBranchRecommendations;
    private getErrorSuggestions;
    getMetadata(): IToolMetadata;
}
//# sourceMappingURL=BranchCreateTool.d.ts.map