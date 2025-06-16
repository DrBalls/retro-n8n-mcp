import { z } from 'zod';
export declare const SemanticVersionSchema: z.ZodObject<{
    major: z.ZodNumber;
    minor: z.ZodNumber;
    patch: z.ZodNumber;
    prerelease: z.ZodOptional<z.ZodString>;
    build: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    patch: number;
    major: number;
    minor: number;
    prerelease?: string | undefined;
    build?: string | undefined;
}, {
    patch: number;
    major: number;
    minor: number;
    prerelease?: string | undefined;
    build?: string | undefined;
}>;
export declare const VersionTagSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    color: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    description?: string | undefined;
    color?: string | undefined;
}, {
    name: string;
    description?: string | undefined;
    color?: string | undefined;
}>;
export declare const ChangeTypeSchema: z.ZodEnum<["create", "update", "delete", "move", "rename", "parameter_change", "connection_change", "node_add", "node_remove", "activation_change"]>;
export declare const WorkflowChangeSchema: z.ZodObject<{
    id: z.ZodString;
    type: z.ZodEnum<["create", "update", "delete", "move", "rename", "parameter_change", "connection_change", "node_add", "node_remove", "activation_change"]>;
    path: z.ZodString;
    oldValue: z.ZodOptional<z.ZodUnknown>;
    newValue: z.ZodOptional<z.ZodUnknown>;
    description: z.ZodOptional<z.ZodString>;
    timestamp: z.ZodString;
}, "strip", z.ZodTypeAny, {
    timestamp: string;
    path: string;
    type: "delete" | "update" | "create" | "move" | "rename" | "parameter_change" | "connection_change" | "node_add" | "node_remove" | "activation_change";
    id: string;
    description?: string | undefined;
    oldValue?: unknown;
    newValue?: unknown;
}, {
    timestamp: string;
    path: string;
    type: "delete" | "update" | "create" | "move" | "rename" | "parameter_change" | "connection_change" | "node_add" | "node_remove" | "activation_change";
    id: string;
    description?: string | undefined;
    oldValue?: unknown;
    newValue?: unknown;
}>;
export declare const WorkflowVersionSchema: z.ZodObject<{
    id: z.ZodString;
    workflowId: z.ZodString;
    parentVersionId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    branchName: z.ZodDefault<z.ZodString>;
    version: z.ZodObject<{
        major: z.ZodNumber;
        minor: z.ZodNumber;
        patch: z.ZodNumber;
        prerelease: z.ZodOptional<z.ZodString>;
        build: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        patch: number;
        major: number;
        minor: number;
        prerelease?: string | undefined;
        build?: string | undefined;
    }, {
        patch: number;
        major: number;
        minor: number;
        prerelease?: string | undefined;
        build?: string | undefined;
    }>;
    versionString: z.ZodString;
    workflow: z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        active: z.ZodBoolean;
        nodes: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            type: z.ZodString;
            typeVersion: z.ZodNumber;
            position: z.ZodArray<z.ZodNumber, "many">;
            parameters: z.ZodRecord<z.ZodString, z.ZodUnknown>;
            credentials: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
            disabled: z.ZodOptional<z.ZodBoolean>;
            notes: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            type: string;
            id: string;
            name: string;
            typeVersion: number;
            position: number[];
            parameters: Record<string, unknown>;
            credentials?: Record<string, unknown> | undefined;
            disabled?: boolean | undefined;
            notes?: string | undefined;
        }, {
            type: string;
            id: string;
            name: string;
            typeVersion: number;
            position: number[];
            parameters: Record<string, unknown>;
            credentials?: Record<string, unknown> | undefined;
            disabled?: boolean | undefined;
            notes?: string | undefined;
        }>, "many">;
        connections: z.ZodRecord<z.ZodString, z.ZodRecord<z.ZodString, z.ZodArray<z.ZodArray<z.ZodUnion<[z.ZodObject<{
            source: z.ZodObject<{
                id: z.ZodString;
                outputIndex: z.ZodOptional<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                id: string;
                outputIndex?: number | undefined;
            }, {
                id: string;
                outputIndex?: number | undefined;
            }>;
            target: z.ZodObject<{
                id: z.ZodString;
                inputIndex: z.ZodOptional<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                id: string;
                inputIndex?: number | undefined;
            }, {
                id: string;
                inputIndex?: number | undefined;
            }>;
        }, "strip", z.ZodTypeAny, {
            source: {
                id: string;
                outputIndex?: number | undefined;
            };
            target: {
                id: string;
                inputIndex?: number | undefined;
            };
        }, {
            source: {
                id: string;
                outputIndex?: number | undefined;
            };
            target: {
                id: string;
                inputIndex?: number | undefined;
            };
        }>, z.ZodObject<{
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
        }>]>, "many">, "many">>>;
        settings: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        staticData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
        versionId: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
        active: boolean;
        nodes: {
            type: string;
            id: string;
            name: string;
            typeVersion: number;
            position: number[];
            parameters: Record<string, unknown>;
            credentials?: Record<string, unknown> | undefined;
            disabled?: boolean | undefined;
            notes?: string | undefined;
        }[];
        connections: Record<string, Record<string, ({
            type: string;
            node: string;
            index: number;
        } | {
            source: {
                id: string;
                outputIndex?: number | undefined;
            };
            target: {
                id: string;
                inputIndex?: number | undefined;
            };
        })[][]>>;
        createdAt: string;
        updatedAt: string;
        settings?: Record<string, unknown> | undefined;
        staticData?: Record<string, unknown> | undefined;
        tags?: string[] | undefined;
        versionId?: string | undefined;
    }, {
        id: string;
        name: string;
        active: boolean;
        nodes: {
            type: string;
            id: string;
            name: string;
            typeVersion: number;
            position: number[];
            parameters: Record<string, unknown>;
            credentials?: Record<string, unknown> | undefined;
            disabled?: boolean | undefined;
            notes?: string | undefined;
        }[];
        connections: Record<string, Record<string, ({
            type: string;
            node: string;
            index: number;
        } | {
            source: {
                id: string;
                outputIndex?: number | undefined;
            };
            target: {
                id: string;
                inputIndex?: number | undefined;
            };
        })[][]>>;
        createdAt: string;
        updatedAt: string;
        settings?: Record<string, unknown> | undefined;
        staticData?: Record<string, unknown> | undefined;
        tags?: string[] | undefined;
        versionId?: string | undefined;
    }>;
    changes: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        type: z.ZodEnum<["create", "update", "delete", "move", "rename", "parameter_change", "connection_change", "node_add", "node_remove", "activation_change"]>;
        path: z.ZodString;
        oldValue: z.ZodOptional<z.ZodUnknown>;
        newValue: z.ZodOptional<z.ZodUnknown>;
        description: z.ZodOptional<z.ZodString>;
        timestamp: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        timestamp: string;
        path: string;
        type: "delete" | "update" | "create" | "move" | "rename" | "parameter_change" | "connection_change" | "node_add" | "node_remove" | "activation_change";
        id: string;
        description?: string | undefined;
        oldValue?: unknown;
        newValue?: unknown;
    }, {
        timestamp: string;
        path: string;
        type: "delete" | "update" | "create" | "move" | "rename" | "parameter_change" | "connection_change" | "node_add" | "node_remove" | "activation_change";
        id: string;
        description?: string | undefined;
        oldValue?: unknown;
        newValue?: unknown;
    }>, "many">;
    commitMessage: z.ZodOptional<z.ZodString>;
    author: z.ZodOptional<z.ZodString>;
    tags: z.ZodDefault<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        color: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        description?: string | undefined;
        color?: string | undefined;
    }, {
        name: string;
        description?: string | undefined;
        color?: string | undefined;
    }>, "many">>;
    createdAt: z.ZodString;
    isSnapshot: z.ZodDefault<z.ZodBoolean>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    tags: {
        name: string;
        description?: string | undefined;
        color?: string | undefined;
    }[];
    createdAt: string;
    workflowId: string;
    version: {
        patch: number;
        major: number;
        minor: number;
        prerelease?: string | undefined;
        build?: string | undefined;
    };
    workflow: {
        id: string;
        name: string;
        active: boolean;
        nodes: {
            type: string;
            id: string;
            name: string;
            typeVersion: number;
            position: number[];
            parameters: Record<string, unknown>;
            credentials?: Record<string, unknown> | undefined;
            disabled?: boolean | undefined;
            notes?: string | undefined;
        }[];
        connections: Record<string, Record<string, ({
            type: string;
            node: string;
            index: number;
        } | {
            source: {
                id: string;
                outputIndex?: number | undefined;
            };
            target: {
                id: string;
                inputIndex?: number | undefined;
            };
        })[][]>>;
        createdAt: string;
        updatedAt: string;
        settings?: Record<string, unknown> | undefined;
        staticData?: Record<string, unknown> | undefined;
        tags?: string[] | undefined;
        versionId?: string | undefined;
    };
    branchName: string;
    versionString: string;
    changes: {
        timestamp: string;
        path: string;
        type: "delete" | "update" | "create" | "move" | "rename" | "parameter_change" | "connection_change" | "node_add" | "node_remove" | "activation_change";
        id: string;
        description?: string | undefined;
        oldValue?: unknown;
        newValue?: unknown;
    }[];
    isSnapshot: boolean;
    metadata?: Record<string, unknown> | undefined;
    parentVersionId?: string | null | undefined;
    commitMessage?: string | undefined;
    author?: string | undefined;
}, {
    id: string;
    createdAt: string;
    workflowId: string;
    version: {
        patch: number;
        major: number;
        minor: number;
        prerelease?: string | undefined;
        build?: string | undefined;
    };
    workflow: {
        id: string;
        name: string;
        active: boolean;
        nodes: {
            type: string;
            id: string;
            name: string;
            typeVersion: number;
            position: number[];
            parameters: Record<string, unknown>;
            credentials?: Record<string, unknown> | undefined;
            disabled?: boolean | undefined;
            notes?: string | undefined;
        }[];
        connections: Record<string, Record<string, ({
            type: string;
            node: string;
            index: number;
        } | {
            source: {
                id: string;
                outputIndex?: number | undefined;
            };
            target: {
                id: string;
                inputIndex?: number | undefined;
            };
        })[][]>>;
        createdAt: string;
        updatedAt: string;
        settings?: Record<string, unknown> | undefined;
        staticData?: Record<string, unknown> | undefined;
        tags?: string[] | undefined;
        versionId?: string | undefined;
    };
    versionString: string;
    changes: {
        timestamp: string;
        path: string;
        type: "delete" | "update" | "create" | "move" | "rename" | "parameter_change" | "connection_change" | "node_add" | "node_remove" | "activation_change";
        id: string;
        description?: string | undefined;
        oldValue?: unknown;
        newValue?: unknown;
    }[];
    tags?: {
        name: string;
        description?: string | undefined;
        color?: string | undefined;
    }[] | undefined;
    metadata?: Record<string, unknown> | undefined;
    parentVersionId?: string | null | undefined;
    branchName?: string | undefined;
    commitMessage?: string | undefined;
    author?: string | undefined;
    isSnapshot?: boolean | undefined;
}>;
export declare const WorkflowBranchSchema: z.ZodObject<{
    id: z.ZodString;
    workflowId: z.ZodString;
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    baseVersionId: z.ZodString;
    headVersionId: z.ZodString;
    isActive: z.ZodDefault<z.ZodBoolean>;
    isMerged: z.ZodDefault<z.ZodBoolean>;
    mergedAt: z.ZodOptional<z.ZodString>;
    createdBy: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    workflowId: string;
    isActive: boolean;
    baseVersionId: string;
    headVersionId: string;
    isMerged: boolean;
    description?: string | undefined;
    mergedAt?: string | undefined;
    createdBy?: string | undefined;
}, {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    workflowId: string;
    baseVersionId: string;
    headVersionId: string;
    description?: string | undefined;
    isActive?: boolean | undefined;
    isMerged?: boolean | undefined;
    mergedAt?: string | undefined;
    createdBy?: string | undefined;
}>;
export declare const MergeConflictSchema: z.ZodObject<{
    id: z.ZodString;
    path: z.ZodString;
    conflictType: z.ZodEnum<["property_conflict", "node_conflict", "connection_conflict", "deletion_conflict"]>;
    sourceValue: z.ZodUnknown;
    targetValue: z.ZodUnknown;
    baseValue: z.ZodOptional<z.ZodUnknown>;
    resolution: z.ZodOptional<z.ZodEnum<["source", "target", "manual", "skip"]>>;
    resolvedValue: z.ZodOptional<z.ZodUnknown>;
    description: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    path: string;
    id: string;
    conflictType: "property_conflict" | "node_conflict" | "connection_conflict" | "deletion_conflict";
    description?: string | undefined;
    sourceValue?: unknown;
    targetValue?: unknown;
    baseValue?: unknown;
    resolution?: "source" | "target" | "manual" | "skip" | undefined;
    resolvedValue?: unknown;
}, {
    path: string;
    id: string;
    conflictType: "property_conflict" | "node_conflict" | "connection_conflict" | "deletion_conflict";
    description?: string | undefined;
    sourceValue?: unknown;
    targetValue?: unknown;
    baseValue?: unknown;
    resolution?: "source" | "target" | "manual" | "skip" | undefined;
    resolvedValue?: unknown;
}>;
export declare const MergeResultSchema: z.ZodObject<{
    id: z.ZodString;
    sourceBranchId: z.ZodString;
    targetBranchId: z.ZodString;
    mergedWorkflow: z.ZodOptional<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        active: z.ZodBoolean;
        nodes: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            type: z.ZodString;
            typeVersion: z.ZodNumber;
            position: z.ZodArray<z.ZodNumber, "many">;
            parameters: z.ZodRecord<z.ZodString, z.ZodUnknown>;
            credentials: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
            disabled: z.ZodOptional<z.ZodBoolean>;
            notes: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            type: string;
            id: string;
            name: string;
            typeVersion: number;
            position: number[];
            parameters: Record<string, unknown>;
            credentials?: Record<string, unknown> | undefined;
            disabled?: boolean | undefined;
            notes?: string | undefined;
        }, {
            type: string;
            id: string;
            name: string;
            typeVersion: number;
            position: number[];
            parameters: Record<string, unknown>;
            credentials?: Record<string, unknown> | undefined;
            disabled?: boolean | undefined;
            notes?: string | undefined;
        }>, "many">;
        connections: z.ZodRecord<z.ZodString, z.ZodRecord<z.ZodString, z.ZodArray<z.ZodArray<z.ZodUnion<[z.ZodObject<{
            source: z.ZodObject<{
                id: z.ZodString;
                outputIndex: z.ZodOptional<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                id: string;
                outputIndex?: number | undefined;
            }, {
                id: string;
                outputIndex?: number | undefined;
            }>;
            target: z.ZodObject<{
                id: z.ZodString;
                inputIndex: z.ZodOptional<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                id: string;
                inputIndex?: number | undefined;
            }, {
                id: string;
                inputIndex?: number | undefined;
            }>;
        }, "strip", z.ZodTypeAny, {
            source: {
                id: string;
                outputIndex?: number | undefined;
            };
            target: {
                id: string;
                inputIndex?: number | undefined;
            };
        }, {
            source: {
                id: string;
                outputIndex?: number | undefined;
            };
            target: {
                id: string;
                inputIndex?: number | undefined;
            };
        }>, z.ZodObject<{
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
        }>]>, "many">, "many">>>;
        settings: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        staticData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
        versionId: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
        active: boolean;
        nodes: {
            type: string;
            id: string;
            name: string;
            typeVersion: number;
            position: number[];
            parameters: Record<string, unknown>;
            credentials?: Record<string, unknown> | undefined;
            disabled?: boolean | undefined;
            notes?: string | undefined;
        }[];
        connections: Record<string, Record<string, ({
            type: string;
            node: string;
            index: number;
        } | {
            source: {
                id: string;
                outputIndex?: number | undefined;
            };
            target: {
                id: string;
                inputIndex?: number | undefined;
            };
        })[][]>>;
        createdAt: string;
        updatedAt: string;
        settings?: Record<string, unknown> | undefined;
        staticData?: Record<string, unknown> | undefined;
        tags?: string[] | undefined;
        versionId?: string | undefined;
    }, {
        id: string;
        name: string;
        active: boolean;
        nodes: {
            type: string;
            id: string;
            name: string;
            typeVersion: number;
            position: number[];
            parameters: Record<string, unknown>;
            credentials?: Record<string, unknown> | undefined;
            disabled?: boolean | undefined;
            notes?: string | undefined;
        }[];
        connections: Record<string, Record<string, ({
            type: string;
            node: string;
            index: number;
        } | {
            source: {
                id: string;
                outputIndex?: number | undefined;
            };
            target: {
                id: string;
                inputIndex?: number | undefined;
            };
        })[][]>>;
        createdAt: string;
        updatedAt: string;
        settings?: Record<string, unknown> | undefined;
        staticData?: Record<string, unknown> | undefined;
        tags?: string[] | undefined;
        versionId?: string | undefined;
    }>>;
    conflicts: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        path: z.ZodString;
        conflictType: z.ZodEnum<["property_conflict", "node_conflict", "connection_conflict", "deletion_conflict"]>;
        sourceValue: z.ZodUnknown;
        targetValue: z.ZodUnknown;
        baseValue: z.ZodOptional<z.ZodUnknown>;
        resolution: z.ZodOptional<z.ZodEnum<["source", "target", "manual", "skip"]>>;
        resolvedValue: z.ZodOptional<z.ZodUnknown>;
        description: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        path: string;
        id: string;
        conflictType: "property_conflict" | "node_conflict" | "connection_conflict" | "deletion_conflict";
        description?: string | undefined;
        sourceValue?: unknown;
        targetValue?: unknown;
        baseValue?: unknown;
        resolution?: "source" | "target" | "manual" | "skip" | undefined;
        resolvedValue?: unknown;
    }, {
        path: string;
        id: string;
        conflictType: "property_conflict" | "node_conflict" | "connection_conflict" | "deletion_conflict";
        description?: string | undefined;
        sourceValue?: unknown;
        targetValue?: unknown;
        baseValue?: unknown;
        resolution?: "source" | "target" | "manual" | "skip" | undefined;
        resolvedValue?: unknown;
    }>, "many">;
    hasConflicts: z.ZodBoolean;
    isAutoMergeable: z.ZodBoolean;
    mergeStrategy: z.ZodEnum<["auto", "manual", "ours", "theirs"]>;
    createdAt: z.ZodString;
    resolvedAt: z.ZodOptional<z.ZodString>;
    mergedAt: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: string;
    sourceBranchId: string;
    targetBranchId: string;
    conflicts: {
        path: string;
        id: string;
        conflictType: "property_conflict" | "node_conflict" | "connection_conflict" | "deletion_conflict";
        description?: string | undefined;
        sourceValue?: unknown;
        targetValue?: unknown;
        baseValue?: unknown;
        resolution?: "source" | "target" | "manual" | "skip" | undefined;
        resolvedValue?: unknown;
    }[];
    hasConflicts: boolean;
    isAutoMergeable: boolean;
    mergeStrategy: "manual" | "auto" | "ours" | "theirs";
    mergedAt?: string | undefined;
    mergedWorkflow?: {
        id: string;
        name: string;
        active: boolean;
        nodes: {
            type: string;
            id: string;
            name: string;
            typeVersion: number;
            position: number[];
            parameters: Record<string, unknown>;
            credentials?: Record<string, unknown> | undefined;
            disabled?: boolean | undefined;
            notes?: string | undefined;
        }[];
        connections: Record<string, Record<string, ({
            type: string;
            node: string;
            index: number;
        } | {
            source: {
                id: string;
                outputIndex?: number | undefined;
            };
            target: {
                id: string;
                inputIndex?: number | undefined;
            };
        })[][]>>;
        createdAt: string;
        updatedAt: string;
        settings?: Record<string, unknown> | undefined;
        staticData?: Record<string, unknown> | undefined;
        tags?: string[] | undefined;
        versionId?: string | undefined;
    } | undefined;
    resolvedAt?: string | undefined;
}, {
    id: string;
    createdAt: string;
    sourceBranchId: string;
    targetBranchId: string;
    conflicts: {
        path: string;
        id: string;
        conflictType: "property_conflict" | "node_conflict" | "connection_conflict" | "deletion_conflict";
        description?: string | undefined;
        sourceValue?: unknown;
        targetValue?: unknown;
        baseValue?: unknown;
        resolution?: "source" | "target" | "manual" | "skip" | undefined;
        resolvedValue?: unknown;
    }[];
    hasConflicts: boolean;
    isAutoMergeable: boolean;
    mergeStrategy: "manual" | "auto" | "ours" | "theirs";
    mergedAt?: string | undefined;
    mergedWorkflow?: {
        id: string;
        name: string;
        active: boolean;
        nodes: {
            type: string;
            id: string;
            name: string;
            typeVersion: number;
            position: number[];
            parameters: Record<string, unknown>;
            credentials?: Record<string, unknown> | undefined;
            disabled?: boolean | undefined;
            notes?: string | undefined;
        }[];
        connections: Record<string, Record<string, ({
            type: string;
            node: string;
            index: number;
        } | {
            source: {
                id: string;
                outputIndex?: number | undefined;
            };
            target: {
                id: string;
                inputIndex?: number | undefined;
            };
        })[][]>>;
        createdAt: string;
        updatedAt: string;
        settings?: Record<string, unknown> | undefined;
        staticData?: Record<string, unknown> | undefined;
        tags?: string[] | undefined;
        versionId?: string | undefined;
    } | undefined;
    resolvedAt?: string | undefined;
}>;
export declare const DiffOperationSchema: z.ZodObject<{
    operation: z.ZodEnum<["add", "remove", "replace", "move", "copy"]>;
    path: z.ZodString;
    value: z.ZodOptional<z.ZodUnknown>;
    oldValue: z.ZodOptional<z.ZodUnknown>;
    from: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    operation: "replace" | "add" | "remove" | "move" | "copy";
    path: string;
    value?: unknown;
    oldValue?: unknown;
    from?: string | undefined;
}, {
    operation: "replace" | "add" | "remove" | "move" | "copy";
    path: string;
    value?: unknown;
    oldValue?: unknown;
    from?: string | undefined;
}>;
export declare const VersionDiffSchema: z.ZodObject<{
    fromVersionId: z.ZodString;
    toVersionId: z.ZodString;
    operations: z.ZodArray<z.ZodObject<{
        operation: z.ZodEnum<["add", "remove", "replace", "move", "copy"]>;
        path: z.ZodString;
        value: z.ZodOptional<z.ZodUnknown>;
        oldValue: z.ZodOptional<z.ZodUnknown>;
        from: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        operation: "replace" | "add" | "remove" | "move" | "copy";
        path: string;
        value?: unknown;
        oldValue?: unknown;
        from?: string | undefined;
    }, {
        operation: "replace" | "add" | "remove" | "move" | "copy";
        path: string;
        value?: unknown;
        oldValue?: unknown;
        from?: string | undefined;
    }>, "many">;
    summary: z.ZodObject<{
        nodesAdded: z.ZodNumber;
        nodesRemoved: z.ZodNumber;
        nodesModified: z.ZodNumber;
        connectionsAdded: z.ZodNumber;
        connectionsRemoved: z.ZodNumber;
        parametersChanged: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        nodesAdded: number;
        nodesRemoved: number;
        nodesModified: number;
        connectionsAdded: number;
        connectionsRemoved: number;
        parametersChanged: number;
    }, {
        nodesAdded: number;
        nodesRemoved: number;
        nodesModified: number;
        connectionsAdded: number;
        connectionsRemoved: number;
        parametersChanged: number;
    }>;
    generatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    summary: {
        nodesAdded: number;
        nodesRemoved: number;
        nodesModified: number;
        connectionsAdded: number;
        connectionsRemoved: number;
        parametersChanged: number;
    };
    fromVersionId: string;
    toVersionId: string;
    operations: {
        operation: "replace" | "add" | "remove" | "move" | "copy";
        path: string;
        value?: unknown;
        oldValue?: unknown;
        from?: string | undefined;
    }[];
    generatedAt: string;
}, {
    summary: {
        nodesAdded: number;
        nodesRemoved: number;
        nodesModified: number;
        connectionsAdded: number;
        connectionsRemoved: number;
        parametersChanged: number;
    };
    fromVersionId: string;
    toVersionId: string;
    operations: {
        operation: "replace" | "add" | "remove" | "move" | "copy";
        path: string;
        value?: unknown;
        oldValue?: unknown;
        from?: string | undefined;
    }[];
    generatedAt: string;
}>;
export declare const VersionControlSettingsSchema: z.ZodObject<{
    workflowId: z.ZodString;
    autoVersion: z.ZodDefault<z.ZodBoolean>;
    versioningStrategy: z.ZodDefault<z.ZodEnum<["semantic", "sequential", "timestamp"]>>;
    autoSnapshot: z.ZodDefault<z.ZodBoolean>;
    snapshotInterval: z.ZodDefault<z.ZodNumber>;
    maxVersions: z.ZodDefault<z.ZodNumber>;
    retentionDays: z.ZodDefault<z.ZodNumber>;
    requireCommitMessage: z.ZodDefault<z.ZodBoolean>;
    allowBranching: z.ZodDefault<z.ZodBoolean>;
    defaultBranch: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    workflowId: string;
    autoVersion: boolean;
    versioningStrategy: "timestamp" | "semantic" | "sequential";
    autoSnapshot: boolean;
    snapshotInterval: number;
    maxVersions: number;
    retentionDays: number;
    requireCommitMessage: boolean;
    allowBranching: boolean;
    defaultBranch: string;
}, {
    workflowId: string;
    autoVersion?: boolean | undefined;
    versioningStrategy?: "timestamp" | "semantic" | "sequential" | undefined;
    autoSnapshot?: boolean | undefined;
    snapshotInterval?: number | undefined;
    maxVersions?: number | undefined;
    retentionDays?: number | undefined;
    requireCommitMessage?: boolean | undefined;
    allowBranching?: boolean | undefined;
    defaultBranch?: string | undefined;
}>;
export type SemanticVersion = z.infer<typeof SemanticVersionSchema>;
export type VersionTag = z.infer<typeof VersionTagSchema>;
export type ChangeType = z.infer<typeof ChangeTypeSchema>;
export type WorkflowChange = z.infer<typeof WorkflowChangeSchema>;
export type WorkflowVersion = z.infer<typeof WorkflowVersionSchema>;
export type WorkflowBranch = z.infer<typeof WorkflowBranchSchema>;
export type MergeConflict = z.infer<typeof MergeConflictSchema>;
export type MergeResult = z.infer<typeof MergeResultSchema>;
export type DiffOperation = z.infer<typeof DiffOperationSchema>;
export type VersionDiff = z.infer<typeof VersionDiffSchema>;
export type VersionControlSettings = z.infer<typeof VersionControlSettingsSchema>;
//# sourceMappingURL=version-control.types.d.ts.map