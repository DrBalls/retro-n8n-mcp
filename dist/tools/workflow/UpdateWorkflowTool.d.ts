import { z } from 'zod';
import { BaseTool, IToolContext, IToolResponse, IToolMetadata } from '../base/Tool.js';
/**
 * Tool for updating an existing workflow
 */
export declare class UpdateWorkflowTool extends BaseTool {
    name: string;
    description: string;
    inputSchema: z.ZodObject<{
        id: z.ZodString;
        name: z.ZodOptional<z.ZodString>;
        active: z.ZodOptional<z.ZodBoolean>;
        nodes: z.ZodOptional<z.ZodArray<z.ZodAny, "many">>;
        connections: z.ZodOptional<z.ZodAny>;
        settings: z.ZodOptional<z.ZodObject<{
            executionOrder: z.ZodOptional<z.ZodEnum<["v0", "v1"]>>;
            saveDataSuccessExecution: z.ZodOptional<z.ZodEnum<["all", "none"]>>;
            saveManualExecutions: z.ZodOptional<z.ZodBoolean>;
            saveExecutionProgress: z.ZodOptional<z.ZodBoolean>;
            executionTimeout: z.ZodOptional<z.ZodNumber>;
            errorWorkflow: z.ZodOptional<z.ZodString>;
            timezone: z.ZodOptional<z.ZodString>;
            saveDataErrorExecution: z.ZodOptional<z.ZodEnum<["all", "none"]>>;
            callerIds: z.ZodOptional<z.ZodString>;
            callerPolicy: z.ZodOptional<z.ZodEnum<["any", "none", "workflowsFromAList", "workflowsFromSameOwner"]>>;
        }, "strip", z.ZodTypeAny, {
            executionOrder?: "v0" | "v1" | undefined;
            saveManualExecutions?: boolean | undefined;
            errorWorkflow?: string | undefined;
            timezone?: string | undefined;
            saveDataSuccessExecution?: "all" | "none" | undefined;
            saveExecutionProgress?: boolean | undefined;
            executionTimeout?: number | undefined;
            saveDataErrorExecution?: "all" | "none" | undefined;
            callerIds?: string | undefined;
            callerPolicy?: "none" | "any" | "workflowsFromAList" | "workflowsFromSameOwner" | undefined;
        }, {
            executionOrder?: "v0" | "v1" | undefined;
            saveManualExecutions?: boolean | undefined;
            errorWorkflow?: string | undefined;
            timezone?: string | undefined;
            saveDataSuccessExecution?: "all" | "none" | undefined;
            saveExecutionProgress?: boolean | undefined;
            executionTimeout?: number | undefined;
            saveDataErrorExecution?: "all" | "none" | undefined;
            callerIds?: string | undefined;
            callerPolicy?: "none" | "any" | "workflowsFromAList" | "workflowsFromSameOwner" | undefined;
        }>>;
        staticData: z.ZodOptional<z.ZodAny>;
        tags: z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodObject<{
            id: z.ZodOptional<z.ZodString>;
            name: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            name: string;
            id?: string | undefined;
        }, {
            name: string;
            id?: string | undefined;
        }>]>, "many">>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name?: string | undefined;
        active?: boolean | undefined;
        nodes?: any[] | undefined;
        connections?: any;
        settings?: {
            executionOrder?: "v0" | "v1" | undefined;
            saveManualExecutions?: boolean | undefined;
            errorWorkflow?: string | undefined;
            timezone?: string | undefined;
            saveDataSuccessExecution?: "all" | "none" | undefined;
            saveExecutionProgress?: boolean | undefined;
            executionTimeout?: number | undefined;
            saveDataErrorExecution?: "all" | "none" | undefined;
            callerIds?: string | undefined;
            callerPolicy?: "none" | "any" | "workflowsFromAList" | "workflowsFromSameOwner" | undefined;
        } | undefined;
        staticData?: any;
        tags?: (string | {
            name: string;
            id?: string | undefined;
        })[] | undefined;
    }, {
        id: string;
        name?: string | undefined;
        active?: boolean | undefined;
        nodes?: any[] | undefined;
        connections?: any;
        settings?: {
            executionOrder?: "v0" | "v1" | undefined;
            saveManualExecutions?: boolean | undefined;
            errorWorkflow?: string | undefined;
            timezone?: string | undefined;
            saveDataSuccessExecution?: "all" | "none" | undefined;
            saveExecutionProgress?: boolean | undefined;
            executionTimeout?: number | undefined;
            saveDataErrorExecution?: "all" | "none" | undefined;
            callerIds?: string | undefined;
            callerPolicy?: "none" | "any" | "workflowsFromAList" | "workflowsFromSameOwner" | undefined;
        } | undefined;
        staticData?: any;
        tags?: (string | {
            name: string;
            id?: string | undefined;
        })[] | undefined;
    }>;
    execute(params: unknown, context: IToolContext): Promise<IToolResponse>;
    getMetadata(): IToolMetadata;
}
//# sourceMappingURL=UpdateWorkflowTool.d.ts.map