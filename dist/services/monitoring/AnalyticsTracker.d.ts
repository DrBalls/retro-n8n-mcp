/**
 * Analytics tracker implementation
 */
import { IAnalyticsTracker, IAnalyticsEvent } from '../../types/monitoring.js';
import { EventEmitter } from 'events';
/**
 * Analytics tracker implementation
 */
export declare class AnalyticsTracker extends EventEmitter implements IAnalyticsTracker {
    private readonly config?;
    private store;
    private currentUserId?;
    private currentSessionId;
    private userTraits;
    private flushTimer?;
    private flushInterval;
    private batchSize;
    private pendingEvents;
    constructor(config?: {
        flushInterval?: number;
        batchSize?: number;
        provider?: "internal" | "segment" | "mixpanel";
        apiKey?: string;
    } | undefined);
    track(event: string, properties?: Record<string, any>): void;
    identify(userId: string, traits?: Record<string, any>): void;
    page(name?: string, properties?: Record<string, any>): void;
    flush(): Promise<void>;
    private sendToProvider;
    private startAutoFlush;
    stop(): void;
    private generateSessionId;
    private getDefaultProperties;
    private getContext;
    private getSessionDuration;
    /**
     * Analytics-specific methods
     */
    getEventStats(timeRange?: {
        start: Date;
        end: Date;
    }): Record<string, any>;
    getUserJourney(userId: string): IAnalyticsEvent[];
    getSessionJourney(sessionId: string): IAnalyticsEvent[];
    /**
     * Common event tracking helpers
     */
    trackToolUsage(toolName: string, success: boolean, duration: number, metadata?: Record<string, any>): void;
    trackApiCall(endpoint: string, method: string, statusCode: number, duration: number): void;
    trackError(error: Error, context?: Record<string, any>): void;
    trackPerformance(operation: string, duration: number, metadata?: Record<string, any>): void;
}
//# sourceMappingURL=AnalyticsTracker.d.ts.map