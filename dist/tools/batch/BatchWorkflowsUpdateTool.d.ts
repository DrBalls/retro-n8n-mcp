import { z } from 'zod';
import { BaseTool, IToolContext, IToolResponse, IToolMetadata } from '../base/Tool.js';
export declare class BatchWorkflowsUpdateTool extends BaseTool {
    name: string;
    description: string;
    inputSchema: z.ZodObject<{
        updates: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodOptional<z.ZodString>;
            nodes: z.ZodOptional<z.ZodArray<z.ZodAny, "many">>;
            connections: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            settings: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            staticData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            active: z.ZodOptional<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            tags?: string[] | undefined;
            name?: string | undefined;
            active?: boolean | undefined;
            nodes?: any[] | undefined;
            connections?: Record<string, any> | undefined;
            settings?: Record<string, any> | undefined;
            staticData?: Record<string, any> | undefined;
        }, {
            id: string;
            tags?: string[] | undefined;
            name?: string | undefined;
            active?: boolean | undefined;
            nodes?: any[] | undefined;
            connections?: Record<string, any> | undefined;
            settings?: Record<string, any> | undefined;
            staticData?: Record<string, any> | undefined;
        }>, "many">;
        options: z.ZodOptional<z.ZodObject<{
            stopOnError: z.ZodDefault<z.ZodBoolean>;
            atomic: z.ZodDefault<z.ZodBoolean>;
            concurrency: z.ZodDefault<z.ZodNumber>;
            validateUpdates: z.ZodDefault<z.ZodBoolean>;
            createBackup: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            concurrency: number;
            stopOnError: boolean;
            atomic: boolean;
            validateUpdates: boolean;
            createBackup: boolean;
        }, {
            concurrency?: number | undefined;
            stopOnError?: boolean | undefined;
            atomic?: boolean | undefined;
            validateUpdates?: boolean | undefined;
            createBackup?: boolean | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        updates: {
            id: string;
            tags?: string[] | undefined;
            name?: string | undefined;
            active?: boolean | undefined;
            nodes?: any[] | undefined;
            connections?: Record<string, any> | undefined;
            settings?: Record<string, any> | undefined;
            staticData?: Record<string, any> | undefined;
        }[];
        options?: {
            concurrency: number;
            stopOnError: boolean;
            atomic: boolean;
            validateUpdates: boolean;
            createBackup: boolean;
        } | undefined;
    }, {
        updates: {
            id: string;
            tags?: string[] | undefined;
            name?: string | undefined;
            active?: boolean | undefined;
            nodes?: any[] | undefined;
            connections?: Record<string, any> | undefined;
            settings?: Record<string, any> | undefined;
            staticData?: Record<string, any> | undefined;
        }[];
        options?: {
            concurrency?: number | undefined;
            stopOnError?: boolean | undefined;
            atomic?: boolean | undefined;
            validateUpdates?: boolean | undefined;
            createBackup?: boolean | undefined;
        } | undefined;
    }>;
    execute(params: unknown, context: IToolContext): Promise<IToolResponse>;
    getMetadata(): IToolMetadata;
}
//# sourceMappingURL=BatchWorkflowsUpdateTool.d.ts.map