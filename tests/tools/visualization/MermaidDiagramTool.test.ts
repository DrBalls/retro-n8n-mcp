import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MermaidDiagramTool } from '../../../src/tools/visualization/MermaidDiagramTool.js';
import { IToolContext } from '../../../src/tools/base/Tool.js';
import { createMockWorkflow, createMockNode, createMockConnection } from '../../helpers/mockWorkflowData.js';

describe('MermaidDiagramTool', () => {
  let tool: MermaidDiagramTool;
  let mockContext: IToolContext;
  let mockApiClient: any;

  beforeEach(() => {
    tool = new MermaidDiagramTool();
    
    mockApiClient = {
      getWorkflow: vi.fn(),
    };

    mockContext = {
      apiClient: mockApiClient,
    };
  });

  describe('Basic Properties', () => {
    it('should have correct name and description', () => {
      expect(tool.name).toBe('visualization_mermaid');
      expect(tool.description).toContain('Mermaid diagram');
      expect(tool.description).toContain('workflow structure');
    });

    it('should have correct metadata', () => {
      const metadata = tool.getMetadata();
      expect(metadata.category).toBe('visualization');
      expect(metadata.isMutating).toBe(false);
      expect(metadata.tags).toContain('visualization');
      expect(metadata.tags).toContain('mermaid');
    });
  });

  describe('Input Validation', () => {
    it('should require workflowId', async () => {
      await expect(tool.execute({}, mockContext)).rejects.toThrow();
    });

    it('should accept valid parameters', async () => {
      const mockWorkflow = createMockWorkflow();

      mockApiClient.getWorkflow.mockResolvedValue(mockWorkflow);

      const params = {
        workflowId: 'wf-123',
        direction: 'TB',
        theme: 'dark',
        includeParameters: true,
        includeCredentials: false,
        highlightActive: true,
      };

      const result = await tool.execute(params, mockContext);
      expect(result).toBeDefined();
    });
  });

  describe('Mermaid Diagram Generation', () => {
    it('should generate basic Mermaid diagram', async () => {
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
            name: 'HTTP Request',
            type: 'n8n-nodes-base.httpRequest',
            position: [300, 100],
            parameters: { url: 'https://api.example.com' },
          }),
        ],
        connections: {
          node1: {
            main: [[createMockConnection('node2')]],
          },
        },
      });

      mockApiClient.getWorkflow.mockResolvedValue(mockWorkflow);

      const result = await tool.execute({ workflowId: 'wf-123' }, mockContext);
      const response = JSON.parse(result.content[0].text);

      expect(response.workflowId).toBe('wf-123');
      expect(response.workflowName).toBe('Test Workflow');
      expect(response.nodeCount).toBe(2);
      expect(response.diagram).toContain('graph LR');
      expect(response.diagram).toContain('node1((Start))');
      expect(response.diagram).toContain('node2[HTTP Request]');
      expect(response.diagram).toContain('node1 -->|main| node2');
      expect(response.previewUrl).toContain('mermaid.live');
    });

    it('should handle different node types', async () => {
      const mockWorkflow = createMockWorkflow({
        name: 'Complex Workflow',
        active: false,
        nodes: [
          createMockNode({
            id: 'trigger1',
            name: 'Webhook Trigger',
            type: 'n8n-nodes-base.webhook',
            position: [100, 100],
          }),
          createMockNode({
            id: 'disabled1',
            name: 'Disabled Node',
            type: 'n8n-nodes-base.function',
            position: [300, 100],
            disabled: true,
          }),
        ],
        connections: {},
      });

      mockApiClient.getWorkflow.mockResolvedValue(mockWorkflow);

      const result = await tool.execute({ 
        workflowId: 'wf-123',
        direction: 'TD',
        theme: 'forest',
      }, mockContext);
      
      const response = JSON.parse(result.content[0].text);
      
      expect(response.diagram).toContain('graph TD');
      expect(response.diagram).toContain("%%{init: {'theme':'forest'}}%%");
      expect(response.diagram).toContain('trigger1{{Webhook Trigger}}');
      expect(response.diagram).toContain('disabled1[/Disabled Node/]');
      expect(response.theme).toBe('forest');
      expect(response.direction).toBe('TD');
    });

    it('should include parameters when requested', async () => {
      const mockWorkflow = createMockWorkflow({
        name: 'Params Workflow',
        nodes: [
          createMockNode({
            id: 'node1',
            name: 'Function',
            type: 'n8n-nodes-base.function',
            position: [100, 100],
            parameters: {
              functionCode: 'return items;',
              mode: 'each',
            },
          }),
        ],
        connections: {},
      });

      mockApiClient.getWorkflow.mockResolvedValue(mockWorkflow);

      const result = await tool.execute({ 
        workflowId: 'wf-123',
        includeParameters: true,
      }, mockContext);
      
      const response = JSON.parse(result.content[0].text);
      
      expect(response.diagram).toContain('node1:::paramNode');
      expect(response.diagram).toContain('paramsnode1["2 parameters"]');
    });

    it('should handle complex connections', async () => {
      const mockWorkflow = createMockWorkflow({
        name: 'Complex Connections',
        nodes: [
          createMockNode({
            id: 'node1',
            name: 'Start',
            type: 'n8n-nodes-base.start',
            position: [100, 100],
          }),
          createMockNode({
            id: 'node2',
            name: 'Split',
            type: 'n8n-nodes-base.splitInBatches',
            position: [300, 100],
          }),
          createMockNode({
            id: 'node3',
            name: 'Merge',
            type: 'n8n-nodes-base.merge',
            position: [500, 100],
          }),
        ],
        connections: {
          node1: {
            main: [[createMockConnection('node2')]],
          },
          node2: {
            main: [
              [createMockConnection('node3', 'main', 0)],
              [createMockConnection('node3', 'main', 1)],
            ],
          },
        },
      });

      mockApiClient.getWorkflow.mockResolvedValue(mockWorkflow);

      const result = await tool.execute({ workflowId: 'wf-123' }, mockContext);
      const response = JSON.parse(result.content[0].text);
      
      expect(response.diagram).toContain('node1 -->|main| node2');
      expect(response.diagram).toContain('node2 -->|main| node3');
    });

    it('should highlight active workflows', async () => {
      const mockWorkflow = createMockWorkflow({
        name: 'Active Workflow',
        active: true,
        nodes: [
          createMockNode({
            id: 'node1',
            name: 'Node 1',
            type: 'n8n-nodes-base.function',
            position: [100, 100],
          }),
        ],
        connections: {},
      });

      mockApiClient.getWorkflow.mockResolvedValue(mockWorkflow);

      const result = await tool.execute({ 
        workflowId: 'wf-123',
        highlightActive: true,
      }, mockContext);
      
      const response = JSON.parse(result.content[0].text);
      
      expect(response.diagram).toContain('classDef activeWorkflow');
      expect(response.diagram).toContain('class node1 activeWorkflow');
    });
  });

  describe('Error Handling', () => {
    it('should handle API client not configured', async () => {
      await expect(tool.execute({ workflowId: 'wf-123' }, {}))
        .rejects.toThrow('n8n API client not configured');
    });

    it('should handle workflow not found', async () => {
      mockApiClient.getWorkflow.mockRejectedValue(new Error('Workflow not found'));

      await expect(tool.execute({ workflowId: 'wf-123' }, mockContext))
        .rejects.toThrow('Failed to generate Mermaid diagram: Workflow not found');
    });

    it('should handle invalid workflow structure', async () => {
      mockApiClient.getWorkflow.mockResolvedValue({ invalid: 'data' });

      await expect(tool.execute({ workflowId: 'wf-123' }, mockContext))
        .rejects.toThrow();
    });
  });

  describe('Special Characters Handling', () => {
    it('should sanitize node IDs and escape labels', async () => {
      const mockWorkflow = createMockWorkflow({
        name: 'Special <Chars> Workflow',
        nodes: [
          createMockNode({
            id: 'node-with-special-chars!@#',
            name: 'Node "with" <quotes>',
            type: 'n8n-nodes-base.function',
            position: [100, 100],
          }),
        ],
        connections: {},
      });

      mockApiClient.getWorkflow.mockResolvedValue(mockWorkflow);

      const result = await tool.execute({ workflowId: 'wf-123' }, mockContext);
      const response = JSON.parse(result.content[0].text);
      
      expect(response.diagram).toContain('node_with_special_chars___');
      expect(response.diagram).toContain('Node &quot;with&quot; &lt;quotes&gt;');
    });
  });
});