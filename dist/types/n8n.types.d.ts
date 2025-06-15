import { z } from 'zod';
export declare const N8nIdSchema: z.ZodString;
export declare const N8nTimestampSchema: z.ZodString;
export declare const WorkflowNodeSchema: z.ZodObject<{
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
}>;
export declare const WorkflowConnectionSchema: z.ZodObject<{
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
}>;
export declare const WorkflowSchema: z.ZodObject<{
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
    connections: z.ZodRecord<z.ZodString, z.ZodRecord<z.ZodString, z.ZodArray<z.ZodArray<z.ZodObject<{
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
    }>, "many">, "many">>>;
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
    connections: Record<string, Record<string, {
        source: {
            id: string;
            outputIndex?: number | undefined;
        };
        target: {
            id: string;
            inputIndex?: number | undefined;
        };
    }[][]>>;
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
    connections: Record<string, Record<string, {
        source: {
            id: string;
            outputIndex?: number | undefined;
        };
        target: {
            id: string;
            inputIndex?: number | undefined;
        };
    }[][]>>;
    createdAt: string;
    updatedAt: string;
    settings?: Record<string, unknown> | undefined;
    staticData?: Record<string, unknown> | undefined;
    tags?: string[] | undefined;
    versionId?: string | undefined;
}>;
export declare const ExecutionStatusSchema: z.ZodEnum<["canceled", "crashed", "error", "new", "running", "success", "unknown", "waiting"]>;
export declare const ExecutionDataSchema: z.ZodObject<{
    startData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    resultData: z.ZodObject<{
        runData: z.ZodRecord<z.ZodString, z.ZodUnknown>;
        lastNodeExecuted: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        runData: Record<string, unknown>;
        lastNodeExecuted?: string | undefined;
    }, {
        runData: Record<string, unknown>;
        lastNodeExecuted?: string | undefined;
    }>;
    executionData: z.ZodObject<{
        contextData: z.ZodRecord<z.ZodString, z.ZodUnknown>;
        nodeExecutionStack: z.ZodArray<z.ZodUnknown, "many">;
        waitingExecution: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        waitingExecutionSource: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    }, "strip", z.ZodTypeAny, {
        contextData: Record<string, unknown>;
        nodeExecutionStack: unknown[];
        waitingExecution?: Record<string, unknown> | undefined;
        waitingExecutionSource?: Record<string, unknown> | undefined;
    }, {
        contextData: Record<string, unknown>;
        nodeExecutionStack: unknown[];
        waitingExecution?: Record<string, unknown> | undefined;
        waitingExecutionSource?: Record<string, unknown> | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    resultData: {
        runData: Record<string, unknown>;
        lastNodeExecuted?: string | undefined;
    };
    executionData: {
        contextData: Record<string, unknown>;
        nodeExecutionStack: unknown[];
        waitingExecution?: Record<string, unknown> | undefined;
        waitingExecutionSource?: Record<string, unknown> | undefined;
    };
    startData?: Record<string, unknown> | undefined;
}, {
    resultData: {
        runData: Record<string, unknown>;
        lastNodeExecuted?: string | undefined;
    };
    executionData: {
        contextData: Record<string, unknown>;
        nodeExecutionStack: unknown[];
        waitingExecution?: Record<string, unknown> | undefined;
        waitingExecutionSource?: Record<string, unknown> | undefined;
    };
    startData?: Record<string, unknown> | undefined;
}>;
export declare const ExecutionSchema: z.ZodObject<{
    id: z.ZodString;
    finished: z.ZodBoolean;
    mode: z.ZodEnum<["manual", "trigger", "webhook", "retry", "integrated", "cli"]>;
    retryOf: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    retrySuccessId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    startedAt: z.ZodString;
    stoppedAt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    workflowId: z.ZodString;
    workflowData: z.ZodOptional<z.ZodObject<{
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
        connections: z.ZodRecord<z.ZodString, z.ZodRecord<z.ZodString, z.ZodArray<z.ZodArray<z.ZodObject<{
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
        }>, "many">, "many">>>;
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
        connections: Record<string, Record<string, {
            source: {
                id: string;
                outputIndex?: number | undefined;
            };
            target: {
                id: string;
                inputIndex?: number | undefined;
            };
        }[][]>>;
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
        connections: Record<string, Record<string, {
            source: {
                id: string;
                outputIndex?: number | undefined;
            };
            target: {
                id: string;
                inputIndex?: number | undefined;
            };
        }[][]>>;
        createdAt: string;
        updatedAt: string;
        settings?: Record<string, unknown> | undefined;
        staticData?: Record<string, unknown> | undefined;
        tags?: string[] | undefined;
        versionId?: string | undefined;
    }>>;
    status: z.ZodEnum<["canceled", "crashed", "error", "new", "running", "success", "unknown", "waiting"]>;
    data: z.ZodOptional<z.ZodObject<{
        startData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        resultData: z.ZodObject<{
            runData: z.ZodRecord<z.ZodString, z.ZodUnknown>;
            lastNodeExecuted: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            runData: Record<string, unknown>;
            lastNodeExecuted?: string | undefined;
        }, {
            runData: Record<string, unknown>;
            lastNodeExecuted?: string | undefined;
        }>;
        executionData: z.ZodObject<{
            contextData: z.ZodRecord<z.ZodString, z.ZodUnknown>;
            nodeExecutionStack: z.ZodArray<z.ZodUnknown, "many">;
            waitingExecution: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
            waitingExecutionSource: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        }, "strip", z.ZodTypeAny, {
            contextData: Record<string, unknown>;
            nodeExecutionStack: unknown[];
            waitingExecution?: Record<string, unknown> | undefined;
            waitingExecutionSource?: Record<string, unknown> | undefined;
        }, {
            contextData: Record<string, unknown>;
            nodeExecutionStack: unknown[];
            waitingExecution?: Record<string, unknown> | undefined;
            waitingExecutionSource?: Record<string, unknown> | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        resultData: {
            runData: Record<string, unknown>;
            lastNodeExecuted?: string | undefined;
        };
        executionData: {
            contextData: Record<string, unknown>;
            nodeExecutionStack: unknown[];
            waitingExecution?: Record<string, unknown> | undefined;
            waitingExecutionSource?: Record<string, unknown> | undefined;
        };
        startData?: Record<string, unknown> | undefined;
    }, {
        resultData: {
            runData: Record<string, unknown>;
            lastNodeExecuted?: string | undefined;
        };
        executionData: {
            contextData: Record<string, unknown>;
            nodeExecutionStack: unknown[];
            waitingExecution?: Record<string, unknown> | undefined;
            waitingExecutionSource?: Record<string, unknown> | undefined;
        };
        startData?: Record<string, unknown> | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    status: "success" | "error" | "unknown" | "canceled" | "crashed" | "new" | "running" | "waiting";
    id: string;
    finished: boolean;
    mode: "retry" | "manual" | "trigger" | "webhook" | "integrated" | "cli";
    startedAt: string;
    workflowId: string;
    retryOf?: string | null | undefined;
    retrySuccessId?: string | null | undefined;
    stoppedAt?: string | null | undefined;
    workflowData?: {
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
        connections: Record<string, Record<string, {
            source: {
                id: string;
                outputIndex?: number | undefined;
            };
            target: {
                id: string;
                inputIndex?: number | undefined;
            };
        }[][]>>;
        createdAt: string;
        updatedAt: string;
        settings?: Record<string, unknown> | undefined;
        staticData?: Record<string, unknown> | undefined;
        tags?: string[] | undefined;
        versionId?: string | undefined;
    } | undefined;
    data?: {
        resultData: {
            runData: Record<string, unknown>;
            lastNodeExecuted?: string | undefined;
        };
        executionData: {
            contextData: Record<string, unknown>;
            nodeExecutionStack: unknown[];
            waitingExecution?: Record<string, unknown> | undefined;
            waitingExecutionSource?: Record<string, unknown> | undefined;
        };
        startData?: Record<string, unknown> | undefined;
    } | undefined;
}, {
    status: "success" | "error" | "unknown" | "canceled" | "crashed" | "new" | "running" | "waiting";
    id: string;
    finished: boolean;
    mode: "retry" | "manual" | "trigger" | "webhook" | "integrated" | "cli";
    startedAt: string;
    workflowId: string;
    retryOf?: string | null | undefined;
    retrySuccessId?: string | null | undefined;
    stoppedAt?: string | null | undefined;
    workflowData?: {
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
        connections: Record<string, Record<string, {
            source: {
                id: string;
                outputIndex?: number | undefined;
            };
            target: {
                id: string;
                inputIndex?: number | undefined;
            };
        }[][]>>;
        createdAt: string;
        updatedAt: string;
        settings?: Record<string, unknown> | undefined;
        staticData?: Record<string, unknown> | undefined;
        tags?: string[] | undefined;
        versionId?: string | undefined;
    } | undefined;
    data?: {
        resultData: {
            runData: Record<string, unknown>;
            lastNodeExecuted?: string | undefined;
        };
        executionData: {
            contextData: Record<string, unknown>;
            nodeExecutionStack: unknown[];
            waitingExecution?: Record<string, unknown> | undefined;
            waitingExecutionSource?: Record<string, unknown> | undefined;
        };
        startData?: Record<string, unknown> | undefined;
    } | undefined;
}>;
export declare const CredentialTypeSchema: z.ZodObject<{
    name: z.ZodString;
    displayName: z.ZodString;
    properties: z.ZodArray<z.ZodRecord<z.ZodString, z.ZodUnknown>, "many">;
    documentationUrl: z.ZodOptional<z.ZodString>;
    iconUrl: z.ZodOptional<z.ZodString>;
    extends: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    name: string;
    displayName: string;
    properties: Record<string, unknown>[];
    documentationUrl?: string | undefined;
    iconUrl?: string | undefined;
    extends?: string[] | undefined;
}, {
    name: string;
    displayName: string;
    properties: Record<string, unknown>[];
    documentationUrl?: string | undefined;
    iconUrl?: string | undefined;
    extends?: string[] | undefined;
}>;
export declare const CredentialSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    type: z.ZodString;
    nodesAccess: z.ZodOptional<z.ZodArray<z.ZodObject<{
        nodeType: z.ZodString;
        date: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        date: string;
        nodeType: string;
    }, {
        date: string;
        nodeType: string;
    }>, "many">>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: string;
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    nodesAccess?: {
        date: string;
        nodeType: string;
    }[] | undefined;
}, {
    type: string;
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    nodesAccess?: {
        date: string;
        nodeType: string;
    }[] | undefined;
}>;
export declare const PaginationSchema: z.ZodObject<{
    limit: z.ZodNumber;
    offset: z.ZodOptional<z.ZodNumber>;
    count: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    limit: number;
    count: number;
    offset?: number | undefined;
}, {
    limit: number;
    count: number;
    offset?: number | undefined;
}>;
export declare const WorkflowListResponseSchema: z.ZodObject<{
    data: z.ZodArray<z.ZodObject<{
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
        connections: z.ZodRecord<z.ZodString, z.ZodRecord<z.ZodString, z.ZodArray<z.ZodArray<z.ZodObject<{
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
        }>, "many">, "many">>>;
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
        connections: Record<string, Record<string, {
            source: {
                id: string;
                outputIndex?: number | undefined;
            };
            target: {
                id: string;
                inputIndex?: number | undefined;
            };
        }[][]>>;
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
        connections: Record<string, Record<string, {
            source: {
                id: string;
                outputIndex?: number | undefined;
            };
            target: {
                id: string;
                inputIndex?: number | undefined;
            };
        }[][]>>;
        createdAt: string;
        updatedAt: string;
        settings?: Record<string, unknown> | undefined;
        staticData?: Record<string, unknown> | undefined;
        tags?: string[] | undefined;
        versionId?: string | undefined;
    }>, "many">;
    nextCursor: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    data: {
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
        connections: Record<string, Record<string, {
            source: {
                id: string;
                outputIndex?: number | undefined;
            };
            target: {
                id: string;
                inputIndex?: number | undefined;
            };
        }[][]>>;
        createdAt: string;
        updatedAt: string;
        settings?: Record<string, unknown> | undefined;
        staticData?: Record<string, unknown> | undefined;
        tags?: string[] | undefined;
        versionId?: string | undefined;
    }[];
    nextCursor?: string | null | undefined;
}, {
    data: {
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
        connections: Record<string, Record<string, {
            source: {
                id: string;
                outputIndex?: number | undefined;
            };
            target: {
                id: string;
                inputIndex?: number | undefined;
            };
        }[][]>>;
        createdAt: string;
        updatedAt: string;
        settings?: Record<string, unknown> | undefined;
        staticData?: Record<string, unknown> | undefined;
        tags?: string[] | undefined;
        versionId?: string | undefined;
    }[];
    nextCursor?: string | null | undefined;
}>;
export declare const ExecutionListResponseSchema: z.ZodObject<{
    data: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        finished: z.ZodBoolean;
        mode: z.ZodEnum<["manual", "trigger", "webhook", "retry", "integrated", "cli"]>;
        retryOf: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        retrySuccessId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        startedAt: z.ZodString;
        stoppedAt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        workflowId: z.ZodString;
        workflowData: z.ZodOptional<z.ZodObject<{
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
            connections: z.ZodRecord<z.ZodString, z.ZodRecord<z.ZodString, z.ZodArray<z.ZodArray<z.ZodObject<{
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
            }>, "many">, "many">>>;
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
            connections: Record<string, Record<string, {
                source: {
                    id: string;
                    outputIndex?: number | undefined;
                };
                target: {
                    id: string;
                    inputIndex?: number | undefined;
                };
            }[][]>>;
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
            connections: Record<string, Record<string, {
                source: {
                    id: string;
                    outputIndex?: number | undefined;
                };
                target: {
                    id: string;
                    inputIndex?: number | undefined;
                };
            }[][]>>;
            createdAt: string;
            updatedAt: string;
            settings?: Record<string, unknown> | undefined;
            staticData?: Record<string, unknown> | undefined;
            tags?: string[] | undefined;
            versionId?: string | undefined;
        }>>;
        status: z.ZodEnum<["canceled", "crashed", "error", "new", "running", "success", "unknown", "waiting"]>;
        data: z.ZodOptional<z.ZodObject<{
            startData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
            resultData: z.ZodObject<{
                runData: z.ZodRecord<z.ZodString, z.ZodUnknown>;
                lastNodeExecuted: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                runData: Record<string, unknown>;
                lastNodeExecuted?: string | undefined;
            }, {
                runData: Record<string, unknown>;
                lastNodeExecuted?: string | undefined;
            }>;
            executionData: z.ZodObject<{
                contextData: z.ZodRecord<z.ZodString, z.ZodUnknown>;
                nodeExecutionStack: z.ZodArray<z.ZodUnknown, "many">;
                waitingExecution: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
                waitingExecutionSource: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
            }, "strip", z.ZodTypeAny, {
                contextData: Record<string, unknown>;
                nodeExecutionStack: unknown[];
                waitingExecution?: Record<string, unknown> | undefined;
                waitingExecutionSource?: Record<string, unknown> | undefined;
            }, {
                contextData: Record<string, unknown>;
                nodeExecutionStack: unknown[];
                waitingExecution?: Record<string, unknown> | undefined;
                waitingExecutionSource?: Record<string, unknown> | undefined;
            }>;
        }, "strip", z.ZodTypeAny, {
            resultData: {
                runData: Record<string, unknown>;
                lastNodeExecuted?: string | undefined;
            };
            executionData: {
                contextData: Record<string, unknown>;
                nodeExecutionStack: unknown[];
                waitingExecution?: Record<string, unknown> | undefined;
                waitingExecutionSource?: Record<string, unknown> | undefined;
            };
            startData?: Record<string, unknown> | undefined;
        }, {
            resultData: {
                runData: Record<string, unknown>;
                lastNodeExecuted?: string | undefined;
            };
            executionData: {
                contextData: Record<string, unknown>;
                nodeExecutionStack: unknown[];
                waitingExecution?: Record<string, unknown> | undefined;
                waitingExecutionSource?: Record<string, unknown> | undefined;
            };
            startData?: Record<string, unknown> | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        status: "success" | "error" | "unknown" | "canceled" | "crashed" | "new" | "running" | "waiting";
        id: string;
        finished: boolean;
        mode: "retry" | "manual" | "trigger" | "webhook" | "integrated" | "cli";
        startedAt: string;
        workflowId: string;
        retryOf?: string | null | undefined;
        retrySuccessId?: string | null | undefined;
        stoppedAt?: string | null | undefined;
        workflowData?: {
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
            connections: Record<string, Record<string, {
                source: {
                    id: string;
                    outputIndex?: number | undefined;
                };
                target: {
                    id: string;
                    inputIndex?: number | undefined;
                };
            }[][]>>;
            createdAt: string;
            updatedAt: string;
            settings?: Record<string, unknown> | undefined;
            staticData?: Record<string, unknown> | undefined;
            tags?: string[] | undefined;
            versionId?: string | undefined;
        } | undefined;
        data?: {
            resultData: {
                runData: Record<string, unknown>;
                lastNodeExecuted?: string | undefined;
            };
            executionData: {
                contextData: Record<string, unknown>;
                nodeExecutionStack: unknown[];
                waitingExecution?: Record<string, unknown> | undefined;
                waitingExecutionSource?: Record<string, unknown> | undefined;
            };
            startData?: Record<string, unknown> | undefined;
        } | undefined;
    }, {
        status: "success" | "error" | "unknown" | "canceled" | "crashed" | "new" | "running" | "waiting";
        id: string;
        finished: boolean;
        mode: "retry" | "manual" | "trigger" | "webhook" | "integrated" | "cli";
        startedAt: string;
        workflowId: string;
        retryOf?: string | null | undefined;
        retrySuccessId?: string | null | undefined;
        stoppedAt?: string | null | undefined;
        workflowData?: {
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
            connections: Record<string, Record<string, {
                source: {
                    id: string;
                    outputIndex?: number | undefined;
                };
                target: {
                    id: string;
                    inputIndex?: number | undefined;
                };
            }[][]>>;
            createdAt: string;
            updatedAt: string;
            settings?: Record<string, unknown> | undefined;
            staticData?: Record<string, unknown> | undefined;
            tags?: string[] | undefined;
            versionId?: string | undefined;
        } | undefined;
        data?: {
            resultData: {
                runData: Record<string, unknown>;
                lastNodeExecuted?: string | undefined;
            };
            executionData: {
                contextData: Record<string, unknown>;
                nodeExecutionStack: unknown[];
                waitingExecution?: Record<string, unknown> | undefined;
                waitingExecutionSource?: Record<string, unknown> | undefined;
            };
            startData?: Record<string, unknown> | undefined;
        } | undefined;
    }>, "many">;
    nextCursor: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    data: {
        status: "success" | "error" | "unknown" | "canceled" | "crashed" | "new" | "running" | "waiting";
        id: string;
        finished: boolean;
        mode: "retry" | "manual" | "trigger" | "webhook" | "integrated" | "cli";
        startedAt: string;
        workflowId: string;
        retryOf?: string | null | undefined;
        retrySuccessId?: string | null | undefined;
        stoppedAt?: string | null | undefined;
        workflowData?: {
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
            connections: Record<string, Record<string, {
                source: {
                    id: string;
                    outputIndex?: number | undefined;
                };
                target: {
                    id: string;
                    inputIndex?: number | undefined;
                };
            }[][]>>;
            createdAt: string;
            updatedAt: string;
            settings?: Record<string, unknown> | undefined;
            staticData?: Record<string, unknown> | undefined;
            tags?: string[] | undefined;
            versionId?: string | undefined;
        } | undefined;
        data?: {
            resultData: {
                runData: Record<string, unknown>;
                lastNodeExecuted?: string | undefined;
            };
            executionData: {
                contextData: Record<string, unknown>;
                nodeExecutionStack: unknown[];
                waitingExecution?: Record<string, unknown> | undefined;
                waitingExecutionSource?: Record<string, unknown> | undefined;
            };
            startData?: Record<string, unknown> | undefined;
        } | undefined;
    }[];
    nextCursor?: string | null | undefined;
}, {
    data: {
        status: "success" | "error" | "unknown" | "canceled" | "crashed" | "new" | "running" | "waiting";
        id: string;
        finished: boolean;
        mode: "retry" | "manual" | "trigger" | "webhook" | "integrated" | "cli";
        startedAt: string;
        workflowId: string;
        retryOf?: string | null | undefined;
        retrySuccessId?: string | null | undefined;
        stoppedAt?: string | null | undefined;
        workflowData?: {
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
            connections: Record<string, Record<string, {
                source: {
                    id: string;
                    outputIndex?: number | undefined;
                };
                target: {
                    id: string;
                    inputIndex?: number | undefined;
                };
            }[][]>>;
            createdAt: string;
            updatedAt: string;
            settings?: Record<string, unknown> | undefined;
            staticData?: Record<string, unknown> | undefined;
            tags?: string[] | undefined;
            versionId?: string | undefined;
        } | undefined;
        data?: {
            resultData: {
                runData: Record<string, unknown>;
                lastNodeExecuted?: string | undefined;
            };
            executionData: {
                contextData: Record<string, unknown>;
                nodeExecutionStack: unknown[];
                waitingExecution?: Record<string, unknown> | undefined;
                waitingExecutionSource?: Record<string, unknown> | undefined;
            };
            startData?: Record<string, unknown> | undefined;
        } | undefined;
    }[];
    nextCursor?: string | null | undefined;
}>;
export declare const CredentialListResponseSchema: z.ZodObject<{
    data: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        type: z.ZodString;
        nodesAccess: z.ZodOptional<z.ZodArray<z.ZodObject<{
            nodeType: z.ZodString;
            date: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            date: string;
            nodeType: string;
        }, {
            date: string;
            nodeType: string;
        }>, "many">>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        type: string;
        id: string;
        name: string;
        createdAt: string;
        updatedAt: string;
        nodesAccess?: {
            date: string;
            nodeType: string;
        }[] | undefined;
    }, {
        type: string;
        id: string;
        name: string;
        createdAt: string;
        updatedAt: string;
        nodesAccess?: {
            date: string;
            nodeType: string;
        }[] | undefined;
    }>, "many">;
    nextCursor: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    data: {
        type: string;
        id: string;
        name: string;
        createdAt: string;
        updatedAt: string;
        nodesAccess?: {
            date: string;
            nodeType: string;
        }[] | undefined;
    }[];
    nextCursor?: string | null | undefined;
}, {
    data: {
        type: string;
        id: string;
        name: string;
        createdAt: string;
        updatedAt: string;
        nodesAccess?: {
            date: string;
            nodeType: string;
        }[] | undefined;
    }[];
    nextCursor?: string | null | undefined;
}>;
export type N8nId = z.infer<typeof N8nIdSchema>;
export type N8nTimestamp = z.infer<typeof N8nTimestampSchema>;
export type WorkflowNode = z.infer<typeof WorkflowNodeSchema>;
export type WorkflowConnection = z.infer<typeof WorkflowConnectionSchema>;
export type Workflow = z.infer<typeof WorkflowSchema>;
export type ExecutionStatus = z.infer<typeof ExecutionStatusSchema>;
export type ExecutionData = z.infer<typeof ExecutionDataSchema>;
export type Execution = z.infer<typeof ExecutionSchema>;
export type CredentialType = z.infer<typeof CredentialTypeSchema>;
export type Credential = z.infer<typeof CredentialSchema>;
export type Pagination = z.infer<typeof PaginationSchema>;
export type WorkflowListResponse = z.infer<typeof WorkflowListResponseSchema>;
export type ExecutionListResponse = z.infer<typeof ExecutionListResponseSchema>;
export type CredentialListResponse = z.infer<typeof CredentialListResponseSchema>;
//# sourceMappingURL=n8n.types.d.ts.map