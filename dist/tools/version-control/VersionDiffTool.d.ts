import { z } from 'zod';
import { BaseTool, IToolContext, IToolResponse, IToolMetadata } from '../base/Tool.js';
/**
 * Tool for generating diffs between workflow versions
 * Provides detailed comparison with visualization options
 */
export declare class VersionDiffTool extends BaseTool {
    name: string;
    description: string;
    private logger;
    private versionManager;
    private differ;
    inputSchema: z.ZodObject<{
        workflowId: z.ZodString;
        fromVersionId: z.ZodString;
        toVersionId: z.ZodString;
        format: z.ZodDefault<z.ZodEnum<["detailed", "summary", "visual", "json"]>>;
        includeContext: z.ZodDefault<z.ZodBoolean>;
        includeMetadata: z.ZodDefault<z.ZodBoolean>;
        highlightChanges: z.ZodDefault<z.ZodBoolean>;
        maxDepth: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        workflowId: string;
        format: "json" | "summary" | "detailed" | "visual";
        fromVersionId: string;
        toVersionId: string;
        includeMetadata: boolean;
        includeContext: boolean;
        highlightChanges: boolean;
        maxDepth: number;
    }, {
        workflowId: string;
        fromVersionId: string;
        toVersionId: string;
        format?: "json" | "summary" | "detailed" | "visual" | undefined;
        includeMetadata?: boolean | undefined;
        includeContext?: boolean | undefined;
        highlightChanges?: boolean | undefined;
        maxDepth?: number | undefined;
    }>;
    execute(params: unknown, context: IToolContext): Promise<IToolResponse>;
    private analyzeNodeChanges;
    private analyzeConnectionChanges;
    private analyzeImpact;
    private formatSummaryDiff;
    private formatVisualDiff;
    private formatDetailedDiff;
    private generateContextualInformation;
    private generateOperationDescription;
    private isImportantChange;
    private getNodeModificationDetails;
    private extractMetadataChanges;
    private isVersionUpgrade;
    private calculateVersionDifference;
    private formatTimeGap;
    private calculateDiffComplexity;
    private countConnections;
    private formatValue;
    private getErrorSuggestions;
    getMetadata(): IToolMetadata;
}
//# sourceMappingURL=VersionDiffTool.d.ts.map