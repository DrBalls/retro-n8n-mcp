import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { DebugSessionManager, IDebugSessionManagerOptions } from '../../src/services/DebugSessionManager.js';
import { DebugSession } from '../../src/services/DebugSession.js';
import { N8nApiClient } from '../../src/services/N8nApiClient.js';

describe('DebugSessionManager', () => {
  let mockApiClient: any;
  let manager: DebugSessionManager;

  beforeEach(() => {
    mockApiClient = {
      triggerWorkflow: vi.fn(),
      getExecution: vi.fn(),
      stopExecution: vi.fn(),
    };

    manager = new DebugSessionManager(mockApiClient as N8nApiClient);
  });

  afterEach(() => {
    manager.stopAll();
    vi.clearAllMocks();
  });

  describe('Session Creation', () => {
    it('should create new session', () => {
      const session = manager.createSession({
        workflowId: 'workflow-123',
      });

      expect(session).toBeInstanceOf(DebugSession);
      expect(session.getWorkflowId()).toBe('workflow-123');
      expect(manager.getActiveSessionCount()).toBe(1);
    });

    it('should emit session:created event', () => {
      const createdSpy = vi.fn();
      manager.on('session:created', createdSpy);

      const session = manager.createSession({
        workflowId: 'workflow-123',
      });

      expect(createdSpy).toHaveBeenCalledWith({
        sessionId: session.getId(),
        workflowId: 'workflow-123',
      });
    });

    it('should enforce max sessions limit', () => {
      const managerWithLimit = new DebugSessionManager(mockApiClient, {
        maxSessions: 2,
      });

      managerWithLimit.createSession({ workflowId: 'workflow-1' });
      managerWithLimit.createSession({ workflowId: 'workflow-2' });

      expect(() => {
        managerWithLimit.createSession({ workflowId: 'workflow-3' });
      }).toThrow('Maximum number of debug sessions (2) reached');
    });

    it('should track session in history', () => {
      const session = manager.createSession({
        workflowId: 'workflow-123',
      });

      const history = manager.getSessionHistory();
      expect(history).toHaveLength(1);
      expect(history[0]).toMatchObject({
        sessionId: session.getId(),
        workflowId: 'workflow-123',
        status: 'active',
      });
    });
  });

  describe('Session Retrieval', () => {
    it('should get session by ID', () => {
      const session = manager.createSession({
        workflowId: 'workflow-123',
      });

      const retrieved = manager.getSession(session.getId());
      expect(retrieved).toBe(session);
    });

    it('should return undefined for non-existent session', () => {
      const retrieved = manager.getSession('non-existent');
      expect(retrieved).toBeUndefined();
    });

    it('should get all active sessions', () => {
      const session1 = manager.createSession({ workflowId: 'workflow-1' });
      const session2 = manager.createSession({ workflowId: 'workflow-2' });

      const sessions = manager.getActiveSessions();
      expect(sessions).toHaveLength(2);
      expect(sessions.map(s => s.getId())).toContain(session1.getId());
      expect(sessions.map(s => s.getId())).toContain(session2.getId());
    });

    it('should get sessions by workflow ID', () => {
      manager.createSession({ workflowId: 'workflow-1' });
      manager.createSession({ workflowId: 'workflow-2' });
      const session3 = manager.createSession({ workflowId: 'workflow-1' });

      const sessions = manager.getSessionsByWorkflow('workflow-1');
      expect(sessions).toHaveLength(2);
      expect(sessions[1].getId()).toBe(session3.getId());
    });
  });

  describe('Session Management', () => {
    it('should stop session by ID', async () => {
      const session = manager.createSession({
        workflowId: 'workflow-123',
      });

      const stoppedSpy = vi.fn();
      manager.on('session:stopped', stoppedSpy);

      const stopped = await manager.stopSession(session.getId());
      expect(stopped).toBe(true);
      expect(manager.getActiveSessionCount()).toBe(0);
      expect(stoppedSpy).toHaveBeenCalledWith({
        sessionId: session.getId(),
        reason: 'manual',
      });
    });

    it('should return false when stopping non-existent session', async () => {
      const stopped = await manager.stopSession('non-existent');
      expect(stopped).toBe(false);
    });

    it('should stop all sessions', async () => {
      manager.createSession({ workflowId: 'workflow-1' });
      manager.createSession({ workflowId: 'workflow-2' });
      manager.createSession({ workflowId: 'workflow-3' });

      await manager.stopAll();
      expect(manager.getActiveSessionCount()).toBe(0);
    });

    it('should clean up inactive sessions', async () => {
      const session1 = manager.createSession({ workflowId: 'workflow-1' });
      const session2 = manager.createSession({ workflowId: 'workflow-2' });

      // Stop session1
      await session1.stop();

      const cleaned = await manager.cleanupInactiveSessions();
      expect(cleaned).toBe(1);
      expect(manager.getActiveSessionCount()).toBe(1);
      expect(manager.getSession(session2.getId())).toBeDefined();
      expect(manager.getSession(session1.getId())).toBeUndefined();
    });
  });

  describe('Session History', () => {
    it('should track session lifecycle in history', async () => {
      const session = manager.createSession({
        workflowId: 'workflow-123',
      });

      await manager.stopSession(session.getId());

      const history = manager.getSessionHistory();
      expect(history).toHaveLength(1);
      expect(history[0]).toMatchObject({
        sessionId: session.getId(),
        workflowId: 'workflow-123',
        status: 'stopped',
        endTime: expect.any(Date),
      });
    });

    it('should limit history size', async () => {
      const managerWithLimit = new DebugSessionManager(mockApiClient, {
        maxHistorySize: 3,
      });

      // Create and stop 5 sessions
      for (let i = 0; i < 5; i++) {
        const session = managerWithLimit.createSession({
          workflowId: `workflow-${i}`,
        });
        await managerWithLimit.stopSession(session.getId());
      }

      const history = managerWithLimit.getSessionHistory();
      expect(history).toHaveLength(3);
      expect(history[0].workflowId).toBe('workflow-2'); // Oldest kept
      expect(history[2].workflowId).toBe('workflow-4'); // Newest
    });

    it('should clear history', () => {
      manager.createSession({ workflowId: 'workflow-1' });
      manager.createSession({ workflowId: 'workflow-2' });

      manager.clearHistory();

      const history = manager.getSessionHistory();
      expect(history).toHaveLength(0);
    });
  });

  describe('Statistics', () => {
    it('should provide session statistics', async () => {
      const session1 = manager.createSession({ workflowId: 'workflow-1' });
      const session2 = manager.createSession({ workflowId: 'workflow-2' });
      manager.createSession({ workflowId: 'workflow-1' });

      await manager.stopSession(session1.getId());

      const stats = manager.getStatistics();
      expect(stats).toEqual({
        totalSessions: 3,
        activeSessions: 2,
        stoppedSessions: 1,
        workflowCounts: {
          'workflow-1': 2,
          'workflow-2': 1,
        },
      });
    });
  });

  describe('Event Handling', () => {
    it('should forward session events', () => {
      const eventSpy = vi.fn();
      manager.on('session:breakpoint:hit', eventSpy);

      const session = manager.createSession({
        workflowId: 'workflow-123',
      });

      // Add breakpoint and trigger it
      session.addBreakpoint({
        id: 'bp-1',
        workflowId: 'workflow-123',
        nodeId: 'node-1',
        enabled: true,
      });

      session.addTimelineEvent({
        timestamp: new Date(),
        nodeId: 'node-1',
        nodeName: 'Test Node',
        nodeType: 'test',
        inputData: {},
      });

      expect(eventSpy).toHaveBeenCalledWith({
        sessionId: session.getId(),
        breakpoint: expect.objectContaining({ id: 'bp-1' }),
        nodeId: 'node-1',
      });
    });

    it('should clean up event listeners on session stop', async () => {
      const eventSpy = vi.fn();
      manager.on('session:breakpoint:hit', eventSpy);

      const session = manager.createSession({
        workflowId: 'workflow-123',
      });

      await manager.stopSession(session.getId());

      // Try to trigger event after stop
      session.emit('breakpoint:hit', {});

      // Event should not be forwarded
      expect(eventSpy).not.toHaveBeenCalled();
    });
  });

  describe('Auto Cleanup', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should auto cleanup inactive sessions when enabled', async () => {
      const managerWithAutoCleanup = new DebugSessionManager(mockApiClient, {
        autoCleanup: true,
        cleanupInterval: 1000, // 1 second
      });

      const session = managerWithAutoCleanup.createSession({
        workflowId: 'workflow-123',
      });

      await session.stop();

      // Advance timers to trigger cleanup
      vi.advanceTimersByTime(1000);
      await vi.runAllTimersAsync();

      expect(managerWithAutoCleanup.getActiveSessionCount()).toBe(0);
    });

    it('should not auto cleanup when disabled', async () => {
      const session = manager.createSession({
        workflowId: 'workflow-123',
      });

      await session.stop();

      // Advance timers
      vi.advanceTimersByTime(30000);
      await vi.runAllTimersAsync();

      // Session should still be tracked (inactive)
      expect(manager.getSession(session.getId())).toBeDefined();
    });
  });

  describe('Configuration', () => {
    it('should use default options', () => {
      const stats = manager.getStatistics();
      expect(stats.totalSessions).toBe(0);
      
      // Create more than 10 sessions to test default max
      for (let i = 0; i < 10; i++) {
        manager.createSession({ workflowId: `workflow-${i}` });
      }

      expect(manager.getActiveSessionCount()).toBe(10);
    });

    it('should apply custom options', () => {
      const customManager = new DebugSessionManager(mockApiClient, {
        maxSessions: 5,
        maxHistorySize: 10,
        autoCleanup: true,
        cleanupInterval: 5000,
      });

      // Test max sessions
      for (let i = 0; i < 5; i++) {
        customManager.createSession({ workflowId: `workflow-${i}` });
      }

      expect(() => {
        customManager.createSession({ workflowId: 'workflow-6' });
      }).toThrow('Maximum number of debug sessions (5) reached');
    });
  });

  describe('Session Export/Import', () => {
    it('should export all sessions', () => {
      const session1 = manager.createSession({ workflowId: 'workflow-1' });
      const session2 = manager.createSession({ workflowId: 'workflow-2' });

      session1.addBreakpoint({
        id: 'bp-1',
        workflowId: 'workflow-1',
        nodeId: 'node-1',
        enabled: true,
      });

      const exported = manager.exportSessions();
      expect(exported).toHaveLength(2);
      expect(exported[0].workflowId).toBe('workflow-1');
      expect(exported[0].breakpoints.size).toBe(1);
      expect(exported[1].workflowId).toBe('workflow-2');
    });

    it('should handle no active sessions', () => {
      const exported = manager.exportSessions();
      expect(exported).toEqual([]);
    });
  });

  describe('Error Handling', () => {
    it('should handle session creation errors', () => {
      const errorSpy = vi.fn();
      manager.on('error', errorSpy);

      // Force an error by providing invalid options
      const session = manager.createSession({
        workflowId: '',
      });

      // Session should still be created but might emit error
      expect(session).toBeInstanceOf(DebugSession);
    });

    it('should handle session stop errors gracefully', async () => {
      const session = manager.createSession({
        workflowId: 'workflow-123',
      });

      // Mock session stop to throw error
      vi.spyOn(session, 'stop').mockRejectedValue(new Error('Stop failed'));

      const errorSpy = vi.fn();
      manager.on('error', errorSpy);

      const stopped = await manager.stopSession(session.getId());
      
      // Should still remove session despite error
      expect(stopped).toBe(true);
      expect(manager.getActiveSessionCount()).toBe(0);
      expect(errorSpy).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});