/**
 * Analytics tracker implementation
 */

import { IAnalyticsTracker, IAnalyticsEvent } from '../../types/monitoring.js';
import { EventEmitter } from 'events';

/**
 * In-memory analytics event store
 */
class AnalyticsEventStore {
  private events: IAnalyticsEvent[] = [];
  private maxEvents: number = 10000;
  private retentionMs: number = 24 * 60 * 60 * 1000; // 24 hours

  add(event: IAnalyticsEvent): void {
    this.events.push(event);
    this.cleanup();
  }

  getEvents(filter?: {
    event?: string;
    userId?: string;
    sessionId?: string;
    start?: Date;
    end?: Date;
  }): IAnalyticsEvent[] {
    let filtered = [...this.events];

    if (filter?.event) {
      filtered = filtered.filter(e => e.event === filter.event);
    }
    if (filter?.userId) {
      filtered = filtered.filter(e => e.userId === filter.userId);
    }
    if (filter?.sessionId) {
      filtered = filtered.filter(e => e.sessionId === filter.sessionId);
    }
    if (filter?.start) {
      filtered = filtered.filter(e => e.timestamp >= filter.start);
    }
    if (filter?.end) {
      filtered = filtered.filter(e => e.timestamp <= filter.end);
    }

    return filtered;
  }

  clear(): void {
    this.events = [];
  }

  private cleanup(): void {
    const now = Date.now();
    
    // Remove old events
    this.events = this.events.filter(
      e => now - e.timestamp.getTime() <= this.retentionMs
    );

    // Keep only the most recent events if over limit
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }
  }

  getStats(): {
    totalEvents: number;
    uniqueUsers: number;
    uniqueSessions: number;
    eventCounts: Record<string, number>;
  } {
    const uniqueUsers = new Set(this.events.map(e => e.userId).filter(Boolean));
    const uniqueSessions = new Set(this.events.map(e => e.sessionId).filter(Boolean));
    const eventCounts: Record<string, number> = {};

    this.events.forEach(e => {
      eventCounts[e.event] = (eventCounts[e.event] || 0) + 1;
    });

    return {
      totalEvents: this.events.length,
      uniqueUsers: uniqueUsers.size,
      uniqueSessions: uniqueSessions.size,
      eventCounts
    };
  }
}

/**
 * Analytics tracker implementation
 */
export class AnalyticsTracker extends EventEmitter implements IAnalyticsTracker {
  private store: AnalyticsEventStore;
  private currentUserId?: string;
  private currentSessionId: string;
  private userTraits: Record<string, any> = {};
  private flushTimer?: NodeJS.Timeout;
  private flushInterval: number = 30000; // 30 seconds
  private batchSize: number = 100;
  private pendingEvents: IAnalyticsEvent[] = [];

  constructor(private readonly config?: {
    flushInterval?: number;
    batchSize?: number;
    provider?: 'internal' | 'segment' | 'mixpanel';
    apiKey?: string;
  }) {
    super();
    this.store = new AnalyticsEventStore();
    this.currentSessionId = this.generateSessionId();
    
    if (config?.flushInterval) {
      this.flushInterval = config.flushInterval;
    }
    if (config?.batchSize) {
      this.batchSize = config.batchSize;
    }

    // Start auto-flush timer
    this.startAutoFlush();
  }

  track(event: string, properties?: Record<string, any>): void {
    const analyticsEvent: IAnalyticsEvent = {
      event,
      timestamp: new Date(),
      properties: {
        ...properties,
        ...this.getDefaultProperties()
      },
      userId: this.currentUserId,
      sessionId: this.currentSessionId,
      context: this.getContext()
    };

    this.pendingEvents.push(analyticsEvent);
    this.emit('event', analyticsEvent);

    // Auto-flush if batch size reached
    if (this.pendingEvents.length >= this.batchSize) {
      this.flush().catch(error => {
        this.emit('error', error);
      });
    }
  }

  identify(userId: string, traits?: Record<string, any>): void {
    this.currentUserId = userId;
    
    if (traits) {
      this.userTraits = {
        ...this.userTraits,
        ...traits
      };
    }

    this.track('identify', {
      userId,
      traits: this.userTraits
    });
  }

  page(name?: string, properties?: Record<string, any>): void {
    this.track('page', {
      name: name || 'Unknown Page',
      ...properties
    });
  }

