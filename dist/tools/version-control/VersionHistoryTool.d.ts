import { z } from 'zod';
import { BaseTool, IToolContext, IToolResponse, IToolMetadata } from '../base/Tool.js';
/**
 * Tool for retrieving workflow version history
 * Provides Git-like log functionality with filtering options
 */
export declare class VersionHistoryTool extends BaseTool {
    name: string;
    description: string;
    private logger;
    private versionManager;
    inputSchema: z.ZodObject<{
        workflowId: z.ZodString;
        branch: z.ZodOptional<z.ZodString>;
        limit: z.ZodDefault<z.ZodNumber>;
        offset: z.ZodDefault<z.ZodNumber>;
        author: z.ZodOptional<z.ZodString>;
        since: z.ZodOptional<z.ZodNumber>;
        until: z.ZodOptional<z.ZodNumber>;
        format: z.ZodDefault<z.ZodEnum<["detailed", "summary", "oneline"]>>;
        includeTags: z.ZodDefault<z.ZodBoolean>;
        includeChanges: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        limit: number;
        offset: number;
        workflowId: string;
        format: "summary" | "detailed" | "oneline";
        includeTags: boolean;
        includeChanges: boolean;
        branch?: string | undefined;
        author?: string | undefined;
        since?: number | undefined;
        until?: number | undefined;
    }, {
        workflowId: string;
        limit?: number | undefined;
        offset?: number | undefined;
        branch?: string | undefined;
        format?: "summary" | "detailed" | "oneline" | undefined;
        author?: string | undefined;
        since?: number | undefined;
        until?: number | undefined;
        includeTags?: boolean | undefined;
        includeChanges?: boolean | undefined;
    }>;
    execute(params: unknown, context: IToolContext): Promise<IToolResponse>;
    private summarizeChanges;
    private generateHistoryStats;
    getMetadata(): IToolMetadata;
}
//# sourceMappingURL=VersionHistoryTool.d.ts.map