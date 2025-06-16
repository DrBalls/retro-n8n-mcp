import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { WorkflowMetricsMonitorTool } from '../../../src/tools/monitoring/WorkflowMetricsMonitorTool.js';
import { IToolContext } from '../../../src/tools/base/Tool.js';

describe('WorkflowMetricsMonitorTool', () => {
  let tool: WorkflowMetricsMonitorTool;
  let mockApiClient: any;
  let mockMonitoringService: any;

  beforeEach(() => {
    tool = new WorkflowMetricsMonitorTool();
    
    mockApiClient = {
      request: vi.fn()
    };

    mockMonitoringService = {
      start: vi.fn().mockResolvedValue(undefined),
      stop: vi.fn().mockResolvedValue(undefined),
      monitorWorkflowMetrics: vi.fn().mockResolvedValue(undefined),
      getWorkflowMetrics: vi.fn(),
      on: vi.fn(),
      off: vi.fn(),
      once: vi.fn(),
      removeAllListeners: vi.fn()
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Properties', () => {
    it('should have correct name', () => {
      expect(tool.name).toBe('monitor_workflow_metrics');
    });

    it('should have a description', () => {
      expect(tool.description).toBe('Monitor real-time performance metrics and statistics for workflows');
    });

    it('should have correct metadata', () => {
      const metadata = tool.getMetadata();
      expect(metadata.category).toBe('monitoring');
      expect(metadata.isMutating).toBe(false);
      expect(metadata.requirements).toContain('n8n API access');
      expect(metadata.tags).toContain('metrics');
      expect(metadata.tags).toContain('performance');
      expect(metadata.tags).toContain('statistics');
    });

    it('should have valid input schema', () => {
      const schema = tool.inputSchema;
      expect(schema).toBeDefined();
      expect(schema._def).toBeDefined();
    });
  });

  describe('Input Validation', () => {
    it('should accept optional workflowId', async () => {
      // Mock getting all workflows when no ID specified
      mockApiClient.request.mockResolvedValue([
        { id: 'wf-1', name: 'Workflow 1' },
        { id: 'wf-2', name: 'Workflow 2' }
      ]);

      mockMonitoringService.getWorkflowMetrics.mockResolvedValue({
        totalExecutions: 10,
        successRate: 90
      });

      // Simulate immediate timeout
      mockMonitoringService.on.mockImplementation((event, handler) => {
        if (event === 'workflow:metrics:update') {
          setTimeout(() => {
            handler({ workflowId: 'wf-1', totalExecutions: 10 });
          }, 10);
        }
      });

      const result = await tool.execute(
        { duration: 100 }, // Short duration for test
        { apiClient: mockApiClient, monitoringService: mockMonitoringService }
      );

      expect(mockApiClient.request).toHaveBeenCalledWith('GET', '/workflows', {
        params: { active: true, limit: 100 }
      });
      expect(result.content).toBeDefined();
    });

    it('should accept specific workflowId', async () => {
      mockMonitoringService.getWorkflowMetrics.mockResolvedValue({
        workflowId: 'wf-123',
        totalExecutions: 50,
        successRate: 98
      });

      const result = await tool.execute(
        { workflowId: 'wf-123', duration: 100 },
        { apiClient: mockApiClient, monitoringService: mockMonitoringService }
      );

      expect(mockMonitoringService.monitorWorkflowMetrics).toHaveBeenCalledWith('wf-123', {
        interval: 30000,
        includePastExecutions: true
      });
      expect(result.content).toBeDefined();
    });

    it('should accept custom interval', async () => {
      mockMonitoringService.getWorkflowMetrics.mockResolvedValue({});

      await tool.execute(
        { workflowId: 'wf-123', interval: 10000, duration: 100 },
        { apiClient: mockApiClient, monitoringService: mockMonitoringService }
      );

      expect(mockMonitoringService.monitorWorkflowMetrics).toHaveBeenCalledWith('wf-123', {
        interval: 10000,
        includePastExecutions: true
      });
    });
  });

  describe('Metrics Collection', () => {
    it('should collect metrics updates over time', async () => {
      const metricsUpdates = [
        { workflowId: 'wf-123', totalExecutions: 10, successRate: 100 },
        { workflowId: 'wf-123', totalExecutions: 11, successRate: 90.9 },
        { workflowId: 'wf-123', totalExecutions: 12, successRate: 91.7 }
      ];

      let updateIndex = 0;
      mockMonitoringService.on.mockImplementation((event, handler) => {
        if (event === 'workflow:metrics:update') {
          // Simulate periodic updates
          const interval = setInterval(() => {
            if (updateIndex < metricsUpdates.length) {
              handler(metricsUpdates[updateIndex++]);
            } else {
              clearInterval(interval);
            }
          }, 20);
        }
      });

      mockMonitoringService.getWorkflowMetrics.mockResolvedValue(
        metricsUpdates[metricsUpdates.length - 1]
      );

      const result = await tool.execute(
        { workflowId: 'wf-123', duration: 200, interval: 50 },
        { apiClient: mockApiClient, monitoringService: mockMonitoringService }
      );

      const report = JSON.parse(result.content[0].text!);
      expect(report.workflowIds).toContain('wf-123');
      expect(report.metricsHistory.length).toBeGreaterThan(0);
      expect(report.summary).toBeDefined();
    });

    it('should handle multiple workflows', async () => {
      mockApiClient.request.mockResolvedValue([
        { id: 'wf-1', name: 'Workflow 1' },
        { id: 'wf-2', name: 'Workflow 2' }
      ]);

      mockMonitoringService.getWorkflowMetrics
        .mockResolvedValueOnce({ workflowId: 'wf-1', totalExecutions: 10 })
        .mockResolvedValueOnce({ workflowId: 'wf-2', totalExecutions: 20 });

      const result = await tool.execute(
        { duration: 100 },
        { apiClient: mockApiClient, monitoringService: mockMonitoringService }
      );

      expect(mockMonitoringService.monitorWorkflowMetrics).toHaveBeenCalledTimes(2);
      expect(mockMonitoringService.monitorWorkflowMetrics).toHaveBeenCalledWith('wf-1', expect.any(Object));
      expect(mockMonitoringService.monitorWorkflowMetrics).toHaveBeenCalledWith('wf-2', expect.any(Object));

      const report = JSON.parse(result.content[0].text!);
      expect(report.workflowIds).toEqual(['wf-1', 'wf-2']);
    });
  });

  describe('Monitoring Service Integration', () => {
    it('should create monitoring service if not provided', async () => {
      let createdService: any;
      
      // Mock the RealtimeMonitoringService constructor
      vi.mock('../../../src/services/RealtimeMonitoringService.js', () => ({
        RealtimeMonitoringService: vi.fn().mockImplementation((config) => {
          createdService = {
            ...mockMonitoringService,
            config
          };
          return createdService;
        })
      }));

      mockMonitoringService.getWorkflowMetrics.mockResolvedValue({});

      const result = await tool.execute(
        { workflowId: 'wf-123', duration: 100 },
        { apiClient: mockApiClient } // No monitoring service provided
      );

      // Should still work by creating its own service
      expect(result.content).toBeDefined();
    });

    it('should clean up monitoring on completion', async () => {
      mockMonitoringService.getWorkflowMetrics.mockResolvedValue({});

      await tool.execute(
        { workflowId: 'wf-123', duration: 100 },
        { apiClient: mockApiClient, monitoringService: mockMonitoringService }
      );

      expect(mockMonitoringService.off).toHaveBeenCalledWith(
        'workflow:metrics:update',
        expect.any(Function)
      );
    });
  });

  describe('Error Handling', () => {
    it('should throw error when API client is not configured', async () => {
      await expect(
        tool.execute({ workflowId: 'wf-123' }, {})
      ).rejects.toThrow('n8n API client not configured');
    });

    it('should handle workflow monitoring errors gracefully', async () => {
      mockMonitoringService.monitorWorkflowMetrics.mockRejectedValue(
        new Error('Monitoring failed')
      );
      mockMonitoringService.getWorkflowMetrics.mockResolvedValue({
        workflowId: 'wf-123',
        error: 'No metrics available'
      });

      const result = await tool.execute(
        { workflowId: 'wf-123', duration: 100 },
        { apiClient: mockApiClient, monitoringService: mockMonitoringService }
      );

      // Should still return a result
      const report = JSON.parse(result.content[0].text!);
      expect(report.workflowIds).toContain('wf-123');
      expect(report.summary.workflowMetrics[0].error).toBe('No metrics available');
    });

    it('should handle API errors when fetching workflows', async () => {
      mockApiClient.request.mockRejectedValue(new Error('API Error'));

      await expect(
        tool.execute(
          { duration: 100 }, // No workflowId, so it tries to fetch all
          { apiClient: mockApiClient, monitoringService: mockMonitoringService }
        )
      ).rejects.toThrow('API Error');
    });
  });

  describe('Response Format', () => {
    it('should return comprehensive metrics report', async () => {
      mockMonitoringService.getWorkflowMetrics.mockResolvedValue({
        workflowId: 'wf-123',
        totalExecutions: 100,
        successRate: 95.5,
        errorRate: 4.5,
        averageDuration: 1500,
        nodeMetrics: {
          'HTTP Request': {
            executions: 100,
            averageDuration: 500,
            errorRate: 2
          }
        }
      });

      const result = await tool.execute(
        { workflowId: 'wf-123', duration: 100 },
        { apiClient: mockApiClient, monitoringService: mockMonitoringService }
      );

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].mimeType).toBe('application/json');

      const report = JSON.parse(result.content[0].text!);
      expect(report).toHaveProperty('workflowIds');
      expect(report).toHaveProperty('duration');
      expect(report).toHaveProperty('metricsHistory');
      expect(report).toHaveProperty('summary');
      expect(report.summary).toHaveProperty('totalWorkflows', 1);
      expect(report.summary).toHaveProperty('workflowMetrics');
      expect(report.summary.workflowMetrics).toHaveLength(1);
      expect(report.summary.workflowMetrics[0]).toHaveProperty('workflowId', 'wf-123');
    });

    it('should include performance analysis', async () => {
      const metricsUpdates = [
        { workflowId: 'wf-123', totalExecutions: 10, averageDuration: 1000 },
        { workflowId: 'wf-123', totalExecutions: 15, averageDuration: 1200 },
        { workflowId: 'wf-123', totalExecutions: 20, averageDuration: 1100 }
      ];

      let updateIndex = 0;
      mockMonitoringService.on.mockImplementation((event, handler) => {
        if (event === 'workflow:metrics:update') {
          metricsUpdates.forEach((update, i) => {
            setTimeout(() => handler(update), i * 20);
          });
        }
      });

      mockMonitoringService.getWorkflowMetrics.mockResolvedValue(
        metricsUpdates[metricsUpdates.length - 1]
      );

      const result = await tool.execute(
        { workflowId: 'wf-123', duration: 200 },
        { apiClient: mockApiClient, monitoringService: mockMonitoringService }
      );

      const report = JSON.parse(result.content[0].text!);
      expect(report.performanceAnalysis).toBeDefined();
      expect(report.performanceAnalysis).toHaveProperty('executionTrend');
      expect(report.performanceAnalysis).toHaveProperty('performanceTrend');
    });
  });
});