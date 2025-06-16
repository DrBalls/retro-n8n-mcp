import { z } from 'zod';
import { BaseTool, IToolContext, IToolResponse, IToolMetadata } from '../base/Tool.js';
export declare class BatchWorkflowsCreateTool extends BaseTool {
    name: string;
    description: string;
    inputSchema: z.ZodObject<{
        workflows: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            nodes: z.ZodArray<z.ZodAny, "many">;
            connections: z.ZodRecord<z.ZodString, z.ZodAny>;
            settings: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            staticData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            active: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            name: string;
            active: boolean;
            nodes: any[];
            connections: Record<string, any>;
            settings?: Record<string, any> | undefined;
            staticData?: Record<string, any> | undefined;
            tags?: string[] | undefined;
        }, {
            name: string;
            nodes: any[];
            connections: Record<string, any>;
            active?: boolean | undefined;
            settings?: Record<string, any> | undefined;
            staticData?: Record<string, any> | undefined;
            tags?: string[] | undefined;
        }>, "many">;
        options: z.ZodOptional<z.ZodObject<{
            stopOnError: z.ZodDefault<z.ZodBoolean>;
            atomic: z.ZodDefault<z.ZodBoolean>;
            concurrency: z.ZodDefault<z.ZodNumber>;
            validateWorkflows: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            concurrency: number;
            stopOnError: boolean;
            atomic: boolean;
            validateWorkflows: boolean;
        }, {
            concurrency?: number | undefined;
            stopOnError?: boolean | undefined;
            atomic?: boolean | undefined;
            validateWorkflows?: boolean | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        workflows: {
            name: string;
            active: boolean;
            nodes: any[];
            connections: Record<string, any>;
            settings?: Record<string, any> | undefined;
            staticData?: Record<string, any> | undefined;
            tags?: string[] | undefined;
        }[];
        options?: {
            concurrency: number;
            stopOnError: boolean;
            atomic: boolean;
            validateWorkflows: boolean;
        } | undefined;
    }, {
        workflows: {
            name: string;
            nodes: any[];
            connections: Record<string, any>;
            active?: boolean | undefined;
            settings?: Record<string, any> | undefined;
            staticData?: Record<string, any> | undefined;
            tags?: string[] | undefined;
        }[];
        options?: {
            concurrency?: number | undefined;
            stopOnError?: boolean | undefined;
            atomic?: boolean | undefined;
            validateWorkflows?: boolean | undefined;
        } | undefined;
    }>;
    execute(params: unknown, context: IToolContext): Promise<IToolResponse>;
    getMetadata(): IToolMetadata;
}
//# sourceMappingURL=BatchWorkflowsCreateTool.d.ts.map