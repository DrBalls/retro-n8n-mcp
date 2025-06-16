import { z } from 'zod';
import { BaseTool, IToolContext, IToolResponse, IToolMetadata } from '../base/Tool.js';
/**
 * Tool for rolling back to a previous version
 * Implements one-click rollback with safety features
 */
export declare class VersionRollbackTool extends BaseTool {
    name: string;
    description: string;
    private logger;
    private versionManager;
    inputSchema: z.ZodObject<{
        workflowId: z.ZodString;
        targetVersionId: z.ZodString;
        branch: z.ZodDefault<z.ZodString>;
        message: z.ZodOptional<z.ZodString>;
        author: z.ZodOptional<z.ZodString>;
        createBackup: z.ZodDefault<z.ZodBoolean>;
        updateN8n: z.ZodDefault<z.ZodBoolean>;
        force: z.ZodDefault<z.ZodBoolean>;
        reason: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        branch: string;
        workflowId: string;
        force: boolean;
        createBackup: boolean;
        targetVersionId: string;
        updateN8n: boolean;
        message?: string | undefined;
        reason?: string | undefined;
        author?: string | undefined;
    }, {
        workflowId: string;
        targetVersionId: string;
        message?: string | undefined;
        reason?: string | undefined;
        branch?: string | undefined;
        force?: boolean | undefined;
        createBackup?: boolean | undefined;
        author?: string | undefined;
        updateN8n?: boolean | undefined;
    }>;
    execute(params: unknown, context: IToolContext): Promise<IToolResponse>;
    private performSafetyChecks;
    private calculateAge;
    private calculateVersionGap;
    private generateChangeDescription;
    private getErrorSuggestions;
    getMetadata(): IToolMetadata;
}
//# sourceMappingURL=VersionRollbackTool.d.ts.map