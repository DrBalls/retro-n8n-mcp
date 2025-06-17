/**
 * Analytics tracker implementation
 */
import { EventEmitter } from 'events';
/**
 * In-memory analytics event store
 */
class AnalyticsEventStore {
    events = [];
    maxEvents = 10000;
    retentionMs = 24 * 60 * 60 * 1000; // 24 hours
    add(event) {
        this.events.push(event);
        this.cleanup();
    }
    getEvents(filter) {
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
    clear() {
        this.events = [];
    }
    cleanup() {
        const now = Date.now();
        // Remove old events
        this.events = this.events.filter(e => now - e.timestamp.getTime() <= this.retentionMs);
        // Keep only the most recent events if over limit
        if (this.events.length > this.maxEvents) {
            this.events = this.events.slice(-this.maxEvents);
        }
    }
    getStats() {
        const uniqueUsers = new Set(this.events.map(e => e.userId).filter(Boolean));
        const uniqueSessions = new Set(this.events.map(e => e.sessionId).filter(Boolean));
        const eventCounts = {};
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
export class AnalyticsTracker extends EventEmitter {
    config;
    store;
    currentUserId;
    currentSessionId;
    userTraits = {};
    flushTimer;
    flushInterval = 30000; // 30 seconds
    batchSize = 100;
    pendingEvents = [];
    constructor(config) {
        super();
        this.config = config;
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
    track(event, properties) {
        const analyticsEvent = {
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
    identify(userId, traits) {
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
    page(name, properties) {
        this.track('page', {
            name: name || 'Unknown Page',
            ...properties
        });
    }
    async flush() {
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
            }
            else {
                // Send to external provider
                await this.sendToProvider(eventsToFlush);
            }
            this.emit('flush', eventsToFlush.length);
        }
        catch (error) {
            // Put events back in pending if flush failed
            this.pendingEvents.unshift(...eventsToFlush);
            throw error;
        }
    }
    async sendToProvider(events) {
        // This would be implemented based on the provider
        // For now, just store internally
        events.forEach(event => {
            this.store.add(event);
        });
    }
    startAutoFlush() {
        if (this.flushTimer) {
            clearInterval(this.flushTimer);
        }
        this.flushTimer = setInterval(() => {
            this.flush().catch(error => {
                this.emit('error', error);
            });
        }, this.flushInterval);
    }
    stop() {
        if (this.flushTimer) {
            clearInterval(this.flushTimer);
            this.flushTimer = undefined;
        }
    }
    generateSessionId() {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    getDefaultProperties() {
        return {
            timestamp: new Date().toISOString(),
            sessionDuration: this.getSessionDuration(),
            ...this.userTraits
        };
    }
    getContext() {
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
    getSessionDuration() {
        // Calculate session duration based on first event in session
        const sessionEvents = this.store.getEvents({ sessionId: this.currentSessionId });
        if (sessionEvents.length === 0)
            return 0;
        const firstEvent = sessionEvents[0];
        return Date.now() - firstEvent.timestamp.getTime();
    }
    /**
     * Analytics-specific methods
     */
    getEventStats(timeRange) {
        const events = this.store.getEvents(timeRange);
        const stats = this.store.getStats();
        // Calculate additional metrics
        const eventsByHour = {};
        const eventsByUser = {};
        const topEvents = [];
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
    getUserJourney(userId) {
        return this.store.getEvents({ userId }).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    }
    getSessionJourney(sessionId) {
        return this.store.getEvents({ sessionId }).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    }
    /**
     * Common event tracking helpers
     */
    trackToolUsage(toolName, success, duration, metadata) {
        this.track('tool_used', {
            tool: toolName,
            success,
            duration,
            ...metadata
        });
    }
    trackApiCall(endpoint, method, statusCode, duration) {
        this.track('api_call', {
            endpoint,
            method,
            statusCode,
            duration,
            success: statusCode >= 200 && statusCode < 300
        });
    }
    trackError(error, context) {
        this.track('error', {
            message: error.message,
            stack: error.stack,
            name: error.name,
            ...context
        });
    }
    trackPerformance(operation, duration, metadata) {
        this.track('performance', {
            operation,
            duration,
            ...metadata
        });
    }
}
//# sourceMappingURL=AnalyticsTracker.js.map