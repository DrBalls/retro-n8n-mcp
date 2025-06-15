import { z } from 'zod';
import { BaseTool, IToolContext, IToolResponse, IToolMetadata } from '../base/Tool.js';
export declare class TriggerExecutionTool extends BaseTool {
    name: string;
    description: string;
    inputSchema: z.ZodObject<{
        workflowId: z.ZodString;
        inputData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        runMode: z.ZodDefault<z.ZodEnum<["manual", "trigger", "webhook", "retry", "integrated", "cli"]>>;
        waitForCompletion: z.ZodDefault<z.ZodBoolean>;
        timeout: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        workflowId: string;
        runMode: "retry" | "manual" | "trigger" | "webhook" | "integrated" | "cli";
        waitForCompletion: boolean;
        timeout?: number | undefined;
        inputData?: Record<string, unknown> | undefined;
    }, {
        workflowId: string;
        timeout?: number | undefined;
        inputData?: Record<string, unknown> | undefined;
        runMode?: "retry" | "manual" | "trigger" | "webhook" | "integrated" | "cli" | undefined;
        waitForCompletion?: boolean | undefined;
    }>;
    execute(params: unknown, context: IToolContext): Promise<IToolResponse>;
    getMetadata(): IToolMetadata;
}
//# sourceMappingURL=TriggerExecutionTool.d.ts.map