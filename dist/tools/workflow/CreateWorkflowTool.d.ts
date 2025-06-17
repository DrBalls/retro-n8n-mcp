import { z } from 'zod';
import { BaseTool, IToolContext, IToolResponse, IToolMetadata } from '../base/Tool.js';
/**
 * Tool for creating new workflows in n8n
 */
export declare class CreateWorkflowTool extends BaseTool {
    readonly name = "workflow_create";
    readonly description = "Create a new workflow in n8n";
    readonly inputSchema: z.ZodObject<{
        name: z.ZodString;
        nodes: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            type: z.ZodString;
            position: z.ZodArray<z.ZodNumber, "many">;
            parameters: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
            typeVersion: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            type: string;
            name: string;
            position: number[];
            typeVersion?: number | undefined;
            parameters?: Record<string, unknown> | undefined;
        }, {
            type: string;
            name: string;
            position: number[];
            typeVersion?: number | undefined;
            parameters?: Record<string, unknown> | undefined;
        }>, "many">;
        connections: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodRecord<z.ZodString, z.ZodArray<z.ZodArray<z.ZodObject<{
            node: z.ZodString;
            type: z.ZodString;
            index: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            type: string;
            node: string;
            index: number;
        }, {
            type: string;
            node: string;
            index: number;
        }>, "many">, "many">>>>;
        settings: z.ZodOptional<z.ZodObject<{
            executionOrder: z.ZodOptional<z.ZodEnum<["v0", "v1"]>>;
            saveManualExecutions: z.ZodOptional<z.ZodBoolean>;
            errorWorkflow: z.ZodOptional<z.ZodString>;
            timezone: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            executionOrder?: "v0" | "v1" | undefined;
            saveManualExecutions?: boolean | undefined;
            errorWorkflow?: string | undefined;
            timezone?: string | undefined;
        }, {
            executionOrder?: "v0" | "v1" | undefined;
            saveManualExecutions?: boolean | undefined;
            errorWorkflow?: string | undefined;
            timezone?: string | undefined;
        }>>;
        active: z.ZodDefault<z.ZodBoolean>;
        tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        active: boolean;
        nodes: {
            type: string;
            name: string;
            position: number[];
            typeVersion?: number | undefined;
            parameters?: Record<string, unknown> | undefined;
        }[];
        tags?: string[] | undefined;
        connections?: Record<string, Record<string, {
            type: string;
            node: string;
            index: number;
        }[][]>> | undefined;
        settings?: {
            executionOrder?: "v0" | "v1" | undefined;
            saveManualExecutions?: boolean | undefined;
            errorWorkflow?: string | undefined;
            timezone?: string | undefined;
        } | undefined;
    }, {
        name: string;
        nodes: {
            type: string;
            name: string;
            position: number[];
            typeVersion?: number | undefined;
            parameters?: Record<string, unknown> | undefined;
        }[];
        tags?: string[] | undefined;
        active?: boolean | undefined;
        connections?: Record<string, Record<string, {
            type: string;
            node: string;
            index: number;
        }[][]>> | undefined;
        settings?: {
            executionOrder?: "v0" | "v1" | undefined;
            saveManualExecutions?: boolean | undefined;
            errorWorkflow?: string | undefined;
            timezone?: string | undefined;
        } | undefined;
    }>;
    execute(params: unknown, context: IToolContext): Promise<IToolResponse>;
    getMetadata(): IToolMetadata;
}
//# sourceMappingURL=CreateWorkflowTool.d.ts.map