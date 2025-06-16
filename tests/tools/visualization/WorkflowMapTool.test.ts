import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WorkflowMapTool } from '../../../src/tools/visualization/WorkflowMapTool.js';
import { IToolContext } from '../../../src/tools/base/Tool.js';
import { createMockWorkflow, createMockNode, createMockConnection, createMockExecution } from '../../helpers/mockWorkflowData.js';

describe('WorkflowMapTool', () => {
  let tool: WorkflowMapTool;
  let mockContext: IToolContext;
  let mockApiClient: any;

  beforeEach(() => {
    tool = new WorkflowMapTool();
    
    mockApiClient = {
      getWorkflow: vi.fn(),
      getExecution: vi.fn(),
    };

    mockContext = {
      apiClient: mockApiClient,
    };
  });

  describe('Basic Properties', () => {
    it('should have correct name and description', () => {
      expect(tool.name).toBe('visualization_workflow_map');
      expect(tool.description).toContain('interactive workflow map');
      expect(tool.description).toContain('execution flow');
    });

    it('should have correct metadata', () => {
      const metadata = tool.getMetadata();
      expect(metadata.category).toBe('visualization');
      expect(metadata.isMutating).toBe(false);
      expect(metadata.tags).toContain('visualization');
      expect(metadata.tags).toContain('map');
      expect(metadata.tags).toContain('interactive');
    });
  });

  describe('Workflow Map Generation', () => {
    const mockWorkflow = createMockWorkflow({
      nodes: [
        createMockNode({
          id: 'node1',
          name: 'Start',
          type: 'n8n-nodes-base.start',
          position: [100, 100],
        }),
        createMockNode({
          id: 'node2',
          name: 'Process',
          type: 'n8n-nodes-base.function',
          position: [300, 100],
          disabled: false,
        }),
      ],
      connections: {
        node1: {
          main: [[createMockConnection('node2')]],
        },
      },
    });

    it('should generate JSON workflow map', async () => {
      mockApiClient.getWorkflow.mockResolvedValue(mockWorkflow);

      const result = await tool.execute({ 
        workflowId: 'wf-123',
        format: 'json',
      }, mockContext);
      
      const response = JSON.parse(result.content[0].text);

      expect(response.workflowId).toBe('wf-123');
      expect(response.workflowName).toBe('Test Workflow');
      expect(response.format).toBe('json');
      expect(response.nodeCount).toBe(2);
      expect(response.connectionCount).toBe(1);
      expect(response.hasExecutionData).toBe(false);

      const map = response.map;
      expect(map.nodes).toHaveLength(2);
      expect(map.connections).toHaveLength(1);
      
      const startNode = map.nodes.find((n: any) => n.id === 'node1');
      expect(startNode.name).toBe('Start');
      expect(startNode.category).toBe('trigger');
      expect(startNode.position).toEqual({ x: 100, y: 100 });
      expect(startNode.status).toBe('enabled');
      
      const connection = map.connections[0];
      expect(connection.source).toBe('node1');
      expect(connection.target).toBe('node2');
      expect(connection.type).toBe('main');
    });

    it('should include execution data when available', async () => {
      const mockExecution = createMockExecution({
        workflowId: 'wf-123',
        data: {
          executionData: {
            executionTime: 1500,
          },
          resultData: {
            runData: {
              Start: [{
                startTime: 1000,
                executionTime: 100,
                data: {
                  main: [[{ json: { test: 'data' } }]],
                },
              }],
              Process: [{
                startTime: 1100,
                executionTime: 400,
                data: {
                  main: [[{ json: { processed: true } }]],
                },
              }],
            },
          },
        },
      });

      mockApiClient.getWorkflow.mockResolvedValue(mockWorkflow);
      mockApiClient.getExecution.mockResolvedValue(mockExecution);

      const result = await tool.execute({ 
        workflowId: 'wf-123',
        executionId: 'exec-123',
        format: 'json',
        includeMetrics: true,
        showDataFlow: true,
      }, mockContext);
      
      const response = JSON.parse(result.content[0].text);
      expect(response.hasExecutionData).toBe(true);
      
      const map = response.map;
      const startNode = map.nodes.find((n: any) => n.name === 'Start');
      
      expect(startNode.execution).toBeDefined();
      expect(startNode.execution.executionTime).toBe(100);
      expect(startNode.execution.status).toBe('success');
      
      expect(startNode.dataFlow).toBeDefined();
      expect(startNode.dataFlow.itemCount).toBe(1);
      
      expect(map.metrics).toBeDefined();
      expect(map.metrics.totalExecutionTime).toBe(1500);
    });

    it('should generate HTML visualization', async () => {
      mockApiClient.getWorkflow.mockResolvedValue(mockWorkflow);

      const result = await tool.execute({ 
        workflowId: 'wf-123',
        format: 'html',
        includeMetrics: true,
      }, mockContext);
      
      const response = JSON.parse(result.content[0].text);
      const html = response.map;

      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('<title>Workflow Map: Test Workflow</title>');
      expect(html).toContain('const workflowData =');
      expect(html).toContain("nodeEl.className = 'node ' + node.category;");
      expect(html).toContain('class="metrics"');
      expect(html).toContain('<svg>');
      expect(html).toContain('marker id="arrowhead"');
    });

    it('should generate SVG visualization', async () => {
      mockApiClient.getWorkflow.mockResolvedValue(mockWorkflow);

      const result = await tool.execute({ 
        workflowId: 'wf-123',
        format: 'svg',
      }, mockContext);
      
      const response = JSON.parse(result.content[0].text);
      const svg = response.map;

      expect(svg).toContain('<svg xmlns="http://www.w3.org/2000/svg"');
      expect(svg).toContain('id="connections"');
      expect(svg).toContain('id="nodes"');
      expect(svg).toContain('marker id="arrowhead"');
      expect(svg).toContain('<rect');
      expect(svg).toContain('<text');
      expect(svg).toContain('Start');
      expect(svg).toContain('Process');
    });
  });

  describe('Compact View', () => {
    it('should recommend compact view for high density workflows', async () => {
      const denseWorkflow = createMockWorkflow({
        nodes: Array(10).fill(null).map((_, i) => createMockNode({
          id: `node${i}`,
          name: `Node ${i}`,
          type: 'n8n-nodes-base.function',
          position: [100 * i, 100],
        })),
        connections: {},
      });

      // Create many connections to increase density
      denseWorkflow.connections = {};
      for (let i = 0; i < 9; i++) {
        denseWorkflow.connections[`node${i}`] = {
          main: [[createMockConnection(`node${i + 1}`)]],
        };
      }

      mockApiClient.getWorkflow.mockResolvedValue(denseWorkflow);

      const result = await tool.execute({ 
        workflowId: 'wf-123',
        format: 'json',
        compactView: false,
      }, mockContext);
      
      const response = JSON.parse(result.content[0].text);
      const layout = response.map.layout;

      expect(layout.density).toBeGreaterThan(0);
      expect(layout.recommendedView).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    const mockWorkflow = createMockWorkflow({
      nodes: [
        createMockNode({ id: 'node1', name: 'Start' }),
      ],
      connections: {},
    });

    it('should handle API client not configured', async () => {
      await expect(tool.execute({ workflowId: 'wf-123' }, {}))
        .rejects.toThrow('n8n API client not configured');
    });

    it('should handle workflow fetch error', async () => {
      mockApiClient.getWorkflow.mockRejectedValue(new Error('Workflow not found'));

      await expect(tool.execute({ workflowId: 'wf-123' }, mockContext))
        .rejects.toThrow('Failed to generate workflow map: Workflow not found');
    });

    it('should continue without execution data if fetch fails', async () => {
      mockApiClient.getWorkflow.mockResolvedValue(mockWorkflow);
      mockApiClient.getExecution.mockRejectedValue(new Error('Execution not found'));

      // Mock console.warn to verify it's called
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const result = await tool.execute({ 
        workflowId: 'wf-123',
        executionId: 'exec-123',
        format: 'json',
      }, mockContext);
      
      const response = JSON.parse(result.content[0].text);
      expect(response.hasExecutionData).toBe(false);
      expect(consoleWarnSpy).toHaveBeenCalled();
      
      consoleWarnSpy.mockRestore();
    });
  });

  describe('Node Categorization', () => {
    it('should categorize nodes correctly', async () => {
      const categorizedWorkflow = createMockWorkflow({
        nodes: [
          createMockNode({
            id: 'trigger',
            name: 'Trigger',
            type: 'n8n-nodes-base.trigger',
            position: [100, 100],
          }),
          createMockNode({
            id: 'webhook',
            name: 'Webhook',
            type: 'n8n-nodes-base.webhook',
            position: [200, 100],
          }),
          createMockNode({
            id: 'http',
            name: 'HTTP',
            type: 'n8n-nodes-base.httpRequest',
            position: [300, 100],
          }),
          createMockNode({
            id: 'function',
            name: 'Function',
            type: 'n8n-nodes-base.function',
            position: [400, 100],
          }),
        ],
        connections: {},
      });

      mockApiClient.getWorkflow.mockResolvedValue(categorizedWorkflow);

      const result = await tool.execute({ 
        workflowId: 'wf-123',
        format: 'json',
      }, mockContext);
      
      const response = JSON.parse(result.content[0].text);
      const nodes = response.map.nodes;

      expect(nodes.find((n: any) => n.id === 'trigger').category).toBe('trigger');
      expect(nodes.find((n: any) => n.id === 'webhook').category).toBe('webhook');
      expect(nodes.find((n: any) => n.id === 'http').category).toBe('http');
      expect(nodes.find((n: any) => n.id === 'function').category).toBe('function');
    });
  });

  describe('Metrics Calculation', () => {
    const mockWorkflow = createMockWorkflow({
      nodes: [
        createMockNode({ id: 'node1', name: 'Start', type: 'n8n-nodes-base.start' }),
        createMockNode({ id: 'node2', name: 'Process', type: 'n8n-nodes-base.function' }),
      ],
      connections: {
        node1: {
          main: [[createMockConnection('node2')]],
        },
      },
    });

    it('should calculate node execution metrics', async () => {
      const mockExecution = createMockExecution({
        workflowId: 'wf-123',
        data: {
          executionData: {
            executionTime: 1000,
          },
          resultData: {
            runData: {
              Start: [{
                startTime: 1000,
                executionTime: 100,
                data: { main: [[]] },
              }],
              Process: [{
                startTime: 1100,
                executionTime: 500,
                data: { main: [[]] },
              }],
            },
          },
        },
      });

      mockApiClient.getWorkflow.mockResolvedValue(mockWorkflow);
      mockApiClient.getExecution.mockResolvedValue(mockExecution);

      const result = await tool.execute({ 
        workflowId: 'wf-123',
        executionId: 'exec-123',
        format: 'json',
        includeMetrics: true,
      }, mockContext);
      
      const response = JSON.parse(result.content[0].text);
      const metrics = response.map.metrics;

      expect(metrics.nodeExecutionTimes).toHaveLength(2);
      expect(metrics.nodeExecutionTimes[0].executionTime).toBe(500); // Process node (slower)
      expect(metrics.nodeExecutionTimes[1].executionTime).toBe(100); // Start node
    });
  });

  describe('HTML Interactive Features', () => {
    const mockWorkflow = createMockWorkflow({
      nodes: [
        createMockNode({ id: 'node1', name: 'Interactive Node' }),
      ],
      connections: {},
    });

    it('should include interactive JavaScript in HTML', async () => {
      mockApiClient.getWorkflow.mockResolvedValue(mockWorkflow);

      const result = await tool.execute({ 
        workflowId: 'wf-123',
        format: 'html',
      }, mockContext);
      
      const response = JSON.parse(result.content[0].text);
      const html = response.map;

      expect(html).toContain('nodeEl.onclick');
      expect(html).toContain('alert(JSON.stringify(node, null, 2))');
      expect(html).toContain('document.getElementById');
      expect(html).toContain('createElementNS');
    });
  });
});