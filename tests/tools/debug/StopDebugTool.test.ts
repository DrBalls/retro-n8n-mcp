import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { StopDebugTool } from '../../../src/tools/debug/StopDebugTool.js';
import { DebugSession } from '../../../src/services/DebugSession.js';
import { DebugSessionManager } from '../../../src/services/DebugSessionManager.js';

describe('StopDebugTool', () => {
  let tool: StopDebugTool;
  let mockSession: any;
  let mockSessionManager: any;
  let mockContext: any;

  beforeEach(() => {
    tool = new StopDebugTool();

    // Mock debug session
    mockSession = {
      getId: vi.fn().mockReturnValue('debug_123_abc'),
      getWorkflowId: vi.fn().mockReturnValue('workflow-123'),
      getExecutionId: vi.fn().mockReturnValue('exec-123'),
      isActive: vi.fn().mockReturnValue(true),
      stop: vi.fn().mockResolvedValue(undefined),
      getState: vi.fn().mockReturnValue({
        isPaused: true,
        currentNodeId: 'node-2',
        callStack: ['node-1', 'node-2'],
        variables: new Map(),
      }),
      getBreakpoints: vi.fn().mockReturnValue([
        {
          id: 'bp-1',
          nodeId: 'node-1',
          enabled: true,
          hitCount: 3,
        },
      ]),
      getWatchExpressions: vi.fn().mockReturnValue([
        {
          id: 'watch-1',
          expression: 'counter',
          value: 42,
        },
      ]),
      getTimeline: vi.fn().mockReturnValue([
        {
          timestamp: new Date('2024-01-01T10:00:00Z'),
          nodeId: 'node-1',
          nodeName: 'Start',
          nodeType: 'start',
          inputData: {},
          duration: 10,
        },
        {
          timestamp: new Date('2024-01-01T10:00:01Z'),
          nodeId: 'node-2',
          nodeName: 'Process',
          nodeType: 'function',
          inputData: {},
          duration: 100,
        },
      ]),
    };

    // Mock debug session manager
    mockSessionManager = {
      getSession: vi.fn().mockReturnValue(mockSession),
      stopSession: vi.fn().mockResolvedValue(true),
      getSessionHistory: vi.fn().mockReturnValue([
        {
          sessionId: 'debug_123_abc',
          workflowId: 'workflow-123',
          executionId: 'exec-123',
          startTime: new Date('2024-01-01T10:00:00Z'),
          endTime: new Date('2024-01-01T10:05:00Z'),
          status: 'stopped',
        },
      ]),
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
      expect(tool.name).toBe('debug_stop');
    });

    it('should have correct description', () => {
      expect(tool.description).toContain('Stop a debug session');
    });

    it('should have correct metadata', () => {
      const metadata = tool.getMetadata();
      expect(metadata.category).toBe('debug');
      expect(metadata.isMutating).toBe(true);
      expect(metadata.tags).toContain('debug');
      expect(metadata.tags).toContain('control');
      expect(metadata.tags).toContain('session');
    });
  });

  describe('Input Validation', () => {
    it('should validate required session ID', async () => {
      await expect(tool.execute({}, mockContext)).rejects.toThrow();
    });

    it('should accept valid input', async () => {
      const result = await tool.execute(
        { sessionId: 'debug_123_abc' },
        mockContext
      );
      expect(result.isError).toBeFalsy();
    });

    it('should accept optional save flag', async () => {
      const result = await tool.execute(
        { sessionId: 'debug_123_abc', saveHistory: true },
        mockContext
      );
      expect(result.isError).toBeFalsy();
    });
  });

  describe('Stopping Sessions', () => {
    it('should stop active session', async () => {
      const result = await tool.execute(
        { sessionId: 'debug_123_abc' },
        mockContext
      );

      expect(mockSessionManager.stopSession).toHaveBeenCalledWith('debug_123_abc');
      
      const data = JSON.parse(result.content[0].text!);
      expect(data.sessionId).toBe('debug_123_abc');
      expect(data.status).toBe('stopped');
      expect(data.success).toBe(true);
    });

    it('should include session summary', async () => {
      const startTime = new Date('2024-01-01T10:00:00Z');
      const endTime = new Date('2024-01-01T10:05:00Z');
      
      mockSessionManager.getSessionHistory.mockReturnValue([
        {
          sessionId: 'debug_123_abc',
          workflowId: 'workflow-123',
          executionId: 'exec-123',
          startTime,
          endTime,
          status: 'stopped',
        },
      ]);

      const result = await tool.execute(
        { sessionId: 'debug_123_abc' },
        mockContext
      );

      const data = JSON.parse(result.content[0].text!);
      expect(data.summary).toMatchObject({
        workflowId: 'workflow-123',
        executionId: 'exec-123',
        duration: 300000, // 5 minutes in ms
        eventsProcessed: 2,
        breakpointsHit: 3,
        watchExpressions: 1,
      });
    });

    it('should include final state', async () => {
      const result = await tool.execute(
        { sessionId: 'debug_123_abc' },
        mockContext
      );

      const data = JSON.parse(result.content[0].text!);
      expect(data.finalState).toEqual({
        lastNodeId: 'node-2',
        callStackDepth: 2,
        wasPaused: true,
      });
    });

    it('should handle saveHistory option', async () => {
      const result = await tool.execute(
        { sessionId: 'debug_123_abc', saveHistory: true },
        mockContext
      );

      const data = JSON.parse(result.content[0].text!);
      expect(data.historySaved).toBe(true);
      expect(data.message).toContain('saved to history');
    });
  });

  describe('Response Format', () => {
    it('should format duration properly', async () => {
      mockSessionManager.getSessionHistory.mockReturnValue([
        {
          sessionId: 'debug_123_abc',
          workflowId: 'workflow-123',
          executionId: 'exec-123',
          startTime: new Date('2024-01-01T10:00:00Z'),
          endTime: new Date('2024-01-01T11:23:45Z'), // 1h 23m 45s
          status: 'stopped',
        },
      ]);

      const result = await tool.execute(
        { sessionId: 'debug_123_abc' },
        mockContext
      );

      const data = JSON.parse(result.content[0].text!);
      expect(data.summary.formattedDuration).toBe('1h 23m 45s');
    });

    it('should format short durations', async () => {
      mockSessionManager.getSessionHistory.mockReturnValue([
        {
          sessionId: 'debug_123_abc',
          workflowId: 'workflow-123',
          executionId: 'exec-123',
          startTime: new Date('2024-01-01T10:00:00Z'),
          endTime: new Date('2024-01-01T10:00:30Z'), // 30 seconds
          status: 'stopped',
        },
      ]);

      const result = await tool.execute(
        { sessionId: 'debug_123_abc' },
        mockContext
      );

      const data = JSON.parse(result.content[0].text!);
      expect(data.summary.formattedDuration).toBe('30s');
    });

    it('should include next steps guidance', async () => {
      const result = await tool.execute(
        { sessionId: 'debug_123_abc' },
        mockContext
      );

      const data = JSON.parse(result.content[0].text!);
      expect(data.nextSteps).toBeDefined();
      expect(data.nextSteps).toContain('debug_history');
      expect(data.nextSteps).toContain('export');
      expect(data.nextSteps).toContain('new debug session');
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
      mockSessionManager.getSession.mockReturnValue(undefined);

      await expect(
        tool.execute({ sessionId: 'non-existent' }, mockContext)
      ).rejects.toThrow('Debug session non-existent not found');
    });

    it('should handle already stopped session', async () => {
      mockSession.isActive.mockReturnValue(false);

      const result = await tool.execute(
        { sessionId: 'debug_123_abc' },
        mockContext
      );

      const data = JSON.parse(result.content[0].text!);
      expect(data.warning).toBe('Session was already inactive');
      expect(data.success).toBe(true);
    });

    it('should handle stop failure', async () => {
      mockSessionManager.stopSession.mockResolvedValue(false);

      const result = await tool.execute(
        { sessionId: 'debug_123_abc' },
        mockContext
      );

      const data = JSON.parse(result.content[0].text!);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Failed to stop session');
    });

    it('should handle stop exceptions gracefully', async () => {
      mockSessionManager.stopSession.mockRejectedValue(new Error('Stop failed'));

      await expect(
        tool.execute({ sessionId: 'debug_123_abc' }, mockContext)
      ).rejects.toThrow('Stop failed');
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
      expect(data.summary.eventsProcessed).toBe(0);
    });

    it('should handle session with no breakpoints', async () => {
      mockSession.getBreakpoints.mockReturnValue([]);

      const result = await tool.execute(
        { sessionId: 'debug_123_abc' },
        mockContext
      );

      const data = JSON.parse(result.content[0].text!);
      expect(data.summary.breakpointsHit).toBe(0);
    });

    it('should calculate total breakpoint hits', async () => {
      mockSession.getBreakpoints.mockReturnValue([
        {
          id: 'bp-1',
          nodeId: 'node-1',
          enabled: true,
          hitCount: 5,
        },
        {
          id: 'bp-2',
          nodeId: 'node-2',
          enabled: false,
          hitCount: 3,
        },
        {
          id: 'bp-3',
          nodeId: 'node-3',
          enabled: true,
          hitCount: 7,
        },
      ]);

      const result = await tool.execute(
        { sessionId: 'debug_123_abc' },
        mockContext
      );

      const data = JSON.parse(result.content[0].text!);
      expect(data.summary.breakpointsHit).toBe(15);
    });

    it('should handle missing execution ID', async () => {
      mockSession.getExecutionId.mockReturnValue(undefined);

      const result = await tool.execute(
        { sessionId: 'debug_123_abc' },
        mockContext
      );

      const data = JSON.parse(result.content[0].text!);
      expect(data.summary.executionId).toBeUndefined();
    });

    it('should handle session without history entry', async () => {
      mockSessionManager.getSessionHistory.mockReturnValue([]);

      const result = await tool.execute(
        { sessionId: 'debug_123_abc' },
        mockContext
      );

      const data = JSON.parse(result.content[0].text!);
      // Should still work but without duration info
      expect(data.summary.duration).toBeUndefined();
      expect(data.summary.formattedDuration).toBe('unknown');
    });

    it('should provide appropriate next steps based on session state', async () => {
      // Session with errors
      mockSession.getTimeline.mockReturnValue([
        {
          timestamp: new Date(),
          nodeId: 'node-1',
          nodeName: 'Error Node',
          nodeType: 'function',
          inputData: {},
          error: 'Function failed',
        },
      ]);

      const result = await tool.execute(
        { sessionId: 'debug_123_abc' },
        mockContext
      );

      const data = JSON.parse(result.content[0].text!);
      expect(data.nextSteps).toContain('errors were encountered');
    });
  });

  describe('Session Cleanup', () => {
    it('should indicate cleanup actions', async () => {
      const result = await tool.execute(
        { sessionId: 'debug_123_abc' },
        mockContext
      );

      const data = JSON.parse(result.content[0].text!);
      expect(data.cleanup).toBeDefined();
      expect(data.cleanup).toContain('execution stopped');
      expect(data.cleanup).toContain('resources freed');
    });

    it('should handle complex session state', async () => {
      mockSession.getState.mockReturnValue({
        isPaused: false,
        stepMode: 'over',
        currentNodeId: 'node-5',
        callStack: ['node-1', 'node-2', 'node-3', 'node-4', 'node-5'],
        variables: new Map([
          ['var1', 'value1'],
          ['var2', 'value2'],
          ['var3', 'value3'],
        ]),
      });

      const result = await tool.execute(
        { sessionId: 'debug_123_abc' },
        mockContext
      );

      const data = JSON.parse(result.content[0].text!);
      expect(data.finalState.callStackDepth).toBe(5);
      expect(data.finalState.wasPaused).toBe(false);
      expect(data.finalState.stepMode).toBe('over');
    });
  });
});