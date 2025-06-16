import { z } from 'zod';
import { BaseTool, IToolContext, IToolResponse, IToolMetadata } from '../base/Tool.js';
export declare class MermaidDiagramTool extends BaseTool {
    name: string;
    description: string;
    inputSchema: z.ZodObject<{
        workflowId: z.ZodString;
        direction: z.ZodDefault<z.ZodEnum<["TB", "TD", "BT", "RL", "LR"]>>;
        theme: z.ZodDefault<z.ZodEnum<["default", "dark", "forest", "neutral"]>>;
        includeParameters: z.ZodDefault<z.ZodBoolean>;
        includeCredentials: z.ZodDefault<z.ZodBoolean>;
        highlightActive: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        workflowId: string;
        direction: "TB" | "TD" | "BT" | "RL" | "LR";
        theme: "default" | "dark" | "forest" | "neutral";
        includeParameters: boolean;
        includeCredentials: boolean;
        highlightActive: boolean;
    }, {
        workflowId: string;
        direction?: "TB" | "TD" | "BT" | "RL" | "LR" | undefined;
        theme?: "default" | "dark" | "forest" | "neutral" | undefined;
        includeParameters?: boolean | undefined;
        includeCredentials?: boolean | undefined;
        highlightActive?: boolean | undefined;
    }>;
    execute(params: unknown, context: IToolContext): Promise<IToolResponse>;
    private generateMermaidDiagram;
    private sanitizeId;
    private escapeLabel;
    getMetadata(): IToolMetadata;
}
//# sourceMappingURL=MermaidDiagramTool.d.ts.map