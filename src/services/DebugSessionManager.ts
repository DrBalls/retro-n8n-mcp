import { EventEmitter } from 'events';
import { N8nApiClient } from './N8nApiClient.js';
import { DebugSession, IDebugSession, IDebugSessionOptions } from './DebugSession.js';
import { SimpleCache } from '../utils/SimpleCache.js';

export interface IDebugSessionManagerOptions {
  maxSessions?: number;
  sessionTimeout?: number;
  autoCleanup?: boolean;
}

export class DebugSessionManager extends EventEmitter {
  private sessions: Map<string, DebugSession>;
  private apiClient: N8nApiClient;
  private options: Required<IDebugSessionManagerOptions>;
  private cleanupInterval?: NodeJS.Timeout;
  private sessionCache: SimpleCache<IDebugSession>;

  constructor(apiClient: N8nApiClient, options: IDebugSessionManagerOptions = {}) {
    super();
    
    this.apiClient = apiClient;
    this.sessions = new Map();
    this.sessionCache = new SimpleCache<IDebugSession>({ defaultTtl: 3600000 }); // 1 hour TTL
    
    this.options = {
      maxSessions: options.maxSessions || 10,
      sessionTimeout: options.sessionTimeout || 3600000, // 1 hour
      autoCleanup: options.autoCleanup !== false,
    };

    if (this.options.autoCleanup) {
      this.startAutoCleanup();
    }
  }

  private startAutoCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanupInactiveSessions();
    }, 60000); // Check every minute
  }

  private cleanupInactiveSessions(): void {
    const now = Date.now();
    const toRemove: string[] = [];

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

  async createSession(options: IDebugSessionOptions): Promise<DebugSession> {
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

  getSession(sessionId: string): DebugSession | undefined {
    return this.sessions.get(sessionId);
  }

  getAllSessions(): DebugSession[] {
    return Array.from(this.sessions.values());
  }

  getActiveSessions(): DebugSession[] {
    return this.getAllSessions().filter(session => session.isActive());
  }

  getSessionsByWorkflow(workflowId: string): DebugSession[] {
    return this.getAllSessions().filter(
      session => session.getWorkflowId() === workflowId
    );
  }

  async removeSession(sessionId: string): Promise<boolean> {
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

  async stopAllSessions(): Promise<void> {
    const promises = this.getAllSessions().map(session => {
      if (session.isActive()) {
        return session.stop();
      }
      return Promise.resolve();
    });

    await Promise.all(promises);
  }

  getSessionHistory(limit: number = 10): IDebugSession[] {
    const history: IDebugSession[] = [];
    
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

  private setupSessionEventHandlers(session: DebugSession): void {
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

  async exportSessions(): Promise<Record<string, IDebugSession>> {
    const exports: Record<string, IDebugSession> = {};
    
    for (const [sessionId, session] of this.sessions) {
      exports[sessionId] = session.exportSession();
    }
    
    return exports;
  }

  async importSession(sessionData: IDebugSession): Promise<DebugSession> {
    const options: IDebugSessionOptions = {
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

  getStatistics(): {
    totalSessions: number;
    activeSessions: number;
    cachedSessions: number;
    averageSessionDuration: number;
    averageBreakpointsPerSession: number;
    averageTimelineEventsPerSession: number;
  } {
    const allSessions = [
      ...this.getAllSessions().map(s => s.exportSession()),
      ...Array.from(this.sessionCache.values()).filter(Boolean) as IDebugSession[],
    ];

    const activeSessions = this.getActiveSessions().length;

    const durations = allSessions
      .filter(s => s.endTime)
      .map(s => s.endTime!.getTime() - s.startTime.getTime());

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

  destroy(): void {
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