  async flush(): Promise<void> {
    if (this.pendingEvents.length === 0) {
      return;
    }

    const eventsToFlush = [...this.pendingEvents];
    this.pendingEvents = [];

    try {
      if (this.config?.provider === 'internal' || !this.config?.provider) {
        // Store internally
        eventsToFlush.forEach(event => {
          this.store.add(event);
        });
      } else {
        // Send to external provider
        await this.sendToProvider(eventsToFlush);
      }

      this.emit('flush', eventsToFlush.length);
    } catch (error) {
      // Put events back in pending if flush failed
      this.pendingEvents.unshift(...eventsToFlush);
      throw error;
    }
  }

  private async sendToProvider(events: IAnalyticsEvent[]): Promise<void> {
    // This would be implemented based on the provider
    // For now, just store internally
    events.forEach(event => {
      this.store.add(event);
    });
  }

  private startAutoFlush(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }

    this.flushTimer = setInterval(() => {
      this.flush().catch(error => {
        this.emit('error', error);
      });
    }, this.flushInterval);
  }

  stop(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = undefined;
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getDefaultProperties(): Record<string, any> {
    return {
      timestamp: new Date().toISOString(),
      sessionDuration: this.getSessionDuration(),
      ...this.userTraits
    };
  }

  private getContext(): Record<string, any> {
    return {
      library: {
        name: 'n8n-mcp-server',
        version: '1.0.0' // This should come from package.json
      },
      runtime: {
        node: process.version,
        platform: process.platform,
        arch: process.arch
      },
      timestamp: new Date().toISOString()
    };
  }

  private getSessionDuration(): number {
    // Calculate session duration based on first event in session
    const sessionEvents = this.store.getEvents({ sessionId: this.currentSessionId });
    if (sessionEvents.length === 0) return 0;
    
    const firstEvent = sessionEvents[0];
    return Date.now() - firstEvent.timestamp.getTime();
  }

  /**
   * Analytics-specific methods
   */
  
  getEventStats(timeRange?: { start: Date; end: Date }): Record<string, any> {
    const events = this.store.getEvents(timeRange);
    const stats = this.store.getStats();

    // Calculate additional metrics
    const eventsByHour: Record<string, number> = {};
    const eventsByUser: Record<string, number> = {};
    const topEvents: Array<{ event: string; count: number }> = [];

    events.forEach(event => {
      // Events by hour
      const hour = new Date(event.timestamp).toISOString().substr(0, 13);
      eventsByHour[hour] = (eventsByHour[hour] || 0) + 1;

      // Events by user
      if (event.userId) {
        eventsByUser[event.userId] = (eventsByUser[event.userId] || 0) + 1;
      }
    });

    // Top events
    Object.entries(stats.eventCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .forEach(([event, count]) => {
        topEvents.push({ event, count });
      });

    return {
      summary: stats,
      eventsByHour,
      eventsByUser,
      topEvents,
      timeRange: timeRange || { start: events[0]?.timestamp, end: events[events.length - 1]?.timestamp }
    };
  }

  getUserJourney(userId: string): IAnalyticsEvent[] {
    return this.store.getEvents({ userId }).sort((a, b) => 
      a.timestamp.getTime() - b.timestamp.getTime()
    );
  }

  getSessionJourney(sessionId: string): IAnalyticsEvent[] {
    return this.store.getEvents({ sessionId }).sort((a, b) => 
      a.timestamp.getTime() - b.timestamp.getTime()
    );
  }

  /**
   * Common event tracking helpers
   */

  trackToolUsage(toolName: string, success: boolean, duration: number, metadata?: Record<string, any>): void {
    this.track('tool_used', {
      tool: toolName,
      success,
      duration,
      ...metadata
    });
  }

  trackApiCall(endpoint: string, method: string, statusCode: number, duration: number): void {
    this.track('api_call', {
      endpoint,
      method,
      statusCode,
      duration,
      success: statusCode >= 200 && statusCode < 300
    });
  }

  trackError(error: Error, context?: Record<string, any>): void {
    this.track('error', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      ...context
    });
  }

  trackPerformance(operation: string, duration: number, metadata?: Record<string, any>): void {
    this.track('performance', {
      operation,
      duration,
      ...metadata
    });
  }
}