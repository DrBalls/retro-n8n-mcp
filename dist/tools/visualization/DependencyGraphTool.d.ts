import { z } from 'zod';
import { BaseTool, IToolContext, IToolResponse, IToolMetadata } from '../base/Tool.js';
export declare class DependencyGraphTool extends BaseTool {
    name: string;
    description: string;
    inputSchema: z.ZodObject<{
        workflowId: z.ZodString;
        format: z.ZodDefault<z.ZodEnum<["json", "dot", "mermaid"]>>;
        layout: z.ZodDefault<z.ZodEnum<["hierarchical", "circular", "force-directed"]>>;
        showDataTypes: z.ZodDefault<z.ZodBoolean>;
        highlightCriticalPath: z.ZodDefault<z.ZodBoolean>;
        groupByType: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        workflowId: string;
        format: "mermaid" | "json" | "dot";
        layout: "hierarchical" | "circular" | "force-directed";
        showDataTypes: boolean;
        highlightCriticalPath: boolean;
        groupByType: boolean;
    }, {
        workflowId: string;
        format?: "mermaid" | "json" | "dot" | undefined;
        layout?: "hierarchical" | "circular" | "force-directed" | undefined;
        showDataTypes?: boolean | undefined;
        highlightCriticalPath?: boolean | undefined;
        groupByType?: boolean | undefined;
    }>;
    execute(params: unknown, context: IToolContext): Promise<IToolResponse>;
    private buildDependencyGraph;
    private calculateNodeLevels;
    private generateJSONGraph;
    private generateDotGraph;
    private generateMermaidGraph;
    private calculateGraphMetrics;
    private categorizeNode;
    private inferDataTypes;
    private groupNodesByType;
    private findCriticalPath;
    private findLongestPathFrom;
    private findLongestPath;
    private findParallelizationOpportunities;
    private identifyBottlenecks;
    private calculateHierarchicalLayout;
    private calculateCircularLayout;
    private sanitizeId;
    getMetadata(): IToolMetadata;
}
//# sourceMappingURL=DependencyGraphTool.d.ts.map