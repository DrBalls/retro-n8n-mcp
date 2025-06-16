import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { ListDebugSessionsTool } from '../../../src/tools/debug/ListDebugSessionsTool.js';
import { DebugSession } from '../../../src/services/DebugSession.js';

describe('ListDebugSessionsTool', () => {
  let tool: ListDebugSessionsTool;
  let mockSessionManager: any;
  let mockContext: any;
  let mockSessions: any[];

  beforeEach(() => {
    tool = new ListDebugSessionsTool();

    // Mock debug sessions
    mockSessions = [
      {
        getId: vi.fn().mockReturnValue('debug_123_abc'),
        getWorkflowId: vi.fn().mockReturnValue('workflow-123'),
        getExecutionId: vi.fn().mockReturnValue('exec-123'),
        isActive: vi.fn().mockReturnValue(true),
        getState: vi.fn().mockReturnValue({
          isPaused: true,
          currentNodeId: 'node-2',
          callStack: ['node-1', 'node-2'],
          variables: new Map(),
        }),
        getBreakpoints: vi.fn().mockReturnValue([
          { id: 'bp-1', nodeId: 'node-1', enabled: true, hitCount: 3 },
          { id: 'bp-2', nodeId: 'node-2', enabled: false, hitCount: 0 },
        ]),
        getWatchExpressions: vi.fn().mockReturnValue([
          { id: 'watch-1', expression: 'counter', value: 42 },
        ]),
        getTimeline: vi.fn().mockReturnValue([
          { timestamp: new Date(), nodeId: 'node-1' },
          { timestamp: new Date(), nodeId: 'node-2' },
        ]),
      },
      {
        getId: vi.fn().mockReturnValue('debug_456_def'),
        getWorkflowId: vi.fn().mockReturnValue('workflow-456'),
        getExecutionId: vi.fn().mockReturnValue('exec-456'),
        isActive: vi.fn().mockReturnValue(true),
        getState: vi.fn().mockReturnValue({
          isPaused: false,
          currentNodeId: 'node-5',
          callStack: ['node-1', 'node-2', 'node-3', 'node-4', 'node-5'],
          variables: new Map(),
        }),
        getBreakpoints: vi.fn().mockReturnValue([]),
        getWatchExpressions: vi.fn().mockReturnValue([
          { id: 'watch-2', expression: 'data.items', value: [1, 2, 3] },
          { id: 'watch-3', expression: 'error', error: 'Not found' },
        ]),
        getTimeline: vi.fn().mockReturnValue([
          { timestamp: new Date(), nodeId: 'node-1' },
          { timestamp: new Date(), nodeId: 'node-2' },
          { timestamp: new Date(), nodeId: 'node-3' },
          { timestamp: new Date(), nodeId: 'node-4' },
          { timestamp: new Date(), nodeId: 'node-5' },
        ]),
      },
      {
        getId: vi.fn().mockReturnValue('debug_789_ghi'),
        getWorkflowId: vi.fn().mockReturnValue('workflow-123'), // Same workflow as first
        getExecutionId: vi.fn().mockReturnValue(undefined), // No execution yet
        isActive: vi.fn().mockReturnValue(false), // Inactive
        getState: vi.fn().mockReturnValue({
          isPaused: false,
          currentNodeId: null,
          callStack: [],
          variables: new Map(),
        }),
        getBreakpoints: vi.fn().mockReturnValue([
          { id: 'bp-3', nodeId: 'node-1', enabled: true, hitCount: 0 },
        ]),
        getWatchExpressions: vi.fn().mockReturnValue([]),
        getTimeline: vi.fn().mockReturnValue([]),
      },
    ];

    // Mock debug session manager
    mockSessionManager = {
      getActiveSessions: vi.fn().mockReturnValue(mockSessions),
      getActiveSessionCount: vi.fn().mockReturnValue(3),
      getSessionsByWorkflow: vi.fn().mockImplementation((workflowId) => {
        return mockSessions.filter(s => s.getWorkflowId() === workflowId);
      }),
      getStatistics: vi.fn().mockReturnValue({
        totalSessions: 5,
        activeSessions: 3,
        stoppedSessions: 2,
        workflowCounts: {
          'workflow-123': 2,
          'workflow-456': 1,
        },
      }),
    };

    global.debugSessionManager = mockSessionManager;

    mockContext = {
      apiClient: {},
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
    global.debugSessionManager = undefined;
  });

  describe('Basic Properties', () => {
    it('should have correct name', () => {
      expect(tool.name).toBe('debug_list');
    });

    it('should have correct description', () => {
      expect(tool.description).toContain('List all active debug sessions');
    });

    it('should have correct metadata', () => {
      const metadata = tool.getMetadata();
      expect(metadata.category).toBe('debug');
      expect(metadata.isMutating).toBe(false);
      expect(metadata.tags).toContain('debug');
      expect(metadata.tags).toContain('session');
      expect(metadata.tags).toContain('list');
    });
  });

  describe('Input Validation', () => {
    it('should accept empty input', async () => {
      const result = await tool.execute({}, mockContext);
      expect(result.isError).toBeFalsy();
    });

    it('should accept workflow filter', async () => {
      const result = await tool.execute(
        { workflowId: 'workflow-123' },
        mockContext
      );
      expect(result.isError).toBeFalsy();
    });

    it('should accept status filter', async () => {
      const validStatuses = ['all', 'active', 'paused', 'running'];
      
      for (const status of validStatuses) {
        const result = await tool.execute({ status }, mockContext);
        expect(result.isError).toBeFalsy();
      }
    });

    it('should validate status enum', async () => {
      await expect(
        tool.execute({ status: 'invalid' }, mockContext)
      ).rejects.toThrow();
    });
  });

  describe('Listing Sessions', () => {
    it('should list all sessions by default', async () => {
      const result = await tool.execute({}, mockContext);

      expect(mockSessionManager.getActiveSessions).toHaveBeenCalled();
      
      const data = JSON.parse(result.content[0].text!);
      expect(data.sessions).toHaveLength(3);
      expect(data.totalCount).toBe(3);
    });

    it('should include session details', async () => {
      const result = await tool.execute({}, mockContext);

      const data = JSON.parse(result.content[0].text!);
      expect(data.sessions[0]).toEqual({
        sessionId: 'debug_123_abc',
        workflowId: 'workflow-123',
        executionId: 'exec-123',
        status: 'paused',
        currentNode: 'node-2',
        callStackDepth: 2,
        breakpoints: {
          total: 2,
          enabled: 1,
          totalHits: 3,
        },
        watchExpressions: {
          total: 1,
          evaluated: 1,
          errors: 0,
        },
        timelineEvents: 2,
      });
    });

    it('should filter by workflow ID', async () => {
      const result = await tool.execute(
        { workflowId: 'workflow-123' },
        mockContext
      );

      expect(mockSessionManager.getSessionsByWorkflow).toHaveBeenCalledWith('workflow-123');
      
      const data = JSON.parse(result.content[0].text!);
      expect(data.sessions).toHaveLength(2);
      expect(data.sessions.every((s: any) => s.workflowId === 'workflow-123')).toBe(true);
    });

    it('should filter by status - active only', async () => {
      const result = await tool.execute({ status: 'active' }, mockContext);

      const data = JSON.parse(result.content[0].text!);
      expect(data.sessions).toHaveLength(2); // Two active sessions
      expect(data.sessions[0].status).not.toBe('inactive');
      expect(data.sessions[1].status).not.toBe('inactive');
    });

    it('should filter by status - paused only', async () => {
      const result = await tool.execute({ status: 'paused' }, mockContext);

      const data = JSON.parse(result.content[0].text!);
      expect(data.sessions).toHaveLength(1);
      expect(data.sessions[0].status).toBe('paused');
    });

    it('should filter by status - running only', async () => {
      const result = await tool.execute({ status: 'running' }, mockContext);

      const data = JSON.parse(result.content[0].text!);
      expect(data.sessions).toHaveLength(1);
      expect(data.sessions[0].status).toBe('running');
    });

    it('should include all statuses with "all" filter', async () => {
      const result = await tool.execute({ status: 'all' }, mockContext);

      const data = JSON.parse(result.content[0].text!);
      expect(data.sessions).toHaveLength(3);
    });
  });

  describe('Summary Statistics', () => {
    it('should include overall statistics', async () => {
      const result = await tool.execute({}, mockContext);

      const data = JSON.parse(result.content[0].text!);
      expect(data.statistics).toEqual({
        total: 5,
        active: 3,
        stopped: 2,
        byWorkflow: {
          'workflow-123': 2,
          'workflow-456': 1,
        },
      });
    });

    it('should calculate status breakdown', async () => {
      const result = await tool.execute({}, mockContext);

      const data = JSON.parse(result.content[0].text!);
      expect(data.statusBreakdown).toEqual({
        active: 2,
        paused: 1,
        running: 1,
        inactive: 1,
      });
    });
  });

  describe('Response Format', () => {
    it('should format empty results', async () => {
      mockSessionManager.getActiveSessions.mockReturnValue([]);

      const result = await tool.execute({}, mockContext);

      const data = JSON.parse(result.content[0].text!);
      expect(data.sessions).toEqual([]);
      expect(data.totalCount).toBe(0);
      expect(data.message).toBe('No active debug sessions');
    });

    it('should include helpful hints', async () => {
      const result = await tool.execute({}, mockContext);

      const data = JSON.parse(result.content[0].text!);
      expect(data.hint).toBeDefined();
      expect(data.hint).toContain('debug_inspect');
      expect(data.hint).toContain('debug_step');
      expect(data.hint).toContain('debug_stop');
    });

    it('should include filter information', async () => {
      const result = await tool.execute(
        { workflowId: 'workflow-123', status: 'active' },
        mockContext
      );

      const data = JSON.parse(result.content[0].text!);
      expect(data.filters).toEqual({
        workflowId: 'workflow-123',
        status: 'active',
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle missing debug session manager', async () => {
      global.debugSessionManager = undefined;

      await expect(
        tool.execute({}, mockContext)
      ).rejects.toThrow('No debug session manager initialized');
    });

    it('should handle errors in session methods gracefully', async () => {
      // Create a session that throws errors
      const errorSession = {
        getId: vi.fn().mockReturnValue('error-session'),
        getWorkflowId: vi.fn().mockImplementation(() => {
          throw new Error('Failed to get workflow ID');
        }),
        isActive: vi.fn().mockReturnValue(true),
        getState: vi.fn().mockReturnValue({ isPaused: false }),
        getBreakpoints: vi.fn().mockReturnValue([]),
        getWatchExpressions: vi.fn().mockReturnValue([]),
        getTimeline: vi.fn().mockReturnValue([]),
      };

      mockSessionManager.getActiveSessions.mockReturnValue([errorSession]);

      const result = await tool.execute({}, mockContext);

      const data = JSON.parse(result.content[0].text!);
      expect(data.sessions[0]).toMatchObject({
        sessionId: 'error-session',
        workflowId: 'unknown',
        error: 'Failed to retrieve session details',
      });
    });
  });

  describe('Complex Scenarios', () => {
    it('should handle sessions with complex watch expressions', async () => {
      mockSessions[0].getWatchExpressions.mockReturnValue([
        { id: 'w1', expression: 'var1', value: 1 },
        { id: 'w2', expression: 'var2', value: 2 },
        { id: 'w3', expression: 'var3', error: 'Not found' },
        { id: 'w4', expression: 'var4', error: 'Type error' },
        { id: 'w5', expression: 'var5', value: 5 },
      ]);

      const result = await tool.execute({}, mockContext);

      const data = JSON.parse(result.content[0].text!);
      expect(data.sessions[0].watchExpressions).toEqual({
        total: 5,
        evaluated: 3,
        errors: 2,
      });
    });

    it('should handle sessions with no execution ID', async () => {
      const result = await tool.execute({}, mockContext);

      const data = JSON.parse(result.content[0].text!);
      const sessionWithoutExec = data.sessions.find((s: any) => s.sessionId === 'debug_789_ghi');
      expect(sessionWithoutExec.executionId).toBeNull();
      expect(sessionWithoutExec.status).toBe('inactive');
    });

    it('should sort sessions by creation time', async () => {
      // Assuming sessions are returned in creation order
      const result = await tool.execute({}, mockContext);

      const data = JSON.parse(result.content[0].text!);
      expect(data.sessions[0].sessionId).toBe('debug_123_abc');
      expect(data.sessions[1].sessionId).toBe('debug_456_def');
      expect(data.sessions[2].sessionId).toBe('debug_789_ghi');
    });

    it('should handle large number of sessions', async () => {
      const manySessions = [];
      for (let i = 0; i < 50; i++) {
        manySessions.push({
          getId: vi.fn().mockReturnValue(`debug_${i}`),
          getWorkflowId: vi.fn().mockReturnValue(`workflow-${i % 5}`),
          getExecutionId: vi.fn().mockReturnValue(`exec-${i}`),
          isActive: vi.fn().mockReturnValue(i % 3 !== 0),
          getState: vi.fn().mockReturnValue({
            isPaused: i % 2 === 0,
            currentNodeId: `node-${i}`,
            callStack: [`node-${i}`],
            variables: new Map(),
          }),
          getBreakpoints: vi.fn().mockReturnValue([]),
          getWatchExpressions: vi.fn().mockReturnValue([]),
          getTimeline: vi.fn().mockReturnValue([]),
        });
      }

      mockSessionManager.getActiveSessions.mockReturnValue(manySessions);
      mockSessionManager.getActiveSessionCount.mockReturnValue(50);

      const result = await tool.execute({}, mockContext);

      const data = JSON.parse(result.content[0].text!);
      expect(data.sessions).toHaveLength(50);
      expect(data.totalCount).toBe(50);
    });

    it('should provide contextual hints based on session states', async () => {
      // All sessions paused
      mockSessions.forEach(s => {
        s.getState.mockReturnValue({
          isPaused: true,
          currentNodeId: 'node-1',
          callStack: ['node-1'],
          variables: new Map(),
        });
      });

      const result = await tool.execute({}, mockContext);

      const data = JSON.parse(result.content[0].text!);
      expect(data.hint).toContain('All sessions are paused');
    });
  });
});