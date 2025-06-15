import { z } from 'zod';
import { BaseTool, IToolContext, IToolResponse, IToolMetadata } from '../base/Tool.js';
/**
 * Tool for testing connection to n8n instance
 */
export declare class TestConnectionTool extends BaseTool {
    readonly name = "test_connection";
    readonly description = "Test connection to the configured n8n instance";
    readonly inputSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
    execute(params: unknown, context: IToolContext): Promise<IToolResponse>;
    isAvailable(): boolean;
    getMetadata(): IToolMetadata;
}
//# sourceMappingURL=TestConnectionTool.d.ts.map