import { EventEmitter } from 'events';
import { DebugSession } from './DebugSession.js';
import { SimpleCache } from '../utils/SimpleCache.js';
export class DebugSessionManager extends EventEmitter {
    sessions;
    apiClient;
    options;
    cleanupInterval;
    sessionCache;
    constructor(apiClient, options = {}) {
        super();
        this.apiClient = apiClient;
        this.sessions = new Map();
        this.sessionCache = new SimpleCache({ defaultTtl: 3600000 }); // 1 hour TTL
        this.options = {
            maxSessions: options.maxSessions || 10,
            sessionTimeout: options.sessionTimeout || 3600000, // 1 hour
            autoCleanup: options.autoCleanup !== false,
        };
        if (this.options.autoCleanup) {
            this.startAutoCleanup();
        }
    }
    startAutoCleanup() {
        this.cleanupInterval = setInterval(() => {
            this.cleanupInactiveSessions();
        }, 60000); // Check every minute
    }
    cleanupInactiveSessions() {
        const now = Date.now();
        const toRemove = [];
        for (const [sessionId, session] of this.sessions) {
            if (!session.isActive()) {
                const endTime = session.exportSession().endTime;
                if (endTime && now - endTime.getTime() > this.options.sessionTimeout) {
                    toRemove.push(sessionId);
                }
            }
        }
        for (const sessionId of toRemove) {
            this.removeSession(sessionId);
        }
    }
    async createSession(options) {
        // Check session limit
        if (this.sessions.size >= this.options.maxSessions) {
            // Try to clean up inactive sessions first
            this.cleanupInactiveSessions();
            if (this.sessions.size >= this.options.maxSessions) {
                throw new Error(`Maximum number of debug sessions (${this.options.maxSessions}) reached`);
            }
        }
        const session = new DebugSession(options, this.apiClient);
        this.sessions.set(session.getId(), session);
        // Set up event forwarding
        this.setupSessionEventHandlers(session);
        this.emit('session:created', {
            sessionId: session.getId(),
            workflowId: session.getWorkflowId(),
        });
        return session;
    }
    getSession(sessionId) {
        return this.sessions.get(sessionId);
    }
    getAllSessions() {
        return Array.from(this.sessions.values());
    }
    getActiveSessions() {
        return this.getAllSessions().filter(session => session.isActive());
    }
    getSessionsByWorkflow(workflowId) {
        return this.getAllSessions().filter(session => session.getWorkflowId() === workflowId);
    }
    async removeSession(sessionId) {
        const session = this.sessions.get(sessionId);
        if (!session) {
            return false;
        }
        // Stop the session if active
        if (session.isActive()) {
            await session.stop();
        }
        // Cache the session data before removal
        this.sessionCache.set(sessionId, session.exportSession());
        // Remove all event listeners
        session.removeAllListeners();
        this.sessions.delete(sessionId);
        this.emit('session:removed', {
            sessionId,
        });
        return true;
    }
    async stopAllSessions() {
        const promises = this.getAllSessions().map(session => {
            if (session.isActive()) {
                return session.stop();
            }
            return Promise.resolve();
        });
        await Promise.all(promises);
    }
    getSessionHistory(limit = 10) {
        const history = [];
        // Get from cache
        for (const [key, value] of this.sessionCache.entries()) {
            if (value) {
                history.push(value);
            }
        }
        // Add current sessions
        for (const session of this.sessions.values()) {
            history.push(session.exportSession());
        }
        // Sort by start time (newest first)
        history.sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
        return history.slice(0, limit);
    }
    setupSessionEventHandlers(session) {
        // Forward all session events with session context
        const events = [
            'session:started',
            'session:paused',
            'session:resumed',
            'session:stopped',
            'session:error',
            'breakpoint:added',
            'breakpoint:removed',
            'breakpoint:enabled',
            'breakpoint:disabled',
            'breakpoint:hit',
            'watch:added',
            'watch:removed',
            'watch:evaluated',
            'watch:error',
            'timeline:event',
        ];
        events.forEach(event => {
            session.on(event, (data) => {
                this.emit(event, {
                    sessionId: session.getId(),
                    ...data,
                });
            });
        });
    }
    async exportSessions() {
        const exports = {};
        for (const [sessionId, session] of this.sessions) {
            exports[sessionId] = session.exportSession();
        }
        return exports;
    }
    async importSession(sessionData) {
        const options = {
            sessionId: sessionData.id,
            workflowId: sessionData.workflowId,
            executionId: sessionData.executionId,
            breakpoints: Array.from(sessionData.breakpoints.values()),
            watchExpressions: Array.from(sessionData.watchExpressions.values()),
        };
        const session = await this.createSession(options);
        // Restore timeline
        for (const event of sessionData.timeline) {
            session.addTimelineEvent(event);
        }
        return session;
    }
    getStatistics() {
        const allSessions = [
            ...this.getAllSessions().map(s => s.exportSession()),
            ...Array.from(this.sessionCache.values()).filter(Boolean),
        ];
        const activeSessions = this.getActiveSessions().length;
        const durations = allSessions
            .filter(s => s.endTime)
            .map(s => s.endTime.getTime() - s.startTime.getTime());
        const averageDuration = durations.length > 0
            ? durations.reduce((a, b) => a + b, 0) / durations.length
            : 0;
        const breakpointCounts = allSessions.map(s => s.breakpoints.size);
        const averageBreakpoints = breakpointCounts.length > 0
            ? breakpointCounts.reduce((a, b) => a + b, 0) / breakpointCounts.length
            : 0;
        const timelineCounts = allSessions.map(s => s.timeline.length);
        const averageTimeline = timelineCounts.length > 0
            ? timelineCounts.reduce((a, b) => a + b, 0) / timelineCounts.length
            : 0;
        return {
            totalSessions: allSessions.length,
            activeSessions,
            cachedSessions: this.sessionCache.size,
            averageSessionDuration: averageDuration,
            averageBreakpointsPerSession: averageBreakpoints,
            averageTimelineEventsPerSession: averageTimeline,
        };
    }
    destroy() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }
        // Stop all active sessions
        this.stopAllSessions().catch(() => {
            // Ignore errors during cleanup
        });
        this.sessions.clear();
        this.sessionCache.clear();
        this.removeAllListeners();
    }
}
//# sourceMappingURL=DebugSessionManager.js.map