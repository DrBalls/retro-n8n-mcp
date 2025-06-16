import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { TimelineDebugTool } from '../../../src/tools/debug/TimelineDebugTool.js';
import { IExecutionSnapshot } from '../../../src/services/DebugSession.js';

describe('TimelineDebugTool', () => {
  let tool: TimelineDebugTool;
  let mockSession: any;
  let mockContext: any;

  const mockTimeline: IExecutionSnapshot[] = [
    {
      timestamp: new Date('2024-01-01T10:00:00Z'),
      nodeId: 'node-1',
      nodeName: 'Start',
      nodeType: 'n8n-nodes-base.start',
      inputData: {},
      outputData: { items: [{ json: { test: true } }] },
      duration: 10,
    },
    {
      timestamp: new Date('2024-01-01T10:00:01Z'),
      nodeId: 'node-2',
      nodeName: 'HTTP Request',
      nodeType: 'n8n-nodes-base.httpRequest',
      inputData: { url: 'https://api.example.com' },
      outputData: { status: 200, data: { result: 'success' } },
      duration: 500,
    },
    {
      timestamp: new Date('2024-01-01T10:00:02Z'),
      nodeId: 'node-3',
      nodeName: 'Process Data',
      nodeType: 'n8n-nodes-base.function',
      inputData: { data: { result: 'success' } },
      outputData: { processed: true },
      duration: 50,
    },
    {
      timestamp: new Date('2024-01-01T10:00:03Z'),
      nodeId: 'node-4',
      nodeName: 'Error Node',
      nodeType: 'n8n-nodes-base.function',
      inputData: { processed: true },
      error: 'Function execution failed: undefined variable',
      duration: 5,
    },
  ];

  beforeEach(() => {
    tool = new TimelineDebugTool();

    // Mock debug session
    mockSession = {
      getId: vi.fn().mockReturnValue('debug_123_abc'),
      getWorkflowId: vi.fn().mockReturnValue('workflow-123'),
      getExecutionId: vi.fn().mockReturnValue('exec-123'),
      isActive: vi.fn().mockReturnValue(true),
      getTimeline: vi.fn().mockReturnValue(mockTimeline),
      getTimelineRange: vi.fn().mockImplementation((start, end) => {
        return mockTimeline.filter(event => {
          if (start && event.timestamp < start) return false;
          if (end && event.timestamp > end) return false;
          return true;
        });
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
      expect(tool.name).toBe('debug_timeline');
    });

    it('should have correct description', () => {
      expect(tool.description).toContain('View execution timeline');
    });

    it('should have correct metadata', () => {
      const metadata = tool.getMetadata();
      expect(metadata.category).toBe('debug');
      expect(metadata.isMutating).toBe(false);
      expect(metadata.tags).toContain('debug');
      expect(metadata.tags).toContain('timeline');
      expect(metadata.tags).toContain('visualization');
    });
  });

  describe('Input Validation', () => {
    it('should validate required session ID', async () => {
      await expect(tool.execute({}, mockContext)).rejects.toThrow();
    });

    it('should accept valid input with default format', async () => {
      const result = await tool.execute(
        { sessionId: 'debug_123_abc' },
        mockContext
      );
      expect(result.isError).toBeFalsy();
    });

    it('should validate format enum values', async () => {
      await expect(
        tool.execute(
          { sessionId: 'debug_123_abc', format: 'invalid' },
          mockContext
        )
      ).rejects.toThrow();
    });

    it('should accept all valid formats', async () => {
      const formats = ['text', 'mermaid', 'json'];
      
      for (const format of formats) {
        const result = await tool.execute(
          { sessionId: 'debug_123_abc', format },
          mockContext
        );
        expect(result.isError).toBeFalsy();
      }
    });

    it('should accept date range filters', async () => {
      const result = await tool.execute(
        {
          sessionId: 'debug_123_abc',
          startTime: '2024-01-01T10:00:00Z',
          endTime: '2024-01-01T10:00:02Z',
        },
        mockContext
      );
      expect(result.isError).toBeFalsy();
    });
  });

  describe('Timeline Retrieval', () => {
    it('should get full timeline without filters', async () => {
      const result = await tool.execute(
        { sessionId: 'debug_123_abc' },
        mockContext
      );

      expect(mockSession.getTimeline).toHaveBeenCalled();
      
      const data = JSON.parse(result.content[0].text!);
      expect(data.format).toBe('text');
      expect(data.timeline).toContain('=== Execution Timeline ===');
      expect(data.timeline).toContain('4 events');
    });

    it('should filter timeline by date range', async () => {
      const result = await tool.execute(
        {
          sessionId: 'debug_123_abc',
          startTime: '2024-01-01T10:00:01Z',
          endTime: '2024-01-01T10:00:02Z',
        },
        mockContext
      );

      expect(mockSession.getTimelineRange).toHaveBeenCalledWith(
        new Date('2024-01-01T10:00:01Z'),
        new Date('2024-01-01T10:00:02Z')
      );
    });

    it('should handle empty timeline', async () => {
      mockSession.getTimeline.mockReturnValue([]);

      const result = await tool.execute(
        { sessionId: 'debug_123_abc' },
        mockContext
      );

      const data = JSON.parse(result.content[0].text!);
      expect(data.timeline).toContain('No events in timeline');
    });
  });

  describe('Text Format Output', () => {
    it('should generate text timeline', async () => {
      const result = await tool.execute(
        { sessionId: 'debug_123_abc', format: 'text' },
        mockContext
      );

      const data = JSON.parse(result.content[0].text!);
      expect(data.timeline).toContain('=== Execution Timeline ===');
      expect(data.timeline).toContain('10:00:00.000 [node-1] Start');
      expect(data.timeline).toContain('10:00:01.000 [node-2] HTTP Request');
      expect(data.timeline).toContain('10:00:02.000 [node-3] Process Data');
      expect(data.timeline).toContain('10:00:03.000 [node-4] Error Node');
    });

    it('should show durations in text format', async () => {
      const result = await tool.execute(
        { sessionId: 'debug_123_abc', format: 'text' },
        mockContext
      );

      const data = JSON.parse(result.content[0].text!);
      expect(data.timeline).toContain('(10ms)');
      expect(data.timeline).toContain('(500ms)');
      expect(data.timeline).toContain('(50ms)');
      expect(data.timeline).toContain('(5ms)');
    });

    it('should indicate errors in text format', async () => {
      const result = await tool.execute(
        { sessionId: 'debug_123_abc', format: 'text' },
        mockContext
      );

      const data = JSON.parse(result.content[0].text!);
      expect(data.timeline).toContain('[ERROR]');
      expect(data.timeline).toContain('Function execution failed');
    });

    it('should show execution summary', async () => {
      const result = await tool.execute(
        { sessionId: 'debug_123_abc', format: 'text' },
        mockContext
      );

      const data = JSON.parse(result.content[0].text!);
      expect(data.timeline).toContain('Total Duration: 3.000s');
      expect(data.timeline).toContain('Errors: 1');
    });
  });

  describe('Mermaid Format Output', () => {
    it('should generate mermaid gantt chart', async () => {
      const result = await tool.execute(
        { sessionId: 'debug_123_abc', format: 'mermaid' },
        mockContext
      );

      const data = JSON.parse(result.content[0].text!);
      expect(data.timeline).toContain('gantt');
      expect(data.timeline).toContain('title Execution Timeline - Workflow workflow-123');
      expect(data.timeline).toContain('dateFormat HH:mm:ss.SSS');
    });

    it('should include all nodes in gantt', async () => {
      const result = await tool.execute(
        { sessionId: 'debug_123_abc', format: 'mermaid' },
        mockContext
      );

      const data = JSON.parse(result.content[0].text!);
      expect(data.timeline).toContain('Start');
      expect(data.timeline).toContain('HTTP Request');
      expect(data.timeline).toContain('Process Data');
      expect(data.timeline).toContain('Error Node [ERROR]');
    });

    it('should show critical path for errors', async () => {
      const result = await tool.execute(
        { sessionId: 'debug_123_abc', format: 'mermaid' },
        mockContext
      );

      const data = JSON.parse(result.content[0].text!);
      expect(data.timeline).toContain('crit');
    });

    it('should handle nodes with special characters', async () => {
      mockSession.getTimeline.mockReturnValue([
        {
          timestamp: new Date('2024-01-01T10:00:00Z'),
          nodeId: 'node-1',
          nodeName: 'Node with "quotes" and :colons',
          nodeType: 'test',
          inputData: {},
          duration: 10,
        },
      ]);

      const result = await tool.execute(
        { sessionId: 'debug_123_abc', format: 'mermaid' },
        mockContext
      );

      const data = JSON.parse(result.content[0].text!);
      expect(data.timeline).toContain('Node with quotes and colons');
    });
  });

  describe('JSON Format Output', () => {
    it('should generate JSON timeline', async () => {
      const result = await tool.execute(
        { sessionId: 'debug_123_abc', format: 'json' },
        mockContext
      );

      const data = JSON.parse(result.content[0].text!);
      const timelineData = JSON.parse(data.timeline);
      
      expect(timelineData.sessionId).toBe('debug_123_abc');
      expect(timelineData.workflowId).toBe('workflow-123');
      expect(timelineData.executionId).toBe('exec-123');
      expect(timelineData.events).toHaveLength(4);
    });

    it('should include event details in JSON', async () => {
      const result = await tool.execute(
        { sessionId: 'debug_123_abc', format: 'json' },
        mockContext
      );

      const data = JSON.parse(result.content[0].text!);
      const timelineData = JSON.parse(data.timeline);
      
      expect(timelineData.events[0]).toEqual({
        timestamp: '2024-01-01T10:00:00.000Z',
        nodeId: 'node-1',
        nodeName: 'Start',
        nodeType: 'n8n-nodes-base.start',
        duration: 10,
        hasError: false,
        inputDataSize: 1,
        outputDataSize: 1,
      });
    });

    it('should include summary in JSON', async () => {
      const result = await tool.execute(
        { sessionId: 'debug_123_abc', format: 'json' },
        mockContext
      );

      const data = JSON.parse(result.content[0].text!);
      const timelineData = JSON.parse(data.timeline);
      
      expect(timelineData.summary).toEqual({
        totalEvents: 4,
        totalDuration: 3000,
        successfulNodes: 3,
        failedNodes: 1,
        averageDuration: 141.25,
        longestNode: {
          nodeId: 'node-2',
          nodeName: 'HTTP Request',
          duration: 500,
        },
      });
    });
  });

  describe('Response Format', () => {
    it('should include metadata in response', async () => {
      const result = await tool.execute(
        { sessionId: 'debug_123_abc' },
        mockContext
      );

      const data = JSON.parse(result.content[0].text!);
      expect(data.sessionId).toBe('debug_123_abc');
      expect(data.format).toBe('text');
      expect(data.eventCount).toBe(4);
      expect(data.dateRange).toEqual({
        start: '2024-01-01T10:00:00.000Z',
        end: '2024-01-01T10:00:03.000Z',
      });
    });

    it('should include visualization note', async () => {
      const result = await tool.execute(
        { sessionId: 'debug_123_abc', format: 'mermaid' },
        mockContext
      );

      const data = JSON.parse(result.content[0].text!);
      expect(data.visualizationNote).toContain('mermaid');
      expect(data.visualizationNote).toContain('renderer');
    });
  });

  describe('Error Handling', () => {
    it('should handle missing debug session manager', async () => {
      global.debugSessionManager = undefined;

      await expect(
        tool.execute(
          { sessionId: 'debug_123_abc' },
          mockContext
        )
      ).rejects.toThrow('No debug session manager initialized');
    });

    it('should handle session not found', async () => {
      global.debugSessionManager!.getSession = vi.fn().mockReturnValue(undefined);

      await expect(
        tool.execute(
          { sessionId: 'non-existent' },
          mockContext
        )
      ).rejects.toThrow('Debug session non-existent not found');
    });

    it('should handle inactive session', async () => {
      mockSession.isActive.mockReturnValue(false);

      await expect(
        tool.execute(
          { sessionId: 'debug_123_abc' },
          mockContext
        )
      ).rejects.toThrow('Debug session debug_123_abc is not active');
    });

    it('should handle invalid date formats', async () => {
      const result = await tool.execute(
        {
          sessionId: 'debug_123_abc',
          startTime: 'invalid-date',
        },
        mockContext
      );

      // Should use current date for invalid dates
      expect(result.isError).toBeFalsy();
    });
  });

  describe('Complex Scenarios', () => {
    it('should handle large timelines efficiently', async () => {
      const largeTimeline: IExecutionSnapshot[] = [];
      for (let i = 0; i < 100; i++) {
        largeTimeline.push({
          timestamp: new Date(`2024-01-01T10:00:${String(i).padStart(2, '0')}Z`),
          nodeId: `node-${i}`,
          nodeName: `Node ${i}`,
          nodeType: 'test',
          inputData: {},
          outputData: {},
          duration: Math.floor(Math.random() * 1000),
        });
      }

      mockSession.getTimeline.mockReturnValue(largeTimeline);

      const result = await tool.execute(
        { sessionId: 'debug_123_abc' },
        mockContext
      );

      const data = JSON.parse(result.content[0].text!);
      expect(data.eventCount).toBe(100);
      expect(data.timeline).toBeDefined();
    });

    it('should handle timeline with missing optional fields', async () => {
      mockSession.getTimeline.mockReturnValue([
        {
          timestamp: new Date('2024-01-01T10:00:00Z'),
          nodeId: 'node-1',
          nodeName: 'Minimal Node',
          nodeType: 'test',
          inputData: {},
          // No outputData, duration, or error
        },
      ]);

      const result = await tool.execute(
        { sessionId: 'debug_123_abc' },
        mockContext
      );

      const data = JSON.parse(result.content[0].text!);
      expect(data.timeline).toBeDefined();
      expect(data.eventCount).toBe(1);
    });

    it('should calculate performance metrics', async () => {
      mockSession.getTimeline.mockReturnValue([
        {
          timestamp: new Date('2024-01-01T10:00:00Z'),
          nodeId: 'node-1',
          nodeName: 'Fast Node',
          nodeType: 'test',
          inputData: {},
          duration: 5,
        },
        {
          timestamp: new Date('2024-01-01T10:00:01Z'),
          nodeId: 'node-2',
          nodeName: 'Slow Node',
          nodeType: 'test',
          inputData: {},
          duration: 2000,
        },
        {
          timestamp: new Date('2024-01-01T10:00:03Z'),
          nodeId: 'node-3',
          nodeName: 'Medium Node',
          nodeType: 'test',
          inputData: {},
          duration: 100,
        },
      ]);

      const result = await tool.execute(
        { sessionId: 'debug_123_abc', format: 'json' },
        mockContext
      );

      const data = JSON.parse(result.content[0].text!);
      const timelineData = JSON.parse(data.timeline);
      
      expect(timelineData.summary.averageDuration).toBeCloseTo(701.67, 1);
      expect(timelineData.summary.longestNode.nodeName).toBe('Slow Node');
      expect(timelineData.summary.longestNode.duration).toBe(2000);
    });

    it('should handle concurrent node executions in mermaid', async () => {
      mockSession.getTimeline.mockReturnValue([
        {
          timestamp: new Date('2024-01-01T10:00:00.000Z'),
          nodeId: 'node-1',
          nodeName: 'Start',
          nodeType: 'start',
          inputData: {},
          duration: 10,
        },
        {
          timestamp: new Date('2024-01-01T10:00:00.005Z'),
          nodeId: 'node-2',
          nodeName: 'Parallel 1',
          nodeType: 'test',
          inputData: {},
          duration: 100,
        },
        {
          timestamp: new Date('2024-01-01T10:00:00.005Z'),
          nodeId: 'node-3',
          nodeName: 'Parallel 2',
          nodeType: 'test',
          inputData: {},
          duration: 150,
        },
      ]);

      const result = await tool.execute(
        { sessionId: 'debug_123_abc', format: 'mermaid' },
        mockContext
      );

      const data = JSON.parse(result.content[0].text!);
      expect(data.timeline).toContain('Parallel 1');
      expect(data.timeline).toContain('Parallel 2');
    });
  });
});