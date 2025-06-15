import { z } from 'zod';
import { BaseTool, IToolContext, IToolResponse, IToolMetadata } from '../base/Tool.js';
/**
 * Tool for deleting a workflow
 */
export declare class DeleteWorkflowTool extends BaseTool {
    name: string;
    description: string;
    inputSchema: z.ZodObject<{
        id: z.ZodString;
        force: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        force: boolean;
    }, {
        id: string;
        force?: boolean | undefined;
    }>;
    execute(params: unknown, context: IToolContext): Promise<IToolResponse>;
    getMetadata(): IToolMetadata;
}
//# sourceMappingURL=DeleteWorkflowTool.d.ts.map