import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { ResumeDebugTool } from '../../../src/tools/debug/ResumeDebugTool.js';

describe('ResumeDebugTool', () => {
  let tool: ResumeDebugTool;
  let mockSession: any;
  let mockContext: any;

  beforeEach(() => {
    tool = new ResumeDebugTool();

    // Mock debug session
    mockSession = {
      getId: vi.fn().mockReturnValue('debug_123_abc'),
      resume: vi.fn().mockResolvedValue(undefined),
      getState: vi.fn().mockReturnValue({
        isPaused: false,
        currentNodeId: 'node-2',
        callStack: ['node-1', 'node-2'],
        variables: new Map(),
      }),
      exportSession: vi.fn().mockReturnValue({
        id: 'debug_123_abc',
        workflowId: 'workflow-123',
        executionId: 'exec-123',
        isActive: true,
      }),
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
      expect(tool.name).toBe('debug_resume');
    });

    it('should have correct description', () => {
      expect(tool.description).toContain('Resume execution');
    });

    it('should have correct metadata', () => {
      const metadata = tool.getMetadata();
      expect(metadata.category).toBe('debug');
      expect(metadata.isMutating).toBe(false);
      expect(metadata.tags).toContain('debug');
      expect(metadata.tags).toContain('control');
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
  });

  describe('Resume Execution', () => {
    it('should resume paused session', async () => {
      // Set initial state to paused
      mockSession.getState.mockReturnValueOnce({
        isPaused: true,
        currentNodeId: 'node-2',
        callStack: ['node-1', 'node-2'],
        variables: new Map(),
      });

      const result = await tool.execute(
        { sessionId: 'debug_123_abc' },
        mockContext
      );

      expect(mockSession.resume).toHaveBeenCalled();
      
      const data = JSON.parse(result.content[0].text!);
      expect(data.success).toBe(true);
      expect(data.sessionId).toBe('debug_123_abc');
      expect(data.message).toBe('Execution resumed');
    });

    it('should return updated state after resuming', async () => {
      const result = await tool.execute(
        { sessionId: 'debug_123_abc' },
        mockContext
      );

      const data = JSON.parse(result.content[0].text!);
      expect(data.currentState).toEqual({
        isPaused: false,
        currentNodeId: 'node-2',
        executionId: 'exec-123',
      });
    });

    it('should provide next action hints', async () => {
      const result = await tool.execute(
        { sessionId: 'debug_123_abc' },
        mockContext
      );

      const data = JSON.parse(result.content[0].text!);
      expect(data.nextActions).toBeDefined();
      expect(data.nextActions.pause).toContain('debug_pause');
      expect(data.nextActions.monitor).toContain('debug_timeline');
      expect(data.nextActions.stop).toContain('debug_stop');
    });

    it('should note execution will continue', async () => {
      const result = await tool.execute(
        { sessionId: 'debug_123_abc' },
        mockContext
      );

      const data = JSON.parse(result.content[0].text!);
      expect(data.note).toContain('continue until');
      expect(data.note).toContain('breakpoint');
      expect(data.note).toContain('completion');
    });
  });

  describe('Error Handling', () => {
    it('should handle missing debug session manager', async () => {
      global.debugSessionManager = undefined;

      await expect(
        tool.execute({ sessionId: 'debug_123_abc' }, mockContext)
      ).rejects.toThrow('No debug sessions active');
    });

    it('should handle session not found', async () => {
      global.debugSessionManager!.getSession = vi.fn().mockReturnValue(undefined);

      await expect(
        tool.execute({ sessionId: 'non-existent' }, mockContext)
      ).rejects.toThrow('Debug session non-existent not found');
    });

    it('should handle resume errors', async () => {
      mockSession.resume.mockRejectedValue(new Error('Cannot resume'));

      await expect(
        tool.execute({ sessionId: 'debug_123_abc' }, mockContext)
      ).rejects.toThrow('Cannot resume');
    });
  });

  describe('State Handling', () => {
    it('should handle already running state', async () => {
      // Session already running
      mockSession.getState.mockReturnValue({
        isPaused: false,
        currentNodeId: 'node-3',
        callStack: ['node-1', 'node-2', 'node-3'],
        variables: new Map(),
      });

      const result = await tool.execute(
        { sessionId: 'debug_123_abc' },
        mockContext
      );

      const data = JSON.parse(result.content[0].text!);
      expect(data.success).toBe(true);
      expect(data.currentState.isPaused).toBe(false);
      expect(data.message).toBe('Execution resumed');
    });

    it('should clear step mode on resume', async () => {
      mockSession.getState.mockReturnValue({
        isPaused: false,
        stepMode: null, // Should be cleared
        currentNodeId: 'node-2',
        callStack: ['node-1', 'node-2'],
        variables: new Map(),
      });

      const result = await tool.execute(
        { sessionId: 'debug_123_abc' },
        mockContext
      );

      const data = JSON.parse(result.content[0].text!);
      expect(data.currentState.isPaused).toBe(false);
    });
  });
});