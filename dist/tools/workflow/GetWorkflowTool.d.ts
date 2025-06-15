import { z } from 'zod';
import { BaseTool, IToolContext, IToolResponse, IToolMetadata } from '../base/Tool.js';
/**
 * Tool for retrieving a single workflow by ID
 */
export declare class GetWorkflowTool extends BaseTool {
    name: string;
    description: string;
    inputSchema: z.ZodObject<{
        id: z.ZodString;
        includeNodes: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        includeNodes: boolean;
    }, {
        id: string;
        includeNodes?: boolean | undefined;
    }>;
    execute(params: unknown, context: IToolContext): Promise<IToolResponse>;
    getMetadata(): IToolMetadata;
}
//# sourceMappingURL=GetWorkflowTool.d.ts.map