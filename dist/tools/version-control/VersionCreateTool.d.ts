import { z } from 'zod';
import { BaseTool, IToolContext, IToolResponse, IToolMetadata } from '../base/Tool.js';
/**
 * Tool for creating a new version of a workflow
 * Implements Git-like commit functionality with semantic versioning
 */
export declare class VersionCreateTool extends BaseTool {
    name: string;
    description: string;
    private logger;
    private versionManager;
    inputSchema: z.ZodObject<{
        workflowId: z.ZodString;
        message: z.ZodString;
        author: z.ZodOptional<z.ZodString>;
        branch: z.ZodDefault<z.ZodString>;
        versionType: z.ZodDefault<z.ZodEnum<["major", "minor", "patch", "auto"]>>;
        tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        isRelease: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        message: string;
        tags: string[];
        branch: string;
        workflowId: string;
        versionType: "patch" | "major" | "minor" | "auto";
        isRelease: boolean;
        author?: string | undefined;
    }, {
        message: string;
        workflowId: string;
        tags?: string[] | undefined;
        branch?: string | undefined;
        author?: string | undefined;
        versionType?: "patch" | "major" | "minor" | "auto" | undefined;
        isRelease?: boolean | undefined;
    }>;
    execute(params: unknown, context: IToolContext): Promise<IToolResponse>;
    getMetadata(): IToolMetadata;
}
//# sourceMappingURL=VersionCreateTool.d.ts.map