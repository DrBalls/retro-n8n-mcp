import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { StatusDebugTool } from '../../../src/tools/debug/StatusDebugTool.js';

describe('StatusDebugTool', () => {
  let tool: StatusDebugTool;
  let mockSession: any;
  let mockContext: any;

  beforeEach(() => {
    tool = new StatusDebugTool();

    // Mock debug session
    mockSession = {
      getId: vi.fn().mockReturnValue('debug_123_abc'),
      getWorkflowId: vi.fn().mockReturnValue('workflow-123'),
      getExecutionId: vi.fn().mockReturnValue('exec-123'),
      isActive: vi.fn().mockReturnValue(true),
      getState: vi.fn().mockReturnValue({
        isPaused: true,
        stepMode: 'over',
        currentNodeId: 'node-3',
        callStack: ['node-1', 'node-2', 'node-3'],
        variables: new Map([
          ['global.counter', 42],
          ['node-2.result', { success: true }],
        ]),
      }),
      getBreakpoints: vi.fn().mockReturnValue([
        {
          id: 'bp-1',
          nodeId: 'node-1',
          enabled: true,
          hitCount: 3,
          condition: undefined,
        },
        {
          id: 'bp-2',
          nodeId: 'node-4',
          enabled: false,
          hitCount: 0,
          condition: 'error !== null',
        },
      ]),
      getWatchExpressions: vi.fn().mockReturnValue([
        {
          id: 'watch-1',
          expression: 'counter',
          value: 42,
        },
        {
          id: 'watch-2',
          expression: 'data.items.length',
          nodeId: 'node-2',
          value: 5,
        },
        {
          id: 'watch-3',
          expression: 'undefined.property',
          error: 'Cannot read property of undefined',
        },
      ]),
      getTimeline: vi.fn().mockReturnValue([
        {
          timestamp: new Date('2024-01-01T10:00:00Z'),
          nodeId: 'node-1',
          nodeName: 'Start',
          nodeType: 'start',
          inputData: {},
          outputData: { trigger: true },
          duration: 10,
        },
        {
          timestamp: new Date('2024-01-01T10:00:01Z'),
          nodeId: 'node-2',
          nodeName: 'Process',
          nodeType: 'function',
          inputData: { trigger: true },
          outputData: { result: { success: true } },
          duration: 100,
        },
        {
          timestamp: new Date('2024-01-01T10:00:02Z'),
          nodeId: 'node-3',
          nodeName: 'Current Node',
          nodeType: 'http',
          inputData: { result: { success: true } },
          // Still executing
        },
      ]),
      exportSession: vi.fn().mockReturnValue({
        id: 'debug_123_abc',
        workflowId: 'workflow-123',
        executionId: 'exec-123',
        startTime: new Date('2024-01-01T10:00:00Z'),
        isActive: true,
      }),
    };

    // Mock debug session manager
    global.debugSessionManager = {
      getSession: vi.fn().mockReturnValue(mockSession),
      getStatistics: vi.fn().mockReturnValue({
        totalSessions: 5,
        activeSessions: 2,
        stoppedSessions: 3,
        workflowCounts: {
          'workflow-123': 3,
          'workflow-456': 2,
        },
      }),
    } as any;

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
      expect(tool.name).toBe('debug_status');
    });

    it('should have correct description', () => {
      expect(tool.description).toContain('detailed status');
    });

    it('should have correct metadata', () => {
      const metadata = tool.getMetadata();
      expect(metadata.category).toBe('debug');
      expect(metadata.isMutating).toBe(false);
      expect(metadata.tags).toContain('debug');
      expect(metadata.tags).toContain('status');
      expect(metadata.tags).toContain('info');
    });
  });

  describe('Input Validation', () => {
    it('should validate required session ID', async () => {
      await expect(tool.execute({}, mockContext)).rejects.toThrow();
    });

    it('should accept valid session ID', async () => {
      const result = await tool.execute(
        { sessionId: 'debug_123_abc' },
        mockContext
      );
      expect(result.isError).toBeFalsy();
    });

    it('should accept verbose flag', async () => {
      const result = await tool.execute(
        { sessionId: 'debug_123_abc', verbose: true },
        mockContext
      );
      expect(result.isError).toBeFalsy();
    });
  });

  describe('Status Information', () => {
    it('should return comprehensive session status', async () => {
      const result = await tool.execute(
        { sessionId: 'debug_123_abc' },
        mockContext
      );

      const data = JSON.parse(result.content[0].text!);
      expect(data.sessionId).toBe('debug_123_abc');
      expect(data.workflowId).toBe('workflow-123');
      expect(data.executionId).toBe('exec-123');
      expect(data.isActive).toBe(true);
    });

    it('should include execution state', async () => {
      const result = await tool.execute(
        { sessionId: 'debug_123_abc' },
        mockContext
      );

      const data = JSON.parse(result.content[0].text!);
      expect(data.executionState).toEqual({
        status: 'paused',
        stepMode: 'over',
        currentNode: {
          id: 'node-3',
          name: 'Current Node',
          type: 'http',
        },
        callStackDepth: 3,
        variableCount: 2,
      });
    });

    it('should include breakpoint summary', async () => {
      const result = await tool.execute(
        { sessionId: 'debug_123_abc' },
        mockContext
      );

      const data = JSON.parse(result.content[0].text!);
      expect(data.breakpoints).toEqual({
        total: 2,
        enabled: 1,
        disabled: 1,
        conditional: 1,
        totalHits: 3,
      });
    });

    it('should include watch expression summary', async () => {
      const result = await tool.execute(
        { sessionId: 'debug_123_abc' },
        mockContext
      );

      const data = JSON.parse(result.content[0].text!);
      expect(data.watchExpressions).toEqual({
        total: 3,
        evaluated: 2,
        errors: 1,
        nodeScoped: 1,
      });
    });

    it('should include timeline summary', async () => {
      const result = await tool.execute(
        { sessionId: 'debug_123_abc' },
        mockContext
      );

      const data = JSON.parse(result.content[0].text!);
      expect(data.timeline).toEqual({
        totalEvents: 3,
        duration: '2s',
        currentNode: 'node-3',
        lastCompletedNode: 'node-2',
      });
    });

    it('should include session duration', async () => {
      const startTime = new Date('2024-01-01T10:00:00Z');
      const now = new Date('2024-01-01T10:05:30Z');
      vi.setSystemTime(now);

      const result = await tool.execute(
        { sessionId: 'debug_123_abc' },
        mockContext
      );

      const data = JSON.parse(result.content[0].text!);
      expect(data.sessionDuration).toBe('5m 30s');

      vi.useRealTimers();
    });
  });

  describe('Verbose Mode', () => {
    it('should include detailed information in verbose mode', async () => {
      const result = await tool.execute(
        { sessionId: 'debug_123_abc', verbose: true },
        mockContext
      );

      const data = JSON.parse(result.content[0].text!);
      expect(data.details).toBeDefined();
      expect(data.details.callStack).toEqual(['node-1', 'node-2', 'node-3']);
      expect(data.details.variables).toEqual({
        'global.counter': 42,
        'node-2.result': { success: true },
      });
    });

    it('should include breakpoint details in verbose mode', async () => {
      const result = await tool.execute(
        { sessionId: 'debug_123_abc', verbose: true },
        mockContext
      );

      const data = JSON.parse(result.content[0].text!);
      expect(data.details.breakpoints).toHaveLength(2);
      expect(data.details.breakpoints[0]).toEqual({
        id: 'bp-1',
        nodeId: 'node-1',
        enabled: true,
        hitCount: 3,
        condition: undefined,
      });
    });

    it('should include watch expression details in verbose mode', async () => {
      const result = await tool.execute(
        { sessionId: 'debug_123_abc', verbose: true },
        mockContext
      );

      const data = JSON.parse(result.content[0].text!);
      expect(data.details.watchExpressions).toHaveLength(3);
      expect(data.details.watchExpressions[0]).toEqual({
        id: 'watch-1',
        expression: 'counter',
        value: 42,
        nodeId: undefined,
        error: undefined,
      });
    });

    it('should include recent timeline events in verbose mode', async () => {
      const result = await tool.execute(
        { sessionId: 'debug_123_abc', verbose: true },
        mockContext
      );

      const data = JSON.parse(result.content[0].text!);
      expect(data.details.recentEvents).toHaveLength(3);
      expect(data.details.recentEvents[0].nodeId).toBe('node-3');
    });
  });

  describe('Response Format', () => {
    it('should include suggested actions based on state', async () => {
      const result = await tool.execute(
        { sessionId: 'debug_123_abc' },
        mockContext
      );

      const data = JSON.parse(result.content[0].text!);
      expect(data.suggestedActions).toBeDefined();
      expect(data.suggestedActions).toContain('debug_step');
      expect(data.suggestedActions).toContain('debug_resume');
      expect(data.suggestedActions).toContain('debug_inspect');
    });

    it('should format duration correctly', async () => {
      mockSession.getTimeline.mockReturnValue([
        {
          timestamp: new Date('2024-01-01T10:00:00Z'),
          nodeId: 'node-1',
          duration: 1234,
        },
        {
          timestamp: new Date('2024-01-01T10:01:00Z'),
          nodeId: 'node-2',
          duration: 56789,
        },
      ]);

      const result = await tool.execute(
        { sessionId: 'debug_123_abc' },
        mockContext
      );

      const data = JSON.parse(result.content[0].text!);
      expect(data.timeline.duration).toBe('1m 0s');
    });
  });

  describe('Error Handling', () => {
    it('should handle missing debug session manager', async () => {
      global.debugSessionManager = undefined;

      await expect(
        tool.execute({ sessionId: 'debug_123_abc' }, mockContext)
      ).rejects.toThrow('No debug session manager initialized');
    });

    it('should handle session not found', async () => {
      global.debugSessionManager!.getSession = vi.fn().mockReturnValue(undefined);

      await expect(
        tool.execute({ sessionId: 'non-existent' }, mockContext)
      ).rejects.toThrow('Debug session non-existent not found');
    });

    it('should handle inactive session', async () => {
      mockSession.isActive.mockReturnValue(false);

      const result = await tool.execute(
        { sessionId: 'debug_123_abc' },
        mockContext
      );

      const data = JSON.parse(result.content[0].text!);
      expect(data.isActive).toBe(false);
      expect(data.suggestedActions).toContain('Session is inactive');
    });
  });

  describe('Complex Scenarios', () => {
    it('should handle session with no timeline events', async () => {
      mockSession.getTimeline.mockReturnValue([]);

      const result = await tool.execute(
        { sessionId: 'debug_123_abc' },
        mockContext
      );

      const data = JSON.parse(result.content[0].text!);
      expect(data.timeline).toEqual({
        totalEvents: 0,
        duration: '0s',
        currentNode: 'node-3',
        lastCompletedNode: null,
      });
    });

    it('should handle session with no breakpoints or watches', async () => {
      mockSession.getBreakpoints.mockReturnValue([]);
      mockSession.getWatchExpressions.mockReturnValue([]);

      const result = await tool.execute(
        { sessionId: 'debug_123_abc' },
        mockContext
      );

      const data = JSON.parse(result.content[0].text!);
      expect(data.breakpoints.total).toBe(0);
      expect(data.watchExpressions.total).toBe(0);
    });

    it('should provide appropriate suggestions for running state', async () => {
      mockSession.getState.mockReturnValue({
        isPaused: false,
        stepMode: null,
        currentNodeId: 'node-5',
        callStack: ['node-1', 'node-2', 'node-3', 'node-4', 'node-5'],
        variables: new Map(),
      });

      const result = await tool.execute(
        { sessionId: 'debug_123_abc' },
        mockContext
      );

      const data = JSON.parse(result.content[0].text!);
      expect(data.executionState.status).toBe('running');
      expect(data.suggestedActions).toContain('debug_pause');
    });

    it('should handle very long session durations', async () => {
      const startTime = new Date('2024-01-01T10:00:00Z');
      const now = new Date('2024-01-02T12:34:56Z'); // Over 24 hours
      vi.setSystemTime(now);

      mockSession.exportSession.mockReturnValue({
        startTime,
        isActive: true,
      });

      const result = await tool.execute(
        { sessionId: 'debug_123_abc' },
        mockContext
      );

      const data = JSON.parse(result.content[0].text!);
      expect(data.sessionDuration).toMatch(/\d+h \d+m \d+s/);

      vi.useRealTimers();
    });
  });
});