import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { WatchDebugTool } from '../../../src/tools/debug/WatchDebugTool.js';
import { IWatchExpression } from '../../../src/services/DebugSession.js';

describe('WatchDebugTool', () => {
  let tool: WatchDebugTool;
  let mockSession: any;
  let mockContext: any;

  beforeEach(() => {
    tool = new WatchDebugTool();

    // Mock debug session
    mockSession = {
      getId: vi.fn().mockReturnValue('debug_123_abc'),
      getWorkflowId: vi.fn().mockReturnValue('workflow-123'),
      isActive: vi.fn().mockReturnValue(true),
      getWatchExpressions: vi.fn().mockReturnValue([
        {
          id: 'watch-1',
          expression: 'counter',
          value: 42,
        },
        {
          id: 'watch-2',
          expression: 'node.output.data',
          nodeId: 'node-1',
          value: { items: [1, 2, 3] },
        },
        {
          id: 'watch-3',
          expression: 'error.message',
          error: 'Cannot evaluate: variable not found',
        },
      ]),
      addWatchExpression: vi.fn().mockImplementation((expr, nodeId) => ({
        id: `watch_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        expression: expr,
        nodeId,
      })),
      removeWatchExpression: vi.fn().mockReturnValue(true),
      evaluateWatchExpression: vi.fn().mockImplementation((watchId) => {
        if (watchId === 'watch-1') return 42;
        if (watchId === 'watch-2') return { items: [1, 2, 3] };
        if (watchId === 'watch-error') throw new Error('Evaluation failed');
        return null;
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
      expect(tool.name).toBe('debug_watch');
    });

    it('should have correct description', () => {
      expect(tool.description).toContain('Manage watch expressions');
    });

    it('should have correct metadata', () => {
      const metadata = tool.getMetadata();
      expect(metadata.category).toBe('debug');
      expect(metadata.isMutating).toBe(true);
      expect(metadata.tags).toContain('debug');
      expect(metadata.tags).toContain('watch');
      expect(metadata.tags).toContain('variables');
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

    it('should validate required expression for add action', async () => {
      await expect(
        tool.execute(
          { sessionId: 'debug_123_abc', action: 'add' },
          mockContext
        )
      ).rejects.toThrow();
    });

    it('should validate required watchId for remove/evaluate', async () => {
      const actions = ['remove', 'evaluate'];
      
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
        { action: 'add', expression: 'variable.value' },
        { action: 'remove', watchId: 'watch-1' },
        { action: 'evaluate', watchId: 'watch-1' },
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

  describe('Watch Expression Listing', () => {
    it('should list all watch expressions', async () => {
      const result = await tool.execute(
        { sessionId: 'debug_123_abc', action: 'list' },
        mockContext
      );

      expect(mockSession.getWatchExpressions).toHaveBeenCalled();
      
      const data = JSON.parse(result.content[0].text!);
      expect(data.action).toBe('list');
      expect(data.watchExpressions).toHaveLength(3);
      expect(data.watchExpressions[0]).toEqual({
        id: 'watch-1',
        expression: 'counter',
        nodeContext: null,
        hasValue: true,
        hasError: false,
        value: 42,
      });
      expect(data.watchExpressions[1]).toEqual({
        id: 'watch-2',
        expression: 'node.output.data',
        nodeContext: 'node-1',
        hasValue: true,
        hasError: false,
        value: { items: [1, 2, 3] },
      });
      expect(data.watchExpressions[2]).toEqual({
        id: 'watch-3',
        expression: 'error.message',
        nodeContext: null,
        hasValue: false,
        hasError: true,
        error: 'Cannot evaluate: variable not found',
      });
    });

    it('should include summary statistics', async () => {
      const result = await tool.execute(
        { sessionId: 'debug_123_abc', action: 'list' },
        mockContext
      );

      const data = JSON.parse(result.content[0].text!);
      expect(data.summary).toEqual({
        total: 3,
        evaluated: 2,
        errors: 1,
        nodeScoped: 1,
      });
    });

    it('should handle empty watch list', async () => {
      mockSession.getWatchExpressions.mockReturnValue([]);

      const result = await tool.execute(
        { sessionId: 'debug_123_abc', action: 'list' },
        mockContext
      );

      const data = JSON.parse(result.content[0].text!);
      expect(data.watchExpressions).toEqual([]);
      expect(data.summary.total).toBe(0);
    });
  });

  describe('Adding Watch Expressions', () => {
    it('should add simple watch expression', async () => {
      const result = await tool.execute(
        {
          sessionId: 'debug_123_abc',
          action: 'add',
          expression: 'myVariable',
        },
        mockContext
      );

      expect(mockSession.addWatchExpression).toHaveBeenCalledWith(
        'myVariable',
        undefined
      );

      const data = JSON.parse(result.content[0].text!);
      expect(data.action).toBe('add');
      expect(data.watchExpression).toMatchObject({
        expression: 'myVariable',
        nodeId: undefined,
      });
      expect(data.message).toContain('added successfully');
    });

    it('should add node-scoped watch expression', async () => {
      const result = await tool.execute(
        {
          sessionId: 'debug_123_abc',
          action: 'add',
          expression: 'input.data',
          nodeId: 'node-2',
        },
        mockContext
      );

      expect(mockSession.addWatchExpression).toHaveBeenCalledWith(
        'input.data',
        'node-2'
      );

      const data = JSON.parse(result.content[0].text!);
      expect(data.watchExpression.nodeId).toBe('node-2');
    });

    it('should handle complex expressions', async () => {
      const complexExpr = 'data.items.filter(x => x.active).length';
      
      const result = await tool.execute(
        {
          sessionId: 'debug_123_abc',
          action: 'add',
          expression: complexExpr,
        },
        mockContext
      );

      expect(mockSession.addWatchExpression).toHaveBeenCalledWith(
        complexExpr,
        undefined
      );

      const data = JSON.parse(result.content[0].text!);
      expect(data.watchExpression.expression).toBe(complexExpr);
    });

    it('should include current watches in response', async () => {
      const result = await tool.execute(
        {
          sessionId: 'debug_123_abc',
          action: 'add',
          expression: 'newWatch',
        },
        mockContext
      );

      const data = JSON.parse(result.content[0].text!);
      expect(data.currentWatches).toHaveLength(3);
    });
  });

  describe('Removing Watch Expressions', () => {
    it('should remove watch expression successfully', async () => {
      const result = await tool.execute(
        {
          sessionId: 'debug_123_abc',
          action: 'remove',
          watchId: 'watch-1',
        },
        mockContext
      );

      expect(mockSession.removeWatchExpression).toHaveBeenCalledWith('watch-1');

      const data = JSON.parse(result.content[0].text!);
      expect(data.action).toBe('remove');
      expect(data.watchId).toBe('watch-1');
      expect(data.success).toBe(true);
      expect(data.message).toContain('removed successfully');
    });

    it('should handle non-existent watch', async () => {
      mockSession.removeWatchExpression.mockReturnValue(false);

      const result = await tool.execute(
        {
          sessionId: 'debug_123_abc',
          action: 'remove',
          watchId: 'non-existent',
        },
        mockContext
      );

      const data = JSON.parse(result.content[0].text!);
      expect(data.success).toBe(false);
      expect(data.message).toContain('not found');
    });
  });

  describe('Evaluating Watch Expressions', () => {
    it('should evaluate watch expression', async () => {
      const result = await tool.execute(
        {
          sessionId: 'debug_123_abc',
          action: 'evaluate',
          watchId: 'watch-1',
        },
        mockContext
      );

      expect(mockSession.evaluateWatchExpression).toHaveBeenCalledWith('watch-1');

      const data = JSON.parse(result.content[0].text!);
      expect(data.action).toBe('evaluate');
      expect(data.watchId).toBe('watch-1');
      expect(data.result).toEqual({
        success: true,
        value: 42,
      });
    });

    it('should handle evaluation errors', async () => {
      const result = await tool.execute(
        {
          sessionId: 'debug_123_abc',
          action: 'evaluate',
          watchId: 'watch-error',
        },
        mockContext
      );

      const data = JSON.parse(result.content[0].text!);
      expect(data.result).toEqual({
        success: false,
        error: 'Evaluation failed',
      });
    });

    it('should include watch details in evaluation response', async () => {
      const watch = {
        id: 'watch-1',
        expression: 'counter',
        value: 42,
      };

      mockSession.getWatchExpressions.mockReturnValue([watch]);

      const result = await tool.execute(
        {
          sessionId: 'debug_123_abc',
          action: 'evaluate',
          watchId: 'watch-1',
        },
        mockContext
      );

      const data = JSON.parse(result.content[0].text!);
      expect(data.watchExpression).toEqual({
        id: 'watch-1',
        expression: 'counter',
        nodeContext: null,
      });
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

    it('should format values correctly', async () => {
      mockSession.getWatchExpressions.mockReturnValue([
        {
          id: 'watch-1',
          expression: 'string',
          value: 'test string',
        },
        {
          id: 'watch-2',
          expression: 'number',
          value: 123.45,
        },
        {
          id: 'watch-3',
          expression: 'boolean',
          value: true,
        },
        {
          id: 'watch-4',
          expression: 'null',
          value: null,
        },
        {
          id: 'watch-5',
          expression: 'undefined',
          value: undefined,
        },
        {
          id: 'watch-6',
          expression: 'date',
          value: new Date('2024-01-01'),
        },
      ]);

      const result = await tool.execute(
        { sessionId: 'debug_123_abc', action: 'list' },
        mockContext
      );

      const data = JSON.parse(result.content[0].text!);
      expect(data.watchExpressions[0].value).toBe('test string');
      expect(data.watchExpressions[1].value).toBe(123.45);
      expect(data.watchExpressions[2].value).toBe(true);
      expect(data.watchExpressions[3].value).toBeNull();
      expect(data.watchExpressions[4].value).toBeUndefined();
      expect(data.watchExpressions[5].value).toMatch(/2024-01-01/);
    });

    it('should include helpful hints', async () => {
      const result = await tool.execute(
        { sessionId: 'debug_123_abc', action: 'list' },
        mockContext
      );

      const data = JSON.parse(result.content[0].text!);
      expect(data.hint).toBeDefined();
      expect(data.hint).toContain('add');
      expect(data.hint).toContain('remove');
      expect(data.hint).toContain('evaluate');
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

    it('should handle add watch errors', async () => {
      mockSession.addWatchExpression.mockImplementation(() => {
        throw new Error('Failed to add watch');
      });

      await expect(
        tool.execute(
          {
            sessionId: 'debug_123_abc',
            action: 'add',
            expression: 'test',
          },
          mockContext
        )
      ).rejects.toThrow('Failed to add watch');
    });
  });

  describe('Complex Scenarios', () => {
    it('should handle watches with circular references', async () => {
      const circular: any = { name: 'circular' };
      circular.self = circular;

      mockSession.getWatchExpressions.mockReturnValue([
        {
          id: 'watch-circular',
          expression: 'circularRef',
          value: circular,
        },
      ]);

      // Should not throw due to JSON.stringify circular reference
      const result = await tool.execute(
        { sessionId: 'debug_123_abc', action: 'list' },
        mockContext
      );

      expect(result.isError).toBeFalsy();
    });

    it('should track evaluation statistics', async () => {
      mockSession.getWatchExpressions.mockReturnValue([
        {
          id: 'watch-1',
          expression: 'var1',
          value: 1,
        },
        {
          id: 'watch-2',
          expression: 'var2',
          value: 2,
        },
        {
          id: 'watch-3',
          expression: 'var3',
          error: 'Not found',
        },
        {
          id: 'watch-4',
          expression: 'var4',
          error: 'Type error',
        },
        {
          id: 'watch-5',
          expression: 'var5',
          nodeId: 'node-1',
          value: 5,
        },
      ]);

      const result = await tool.execute(
        { sessionId: 'debug_123_abc', action: 'list' },
        mockContext
      );

      const data = JSON.parse(result.content[0].text!);
      expect(data.summary).toEqual({
        total: 5,
        evaluated: 3,
        errors: 2,
        nodeScoped: 1,
      });
    });

    it('should provide contextual hints based on state', async () => {
      // No watches
      mockSession.getWatchExpressions.mockReturnValue([]);
      let result = await tool.execute(
        { sessionId: 'debug_123_abc', action: 'list' },
        mockContext
      );
      let data = JSON.parse(result.content[0].text!);
      expect(data.hint).toContain('No watch expressions');

      // All with errors
      mockSession.getWatchExpressions.mockReturnValue([
        {
          id: 'watch-1',
          expression: 'var1',
          error: 'Error 1',
        },
        {
          id: 'watch-2',
          expression: 'var2',
          error: 'Error 2',
        },
      ]);
      result = await tool.execute(
        { sessionId: 'debug_123_abc', action: 'list' },
        mockContext
      );
      data = JSON.parse(result.content[0].text!);
      expect(data.hint).toContain('errors');
    });

    it('should handle special expression patterns', async () => {
      const specialExpressions = [
        'this',
        'arguments',
        'window.location',
        'process.env.NODE_ENV',
        'Math.PI',
        'JSON.stringify(data)',
      ];

      for (const expr of specialExpressions) {
        const result = await tool.execute(
          {
            sessionId: 'debug_123_abc',
            action: 'add',
            expression: expr,
          },
          mockContext
        );

        expect(result.isError).toBeFalsy();
        const data = JSON.parse(result.content[0].text!);
        expect(data.watchExpression.expression).toBe(expr);
      }
    });
  });
});