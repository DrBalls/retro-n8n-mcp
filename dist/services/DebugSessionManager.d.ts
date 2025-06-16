import { EventEmitter } from 'events';
import { N8nApiClient } from './N8nApiClient.js';
import { DebugSession, IDebugSession, IDebugSessionOptions } from './DebugSession.js';
export interface IDebugSessionManagerOptions {
    maxSessions?: number;
    sessionTimeout?: number;
    autoCleanup?: boolean;
}
export declare class DebugSessionManager extends EventEmitter {
    private sessions;
    private apiClient;
    private options;
    private cleanupInterval?;
    private sessionCache;
    constructor(apiClient: N8nApiClient, options?: IDebugSessionManagerOptions);
    private startAutoCleanup;
    private cleanupInactiveSessions;
    createSession(options: IDebugSessionOptions): Promise<DebugSession>;
    getSession(sessionId: string): DebugSession | undefined;
    getAllSessions(): DebugSession[];
    getActiveSessions(): DebugSession[];
    getSessionsByWorkflow(workflowId: string): DebugSession[];
    removeSession(sessionId: string): Promise<boolean>;
    stopAllSessions(): Promise<void>;
    getSessionHistory(limit?: number): IDebugSession[];
    private setupSessionEventHandlers;
    exportSessions(): Promise<Record<string, IDebugSession>>;
    importSession(sessionData: IDebugSession): Promise<DebugSession>;
    getStatistics(): {
        totalSessions: number;
        activeSessions: number;
        cachedSessions: number;
        averageSessionDuration: number;
        averageBreakpointsPerSession: number;
        averageTimelineEventsPerSession: number;
    };
    destroy(): void;
}
//# sourceMappingURL=DebugSessionManager.d.ts.map