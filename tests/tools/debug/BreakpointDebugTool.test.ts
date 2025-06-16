import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { BreakpointDebugTool } from '../../../src/tools/debug/BreakpointDebugTool.js';
import { IBreakpoint } from '../../../src/services/DebugSession.js';

describe('BreakpointDebugTool', () => {
  let tool: BreakpointDebugTool;
  let mockSession: any;
  let mockContext: any;

  beforeEach(() => {
    tool = new BreakpointDebugTool();

    // Mock debug session
    mockSession = {
      getId: vi.fn().mockReturnValue('debug_123_abc'),
      getWorkflowId: vi.fn().mockReturnValue('workflow-123'),
      isActive: vi.fn().mockReturnValue(true),
      getBreakpoints: vi.fn().mockReturnValue([
        {
          id: 'bp-1',
          workflowId: 'workflow-123',
          nodeId: 'node-1',
          enabled: true,
          hitCount: 0,
        },
        {
          id: 'bp-2',
          workflowId: 'workflow-123',
          nodeId: 'node-2',
          condition: 'x > 10',
          enabled: false,
          hitCount: 3,
        },
      ]),
      addBreakpoint: vi.fn().mockImplementation((bp) => ({
        ...bp,
        hitCount: 0,
      })),
      removeBreakpoint: vi.fn().mockReturnValue(true),
      enableBreakpoint: vi.fn().mockReturnValue(true),
      disableBreakpoint: vi.fn().mockReturnValue(true),
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
      expect(tool.name).toBe('debug_breakpoint');
    });

    it('should have correct description', () => {
      expect(tool.description).toContain('Manage breakpoints');
    });

    it('should have correct metadata', () => {
      const metadata = tool.getMetadata();
      expect(metadata.category).toBe('debug');
      expect(metadata.isMutating).toBe(true);
      expect(metadata.tags).toContain('debug');
      expect(metadata.tags).toContain('breakpoint');
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

    it('should validate required nodeId for add action', async () => {
      await expect(
        tool.execute(
          { sessionId: 'debug_123_abc', action: 'add' },
          mockContext
        )
      ).rejects.toThrow();
    });

    it('should validate required breakpointId for remove/enable/disable', async () => {
      const actions = ['remove', 'enable', 'disable'];
      
      for (const action of actions) {
        await expect(
          tool.execute(
            { sessionId: 'debug_123_abc', action },
            mockContext
          )
        ).rejects.toThrow();
      }
    });

    it('should accept valid input for all actions', async () => {
      const testCases = [
        { action: 'list' },
        { action: 'add', nodeId: 'node-3' },
        { action: 'remove', breakpointId: 'bp-1' },
        { action: 'enable', breakpointId: 'bp-2' },
        { action: 'disable', breakpointId: 'bp-1' },
      ];

      for (const testCase of testCases) {
        const result = await tool.execute(
          { sessionId: 'debug_123_abc', ...testCase },
          mockContext
        );
        expect(result.isError).toBeFalsy();
      }
    });
  });

  describe('Breakpoint Listing', () => {
    it('should list all breakpoints', async () => {
      const result = await tool.execute(
        { sessionId: 'debug_123_abc', action: 'list' },
        mockContext
      );

      expect(mockSession.getBreakpoints).toHaveBeenCalled();
      
      const data = JSON.parse(result.content[0].text!);
      expect(data.action).toBe('list');
      expect(data.breakpoints).toHaveLength(2);
      expect(data.breakpoints[0]).toEqual({
        id: 'bp-1',
        nodeId: 'node-1',
        enabled: true,
        condition: undefined,
        hitCount: 0,
      });
      expect(data.breakpoints[1]).toEqual({
        id: 'bp-2',
        nodeId: 'node-2',
        enabled: false,
        condition: 'x > 10',
        hitCount: 3,
      });
    });

    it('should include summary statistics', async () => {
      const result = await tool.execute(
        { sessionId: 'debug_123_abc', action: 'list' },
        mockContext
      );

      const data = JSON.parse(result.content[0].text!);
      expect(data.summary).toEqual({
        total: 2,
        enabled: 1,
        disabled: 1,
        conditional: 1,
        totalHits: 3,
      });
    });

    it('should handle empty breakpoint list', async () => {
      mockSession.getBreakpoints.mockReturnValue([]);

      const result = await tool.execute(
        { sessionId: 'debug_123_abc', action: 'list' },
        mockContext
      );

      const data = JSON.parse(result.content[0].text!);
      expect(data.breakpoints).toEqual([]);
      expect(data.summary.total).toBe(0);
    });
  });

  describe('Adding Breakpoints', () => {
    it('should add simple breakpoint', async () => {
      const result = await tool.execute(
        {
          sessionId: 'debug_123_abc',
          action: 'add',
          nodeId: 'node-3',
        },
        mockContext
      );

      expect(mockSession.addBreakpoint).toHaveBeenCalledWith({
        id: expect.stringMatching(/^bp_\d+_[a-z0-9]+$/),
        workflowId: 'workflow-123',
        nodeId: 'node-3',
        enabled: true,
      });

      const data = JSON.parse(result.content[0].text!);
      expect(data.action).toBe('add');
      expect(data.breakpoint).toMatchObject({
        nodeId: 'node-3',
        enabled: true,
        hitCount: 0,
      });
      expect(data.message).toContain('added successfully');
    });

    it('should add conditional breakpoint', async () => {
      const result = await tool.execute(
        {
          sessionId: 'debug_123_abc',
          action: 'add',
          nodeId: 'node-3',
          condition: 'error !== null',
        },
        mockContext
      );

      expect(mockSession.addBreakpoint).toHaveBeenCalledWith({
        id: expect.stringMatching(/^bp_\d+_[a-z0-9]+$/),
        workflowId: 'workflow-123',
        nodeId: 'node-3',
        condition: 'error !== null',
        enabled: true,
      });

      const data = JSON.parse(result.content[0].text!);
      expect(data.breakpoint.condition).toBe('error !== null');
    });

    it('should include current breakpoints in response', async () => {
      const result = await tool.execute(
        {
          sessionId: 'debug_123_abc',
          action: 'add',
          nodeId: 'node-3',
        },
        mockContext
      );

      const data = JSON.parse(result.content[0].text!);
      expect(data.currentBreakpoints).toHaveLength(2);
    });
  });

  describe('Removing Breakpoints', () => {
    it('should remove breakpoint successfully', async () => {
      const result = await tool.execute(
        {
          sessionId: 'debug_123_abc',
          action: 'remove',
          breakpointId: 'bp-1',
        },
        mockContext
      );

      expect(mockSession.removeBreakpoint).toHaveBeenCalledWith('bp-1');

      const data = JSON.parse(result.content[0].text!);
      expect(data.action).toBe('remove');
      expect(data.breakpointId).toBe('bp-1');
      expect(data.success).toBe(true);
      expect(data.message).toContain('removed successfully');
    });

    it('should handle non-existent breakpoint', async () => {
      mockSession.removeBreakpoint.mockReturnValue(false);

      const result = await tool.execute(
        {
          sessionId: 'debug_123_abc',
          action: 'remove',
          breakpointId: 'non-existent',
        },
        mockContext
      );

      const data = JSON.parse(result.content[0].text!);
      expect(data.success).toBe(false);
      expect(data.message).toContain('not found');
    });
  });

  describe('Enabling/Disabling Breakpoints', () => {
    it('should enable breakpoint', async () => {
      const result = await tool.execute(
        {
          sessionId: 'debug_123_abc',
          action: 'enable',
          breakpointId: 'bp-2',
        },
        mockContext
      );

      expect(mockSession.enableBreakpoint).toHaveBeenCalledWith('bp-2');

      const data = JSON.parse(result.content[0].text!);
      expect(data.action).toBe('enable');
      expect(data.breakpointId).toBe('bp-2');
      expect(data.success).toBe(true);
      expect(data.message).toContain('enabled successfully');
    });

    it('should disable breakpoint', async () => {
      const result = await tool.execute(
        {
          sessionId: 'debug_123_abc',
          action: 'disable',
          breakpointId: 'bp-1',
        },
        mockContext
      );

      expect(mockSession.disableBreakpoint).toHaveBeenCalledWith('bp-1');

      const data = JSON.parse(result.content[0].text!);
      expect(data.action).toBe('disable');
      expect(data.breakpointId).toBe('bp-1');
      expect(data.success).toBe(true);
      expect(data.message).toContain('disabled successfully');
    });

    it('should handle enable/disable failures', async () => {
      mockSession.enableBreakpoint.mockReturnValue(false);
      mockSession.disableBreakpoint.mockReturnValue(false);

      const enableResult = await tool.execute(
        {
          sessionId: 'debug_123_abc',
          action: 'enable',
          breakpointId: 'non-existent',
        },
        mockContext
      );

      const disableResult = await tool.execute(
        {
          sessionId: 'debug_123_abc',
          action: 'disable',
          breakpointId: 'non-existent',
        },
        mockContext
      );

      expect(JSON.parse(enableResult.content[0].text!).success).toBe(false);
      expect(JSON.parse(disableResult.content[0].text!).success).toBe(false);
    });
  });

  describe('Response Format', () => {
    it('should include session metadata', async () => {
      const result = await tool.execute(
        { sessionId: 'debug_123_abc', action: 'list' },
        mockContext
      );

      const data = JSON.parse(result.content[0].text!);
      expect(data.sessionId).toBe('debug_123_abc');
      expect(data.workflowId).toBe('workflow-123');
    });

    it('should include hints for next actions', async () => {
      const result = await tool.execute(
        { sessionId: 'debug_123_abc', action: 'list' },
        mockContext
      );

      const data = JSON.parse(result.content[0].text!);
      expect(data.hint).toBeDefined();
      expect(data.hint).toContain('add');
      expect(data.hint).toContain('remove');
      expect(data.hint).toContain('enable');
      expect(data.hint).toContain('disable');
    });
  });

  describe('Error Handling', () => {
    it('should handle missing debug session manager', async () => {
      global.debugSessionManager = undefined;

      await expect(
        tool.execute(
          { sessionId: 'debug_123_abc', action: 'list' },
          mockContext
        )
      ).rejects.toThrow('No debug session manager initialized');
    });

    it('should handle session not found', async () => {
      global.debugSessionManager!.getSession = vi.fn().mockReturnValue(undefined);

      await expect(
        tool.execute(
          { sessionId: 'non-existent', action: 'list' },
          mockContext
        )
      ).rejects.toThrow('Debug session non-existent not found');
    });

    it('should handle inactive session', async () => {
      mockSession.isActive.mockReturnValue(false);

      await expect(
        tool.execute(
          { sessionId: 'debug_123_abc', action: 'list' },
          mockContext
        )
      ).rejects.toThrow('Debug session debug_123_abc is not active');
    });

    it('should handle add breakpoint errors', async () => {
      mockSession.addBreakpoint.mockImplementation(() => {
        throw new Error('Failed to add breakpoint');
      });

      await expect(
        tool.execute(
          {
            sessionId: 'debug_123_abc',
            action: 'add',
            nodeId: 'node-3',
          },
          mockContext
        )
      ).rejects.toThrow('Failed to add breakpoint');
    });
  });

  describe('Complex Scenarios', () => {
    it('should handle complex breakpoint conditions', async () => {
      const complexCondition = '(x > 10 && y < 20) || error.code === "TIMEOUT"';
      
      const result = await tool.execute(
        {
          sessionId: 'debug_123_abc',
          action: 'add',
          nodeId: 'node-3',
          condition: complexCondition,
        },
        mockContext
      );

      expect(mockSession.addBreakpoint).toHaveBeenCalledWith({
        id: expect.any(String),
        workflowId: 'workflow-123',
        nodeId: 'node-3',
        condition: complexCondition,
        enabled: true,
      });

      const data = JSON.parse(result.content[0].text!);
      expect(data.breakpoint.condition).toBe(complexCondition);
    });

    it('should track hit counts in listing', async () => {
      mockSession.getBreakpoints.mockReturnValue([
        {
          id: 'bp-1',
          workflowId: 'workflow-123',
          nodeId: 'node-1',
          enabled: true,
          hitCount: 10,
        },
        {
          id: 'bp-2',
          workflowId: 'workflow-123',
          nodeId: 'node-2',
          enabled: true,
          hitCount: 5,
        },
        {
          id: 'bp-3',
          workflowId: 'workflow-123',
          nodeId: 'node-3',
          enabled: false,
          hitCount: 0,
        },
      ]);

      const result = await tool.execute(
        { sessionId: 'debug_123_abc', action: 'list' },
        mockContext
      );

      const data = JSON.parse(result.content[0].text!);
      expect(data.summary.totalHits).toBe(15);
      expect(data.breakpoints[0].hitCount).toBe(10);
      expect(data.breakpoints[1].hitCount).toBe(5);
    });

    it('should generate unique breakpoint IDs', async () => {
      const results = [];
      
      for (let i = 0; i < 5; i++) {
        const result = await tool.execute(
          {
            sessionId: 'debug_123_abc',
            action: 'add',
            nodeId: `node-${i}`,
          },
          mockContext
        );
        results.push(JSON.parse(result.content[0].text!).breakpoint.id);
      }

      const uniqueIds = new Set(results);
      expect(uniqueIds.size).toBe(5);
    });

    it('should provide contextual hints based on current state', async () => {
      // No breakpoints
      mockSession.getBreakpoints.mockReturnValue([]);
      let result = await tool.execute(
        { sessionId: 'debug_123_abc', action: 'list' },
        mockContext
      );
      let data = JSON.parse(result.content[0].text!);
      expect(data.hint).toContain('No breakpoints set');

      // All disabled
      mockSession.getBreakpoints.mockReturnValue([
        {
          id: 'bp-1',
          workflowId: 'workflow-123',
          nodeId: 'node-1',
          enabled: false,
          hitCount: 0,
        },
      ]);
      result = await tool.execute(
        { sessionId: 'debug_123_abc', action: 'list' },
        mockContext
      );
      data = JSON.parse(result.content[0].text!);
      expect(data.hint).toContain('enable');
    });
  });
});