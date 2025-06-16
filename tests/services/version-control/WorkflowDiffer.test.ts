import { describe, it, expect } from 'vitest';
import { WorkflowDiffer } from '../../../src/services/version-control/WorkflowDiffer.js';

describe('WorkflowDiffer', () => {
  let differ: WorkflowDiffer;

  const baseWorkflow = {
    id: 'workflow-1',
    name: 'Test Workflow',
    nodes: [
      { 
        id: 'node-1', 
        type: 'webhook', 
        name: 'Webhook', 
        position: [100, 100],
        parameters: { path: '/webhook' }
      },
      { 
        id: 'node-2', 
        type: 'function', 
        name: 'Process Data', 
        position: [300, 100],
        parameters: { code: 'return items;' }
      }
    ],
    connections: {
      'node-1': {
        main: [
          [{ node: 'node-2', type: 'main', index: 0 }]
        ]
      }
    },
    active: true,
    settings: { saveManualExecutions: true }
  };

  beforeEach(() => {
    differ = new WorkflowDiffer();
  });

  describe('generateDiff', () => {
    it('should detect no changes for identical workflows', async () => {
      const diff = await differ.generateDiff(baseWorkflow, baseWorkflow);
      
      expect(diff.operations).toHaveLength(0);
      expect(diff.summary.nodesAdded).toBe(0);
      expect(diff.summary.nodesRemoved).toBe(0);
      expect(diff.summary.nodesModified).toBe(0);
      expect(diff.summary.connectionsAdded).toBe(0);
      expect(diff.summary.connectionsRemoved).toBe(0);
    });

    it('should detect added nodes', async () => {
      const modifiedWorkflow = {
        ...baseWorkflow,
        nodes: [
          ...baseWorkflow.nodes,
          { 
            id: 'node-3', 
            type: 'email', 
            name: 'Send Email', 
            position: [500, 100],
            parameters: { to: 'user@example.com' }
          }
        ]
      };

      const diff = await differ.generateDiff(baseWorkflow, modifiedWorkflow);
      
      expect(diff.summary.nodesAdded).toBe(1);
      expect(diff.operations.some(op => 
        op.operation === 'add' && op.path.includes('/nodes/2')
      )).toBe(true);
    });

    it('should detect removed nodes', async () => {
      const modifiedWorkflow = {
        ...baseWorkflow,
        nodes: [baseWorkflow.nodes[0]] // Remove second node
      };

      const diff = await differ.generateDiff(baseWorkflow, modifiedWorkflow);
      
      expect(diff.summary.nodesRemoved).toBe(1);
      expect(diff.operations.some(op => 
        op.operation === 'remove' && op.path.includes('/nodes/1')
      )).toBe(true);
    });

    it('should detect modified node parameters', async () => {
      const modifiedWorkflow = {
        ...baseWorkflow,
        nodes: baseWorkflow.nodes.map(node => 
          node.id === 'node-1' 
            ? { ...node, parameters: { path: '/new-webhook' } }
            : node
        )
      };

      const diff = await differ.generateDiff(baseWorkflow, modifiedWorkflow);
      
      expect(diff.summary.nodesModified).toBe(1);
      expect(diff.operations.some(op => 
        op.operation === 'replace' && op.path.includes('/parameters/path')
      )).toBe(true);
    });

    it('should detect modified node position', async () => {
      const modifiedWorkflow = {
        ...baseWorkflow,
        nodes: baseWorkflow.nodes.map(node => 
          node.id === 'node-1' 
            ? { ...node, position: [200, 200] }
            : node
        )
      };

      const diff = await differ.generateDiff(baseWorkflow, modifiedWorkflow);
      
      expect(diff.operations.some(op => 
        op.operation === 'replace' && op.path.includes('/position')
      )).toBe(true);
    });

    it('should detect added connections', async () => {
      const modifiedWorkflow = {
        ...baseWorkflow,
        nodes: [
          ...baseWorkflow.nodes,
          { 
            id: 'node-3', 
            type: 'email', 
            name: 'Send Email', 
            position: [500, 100] 
          }
        ],
        connections: {
          ...baseWorkflow.connections,
          'node-2': {
            main: [
              [{ node: 'node-3', type: 'main', index: 0 }]
            ]
          }
        }
      };

      const diff = await differ.generateDiff(baseWorkflow, modifiedWorkflow);
      
      expect(diff.summary.connectionsAdded).toBe(1);
      expect(diff.operations.some(op => 
        op.operation === 'add' && op.path.includes('/connections/node-2')
      )).toBe(true);
    });

    it('should detect removed connections', async () => {
      const modifiedWorkflow = {
        ...baseWorkflow,
        connections: {} // Remove all connections
      };

      const diff = await differ.generateDiff(baseWorkflow, modifiedWorkflow);
      
      expect(diff.summary.connectionsRemoved).toBe(1);
      expect(diff.operations.some(op => 
        op.operation === 'remove' && op.path.includes('/connections')
      )).toBe(true);
    });

    it('should detect workflow metadata changes', async () => {
      const modifiedWorkflow = {
        ...baseWorkflow,
        name: 'Modified Workflow Name',
        active: false,
        settings: { saveManualExecutions: false }
      };

      const diff = await differ.generateDiff(baseWorkflow, modifiedWorkflow);
      
      expect(diff.operations.some(op => 
        op.operation === 'replace' && op.path === '/name'
      )).toBe(true);
      
      expect(diff.operations.some(op => 
        op.operation === 'replace' && op.path === '/active'
      )).toBe(true);
      
      expect(diff.operations.some(op => 
        op.operation === 'replace' && op.path.includes('/settings')
      )).toBe(true);
    });
  });

  describe('getAddedNodes', () => {
    it('should return nodes that were added', () => {
      const modifiedWorkflow = {
        ...baseWorkflow,
        nodes: [
          ...baseWorkflow.nodes,
          { id: 'node-3', type: 'email', name: 'Send Email', position: [500, 100] }
        ]
      };

      const addedNodes = differ.getAddedNodes(baseWorkflow, modifiedWorkflow);
      
      expect(addedNodes).toHaveLength(1);
      expect(addedNodes[0].id).toBe('node-3');
      expect(addedNodes[0].type).toBe('email');
    });

    it('should return empty array when no nodes added', () => {
      const addedNodes = differ.getAddedNodes(baseWorkflow, baseWorkflow);
      expect(addedNodes).toHaveLength(0);
    });
  });

  describe('getRemovedNodes', () => {
    it('should return nodes that were removed', () => {
      const modifiedWorkflow = {
        ...baseWorkflow,
        nodes: [baseWorkflow.nodes[0]] // Remove second node
      };

      const removedNodes = differ.getRemovedNodes(baseWorkflow, modifiedWorkflow);
      
      expect(removedNodes).toHaveLength(1);
      expect(removedNodes[0].id).toBe('node-2');
      expect(removedNodes[0].type).toBe('function');
    });

    it('should return empty array when no nodes removed', () => {
      const removedNodes = differ.getRemovedNodes(baseWorkflow, baseWorkflow);
      expect(removedNodes).toHaveLength(0);
    });
  });

  describe('getModifiedNodes', () => {
    it('should detect nodes with modified parameters', () => {
      const modifiedWorkflow = {
        ...baseWorkflow,
        nodes: baseWorkflow.nodes.map(node => 
          node.id === 'node-1' 
            ? { ...node, parameters: { path: '/new-webhook' } }
            : node
        )
      };

      const modifiedNodes = differ.getModifiedNodes(baseWorkflow, modifiedWorkflow);
      
      expect(modifiedNodes).toHaveLength(1);
      expect(modifiedNodes[0].nodeId).toBe('node-1');
      expect(modifiedNodes[0].changes).toContain('parameters');
    });

    it('should detect nodes with modified position', () => {
      const modifiedWorkflow = {
        ...baseWorkflow,
        nodes: baseWorkflow.nodes.map(node => 
          node.id === 'node-1' 
            ? { ...node, position: [200, 200] }
            : node
        )
      };

      const modifiedNodes = differ.getModifiedNodes(baseWorkflow, modifiedWorkflow);
      
      expect(modifiedNodes).toHaveLength(1);
      expect(modifiedNodes[0].nodeId).toBe('node-1');
      expect(modifiedNodes[0].changes).toContain('position');
    });

    it('should detect nodes with modified name', () => {
      const modifiedWorkflow = {
        ...baseWorkflow,
        nodes: baseWorkflow.nodes.map(node => 
          node.id === 'node-1' 
            ? { ...node, name: 'Modified Webhook' }
            : node
        )
      };

      const modifiedNodes = differ.getModifiedNodes(baseWorkflow, modifiedWorkflow);
      
      expect(modifiedNodes).toHaveLength(1);
      expect(modifiedNodes[0].nodeId).toBe('node-1');
      expect(modifiedNodes[0].changes).toContain('name');
    });

    it('should detect nodes with multiple changes', () => {
      const modifiedWorkflow = {
        ...baseWorkflow,
        nodes: baseWorkflow.nodes.map(node => 
          node.id === 'node-1' 
            ? { 
                ...node, 
                name: 'Modified Webhook',
                position: [200, 200],
                parameters: { path: '/new-webhook' }
              }
            : node
        )
      };

      const modifiedNodes = differ.getModifiedNodes(baseWorkflow, modifiedWorkflow);
      
      expect(modifiedNodes).toHaveLength(1);
      expect(modifiedNodes[0].nodeId).toBe('node-1');
      expect(modifiedNodes[0].changes).toContain('name');
      expect(modifiedNodes[0].changes).toContain('position');
      expect(modifiedNodes[0].changes).toContain('parameters');
    });

    it('should return empty array when no nodes modified', () => {
      const modifiedNodes = differ.getModifiedNodes(baseWorkflow, baseWorkflow);
      expect(modifiedNodes).toHaveLength(0);
    });
  });

  describe('getConnectionChanges', () => {
    it('should detect added connections', () => {
      const modifiedWorkflow = {
        ...baseWorkflow,
        nodes: [
          ...baseWorkflow.nodes,
          { id: 'node-3', type: 'email', name: 'Send Email', position: [500, 100] }
        ],
        connections: {
          ...baseWorkflow.connections,
          'node-2': {
            main: [
              [{ node: 'node-3', type: 'main', index: 0 }]
            ]
          }
        }
      };

      const connectionChanges = differ.getConnectionChanges(baseWorkflow, modifiedWorkflow);
      
      expect(connectionChanges.added).toHaveLength(1);
      expect(connectionChanges.added[0].source).toBe('node-2');
      expect(connectionChanges.added[0].target).toBe('node-3');
    });

    it('should detect removed connections', () => {
      const modifiedWorkflow = {
        ...baseWorkflow,
        connections: {} // Remove all connections
      };

      const connectionChanges = differ.getConnectionChanges(baseWorkflow, modifiedWorkflow);
      
      expect(connectionChanges.removed).toHaveLength(1);
      expect(connectionChanges.removed[0].source).toBe('node-1');
      expect(connectionChanges.removed[0].target).toBe('node-2');
    });

    it('should return empty changes for identical connections', () => {
      const connectionChanges = differ.getConnectionChanges(baseWorkflow, baseWorkflow);
      
      expect(connectionChanges.added).toHaveLength(0);
      expect(connectionChanges.removed).toHaveLength(0);
    });
  });

  describe('generateDiffDescription', () => {
    it('should generate meaningful description for simple changes', () => {
      const diff = {
        summary: {
          nodesAdded: 1,
          nodesRemoved: 0,
          nodesModified: 0,
          connectionsAdded: 1,
          connectionsRemoved: 0
        }
      };

      const description = differ.generateDiffDescription(diff);
      
      expect(description).toContain('1 node added');
      expect(description).toContain('1 connection added');
    });

    it('should generate description for complex changes', () => {
      const diff = {
        summary: {
          nodesAdded: 2,
          nodesRemoved: 1,
          nodesModified: 3,
          connectionsAdded: 2,
          connectionsRemoved: 1
        }
      };

      const description = differ.generateDiffDescription(diff);
      
      expect(description).toContain('2 nodes added');
      expect(description).toContain('1 node removed');
      expect(description).toContain('3 nodes modified');
      expect(description).toContain('2 connections added');
      expect(description).toContain('1 connection removed');
    });

    it('should handle no changes', () => {
      const diff = {
        summary: {
          nodesAdded: 0,
          nodesRemoved: 0,
          nodesModified: 0,
          connectionsAdded: 0,
          connectionsRemoved: 0
        }
      };

      const description = differ.generateDiffDescription(diff);
      
      expect(description).toBe('No changes detected');
    });
  });

  describe('generateVisualDiff', () => {
    it('should generate text-based visual diff', () => {
      const diff = {
        operations: [
          { operation: 'add', path: '/nodes/2', value: { id: 'node-3', type: 'email' } },
          { operation: 'remove', path: '/nodes/1' },
          { operation: 'replace', path: '/nodes/0/name', value: 'Modified Webhook' }
        ]
      };

      const visual = differ.generateVisualDiff(diff);
      
      expect(visual.type).toBe('text');
      expect(visual.content).toContain('+');
      expect(visual.content).toContain('-');
      expect(visual.content).toContain('~');
    });

    it('should generate mermaid diagram for complex changes', () => {
      const diff = {
        operations: Array.from({ length: 20 }, (_, i) => ({
          operation: 'add',
          path: `/nodes/${i}`,
          value: { id: `node-${i}`, type: 'test' }
        }))
      };

      const visual = differ.generateVisualDiff(diff);
      
      expect(visual.type).toBe('mermaid');
      expect(visual.content).toContain('graph');
    });
  });

  describe('edge cases', () => {
    it('should handle undefined or null workflows', async () => {
      await expect(differ.generateDiff(null as any, baseWorkflow)).rejects.toThrow();
      await expect(differ.generateDiff(baseWorkflow, null as any)).rejects.toThrow();
      await expect(differ.generateDiff(undefined as any, baseWorkflow)).rejects.toThrow();
    });

    it('should handle workflows with missing properties', async () => {
      const incompleteWorkflow = {
        id: 'workflow-2',
        name: 'Incomplete Workflow'
        // Missing nodes, connections, etc.
      };

      const diff = await differ.generateDiff(incompleteWorkflow as any, baseWorkflow);
      
      expect(diff.operations.length).toBeGreaterThan(0);
      expect(diff.summary.nodesAdded).toBe(2); // Base workflow has 2 nodes
    });

    it('should handle deeply nested parameter changes', async () => {
      const modifiedWorkflow = {
        ...baseWorkflow,
        nodes: baseWorkflow.nodes.map(node => 
          node.id === 'node-1' 
            ? { 
                ...node, 
                parameters: { 
                  ...node.parameters,
                  advanced: {
                    timeout: 5000,
                    retries: 3,
                    nested: {
                      deep: {
                        value: 'changed'
                      }
                    }
                  }
                }
              }
            : node
        )
      };

      const diff = await differ.generateDiff(baseWorkflow, modifiedWorkflow);
      
      expect(diff.operations.some(op => 
        op.path.includes('/parameters/advanced')
      )).toBe(true);
    });
  });
});