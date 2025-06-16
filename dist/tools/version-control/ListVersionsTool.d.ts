import { z } from 'zod';
import { BaseTool, IToolContext, IToolResponse, IToolMetadata } from '../base/Tool.js';
export declare class ListVersionsTool extends BaseTool {
    name: string;
    description: string;
    inputSchema: z.ZodObject<{
        workflowId: z.ZodString;
        branchName: z.ZodOptional<z.ZodString>;
        limit: z.ZodDefault<z.ZodNumber>;
        offset: z.ZodDefault<z.ZodNumber>;
        includeSnapshots: z.ZodDefault<z.ZodBoolean>;
        includeDetails: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        workflowId: string;
        limit: number;
        offset: number;
        includeDetails: boolean;
        includeSnapshots: boolean;
        branchName?: string | undefined;
    }, {
        workflowId: string;
        limit?: number | undefined;
        offset?: number | undefined;
        includeDetails?: boolean | undefined;
        branchName?: string | undefined;
        includeSnapshots?: boolean | undefined;
    }>;
    private versionControlService;
    execute(params: unknown, context: IToolContext): Promise<IToolResponse>;
    getMetadata(): IToolMetadata;
}
//# sourceMappingURL=ListVersionsTool.d.ts.map