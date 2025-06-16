import { z } from 'zod';
import { BaseTool, IToolContext, IToolResponse, IToolMetadata } from '../base/Tool.js';
export declare class WorkflowMapTool extends BaseTool {
    name: string;
    description: string;
    inputSchema: z.ZodObject<{
        workflowId: z.ZodString;
        executionId: z.ZodOptional<z.ZodString>;
        format: z.ZodDefault<z.ZodEnum<["json", "html", "svg"]>>;
        includeMetrics: z.ZodDefault<z.ZodBoolean>;
        showDataFlow: z.ZodDefault<z.ZodBoolean>;
        compactView: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        workflowId: string;
        format: "json" | "html" | "svg";
        includeMetrics: boolean;
        showDataFlow: boolean;
        compactView: boolean;
        executionId?: string | undefined;
    }, {
        workflowId: string;
        executionId?: string | undefined;
        format?: "json" | "html" | "svg" | undefined;
        includeMetrics?: boolean | undefined;
        showDataFlow?: boolean | undefined;
        compactView?: boolean | undefined;
    }>;
    execute(params: unknown, context: IToolContext): Promise<IToolResponse>;
    private generateJSONMap;
    private generateHTMLMap;
    private generateSVGMap;
    private categorizeNode;
    private countConnections;
    private calculateBounds;
    private calculateDensity;
    private getDataTransferInfo;
    private calculateNodeMetrics;
    private identifyCriticalPath;
    private getNodeColor;
    private escapeXML;
    getMetadata(): IToolMetadata;
}
//# sourceMappingURL=WorkflowMapTool.d.ts.map