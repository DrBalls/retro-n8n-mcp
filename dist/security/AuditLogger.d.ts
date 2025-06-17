export interface IAuditEvent {
    id: string;
    timestamp: Date;
    userId?: string;
    apiKeyId?: string;
    action: string;
    resource?: {
        type: string;
        id: string;
        name?: string;
    };
    result: 'success' | 'failure' | 'denied';
    details?: Record<string, unknown>;
    metadata?: {
        ip?: string;
        userAgent?: string;
        sessionId?: string;
    };
}
export interface IAuditQuery {
    userId?: string;
    apiKeyId?: string;
    action?: string;
    resourceType?: string;
    resourceId?: string;
    result?: 'success' | 'failure' | 'denied';
    startTime?: Date;
    endTime?: Date;
    limit?: number;
}
export declare class AuditLogger {
    private logger;
    private events;
    private maxEvents;
    private eventHandlers;
    constructor(maxEvents?: number);
    /**
     * Log an audit event
     */
    logEvent(event: Omit<IAuditEvent, 'id' | 'timestamp'>): void;
    /**
     * Log a successful action
     */
    logSuccess(action: string, context: {
        userId?: string;
        apiKeyId?: string;
        resource?: IAuditEvent['resource'];
        details?: Record<string, unknown>;
        metadata?: IAuditEvent['metadata'];
    }): void;
    /**
     * Log a failed action
     */
    logFailure(action: string, error: Error | string, context: {
        userId?: string;
        apiKeyId?: string;
        resource?: IAuditEvent['resource'];
        details?: Record<string, unknown>;
        metadata?: IAuditEvent['metadata'];
    }): void;
    /**
     * Log a denied action (authorization failure)
     */
    logDenied(action: string, reason: string, context: {
        userId?: string;
        apiKeyId?: string;
        resource?: IAuditEvent['resource'];
        details?: Record<string, unknown>;
        metadata?: IAuditEvent['metadata'];
    }): void;
    /**
     * Query audit events
     */
    queryEvents(query: IAuditQuery): IAuditEvent[];
    /**
     * Add an event handler for real-time monitoring
     */
    addEventHandler(handler: (event: IAuditEvent) => void): void;
    /**
     * Remove an event handler
     */
    removeEventHandler(handler: (event: IAuditEvent) => void): void;
    /**
     * Export events for persistence
     */
    exportEvents(query?: IAuditQuery): {
        events: IAuditEvent[];
        exportedAt: Date;
        format: string;
    };
    /**
     * Import events from persistence
     */
    importEvents(events: IAuditEvent[]): void;
    /**
     * Clear old events
     */
    clearOldEvents(beforeDate: Date): number;
    /**
     * Generate unique event ID
     */
    private generateEventId;
    /**
     * Get audit trail for a specific resource
     */
    getResourceAuditTrail(resourceType: string, resourceId: string): IAuditEvent[];
    /**
     * Get user activity
     */
    getUserActivity(userId: string, limit?: number): IAuditEvent[];
    /**
     * Detect suspicious activity patterns
     */
    detectSuspiciousActivity(): {
        failureSpikes: {
            userId: string;
            failures: number;
        }[];
        denialSpikes: {
            userId: string;
            denials: number;
        }[];
        unusualActions: {
            action: string;
            count: number;
        }[];
    };
    /**
     * Get statistics for a time range
     */
    getStatistics(startTime: Date, endTime: Date): {
        totalEvents: number;
        successCount: number;
        failureCount: number;
        deniedCount: number;
        actionBreakdown: Record<string, number>;
        topUsers: Array<{
            userId: string;
            count: number;
        }>;
    };
}
//# sourceMappingURL=AuditLogger.d.ts.map