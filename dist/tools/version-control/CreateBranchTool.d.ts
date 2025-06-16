import { z } from 'zod';
import { BaseTool, IToolContext, IToolResponse, IToolMetadata } from '../base/Tool.js';
export declare class CreateBranchTool extends BaseTool {
    name: string;
    description: string;
    inputSchema: z.ZodObject<{
        workflowId: z.ZodString;
        branchName: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        baseVersionId: z.ZodOptional<z.ZodString>;
        createdBy: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        workflowId: string;
        branchName: string;
        description?: string | undefined;
        baseVersionId?: string | undefined;
        createdBy?: string | undefined;
    }, {
        workflowId: string;
        branchName: string;
        description?: string | undefined;
        baseVersionId?: string | undefined;
        createdBy?: string | undefined;
    }>;
    private versionControlService;
    execute(params: unknown, context: IToolContext): Promise<IToolResponse>;
    getMetadata(): IToolMetadata;
}
//# sourceMappingURL=CreateBranchTool.d.ts.map