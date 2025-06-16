import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { PauseDebugTool } from '../../../src/tools/debug/PauseDebugTool.js';

describe('PauseDebugTool', () => {
  let tool: PauseDebugTool;
  let mockSession: any;
  let mockContext: any;

  beforeEach(() => {
    tool = new PauseDebugTool();

    // Mock debug session
    mockSession = {
      getId: vi.fn().mockReturnValue('debug_123_abc'),
      pause: vi.fn().mockResolvedValue(undefined),
      getState: vi.fn().mockReturnValue({
        isPaused: true,
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
      expect(tool.name).toBe('debug_pause');
    });

    it('should have correct description', () => {
      expect(tool.description).toContain('Pause execution');
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

  describe('Pause Execution', () => {
    it('should pause active session', async () => {
      const result = await tool.execute(
        { sessionId: 'debug_123_abc' },
        mockContext
      );

      expect(mockSession.pause).toHaveBeenCalled();
      
      const data = JSON.parse(result.content[0].text!);
      expect(data.success).toBe(true);
      expect(data.sessionId).toBe('debug_123_abc');
      expect(data.message).toBe('Execution paused');
    });

    it('should return current state after pausing', async () => {
      const result = await tool.execute(
        { sessionId: 'debug_123_abc' },
        mockContext
      );

      const data = JSON.parse(result.content[0].text!);
      expect(data.currentState).toEqual({
        isPaused: true,
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
      expect(data.nextActions.resume).toContain('debug_resume');
      expect(data.nextActions.step).toContain('debug_step');
      expect(data.nextActions.inspect).toContain('debug_inspect');
      expect(data.nextActions.breakpoint).toContain('debug_breakpoint');
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

    it('should handle pause errors', async () => {
      mockSession.pause.mockRejectedValue(new Error('Cannot pause'));

      await expect(
        tool.execute({ sessionId: 'debug_123_abc' }, mockContext)
      ).rejects.toThrow('Cannot pause');
    });
  });

  describe('State Handling', () => {
    it('should handle already paused state', async () => {
      // Session already paused
      mockSession.getState.mockReturnValue({
        isPaused: true,
        currentNodeId: 'node-1',
        callStack: ['node-1'],
        variables: new Map(),
      });

      const result = await tool.execute(
        { sessionId: 'debug_123_abc' },
        mockContext
      );

      const data = JSON.parse(result.content[0].text!);
      expect(data.success).toBe(true);
      expect(data.currentState.isPaused).toBe(true);
    });

    it('should handle running state', async () => {
      // Session currently running
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

      expect(mockSession.pause).toHaveBeenCalled();
      
      const data = JSON.parse(result.content[0].text!);
      expect(data.currentState.currentNodeId).toBe('node-3');
    });
  });
});