import { z } from 'zod';
import { BaseTool, IToolContext, IToolResponse, IToolMetadata } from '../base/Tool.js';
export declare class CompareVersionsTool extends BaseTool {
    name: string;
    description: string;
    inputSchema: z.ZodObject<{
        fromVersionId: z.ZodString;
        toVersionId: z.ZodString;
        format: z.ZodDefault<z.ZodEnum<["json", "text", "markdown"]>>;
        includeMetadata: z.ZodDefault<z.ZodBoolean>;
        showOnlyChanges: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        format: "text" | "json" | "markdown";
        fromVersionId: string;
        toVersionId: string;
        includeMetadata: boolean;
        showOnlyChanges: boolean;
    }, {
        fromVersionId: string;
        toVersionId: string;
        format?: "text" | "json" | "markdown" | undefined;
        includeMetadata?: boolean | undefined;
        showOnlyChanges?: boolean | undefined;
    }>;
    private versionControlService;
    execute(params: unknown, context: IToolContext): Promise<IToolResponse>;
    private formatDiffAsMarkdown;
    private formatDiffAsText;
    private operationToReadableText;
    private pathToReadable;
    getMetadata(): IToolMetadata;
}
//# sourceMappingURL=CompareVersionsTool.d.ts.map