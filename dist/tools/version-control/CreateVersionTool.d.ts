import { z } from 'zod';
import { BaseTool, IToolContext, IToolResponse, IToolMetadata } from '../base/Tool.js';
export declare class CreateVersionTool extends BaseTool {
    name: string;
    description: string;
    inputSchema: z.ZodObject<{
        workflowId: z.ZodString;
        branchName: z.ZodDefault<z.ZodString>;
        commitMessage: z.ZodOptional<z.ZodString>;
        author: z.ZodOptional<z.ZodString>;
        versionIncrement: z.ZodDefault<z.ZodEnum<["major", "minor", "patch"]>>;
        tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        isSnapshot: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        tags: string[];
        workflowId: string;
        branchName: string;
        isSnapshot: boolean;
        versionIncrement: "patch" | "major" | "minor";
        commitMessage?: string | undefined;
        author?: string | undefined;
    }, {
        workflowId: string;
        tags?: string[] | undefined;
        branchName?: string | undefined;
        commitMessage?: string | undefined;
        author?: string | undefined;
        isSnapshot?: boolean | undefined;
        versionIncrement?: "patch" | "major" | "minor" | undefined;
    }>;
    private versionControlService;
    execute(params: unknown, context: IToolContext): Promise<IToolResponse>;
    getMetadata(): IToolMetadata;
}
//# sourceMappingURL=CreateVersionTool.d.ts.map