import { z } from 'zod';
// Base types
export const N8nIdSchema = z.string().min(1);
export const N8nTimestampSchema = z.string().datetime();
// Workflow types
export const WorkflowNodeSchema = z.object({
    id: z.string(),
    name: z.string(),
    type: z.string(),
    typeVersion: z.number(),
    position: z.array(z.number()).length(2),
    parameters: z.record(z.unknown()),
    credentials: z.record(z.unknown()).optional(),
    disabled: z.boolean().optional(),
    notes: z.string().optional(),
});
// Connection format as used in n8n API responses
export const WorkflowConnectionItemSchema = z.object({
    node: z.string(),
    type: z.string(),
    index: z.number(),
});
// Alternative format for some API endpoints
export const WorkflowConnectionSchema = z.object({
    source: z.object({
        id: z.string(),
        outputIndex: z.number().optional(),
    }),
    target: z.object({
        id: z.string(),
        inputIndex: z.number().optional(),
    }),
});
export const WorkflowSchema = z.object({
    id: N8nIdSchema,
    name: z.string(),
    active: z.boolean(),
    nodes: z.array(WorkflowNodeSchema),
    connections: z.record(z.record(z.array(z.array(z.union([WorkflowConnectionSchema, WorkflowConnectionItemSchema]))))),
    settings: z.record(z.unknown()).optional(),
    staticData: z.record(z.unknown()).optional(),
    tags: z.array(z.string()).optional(),
    createdAt: N8nTimestampSchema,
    updatedAt: N8nTimestampSchema,
    versionId: z.string().optional(),
});
// Execution types
export const ExecutionStatusSchema = z.enum([
    'canceled',
    'crashed',
    'error',
    'new',
    'running',
    'success',
    'unknown',
    'waiting',
]);
export const ExecutionDataSchema = z.object({
    startData: z.record(z.unknown()).optional(),
    resultData: z.object({
        runData: z.record(z.unknown()),
        lastNodeExecuted: z.string().optional(),
    }).optional(),
    executionData: z.object({
        contextData: z.record(z.unknown()),
        nodeExecutionStack: z.array(z.unknown()),
        waitingExecution: z.record(z.unknown()).optional(),
        waitingExecutionSource: z.record(z.unknown()).optional(),
        executionTime: z.number().optional(),
    }).optional(),
});
export const ExecutionSchema = z.object({
    id: N8nIdSchema,
    finished: z.boolean(),
    mode: z.enum(['manual', 'trigger', 'webhook', 'retry', 'integrated', 'cli']),
    retryOf: N8nIdSchema.nullable().optional(),
    retrySuccessId: N8nIdSchema.nullable().optional(),
    startedAt: N8nTimestampSchema,
    stoppedAt: N8nTimestampSchema.nullable().optional(),
    workflowId: N8nIdSchema,
    workflowData: WorkflowSchema.optional(),
    status: ExecutionStatusSchema,
    data: ExecutionDataSchema.optional(),
});
// Credential types
export const CredentialTypeSchema = z.object({
    name: z.string(),
    displayName: z.string(),
    properties: z.array(z.record(z.unknown())),
    documentationUrl: z.string().optional(),
    iconUrl: z.string().optional(),
    extends: z.array(z.string()).optional(),
});
export const CredentialSchema = z.object({
    id: N8nIdSchema,
    name: z.string(),
    type: z.string(),
    nodesAccess: z.array(z.object({
        nodeType: z.string(),
        date: N8nTimestampSchema,
    })).optional(),
    createdAt: N8nTimestampSchema,
    updatedAt: N8nTimestampSchema,
});
// API Response types
export const PaginationSchema = z.object({
    limit: z.number(),
    offset: z.number().optional(),
    count: z.number(),
});
export const WorkflowListResponseSchema = z.object({
    data: z.array(WorkflowSchema),
    nextCursor: z.string().nullable().optional(),
});
export const ExecutionListResponseSchema = z.object({
    data: z.array(ExecutionSchema),
    nextCursor: z.string().nullable().optional(),
});
export const CredentialListResponseSchema = z.object({
    data: z.array(CredentialSchema),
    nextCursor: z.string().nullable().optional(),
});
//# sourceMappingURL=n8n.types.js.map