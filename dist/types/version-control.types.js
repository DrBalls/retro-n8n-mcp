import { z } from 'zod';
import { N8nIdSchema, N8nTimestampSchema, WorkflowSchema } from './n8n.types.js';
// Semantic version schema
export const SemanticVersionSchema = z.object({
    major: z.number().min(0),
    minor: z.number().min(0),
    patch: z.number().min(0),
    prerelease: z.string().optional(),
    build: z.string().optional(),
});
// Version tag schema
export const VersionTagSchema = z.object({
    name: z.string().min(1).max(50),
    description: z.string().optional(),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
});
// Change type enumeration
export const ChangeTypeSchema = z.enum([
    'create',
    'update',
    'delete',
    'move',
    'rename',
    'parameter_change',
    'connection_change',
    'node_add',
    'node_remove',
    'activation_change',
]);
// Individual change in a workflow
export const WorkflowChangeSchema = z.object({
    id: z.string(),
    type: ChangeTypeSchema,
    path: z.string(), // JSON path to the changed element
    oldValue: z.unknown().optional(),
    newValue: z.unknown().optional(),
    description: z.string().optional(),
    timestamp: N8nTimestampSchema,
});
// Workflow version schema
export const WorkflowVersionSchema = z.object({
    id: N8nIdSchema,
    workflowId: N8nIdSchema,
    parentVersionId: N8nIdSchema.nullable().optional(),
    branchName: z.string().default('main'),
    version: SemanticVersionSchema,
    versionString: z.string(), // e.g., "1.2.3-beta.1"
    workflow: WorkflowSchema,
    changes: z.array(WorkflowChangeSchema),
    commitMessage: z.string().optional(),
    author: z.string().optional(),
    tags: z.array(VersionTagSchema).default([]),
    createdAt: N8nTimestampSchema,
    isSnapshot: z.boolean().default(false),
    metadata: z.record(z.unknown()).optional(),
});
// Branch schema
export const WorkflowBranchSchema = z.object({
    id: N8nIdSchema,
    workflowId: N8nIdSchema,
    name: z.string().min(1).max(100),
    description: z.string().optional(),
    baseVersionId: N8nIdSchema,
    headVersionId: N8nIdSchema,
    isActive: z.boolean().default(true),
    isMerged: z.boolean().default(false),
    mergedAt: N8nTimestampSchema.optional(),
    createdBy: z.string().optional(),
    createdAt: N8nTimestampSchema,
    updatedAt: N8nTimestampSchema,
});
// Merge conflict schema
export const MergeConflictSchema = z.object({
    id: z.string(),
    path: z.string(),
    conflictType: z.enum([
        'property_conflict',
        'node_conflict',
        'connection_conflict',
        'deletion_conflict',
    ]),
    sourceValue: z.unknown(),
    targetValue: z.unknown(),
    baseValue: z.unknown().optional(),
    resolution: z.enum(['source', 'target', 'manual', 'skip']).optional(),
    resolvedValue: z.unknown().optional(),
    description: z.string().optional(),
});
// Merge result schema
export const MergeResultSchema = z.object({
    id: N8nIdSchema,
    sourceBranchId: N8nIdSchema,
    targetBranchId: N8nIdSchema,
    mergedWorkflow: WorkflowSchema.optional(),
    conflicts: z.array(MergeConflictSchema),
    hasConflicts: z.boolean(),
    isAutoMergeable: z.boolean(),
    mergeStrategy: z.enum(['auto', 'manual', 'ours', 'theirs']),
    createdAt: N8nTimestampSchema,
    resolvedAt: N8nTimestampSchema.optional(),
    mergedAt: N8nTimestampSchema.optional(),
});
// Diff operation schema
export const DiffOperationSchema = z.object({
    operation: z.enum(['add', 'remove', 'replace', 'move', 'copy']),
    path: z.string(),
    value: z.unknown().optional(),
    oldValue: z.unknown().optional(),
    from: z.string().optional(), // for move operations
});
// Version diff schema
export const VersionDiffSchema = z.object({
    fromVersionId: N8nIdSchema,
    toVersionId: N8nIdSchema,
    operations: z.array(DiffOperationSchema),
    summary: z.object({
        nodesAdded: z.number(),
        nodesRemoved: z.number(),
        nodesModified: z.number(),
        connectionsAdded: z.number(),
        connectionsRemoved: z.number(),
        parametersChanged: z.number(),
    }),
    generatedAt: N8nTimestampSchema,
});
// Version control settings schema
export const VersionControlSettingsSchema = z.object({
    workflowId: N8nIdSchema,
    autoVersion: z.boolean().default(true),
    versioningStrategy: z.enum(['semantic', 'sequential', 'timestamp']).default('semantic'),
    autoSnapshot: z.boolean().default(false),
    snapshotInterval: z.number().min(1).max(24).default(1), // hours
    maxVersions: z.number().min(1).max(1000).default(100),
    retentionDays: z.number().min(1).max(365).default(90),
    requireCommitMessage: z.boolean().default(false),
    allowBranching: z.boolean().default(true),
    defaultBranch: z.string().default('main'),
});
//# sourceMappingURL=version-control.types.js.map