import { EventEmitter } from 'events';
import { N8nApiClient } from './N8nApiClient.js';
export interface IBreakpoint {
    id: string;
    workflowId: string;
    nodeId: string;
    condition?: string;
    hitCount: number;
    enabled: boolean;
}
export interface IWatchExpression {
    id: string;
    expression: string;
    nodeId?: string;
    value?: unknown;
    error?: string;
}
export interface IDebugState {
    currentNodeId?: string;
    currentExecutionId?: string;
    isPaused: boolean;
    stepMode: 'over' | 'into' | 'out' | null;
    callStack: string[];
    variables: Map<string, unknown>;
}
export interface IExecutionSnapshot {
    timestamp: Date;
    nodeId: string;
    nodeName: string;
    nodeType: string;
    inputData: unknown;
    outputData?: unknown;
    error?: string;
    duration?: number;
    memoryUsage?: number;
}
export interface IDebugSession {
    id: string;
    workflowId: string;
    executionId?: string;
    startTime: Date;
    endTime?: Date;
    state: IDebugState;
    breakpoints: Map<string, IBreakpoint>;
    watchExpressions: Map<string, IWatchExpression>;
    timeline: IExecutionSnapshot[];
    isActive: boolean;
}
export interface IDebugSessionOptions {
    sessionId?: string;
    workflowId: string;
    executionId?: string | undefined;
    breakpoints?: IBreakpoint[];
    watchExpressions?: IWatchExpression[];
}
export declare class DebugSession extends EventEmitter {
    private session;
    private apiClient;
    private pollInterval?;
    private variableCache;
    constructor(options: IDebugSessionOptions, apiClient: N8nApiClient);
    private generateSessionId;
    getId(): string;
    getWorkflowId(): string;
    getExecutionId(): string | undefined;
    isActive(): boolean;
    getState(): IDebugState;
    getTimeline(): IExecutionSnapshot[];
    addBreakpoint(breakpoint: Omit<IBreakpoint, 'hitCount'>): IBreakpoint;
    removeBreakpoint(breakpointId: string): boolean;
    enableBreakpoint(breakpointId: string): boolean;
    disableBreakpoint(breakpointId: string): boolean;
    getBreakpoints(): IBreakpoint[];
    addWatchExpression(expression: string, nodeId?: string): IWatchExpression;
    removeWatchExpression(watchId: string): boolean;
    evaluateWatchExpression(watchId: string): Promise<unknown>;
    getWatchExpressions(): IWatchExpression[];
    start(executionId?: string): Promise<void>;
    pause(): Promise<void>;
    resume(): Promise<void>;
    stepOver(): Promise<void>;
    stepInto(): Promise<void>;
    stepOut(): Promise<void>;
    stop(): Promise<void>;
    inspectVariable(name: string, nodeId?: string): Promise<unknown>;
    getVariables(nodeId?: string): Promise<Record<string, unknown>>;
    addTimelineEvent(snapshot: IExecutionSnapshot): void;
    getTimelineRange(startTime?: Date, endTime?: Date): IExecutionSnapshot[];
    private startMonitoring;
    private updateExecutionState;
    private checkBreakpoints;
    private evaluateCondition;
    private evaluateExpression;
    private getVariableValue;
    private waitForStep;
    exportSession(): IDebugSession;
}
//# sourceMappingURL=DebugSession.d.ts.map