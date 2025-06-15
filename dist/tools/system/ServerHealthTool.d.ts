import { z } from 'zod';
import { BaseTool, IToolContext, IToolResponse, IToolMetadata } from '../base/Tool.js';
/**
 * Tool for checking MCP server health
 */
export declare class ServerHealthTool extends BaseTool {
    readonly name = "server_health";
    readonly description = "Get the health status and statistics of the MCP server";
    readonly inputSchema: z.ZodObject<{
        includeStats: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        includeStats: boolean;
    }, {
        includeStats?: boolean | undefined;
    }>;
    execute(params: unknown, context: IToolContext): Promise<IToolResponse>;
    isAvailable(): boolean;
    getMetadata(): IToolMetadata;
}
//# sourceMappingURL=ServerHealthTool.d.ts.map