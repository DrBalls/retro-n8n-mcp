import { z } from 'zod';
import { BaseTool, IToolContext, IToolResponse, IToolMetadata } from '../base/Tool.js';
export declare class TimelineDebugTool extends BaseTool {
    name: string;
    description: string;
    inputSchema: z.ZodObject<{
        sessionId: z.ZodString;
        format: z.ZodDefault<z.ZodEnum<["text", "mermaid", "json"]>>;
        timeRange: z.ZodOptional<z.ZodObject<{
            start: z.ZodOptional<z.ZodString>;
            end: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            start?: string | undefined;
            end?: string | undefined;
        }, {
            start?: string | undefined;
            end?: string | undefined;
        }>>;
        includeData: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        sessionId: string;
        includeData: boolean;
        format: "json" | "text" | "mermaid";
        timeRange?: {
            start?: string | undefined;
            end?: string | undefined;
        } | undefined;
    }, {
        sessionId: string;
        timeRange?: {
            start?: string | undefined;
            end?: string | undefined;
        } | undefined;
        includeData?: boolean | undefined;
        format?: "json" | "text" | "mermaid" | undefined;
    }>;
    execute(params: unknown, context: IToolContext): Promise<IToolResponse>;
    private generateTextTimeline;
    private generateMermaidTimeline;
    private calculateStatistics;
    private formatTime;
    getMetadata(): IToolMetadata;
}
//# sourceMappingURL=TimelineDebugTool.d.ts.map