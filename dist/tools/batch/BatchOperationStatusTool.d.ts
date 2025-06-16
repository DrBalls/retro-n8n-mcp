import { z } from 'zod';
import { BaseTool, IToolContext, IToolResponse, IToolMetadata } from '../base/Tool.js';
export declare class BatchOperationStatusTool extends BaseTool {
    name: string;
    description: string;
    inputSchema: z.ZodObject<{
        operationId: z.ZodOptional<z.ZodString>;
        listActive: z.ZodDefault<z.ZodBoolean>;
        includeDetails: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        listActive: boolean;
        includeDetails: boolean;
        operationId?: string | undefined;
    }, {
        operationId?: string | undefined;
        listActive?: boolean | undefined;
        includeDetails?: boolean | undefined;
    }>;
    execute(params: unknown, context: IToolContext): Promise<IToolResponse>;
    getMetadata(): IToolMetadata;
}
//# sourceMappingURL=BatchOperationStatusTool.d.ts.map