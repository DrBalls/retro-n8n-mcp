import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { HistoryDebugTool } from '../../../src/tools/debug/HistoryDebugTool.js';

describe('HistoryDebugTool', () => {
  let tool: HistoryDebugTool;
  let mockSessionManager: any;
  let mockContext: any;

  const mockHistory = [
    {
      sessionId: 'debug_123_abc',
      workflowId: 'workflow-123',
      executionId: 'exec-123',
      startTime: new Date('2024-01-01T10:00:00Z'),
      endTime: new Date('2024-01-01T10:15:30Z'),
      status: 'stopped',
      duration: 930000, // 15.5 minutes
      eventsProcessed: 25,
      breakpointsHit: 5,
      errors: 1,
    },
    {
      sessionId: 'debug_456_def',
      workflowId: 'workflow-456',
      executionId: 'exec-456',
      startTime: new Date('2024-01-01T11:00:00Z'),
      endTime: new Date('2024-01-01T11:05:00Z'),
      status: 'stopped',
      duration: 300000, // 5 minutes
      eventsProcessed: 10,
      breakpointsHit: 2,
      errors: 0,
    },
    {
      sessionId: 'debug_789_ghi',
      workflowId: 'workflow-123', // Same workflow
      executionId: 'exec-789',
      startTime: new Date('2024-01-01T12:00:00Z'),
      endTime: new Date('2024-01-01T12:00:45Z'),
      status: 'crashed',
      duration: 45000, // 45 seconds
      eventsProcessed: 3,
      breakpointsHit: 0,
      errors: 1,
    },
    {
      sessionId: 'debug_current_active',
      workflowId: 'workflow-999',
      executionId: 'exec-999',
      startTime: new Date('2024-01-01T13:00:00Z'),
      endTime: undefined, // Still active
      status: 'active',
      duration: undefined,
      eventsProcessed: 15,
      breakpointsHit: 3,
      errors: 0,
    },
  ];

  beforeEach(() => {
    tool = new HistoryDebugTool();

    // Mock debug session manager
    mockSessionManager = {
      getSessionHistory: vi.fn().mockReturnValue(mockHistory),
      clearHistory: vi.fn(),
      getStatistics: vi.fn().mockReturnValue({
        totalSessions: 10,
        activeSessions: 1,
        stoppedSessions: 9,
        workflowCounts: {
          'workflow-123': 3,
          'workflow-456': 2,
          'workflow-999': 1,
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
      expect(tool.name).toBe('debug_history');
    });

    it('should have correct description', () => {
      expect(tool.description).toContain('View debug session history');
    });

    it('should have correct metadata', () => {
      const metadata = tool.getMetadata();
      expect(metadata.category).toBe('debug');
      expect(metadata.isMutating).toBe(false);
      expect(metadata.tags).toContain('debug');
      expect(metadata.tags).toContain('history');
      expect(metadata.tags).toContain('session');
    });
  });

  describe('Input Validation', () => {
    it('should accept empty input', async () => {
      const result = await tool.execute({}, mockContext);
      expect(result.isError).toBeFalsy();
    });

    it('should accept limit parameter', async () => {
      const result = await tool.execute({ limit: 5 }, mockContext);
      expect(result.isError).toBeFalsy();
    });

    it('should accept workflow filter', async () => {
      const result = await tool.execute(
        { workflowId: 'workflow-123' },
        mockContext
      );
      expect(result.isError).toBeFalsy();
    });

    it('should accept clear action', async () => {
      const result = await tool.execute({ clear: true }, mockContext);
      expect(result.isError).toBeFalsy();
    });

    it('should validate positive limit', async () => {
      await expect(
        tool.execute({ limit: -1 }, mockContext)
      ).rejects.toThrow();
    });
  });

  describe('History Retrieval', () => {
    it('should retrieve full history by default', async () => {
      const result = await tool.execute({}, mockContext);

      expect(mockSessionManager.getSessionHistory).toHaveBeenCalled();
      
      const data = JSON.parse(result.content[0].text!);
      expect(data.sessions).toHaveLength(4);
      expect(data.totalCount).toBe(4);
    });

    it('should format session entries correctly', async () => {
      const result = await tool.execute({}, mockContext);

      const data = JSON.parse(result.content[0].text!);
      expect(data.sessions[0]).toEqual({
        sessionId: 'debug_123_abc',
        workflowId: 'workflow-123',
        executionId: 'exec-123',
        startTime: '2024-01-01T10:00:00.000Z',
        endTime: '2024-01-01T10:15:30.000Z',
        status: 'stopped',
        duration: '15m 30s',
        eventsProcessed: 25,
        breakpointsHit: 5,
        hasErrors: true,
      });
    });

    it('should handle active sessions', async () => {
      const result = await tool.execute({}, mockContext);

      const data = JSON.parse(result.content[0].text!);
      const activeSession = data.sessions.find((s: any) => s.status === 'active');
      
      expect(activeSession).toMatchObject({
        sessionId: 'debug_current_active',
        status: 'active',
        duration: 'ongoing',
        endTime: null,
      });
    });

    it('should limit results when specified', async () => {
      const result = await tool.execute({ limit: 2 }, mockContext);

      const data = JSON.parse(result.content[0].text!);
      expect(data.sessions).toHaveLength(2);
      expect(data.sessions[0].sessionId).toBe('debug_current_active'); // Most recent first
      expect(data.sessions[1].sessionId).toBe('debug_789_ghi');
    });

    it('should filter by workflow ID', async () => {
      const result = await tool.execute({ workflowId: 'workflow-123' }, mockContext);

      const data = JSON.parse(result.content[0].text!);
      expect(data.sessions).toHaveLength(2);
      expect(data.sessions.every((s: any) => s.workflowId === 'workflow-123')).toBe(true);
    });
  });

  describe('History Clearing', () => {
    it('should clear history when requested', async () => {
      const result = await tool.execute({ clear: true }, mockContext);

      expect(mockSessionManager.clearHistory).toHaveBeenCalled();
      
      const data = JSON.parse(result.content[0].text!);
      expect(data.action).toBe('clear');
      expect(data.success).toBe(true);
      expect(data.message).toContain('History cleared');
    });

    it('should not retrieve sessions when clearing', async () => {
      await tool.execute({ clear: true }, mockContext);

      expect(mockSessionManager.getSessionHistory).not.toHaveBeenCalled();
    });
  });

  describe('Statistics and Summary', () => {
    it('should include overall statistics', async () => {
      const result = await tool.execute({}, mockContext);

      const data = JSON.parse(result.content[0].text!);
      expect(data.statistics).toEqual({
        totalSessions: 10,
        displayed: 4,
        activeSessions: 1,
        stoppedSessions: 3,
        crashedSessions: 1,
        byWorkflow: {
          'workflow-123': 2,
          'workflow-456': 1,
          'workflow-999': 1,
        },
      });
    });

    it('should calculate aggregate metrics', async () => {
      const result = await tool.execute({}, mockContext);

      const data = JSON.parse(result.content[0].text!);
      expect(data.aggregates).toEqual({
        totalDuration: '21m 15s',
        totalEvents: 53,
        totalBreakpointsHit: 10,
        totalErrors: 2,
        averageDuration: '7m 5s', // Average of 3 completed sessions
      });
    });
  });

  describe('Duration Formatting', () => {
    it('should format various durations correctly', async () => {
      mockSessionManager.getSessionHistory.mockReturnValue([
        {
          sessionId: 'test-1',
          duration: 3661000, // 1h 1m 1s
          status: 'stopped',
          startTime: new Date(),
          endTime: new Date(),
        },
        {
          sessionId: 'test-2',
          duration: 45000, // 45s
          status: 'stopped',
          startTime: new Date(),
          endTime: new Date(),
        },
        {
          sessionId: 'test-3',
          duration: 7200000, // 2h
          status: 'stopped',
          startTime: new Date(),
          endTime: new Date(),
        },
      ]);

      const result = await tool.execute({}, mockContext);

      const data = JSON.parse(result.content[0].text!);
      expect(data.sessions[0].duration).toBe('1h 1m 1s');
      expect(data.sessions[1].duration).toBe('45s');
      expect(data.sessions[2].duration).toBe('2h 0m 0s');
    });
  });

  describe('Response Format', () => {
    it('should handle empty history', async () => {
      mockSessionManager.getSessionHistory.mockReturnValue([]);

      const result = await tool.execute({}, mockContext);

      const data = JSON.parse(result.content[0].text!);
      expect(data.sessions).toEqual([]);
      expect(data.message).toBe('No debug session history available');
    });

    it('should include helpful hints', async () => {
      const result = await tool.execute({}, mockContext);

      const data = JSON.parse(result.content[0].text!);
      expect(data.hint).toBeDefined();
      expect(data.hint).toContain('debug_start');
      expect(data.hint).toContain('export');
    });

    it('should sort by start time descending', async () => {
      const result = await tool.execute({}, mockContext);

      const data = JSON.parse(result.content[0].text!);
      const times = data.sessions.map((s: any) => new Date(s.startTime || 0).getTime());
      
      // Check that array is sorted descending
      for (let i = 1; i < times.length; i++) {
        expect(times[i]).toBeLessThanOrEqual(times[i - 1]);
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle missing debug session manager', async () => {
      global.debugSessionManager = undefined;

      await expect(
        tool.execute({}, mockContext)
      ).rejects.toThrow('No debug session manager initialized');
    });

    it('should handle history retrieval errors', async () => {
      mockSessionManager.getSessionHistory.mockImplementation(() => {
        throw new Error('Failed to retrieve history');
      });

      await expect(
        tool.execute({}, mockContext)
      ).rejects.toThrow('Failed to retrieve history');
    });

    it('should handle clear errors gracefully', async () => {
      mockSessionManager.clearHistory.mockImplementation(() => {
        throw new Error('Failed to clear');
      });

      await expect(
        tool.execute({ clear: true }, mockContext)
      ).rejects.toThrow('Failed to clear');
    });
  });

  describe('Complex Scenarios', () => {
    it('should handle sessions with missing data', async () => {
      mockSessionManager.getSessionHistory.mockReturnValue([
        {
          sessionId: 'minimal-session',
          workflowId: 'workflow-min',
          // Missing most fields
        },
      ]);

      const result = await tool.execute({}, mockContext);

      const data = JSON.parse(result.content[0].text!);
      expect(data.sessions[0]).toMatchObject({
        sessionId: 'minimal-session',
        workflowId: 'workflow-min',
        executionId: null,
        duration: 'unknown',
        eventsProcessed: 0,
        breakpointsHit: 0,
        hasErrors: false,
      });
    });

    it('should handle very long sessions', async () => {
      mockSessionManager.getSessionHistory.mockReturnValue([
        {
          sessionId: 'long-session',
          duration: 86400000, // 24 hours
          status: 'stopped',
          startTime: new Date(),
          endTime: new Date(),
        },
      ]);

      const result = await tool.execute({}, mockContext);

      const data = JSON.parse(result.content[0].text!);
      expect(data.sessions[0].duration).toBe('24h 0m 0s');
    });

    it('should provide status-specific hints', async () => {
      // All crashed sessions
      mockSessionManager.getSessionHistory.mockReturnValue([
        {
          sessionId: 'crash-1',
          status: 'crashed',
          errors: 1,
        },
        {
          sessionId: 'crash-2',
          status: 'crashed',
          errors: 1,
        },
      ]);

      const result = await tool.execute({}, mockContext);

      const data = JSON.parse(result.content[0].text!);
      expect(data.hint).toContain('crashed sessions');
    });

    it('should handle large history efficiently', async () => {
      const largeHistory = [];
      for (let i = 0; i < 1000; i++) {
        largeHistory.push({
          sessionId: `session-${i}`,
          workflowId: `workflow-${i % 10}`,
          startTime: new Date(Date.now() - i * 60000),
          endTime: new Date(Date.now() - i * 60000 + 30000),
          status: 'stopped',
          duration: 30000,
        });
      }

      mockSessionManager.getSessionHistory.mockReturnValue(largeHistory);

      const result = await tool.execute({ limit: 10 }, mockContext);

      const data = JSON.parse(result.content[0].text!);
      expect(data.sessions).toHaveLength(10);
      expect(data.totalCount).toBe(1000);
    });
  });
});