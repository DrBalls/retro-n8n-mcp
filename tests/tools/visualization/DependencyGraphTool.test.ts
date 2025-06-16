import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DependencyGraphTool } from '../../../src/tools/visualization/DependencyGraphTool.js';
import { IToolContext } from '../../../src/tools/base/Tool.js';
import { createMockWorkflow, createMockNode, createMockConnection } from '../../helpers/mockWorkflowData.js';

describe('DependencyGraphTool', () => {
  let tool: DependencyGraphTool;
  let mockContext: IToolContext;
  let mockApiClient: any;

  beforeEach(() => {
    tool = new DependencyGraphTool();
    
    mockApiClient = {
      getWorkflow: vi.fn(),
    };

    mockContext = {
      apiClient: mockApiClient,
    };
  });

  describe('Basic Properties', () => {
    it('should have correct name and description', () => {
      expect(tool.name).toBe('visualization_dependency_graph');
      expect(tool.description).toContain('dependency graph');
      expect(tool.description).toContain('node relationships');
    });

    it('should have correct metadata', () => {
      const metadata = tool.getMetadata();
      expect(metadata.category).toBe('visualization');
      expect(metadata.isMutating).toBe(false);
      expect(metadata.tags).toContain('visualization');
      expect(metadata.tags).toContain('dependency');
      expect(metadata.tags).toContain('graph');
    });
  });

  describe('Dependency Graph Generation', () => {
    it('should generate JSON dependency graph', async () => {
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
          }),
          createMockNode({
            id: 'node3',
            name: 'End',
            type: 'n8n-nodes-base.noOp',
            position: [500, 100],
          }),
        ],
        connections: {
          node1: {
            main: [[createMockConnection('node2')]],
          },
          node2: {
            main: [[createMockConnection('node3')]],
          },
        },
      });

      mockApiClient.getWorkflow.mockResolvedValue(mockWorkflow);

      const result = await tool.execute({ 
        workflowId: 'wf-123',
        format: 'json',
      }, mockContext);
      
      const response = JSON.parse(result.content[0].text);

      expect(response.workflowId).toBe('wf-123');
      expect(response.format).toBe('json');
      expect(response.nodeCount).toBe(3);
      expect(response.metrics).toBeDefined();
      expect(response.metrics.nodeCount).toBe(3);
      expect(response.metrics.edgeCount).toBe(2);
      expect(response.metrics.startNodes).toBe(1);
      expect(response.metrics.endNodes).toBe(1);

      const graph = response.graph;
      expect(graph.nodes).toHaveLength(3);
      expect(graph.edges).toHaveLength(2);
      
      // Check node properties
      const startNode = graph.nodes.find((n: any) => n.id === 'node1');
      expect(startNode.properties.isStartNode).toBe(true);
      expect(startNode.properties.inDegree).toBe(0);
      expect(startNode.properties.outDegree).toBe(1);
      expect(startNode.level).toBe(0);
      
      const endNode = graph.nodes.find((n: any) => n.id === 'node3');
      expect(endNode.properties.isEndNode).toBe(true);
      expect(endNode.level).toBe(2);
    });

    it('should generate DOT format graph', async () => {
      const mockWorkflow = createMockWorkflow({
        name: 'DOT Workflow',
        nodes: [
          createMockNode({
            id: 'node1',
            name: 'Start',
            type: 'n8n-nodes-base.start',
            position: [100, 100],
          }),
          createMockNode({
            id: 'node2',
            name: 'End',
            type: 'n8n-nodes-base.noOp',
            position: [300, 100],
            disabled: true,
          }),
        ],
        connections: {
          node1: {
            main: [[createMockConnection('node2')]],
          },
        },
      });

      mockApiClient.getWorkflow.mockResolvedValue(mockWorkflow);

      const result = await tool.execute({ 
        workflowId: 'wf-123',
        format: 'dot',
        layout: 'hierarchical',
      }, mockContext);
      
      const response = JSON.parse(result.content[0].text);
      const dot = response.graph;

      expect(dot).toContain('digraph WorkflowDependencies');
      expect(dot).toContain('rankdir=LR');
      expect(dot).toContain('"node1" [label="Start\\nstart"');
      expect(dot).toContain('fillcolor="#E8F5E9"'); // Start node color
      expect(dot).toContain('"node2" [label="End\\nnoOp"');
      expect(dot).toContain('style="rounded,dashed"'); // Disabled node
      expect(dot).toContain('"node1" -> "node2"');
      expect(dot).toContain('rank=same');
    });

    it('should generate Mermaid format graph', async () => {
      const mockWorkflow = createMockWorkflow({
        name: 'Mermaid Workflow',
        nodes: [
          createMockNode({
            id: 'trigger',
            name: 'Webhook',
            type: 'n8n-nodes-base.webhook',
            position: [100, 100],
          }),
          createMockNode({
            id: 'process',
            name: 'Process Data',
            type: 'n8n-nodes-base.function',
            position: [300, 100],
          }),
        ],
        connections: {
          trigger: {
            main: [[createMockConnection('process')]],
          },
        },
      });

      mockApiClient.getWorkflow.mockResolvedValue(mockWorkflow);

      const result = await tool.execute({ 
        workflowId: 'wf-123',
        format: 'mermaid',
      }, mockContext);
      
      const response = JSON.parse(result.content[0].text);
      const mermaid = response.graph;

      expect(mermaid).toContain('graph LR');
      expect(mermaid).toContain('trigger((Webhook<br/>webhook))');
      expect(mermaid).toContain('process[Process Data<br/>function]');
      expect(mermaid).toContain('trigger --> process');
      expect(mermaid).toContain('classDef startNode');
      expect(mermaid).toContain('class trigger startNode');
    });

    it('should identify critical path', async () => {
      const mockWorkflow = createMockWorkflow({
        name: 'Critical Path Workflow',
        nodes: [
          createMockNode({
            id: 'start',
            name: 'Start',
            type: 'n8n-nodes-base.start',
            position: [100, 100],
          }),
          createMockNode({
            id: 'path1',
            name: 'Path 1',
            type: 'n8n-nodes-base.function',
            position: [300, 50],
          }),
          createMockNode({
            id: 'path2a',
            name: 'Path 2A',
            type: 'n8n-nodes-base.function',
            position: [300, 150],
          }),
          createMockNode({
            id: 'path2b',
            name: 'Path 2B',
            type: 'n8n-nodes-base.function',
            position: [500, 150],
          }),
          createMockNode({
            id: 'end',
            name: 'End',
            type: 'n8n-nodes-base.noOp',
            position: [700, 100],
          }),
        ],
        connections: {
          start: {
            main: [
              [createMockConnection('path1')],
              [createMockConnection('path2a')],
            ],
          },
          path1: {
            main: [[createMockConnection('end')]],
          },
          path2a: {
            main: [[createMockConnection('path2b')]],
          },
          path2b: {
            main: [[createMockConnection('end')]],
          },
        },
      });

      mockApiClient.getWorkflow.mockResolvedValue(mockWorkflow);

      const result = await tool.execute({ 
        workflowId: 'wf-123',
        format: 'json',
        highlightCriticalPath: true,
      }, mockContext);
      
      const response = JSON.parse(result.content[0].text);
      const graph = response.graph;

      expect(graph.criticalPath).toBeDefined();
      expect(graph.criticalPath).toContain('start');
      expect(graph.criticalPath).toContain('end');
      expect(graph.analysis.longestPath).toBeDefined();
      expect(graph.analysis.longestPath.length).toBeGreaterThanOrEqual(3);
    });

    it('should find parallelization opportunities', async () => {
      const mockWorkflow = createMockWorkflow({
        name: 'Parallel Workflow',
        nodes: [
          createMockNode({
            id: 'start',
            name: 'Start',
            type: 'n8n-nodes-base.start',
            position: [100, 100],
          }),
          createMockNode({
            id: 'parallel1',
            name: 'Parallel 1',
            type: 'n8n-nodes-base.function',
            position: [300, 50],
          }),
          createMockNode({
            id: 'parallel2',
            name: 'Parallel 2',
            type: 'n8n-nodes-base.function',
            position: [300, 150],
          }),
          createMockNode({
            id: 'merge',
            name: 'Merge',
            type: 'n8n-nodes-base.merge',
            position: [500, 100],
          }),
        ],
        connections: {
          start: {
            main: [
              [createMockConnection('parallel1')],
              [createMockConnection('parallel2')],
            ],
          },
          parallel1: {
            main: [[createMockConnection('merge', 'main', 0)]],
          },
          parallel2: {
            main: [[createMockConnection('merge', 'main', 1)]],
          },
        },
      });

      mockApiClient.getWorkflow.mockResolvedValue(mockWorkflow);

      const result = await tool.execute({ 
        workflowId: 'wf-123',
        format: 'json',
      }, mockContext);
      
      const response = JSON.parse(result.content[0].text);
      const opportunities = response.graph.analysis.parallelizationOpportunities;

      expect(opportunities).toBeDefined();
      expect(opportunities.length).toBeGreaterThan(0);
      
      const parallelLevel = opportunities.find((o: any) => o.parallelNodes.length === 2);
      expect(parallelLevel).toBeDefined();
      expect(parallelLevel.potentialSpeedup).toBe(2);
    });

    it('should identify bottlenecks', async () => {
      const mockWorkflow = createMockWorkflow({
        name: 'Bottleneck Workflow',
        nodes: [
          createMockNode({
            id: 'input1',
            name: 'Input 1',
            type: 'n8n-nodes-base.function',
            position: [100, 50],
          }),
          createMockNode({
            id: 'input2',
            name: 'Input 2',
            type: 'n8n-nodes-base.function',
            position: [100, 150],
          }),
          createMockNode({
            id: 'input3',
            name: 'Input 3',
            type: 'n8n-nodes-base.function',
            position: [100, 250],
          }),
          createMockNode({
            id: 'bottleneck',
            name: 'Bottleneck',
            type: 'n8n-nodes-base.function',
            position: [300, 150],
          }),
          createMockNode({
            id: 'output',
            name: 'Output',
            type: 'n8n-nodes-base.noOp',
            position: [500, 150],
          }),
        ],
        connections: {
          input1: {
            main: [[createMockConnection('bottleneck')]],
          },
          input2: {
            main: [[createMockConnection('bottleneck')]],
          },
          input3: {
            main: [[createMockConnection('bottleneck')]],
          },
          bottleneck: {
            main: [[createMockConnection('output')]],
          },
        },
      });

      mockApiClient.getWorkflow.mockResolvedValue(mockWorkflow);

      const result = await tool.execute({ 
        workflowId: 'wf-123',
        format: 'json',
      }, mockContext);
      
      const response = JSON.parse(result.content[0].text);
      const bottlenecks = response.graph.analysis.bottlenecks;

      expect(bottlenecks).toBeDefined();
      expect(bottlenecks.length).toBeGreaterThan(0);
      expect(bottlenecks[0].nodeId).toBe('bottleneck');
      expect(bottlenecks[0].incomingConnections).toBe(3);
      expect(bottlenecks[0].outgoingConnections).toBe(1);
      expect(bottlenecks[0].bottleneckScore).toBe(3);
    });

    it('should handle data type inference', async () => {
      const mockWorkflow = createMockWorkflow({
        name: 'Data Types Workflow',
        nodes: [
          createMockNode({
            id: 'http',
            name: 'HTTP Request',
            type: 'n8n-nodes-base.httpRequest',
            position: [100, 100],
          }),
          createMockNode({
            id: 'db',
            name: 'Database',
            type: 'n8n-nodes-base.postgres',
            position: [300, 100],
          }),
        ],
        connections: {},
      });

      mockApiClient.getWorkflow.mockResolvedValue(mockWorkflow);

      const result = await tool.execute({ 
        workflowId: 'wf-123',
        format: 'json',
        showDataTypes: true,
      }, mockContext);
      
      const response = JSON.parse(result.content[0].text);
      const nodes = response.graph.nodes;

      const httpNode = nodes.find((n: any) => n.id === 'http');
      expect(httpNode.dataTypes).toBeDefined();
      expect(httpNode.dataTypes.output).toContain('json');
      
      const dbNode = nodes.find((n: any) => n.id === 'db');
      expect(dbNode.dataTypes).toBeDefined();
      expect(dbNode.dataTypes.output).toContain('array');
    });
  });

  describe('Layout Algorithms', () => {
    it('should calculate hierarchical layout', async () => {
      const mockWorkflow = createMockWorkflow({
        name: 'Hierarchical Workflow',
        nodes: [
          createMockNode({
            id: 'level0',
            name: 'Level 0',
            type: 'n8n-nodes-base.start',
            position: [100, 100],
          }),
          createMockNode({
            id: 'level1a',
            name: 'Level 1A',
            type: 'n8n-nodes-base.function',
            position: [300, 50],
          }),
          createMockNode({
            id: 'level1b',
            name: 'Level 1B',
            type: 'n8n-nodes-base.function',
            position: [300, 150],
          }),
        ],
        connections: {
          level0: {
            main: [
              [createMockConnection('level1a')],
              [createMockConnection('level1b')],
            ],
          },
        },
      });

      mockApiClient.getWorkflow.mockResolvedValue(mockWorkflow);

      const result = await tool.execute({ 
        workflowId: 'wf-123',
        format: 'json',
        layout: 'hierarchical',
      }, mockContext);
      
      const response = JSON.parse(result.content[0].text);
      const layout = response.graph.layout;

      expect(layout.type).toBe('hierarchical');
      expect(layout.levels).toBeDefined();
      expect(layout.levels[0]).toHaveLength(1);
      expect(layout.levels[1]).toHaveLength(2);
      expect(layout.spacing).toBeDefined();
    });

    it('should calculate circular layout', async () => {
      const mockWorkflow = createMockWorkflow({
        name: 'Circular Workflow',
        nodes: [
          createMockNode({
            id: 'node1',
            name: 'Node 1',
            type: 'n8n-nodes-base.function',
            position: [100, 100],
          }),
          createMockNode({
            id: 'node2',
            name: 'Node 2',
            type: 'n8n-nodes-base.function',
            position: [200, 100],
          }),
        ],
        connections: {},
      });

      mockApiClient.getWorkflow.mockResolvedValue(mockWorkflow);

      const result = await tool.execute({ 
        workflowId: 'wf-123',
        format: 'json',
        layout: 'circular',
      }, mockContext);
      
      const response = JSON.parse(result.content[0].text);
      const layout = response.graph.layout;

      expect(layout.type).toBe('circular');
      expect(layout.positions).toHaveLength(2);
      expect(layout.positions[0]).toHaveProperty('angle');
      expect(layout.positions[0]).toHaveProperty('x');
      expect(layout.positions[0]).toHaveProperty('y');
      expect(layout.radius).toBe(300);
    });
  });

  describe('Error Handling', () => {
    it('should handle API client not configured', async () => {
      await expect(tool.execute({ workflowId: 'wf-123' }, {}))
        .rejects.toThrow('n8n API client not configured');
    });

    it('should handle workflow fetch error', async () => {
      mockApiClient.getWorkflow.mockRejectedValue(new Error('API error'));

      await expect(tool.execute({ workflowId: 'wf-123' }, mockContext))
        .rejects.toThrow('Failed to generate dependency graph: API error');
    });
  });
});