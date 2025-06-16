import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { StepDebugTool } from '../../../src/tools/debug/StepDebugTool.js';
import { DebugSession } from '../../../src/services/DebugSession.js';
import { DebugSessionManager } from '../../../src/services/DebugSessionManager.js';

describe('StepDebugTool', () => {
  let tool: StepDebugTool;
  let mockSession: any;
  let mockContext: any;

  beforeEach(() => {
    tool = new StepDebugTool();

    // Mock debug session
    mockSession = {
      getId: vi.fn().mockReturnValue('debug_123_abc'),
      getWorkflowId: vi.fn().mockReturnValue('workflow-123'),
      getExecutionId: vi.fn().mockReturnValue('exec-123'),
      isActive: vi.fn().mockReturnValue(true),
      getState: vi.fn().mockReturnValue({
        isPaused: true,
        stepMode: null,
        currentNodeId: 'node-1',
        callStack: ['node-1'],
        variables: new Map(),
      }),
      stepOver: vi.fn().mockResolvedValue(undefined),
      stepInto: vi.fn().mockResolvedValue(undefined),
      stepOut: vi.fn().mockResolvedValue(undefined),
      resume: vi.fn().mockResolvedValue(undefined),
      pause: vi.fn().mockResolvedValue(undefined),
      getTimeline: vi.fn().mockReturnValue([
        {
          timestamp: new Date(),
          nodeId: 'node-1',
          nodeName: 'Start Node',
          nodeType: 'n8n-nodes-base.start',
          inputData: {},
          outputData: { data: 'test' },
        },
      ]),
    };

    // Mock debug session manager
    global.debugSessionManager = {
      getSession: vi.fn().mockReturnValue(mockSession),
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
      expect(tool.name).toBe('debug_step');
    });

    it('should have correct description', () => {
      expect(tool.description).toContain('Control debug session execution');
    });

    it('should have correct metadata', () => {
      const metadata = tool.getMetadata();
      expect(metadata.category).toBe('debug');
      expect(metadata.isMutating).toBe(false);
      expect(metadata.tags).toContain('debug');
      expect(metadata.tags).toContain('execution');
      expect(metadata.tags).toContain('control');
    });
  });

  describe('Input Validation', () => {
    it('should validate required session ID', async () => {
      await expect(tool.execute({}, mockContext)).rejects.toThrow();
    });

    it('should validate required action', async () => {
      await expect(
        tool.execute({ sessionId: 'debug_123' }, mockContext)
      ).rejects.toThrow();
    });

    it('should validate action enum values', async () => {
      await expect(
        tool.execute(
          { sessionId: 'debug_123', action: 'invalid' },
          mockContext
        )
      ).rejects.toThrow();
    });

    it('should accept valid actions', async () => {
      const actions = ['over', 'into', 'out', 'resume', 'pause'];
      
      for (const action of actions) {
        const result = await tool.execute(
          { sessionId: 'debug_123_abc', action },
          mockContext
        );
        expect(result.isError).toBeFalsy();
      }
    });
  });

  describe('Step Actions', () => {
    it('should handle step over', async () => {
      const result = await tool.execute(
        { sessionId: 'debug_123_abc', action: 'over' },
        mockContext
      );

      expect(mockSession.stepOver).toHaveBeenCalled();
      expect(result.isError).toBeFalsy();

      const data = JSON.parse(result.content[0].text!);
      expect(data.action).toBe('over');
      expect(data.status).toBe('stepping');
    });

    it('should handle step into', async () => {
      const result = await tool.execute(
        { sessionId: 'debug_123_abc', action: 'into' },
        mockContext
      );

      expect(mockSession.stepInto).toHaveBeenCalled();
      expect(result.isError).toBeFalsy();

      const data = JSON.parse(result.content[0].text!);
      expect(data.action).toBe('into');
      expect(data.status).toBe('stepping');
    });

    it('should handle step out', async () => {
      const result = await tool.execute(
        { sessionId: 'debug_123_abc', action: 'out' },
        mockContext
      );

      expect(mockSession.stepOut).toHaveBeenCalled();
      expect(result.isError).toBeFalsy();

      const data = JSON.parse(result.content[0].text!);
      expect(data.action).toBe('out');
      expect(data.status).toBe('stepping');
    });

    it('should handle resume', async () => {
      const result = await tool.execute(
        { sessionId: 'debug_123_abc', action: 'resume' },
        mockContext
      );

      expect(mockSession.resume).toHaveBeenCalled();
      expect(result.isError).toBeFalsy();

      const data = JSON.parse(result.content[0].text!);
      expect(data.action).toBe('resume');
      expect(data.status).toBe('resumed');
    });

    it('should handle pause', async () => {
      mockSession.getState.mockReturnValue({
        isPaused: false,
        stepMode: null,
        currentNodeId: 'node-2',
        callStack: ['node-1', 'node-2'],
        variables: new Map(),
      });

      const result = await tool.execute(
        { sessionId: 'debug_123_abc', action: 'pause' },
        mockContext
      );

      expect(mockSession.pause).toHaveBeenCalled();
      expect(result.isError).toBeFalsy();

      const data = JSON.parse(result.content[0].text!);
      expect(data.action).toBe('pause');
      expect(data.status).toBe('paused');
    });
  });

  describe('Response Format', () => {
    it('should include session state in response', async () => {
      const result = await tool.execute(
        { sessionId: 'debug_123_abc', action: 'over' },
        mockContext
      );

      const data = JSON.parse(result.content[0].text!);
      expect(data.sessionId).toBe('debug_123_abc');
      expect(data.state).toEqual({
        isPaused: true,
        stepMode: null,
        currentNodeId: 'node-1',
        callStack: ['node-1'],
      });
    });

    it('should include timeline summary', async () => {
      mockSession.getTimeline.mockReturnValue([
        {
          timestamp: new Date('2024-01-01T10:00:00Z'),
          nodeId: 'node-1',
          nodeName: 'Start Node',
          nodeType: 'n8n-nodes-base.start',
          inputData: {},
          outputData: { data: 'test' },
        },
        {
          timestamp: new Date('2024-01-01T10:00:01Z'),
          nodeId: 'node-2',
          nodeName: 'HTTP Request',
          nodeType: 'n8n-nodes-base.httpRequest',
          inputData: { url: 'https://example.com' },
          outputData: { status: 200 },
          error: undefined,
        },
        {
          timestamp: new Date('2024-01-01T10:00:02Z'),
          nodeId: 'node-3',
          nodeName: 'Error Node',
          nodeType: 'n8n-nodes-base.function',
          inputData: {},
          error: 'Function failed',
        },
      ]);

      const result = await tool.execute(
        { sessionId: 'debug_123_abc', action: 'over' },
        mockContext
      );

      const data = JSON.parse(result.content[0].text!);
      expect(data.timeline).toEqual({
        totalEvents: 3,
        lastEvent: {
          nodeId: 'node-3',
          nodeName: 'Error Node',
          timestamp: '2024-01-01T10:00:02.000Z',
          hasError: true,
        },
      });
    });

    it('should include next step hint based on state', async () => {
      const result = await tool.execute(
        { sessionId: 'debug_123_abc', action: 'over' },
        mockContext
      );

      const data = JSON.parse(result.content[0].text!);
      expect(data.nextStepHint).toContain('over');
      expect(data.nextStepHint).toContain('into');
      expect(data.nextStepHint).toContain('out');
      expect(data.nextStepHint).toContain('resume');
    });

    it('should suggest resume when not paused', async () => {
      mockSession.getState.mockReturnValue({
        isPaused: false,
        stepMode: null,
        currentNodeId: 'node-2',
        callStack: ['node-1', 'node-2'],
        variables: new Map(),
      });

      const result = await tool.execute(
        { sessionId: 'debug_123_abc', action: 'resume' },
        mockContext
      );

      const data = JSON.parse(result.content[0].text!);
      expect(data.nextStepHint).toContain('pause');
    });
  });

  describe('Error Handling', () => {
    it('should handle missing debug session manager', async () => {
      global.debugSessionManager = undefined;

      await expect(
        tool.execute(
          { sessionId: 'debug_123_abc', action: 'over' },
          mockContext
        )
      ).rejects.toThrow('No debug session manager initialized');
    });

    it('should handle session not found', async () => {
      global.debugSessionManager!.getSession = vi.fn().mockReturnValue(undefined);

      await expect(
        tool.execute(
          { sessionId: 'non-existent', action: 'over' },
          mockContext
        )
      ).rejects.toThrow('Debug session non-existent not found');
    });

    it('should handle inactive session', async () => {
      mockSession.isActive.mockReturnValue(false);

      await expect(
        tool.execute(
          { sessionId: 'debug_123_abc', action: 'over' },
          mockContext
        )
      ).rejects.toThrow('Debug session debug_123_abc is not active');
    });

    it('should handle step action errors', async () => {
      mockSession.stepOver.mockRejectedValue(new Error('Step failed'));

      await expect(
        tool.execute(
          { sessionId: 'debug_123_abc', action: 'over' },
          mockContext
        )
      ).rejects.toThrow('Step failed');
    });

    it('should validate pause/resume state', async () => {
      // Try to pause when already paused
      const result = await tool.execute(
        { sessionId: 'debug_123_abc', action: 'pause' },
        mockContext
      );

      const data = JSON.parse(result.content[0].text!);
      expect(data.warning).toBe('Session is already paused');
      expect(mockSession.pause).not.toHaveBeenCalled();
    });

    it('should validate resume when not paused', async () => {
      mockSession.getState.mockReturnValue({
        isPaused: false,
        stepMode: null,
        currentNodeId: 'node-2',
        callStack: ['node-1', 'node-2'],
        variables: new Map(),
      });

      const result = await tool.execute(
        { sessionId: 'debug_123_abc', action: 'resume' },
        mockContext
      );

      const data = JSON.parse(result.content[0].text!);
      expect(data.warning).toBe('Session is not paused');
      expect(mockSession.resume).not.toHaveBeenCalled();
    });
  });

  describe('Complex Scenarios', () => {
    it('should handle empty timeline', async () => {
      mockSession.getTimeline.mockReturnValue([]);

      const result = await tool.execute(
        { sessionId: 'debug_123_abc', action: 'over' },
        mockContext
      );

      const data = JSON.parse(result.content[0].text!);
      expect(data.timeline).toEqual({
        totalEvents: 0,
        lastEvent: null,
      });
    });

    it('should handle deep call stack', async () => {
      mockSession.getState.mockReturnValue({
        isPaused: true,
        stepMode: 'into',
        currentNodeId: 'node-5',
        callStack: ['node-1', 'node-2', 'node-3', 'node-4', 'node-5'],
        variables: new Map(),
      });

      const result = await tool.execute(
        { sessionId: 'debug_123_abc', action: 'out' },
        mockContext
      );

      const data = JSON.parse(result.content[0].text!);
      expect(data.state.callStack).toHaveLength(5);
      expect(data.nextStepHint).toContain('step out');
    });

    it('should preserve step mode in state', async () => {
      mockSession.getState.mockReturnValue({
        isPaused: true,
        stepMode: 'over',
        currentNodeId: 'node-2',
        callStack: ['node-1', 'node-2'],
        variables: new Map(),
      });

      const result = await tool.execute(
        { sessionId: 'debug_123_abc', action: 'into' },
        mockContext
      );

      const data = JSON.parse(result.content[0].text!);
      expect(data.state.stepMode).toBe('over'); // Previous mode
      expect(data.action).toBe('into'); // Current action
    });

    it('should format timeline with errors properly', async () => {
      mockSession.getTimeline.mockReturnValue([
        {
          timestamp: new Date('2024-01-01T10:00:00Z'),
          nodeId: 'node-1',
          nodeName: 'Start',
          nodeType: 'start',
          inputData: {},
          outputData: {},
          duration: 10,
        },
        {
          timestamp: new Date('2024-01-01T10:00:01Z'),
          nodeId: 'node-2',
          nodeName: 'Process',
          nodeType: 'function',
          inputData: {},
          error: 'Invalid input data',
          duration: 50,
        },
      ]);

      const result = await tool.execute(
        { sessionId: 'debug_123_abc', action: 'over' },
        mockContext
      );

      const data = JSON.parse(result.content[0].text!);
      expect(data.timeline.lastEvent.hasError).toBe(true);
      expect(data.timeline.totalEvents).toBe(2);
    });
  });
});