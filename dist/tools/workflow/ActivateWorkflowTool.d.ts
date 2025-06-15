import { z } from 'zod';
import { BaseTool, IToolContext, IToolResponse, IToolMetadata } from '../base/Tool.js';
/**
 * Tool for activating a workflow
 */
export declare class ActivateWorkflowTool extends BaseTool {
    name: string;
    description: string;
    inputSchema: z.ZodObject<{
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>;
    execute(params: unknown, context: IToolContext): Promise<IToolResponse>;
    getMetadata(): IToolMetadata;
}
//# sourceMappingURL=ActivateWorkflowTool.d.ts.map