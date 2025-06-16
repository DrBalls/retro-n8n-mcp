import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { InspectDebugTool } from '../../../src/tools/debug/InspectDebugTool.js';
import { DebugSession } from '../../../src/services/DebugSession.js';

describe('InspectDebugTool', () => {
  let tool: InspectDebugTool;
  let mockSession: any;
  let mockContext: any;

  beforeEach(() => {
    tool = new InspectDebugTool();

    // Mock debug session
    mockSession = {
      getId: vi.fn().mockReturnValue('debug_123_abc'),
      getWorkflowId: vi.fn().mockReturnValue('workflow-123'),
      getExecutionId: vi.fn().mockReturnValue('exec-123'),
      isActive: vi.fn().mockReturnValue(true),
      getState: vi.fn().mockReturnValue({
        isPaused: true,
        currentNodeId: 'node-2',
        callStack: ['node-1', 'node-2'],
        variables: new Map([
          ['global.counter', 42],
          ['node-1.output', { data: 'test' }],
          ['node-2.input', { items: [1, 2, 3] }],
        ]),
      }),
      inspectVariable: vi.fn().mockImplementation((name, nodeId) => {
        if (name === 'notFound') {
          return undefined;
        }
        if (nodeId === 'node-1' && name === 'output') {
          return { data: 'test' };
        }
        if (nodeId === 'node-2' && name === 'input') {
          return { items: [1, 2, 3] };
        }
        if (name === 'counter') {
          return 42;
        }
        return null;
      }),
      getVariables: vi.fn().mockImplementation((nodeId) => {
        if (nodeId === 'node-1') {
          return { 'node-1.output': { data: 'test' } };
        }
        if (nodeId === 'node-2') {
          return { 'node-2.input': { items: [1, 2, 3] } };
        }
        return {
          'global.counter': 42,
          'node-1.output': { data: 'test' },
          'node-2.input': { items: [1, 2, 3] },
        };
      }),
      getTimeline: vi.fn().mockReturnValue([
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
          nodeName: 'Process Node',
          nodeType: 'n8n-nodes-base.function',
          inputData: { items: [1, 2, 3] },
          outputData: { result: 'processed' },
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
      expect(tool.name).toBe('debug_inspect');
    });

    it('should have correct description', () => {
      expect(tool.description).toContain('Inspect variables');
    });

    it('should have correct metadata', () => {
      const metadata = tool.getMetadata();
      expect(metadata.category).toBe('debug');
      expect(metadata.isMutating).toBe(false);
      expect(metadata.tags).toContain('debug');
      expect(metadata.tags).toContain('inspection');
      expect(metadata.tags).toContain('variables');
    });
  });

  describe('Input Validation', () => {
    it('should validate required session ID', async () => {
      await expect(tool.execute({}, mockContext)).rejects.toThrow();
    });

    it('should validate required target', async () => {
      await expect(
        tool.execute({ sessionId: 'debug_123' }, mockContext)
      ).rejects.toThrow();
    });

    it('should accept valid input with variable name', async () => {
      const result = await tool.execute(
        {
          sessionId: 'debug_123_abc',
          target: 'counter',
        },
        mockContext
      );
      expect(result.isError).toBeFalsy();
    });

    it('should accept node ID with variable name', async () => {
      const result = await tool.execute(
        {
          sessionId: 'debug_123_abc',
          target: 'output',
          nodeId: 'node-1',
        },
        mockContext
      );
      expect(result.isError).toBeFalsy();
    });

    it('should accept wildcard targets', async () => {
      const targets = ['*', 'all', 'state'];
      
      for (const target of targets) {
        const result = await tool.execute(
          { sessionId: 'debug_123_abc', target },
          mockContext
        );
        expect(result.isError).toBeFalsy();
      }
    });
  });

  describe('Variable Inspection', () => {
    it('should inspect specific variable', async () => {
      const result = await tool.execute(
        {
          sessionId: 'debug_123_abc',
          target: 'counter',
        },
        mockContext
      );

      expect(mockSession.inspectVariable).toHaveBeenCalledWith('counter', undefined);
      
      const data = JSON.parse(result.content[0].text!);
      expect(data.sessionId).toBe('debug_123_abc');
      expect(data.target).toBe('counter');
      expect(data.result).toEqual({
        type: 'variable',
        name: 'counter',
        value: 42,
        nodeContext: null,
      });
    });

    it('should inspect node-specific variable', async () => {
      const result = await tool.execute(
        {
          sessionId: 'debug_123_abc',
          target: 'output',
          nodeId: 'node-1',
        },
        mockContext
      );

      expect(mockSession.inspectVariable).toHaveBeenCalledWith('output', 'node-1');
      
      const data = JSON.parse(result.content[0].text!);
      expect(data.result).toEqual({
        type: 'variable',
        name: 'output',
        value: { data: 'test' },
        nodeContext: 'node-1',
      });
    });

    it('should handle undefined variables', async () => {
      const result = await tool.execute(
        {
          sessionId: 'debug_123_abc',
          target: 'notFound',
        },
        mockContext
      );

      const data = JSON.parse(result.content[0].text!);
      expect(data.result).toEqual({
        type: 'variable',
        name: 'notFound',
        value: undefined,
        nodeContext: null,
      });
    });

    it('should inspect all variables with wildcard', async () => {
      const result = await tool.execute(
        {
          sessionId: 'debug_123_abc',
          target: '*',
        },
        mockContext
      );

      expect(mockSession.getVariables).toHaveBeenCalledWith(undefined);
      
      const data = JSON.parse(result.content[0].text!);
      expect(data.result.type).toBe('all');
      expect(data.result.variables).toEqual({
        'global.counter': 42,
        'node-1.output': { data: 'test' },
        'node-2.input': { items: [1, 2, 3] },
      });
      expect(data.result.count).toBe(3);
    });

    it('should inspect node-specific variables with wildcard', async () => {
      const result = await tool.execute(
        {
          sessionId: 'debug_123_abc',
          target: 'all',
          nodeId: 'node-2',
        },
        mockContext
      );

      expect(mockSession.getVariables).toHaveBeenCalledWith('node-2');
      
      const data = JSON.parse(result.content[0].text!);
      expect(data.result.variables).toEqual({
        'node-2.input': { items: [1, 2, 3] },
      });
      expect(data.result.nodeContext).toBe('node-2');
    });

    it('should inspect session state', async () => {
      const result = await tool.execute(
        {
          sessionId: 'debug_123_abc',
          target: 'state',
        },
        mockContext
      );

      const data = JSON.parse(result.content[0].text!);
      expect(data.result.type).toBe('state');
      expect(data.result.state).toEqual({
        isPaused: true,
        currentNodeId: 'node-2',
        callStack: ['node-1', 'node-2'],
        variableCount: 3,
      });
    });
  });

  describe('Timeline Context', () => {
    it('should include timeline context when inspecting current node', async () => {
      const result = await tool.execute(
        {
          sessionId: 'debug_123_abc',
          target: 'input',
          nodeId: 'node-2',
        },
        mockContext
      );

      const data = JSON.parse(result.content[0].text!);
      expect(data.context).toBeDefined();
      expect(data.context.currentNode).toEqual({
        nodeId: 'node-2',
        nodeName: 'Process Node',
        nodeType: 'n8n-nodes-base.function',
        executedAt: '2024-01-01T10:00:01.000Z',
      });
    });

    it('should include previous node in context', async () => {
      const result = await tool.execute(
        {
          sessionId: 'debug_123_abc',
          target: 'all',
          nodeId: 'node-2',
        },
        mockContext
      );

      const data = JSON.parse(result.content[0].text!);
      expect(data.context.previousNode).toEqual({
        nodeId: 'node-1',
        nodeName: 'Start Node',
        outputData: { data: 'test' },
      });
    });

    it('should handle missing timeline context', async () => {
      mockSession.getTimeline.mockReturnValue([]);

      const result = await tool.execute(
        {
          sessionId: 'debug_123_abc',
          target: 'counter',
        },
        mockContext
      );

      const data = JSON.parse(result.content[0].text!);
      expect(data.context).toBeUndefined();
    });
  });

  describe('Response Format', () => {
    it('should format primitive values correctly', async () => {
      mockSession.inspectVariable.mockResolvedValue('test string');

      const result = await tool.execute(
        {
          sessionId: 'debug_123_abc',
          target: 'stringVar',
        },
        mockContext
      );

      const data = JSON.parse(result.content[0].text!);
      expect(data.result.value).toBe('test string');
    });

    it('should format complex objects', async () => {
      const complexObject = {
        nested: {
          array: [1, 2, 3],
          object: { key: 'value' },
        },
        date: new Date('2024-01-01'),
      };
      mockSession.inspectVariable.mockResolvedValue(complexObject);

      const result = await tool.execute(
        {
          sessionId: 'debug_123_abc',
          target: 'complexVar',
        },
        mockContext
      );

      const data = JSON.parse(result.content[0].text!);
      expect(data.result.value).toEqual(complexObject);
    });

    it('should include metadata in response', async () => {
      const result = await tool.execute(
        {
          sessionId: 'debug_123_abc',
          target: '*',
        },
        mockContext
      );

      const data = JSON.parse(result.content[0].text!);
      expect(data.timestamp).toBeDefined();
      expect(data.workflowId).toBe('workflow-123');
      expect(data.executionId).toBe('exec-123');
    });
  });

  describe('Error Handling', () => {
    it('should handle missing debug session manager', async () => {
      global.debugSessionManager = undefined;

      await expect(
        tool.execute(
          { sessionId: 'debug_123_abc', target: 'counter' },
          mockContext
        )
      ).rejects.toThrow('No debug session manager initialized');
    });

    it('should handle session not found', async () => {
      global.debugSessionManager!.getSession = vi.fn().mockReturnValue(undefined);

      await expect(
        tool.execute(
          { sessionId: 'non-existent', target: 'counter' },
          mockContext
        )
      ).rejects.toThrow('Debug session non-existent not found');
    });

    it('should handle inactive session', async () => {
      mockSession.isActive.mockReturnValue(false);

      await expect(
        tool.execute(
          { sessionId: 'debug_123_abc', target: 'counter' },
          mockContext
        )
      ).rejects.toThrow('Debug session debug_123_abc is not active');
    });

    it('should handle inspection errors gracefully', async () => {
      mockSession.inspectVariable.mockRejectedValue(new Error('Inspection failed'));

      await expect(
        tool.execute(
          { sessionId: 'debug_123_abc', target: 'errorVar' },
          mockContext
        )
      ).rejects.toThrow('Inspection failed');
    });
  });

  describe('Complex Scenarios', () => {
    it('should handle empty variable state', async () => {
      mockSession.getState.mockReturnValue({
        isPaused: true,
        currentNodeId: null,
        callStack: [],
        variables: new Map(),
      });

      mockSession.getVariables.mockReturnValue({});

      const result = await tool.execute(
        {
          sessionId: 'debug_123_abc',
          target: '*',
        },
        mockContext
      );

      const data = JSON.parse(result.content[0].text!);
      expect(data.result.variables).toEqual({});
      expect(data.result.count).toBe(0);
    });

    it('should handle circular references in variables', async () => {
      const circular: any = { name: 'circular' };
      circular.self = circular;
      
      mockSession.inspectVariable.mockResolvedValue(circular);

      // Should not throw due to JSON.stringify circular reference
      const result = await tool.execute(
        {
          sessionId: 'debug_123_abc',
          target: 'circularVar',
        },
        mockContext
      );

      expect(result.isError).toBeFalsy();
    });

    it('should provide helpful hints for common patterns', async () => {
      const result = await tool.execute(
        {
          sessionId: 'debug_123_abc',
          target: 'all',
        },
        mockContext
      );

      const data = JSON.parse(result.content[0].text!);
      expect(data.hint).toContain('inspect specific variable');
      expect(data.hint).toContain('node context');
    });

    it('should handle large variable collections', async () => {
      const largeVariables: Record<string, any> = {};
      for (let i = 0; i < 100; i++) {
        largeVariables[`var_${i}`] = { index: i, data: `value_${i}` };
      }

      mockSession.getVariables.mockReturnValue(largeVariables);

      const result = await tool.execute(
        {
          sessionId: 'debug_123_abc',
          target: '*',
        },
        mockContext
      );

      const data = JSON.parse(result.content[0].text!);
      expect(data.result.count).toBe(100);
      expect(Object.keys(data.result.variables)).toHaveLength(100);
    });
  });
});