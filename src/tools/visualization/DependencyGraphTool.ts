import { z } from 'zod';
import { BaseTool, IToolContext, IToolResponse, IToolMetadata } from '../base/Tool.js';
import { WorkflowSchema } from '../../types/n8n.types.js';

interface DependencyNode {
  id: string;
  name: string;
  type: string;
  level: number;
  dependencies: string[];
  dependents: string[];
  isStartNode: boolean;
  isEndNode: boolean;
}

export class DependencyGraphTool extends BaseTool {
  name = 'visualization_dependency_graph';
  description = 'Generate a dependency graph showing node relationships, execution order, and data flow paths';
  
  inputSchema = z.object({
    workflowId: z.string().describe('The ID of the workflow to analyze'),
    format: z.enum(['json', 'dot', 'mermaid']).default('json').describe('Output format for the dependency graph'),
    layout: z.enum(['hierarchical', 'circular', 'force-directed']).default('hierarchical').describe('Graph layout algorithm'),
    showDataTypes: z.boolean().default(false).describe('Include data type information in the graph'),
    highlightCriticalPath: z.boolean().default(true).describe('Highlight the critical execution path'),
    groupByType: z.boolean().default(false).describe('Group nodes by their type'),
  });

  async execute(params: unknown, context: IToolContext): Promise<IToolResponse> {
    const input = this.validateInput<z.infer<typeof this.inputSchema>>(params);
    
    if (!context.apiClient) {
      throw new Error('n8n API client not configured');
    }

    try {
      // Fetch the workflow
      const workflow = await context.apiClient.getWorkflow(input.workflowId);
      const validatedWorkflow = WorkflowSchema.parse(workflow);
      
      // Build dependency graph
      const dependencyGraph = this.buildDependencyGraph(validatedWorkflow);
      
      // Generate output based on format
      let output;
      switch (input.format) {
        case 'dot':
          output = this.generateDotGraph(dependencyGraph, validatedWorkflow, input);
          break;
        case 'mermaid':
          output = this.generateMermaidGraph(dependencyGraph, validatedWorkflow, input);
          break;
        case 'json':
        default:
          output = this.generateJSONGraph(dependencyGraph, validatedWorkflow, input);
      }
      
      // Calculate graph metrics
      const metrics = this.calculateGraphMetrics(dependencyGraph);
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            workflowId: validatedWorkflow.id,
            workflowName: validatedWorkflow.name,
            format: input.format,
            nodeCount: dependencyGraph.size,
            metrics,
            graph: output,
            instructions: {
              json: 'Use the JSON data to build custom visualizations',
              dot: 'Use Graphviz to render the DOT notation (e.g., dot -Tpng graph.dot -o graph.png)',
              mermaid: 'Paste into any Mermaid renderer or documentation',
            },
          }, null, 2),
        }],
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Failed to generate dependency graph: ${errorMessage}`);
    }
  }

  private buildDependencyGraph(workflow: z.infer<typeof WorkflowSchema>): Map<string, DependencyNode> {
    const graph = new Map<string, DependencyNode>();
    
    // Initialize nodes
    workflow.nodes.forEach(node => {
      graph.set(node.id, {
        id: node.id,
        name: node.name,
        type: node.type,
        level: -1,
        dependencies: [],
        dependents: [],
        isStartNode: false,
        isEndNode: false,
      });
    });
    
    // Build dependencies from connections
    Object.entries(workflow.connections).forEach(([sourceId, targets]) => {
      const sourceNode = graph.get(sourceId);
      if (!sourceNode) return;
      
      Object.values(targets).forEach(outputs => {
        outputs.forEach(connections => {
          connections.forEach(conn => {
            const targetNode = graph.get(conn.node);
            if (targetNode) {
              sourceNode.dependents.push(conn.node);
              targetNode.dependencies.push(sourceId);
            }
          });
        });
      });
    });
    
    // Identify start and end nodes
    graph.forEach(node => {
      if (node.dependencies.length === 0) {
        node.isStartNode = true;
        node.level = 0;
      }
      if (node.dependents.length === 0) {
        node.isEndNode = true;
      }
    });
    
    // Calculate levels using BFS
    this.calculateNodeLevels(graph);
    
    return graph;
  }

  private calculateNodeLevels(graph: Map<string, DependencyNode>): void {
    const queue: string[] = [];
    
    // Start with nodes that have no dependencies
    graph.forEach(node => {
      if (node.level === 0) {
        queue.push(node.id);
      }
    });
    
    while (queue.length > 0) {
      const nodeId = queue.shift()!;
      const node = graph.get(nodeId)!;
      
      node.dependents.forEach(dependentId => {
        const dependent = graph.get(dependentId)!;
        const newLevel = node.level + 1;
        
        if (dependent.level < newLevel) {
          dependent.level = newLevel;
          queue.push(dependentId);
        }
      });
    }
  }

  private generateJSONGraph(
    graph: Map<string, DependencyNode>,
    workflow: z.infer<typeof WorkflowSchema>,
    options: z.infer<typeof this.inputSchema>
  ): any {
    const nodes: any[] = [];
    const edges: any[] = [];
    const nodeMap = new Map<string, any>();
    
    // Convert nodes
    graph.forEach((node, id) => {
      const workflowNode = workflow.nodes.find(n => n.id === id)!;
      const nodeData = {
        id: node.id,
        name: node.name,
        type: node.type,
        category: this.categorizeNode(node.type),
        level: node.level,
        position: {
          x: workflowNode.position[0],
          y: workflowNode.position[1],
        },
        properties: {
          isStartNode: node.isStartNode,
          isEndNode: node.isEndNode,
          inDegree: node.dependencies.length,
          outDegree: node.dependents.length,
          disabled: workflowNode.disabled || false,
        },
      };
      
      if (options.showDataTypes) {
        nodeData.dataTypes = this.inferDataTypes(workflowNode);
      }
      
      nodes.push(nodeData);
      nodeMap.set(id, nodeData);
    });
    
    // Convert edges
    graph.forEach(node => {
      node.dependents.forEach(targetId => {
        edges.push({
          source: node.id,
          target: targetId,
          weight: 1,
          type: 'data-flow',
        });
      });
    });
    
    // Group by type if requested
    let groups;
    if (options.groupByType) {
      groups = this.groupNodesByType(nodes);
    }
    
    // Find critical path if requested
    let criticalPath;
    if (options.highlightCriticalPath) {
      criticalPath = this.findCriticalPath(graph);
    }
    
    // Apply layout
    let layout;
    switch (options.layout) {
      case 'hierarchical':
        layout = this.calculateHierarchicalLayout(nodes, graph);
        break;
      case 'circular':
        layout = this.calculateCircularLayout(nodes);
        break;
      case 'force-directed':
        layout = 'Use d3.js force simulation for positioning';
        break;
    }
    
    return {
      nodes,
      edges,
      groups,
      criticalPath,
      layout,
      analysis: {
        longestPath: this.findLongestPath(graph),
        parallelizationOpportunities: this.findParallelizationOpportunities(graph),
        bottlenecks: this.identifyBottlenecks(graph),
      },
    };
  }

  private generateDotGraph(
    graph: Map<string, DependencyNode>,
    workflow: z.infer<typeof WorkflowSchema>,
    options: z.infer<typeof this.inputSchema>
  ): string {
    const lines: string[] = [];
    
    lines.push('digraph WorkflowDependencies {');
    lines.push('  rankdir=LR;');
    lines.push('  node [shape=box, style=rounded];');
    lines.push('');
    
    // Define node styles
    lines.push('  // Node definitions');
    graph.forEach((node, id) => {
      const workflowNode = workflow.nodes.find(n => n.id === id)!;
      const label = `${node.name}\\n${node.type.split('.').pop()}`;
      let style = '';
      
      if (workflowNode.disabled) {
        style = ', style="rounded,dashed", color="#999999"';
      } else if (node.isStartNode) {
        style = ', style="rounded,filled", fillcolor="#E8F5E9"';
      } else if (node.isEndNode) {
        style = ', style="rounded,filled", fillcolor="#FFEBEE"';
      }
      
      lines.push(`  "${id}" [label="${label}"${style}];`);
    });
    
    lines.push('');
    lines.push('  // Edges');
    
    // Define edges
    graph.forEach(node => {
      node.dependents.forEach(targetId => {
        lines.push(`  "${node.id}" -> "${targetId}";`);
      });
    });
    
    // Group by level if hierarchical
    if (options.layout === 'hierarchical') {
      lines.push('');
      lines.push('  // Level grouping');
      const levels = new Map<number, string[]>();
      graph.forEach(node => {
        if (!levels.has(node.level)) {
          levels.set(node.level, []);
        }
        levels.get(node.level)!.push(`"${node.id}"`);
      });
      
      levels.forEach((nodes, level) => {
        lines.push(`  { rank=same; ${nodes.join('; ')}; }`);
      });
    }
    
    lines.push('}');
    
    return lines.join('\n');
  }

  private generateMermaidGraph(
    graph: Map<string, DependencyNode>,
    workflow: z.infer<typeof WorkflowSchema>,
    options: z.infer<typeof this.inputSchema>
  ): string {
    const lines: string[] = [];
    
    lines.push('graph LR');
    lines.push('');
    
    // Define nodes
    graph.forEach((node, id) => {
      const workflowNode = workflow.nodes.find(n => n.id === id)!;
      const nodeId = this.sanitizeId(id);
      const label = `${node.name}<br/>${node.type.split('.').pop()}`;
      
      if (node.isStartNode) {
        lines.push(`    ${nodeId}((${label}))`);
      } else if (node.isEndNode) {
        lines.push(`    ${nodeId}[${label}]`);
      } else if (workflowNode.disabled) {
        lines.push(`    ${nodeId}[/${label}/]`);
      } else {
        lines.push(`    ${nodeId}[${label}]`);
      }
    });
    
    lines.push('');
    
    // Define connections
    graph.forEach(node => {
      const sourceId = this.sanitizeId(node.id);
      node.dependents.forEach(targetId => {
        const targetNodeId = this.sanitizeId(targetId);
        lines.push(`    ${sourceId} --> ${targetNodeId}`);
      });
    });
    
    // Add styling
    lines.push('');
    lines.push('    %% Styling');
    lines.push('    classDef startNode fill:#E8F5E9,stroke:#4CAF50,stroke-width:2px;');
    lines.push('    classDef endNode fill:#FFEBEE,stroke:#F44336,stroke-width:2px;');
    lines.push('    classDef disabledNode fill:#F5F5F5,stroke:#999999,stroke-width:1px,stroke-dasharray: 5 5;');
    
    // Apply styles
    const startNodes: string[] = [];
    const endNodes: string[] = [];
    const disabledNodes: string[] = [];
    
    graph.forEach((node, id) => {
      const workflowNode = workflow.nodes.find(n => n.id === id)!;
      const nodeId = this.sanitizeId(id);
      
      if (node.isStartNode) startNodes.push(nodeId);
      if (node.isEndNode) endNodes.push(nodeId);
      if (workflowNode.disabled) disabledNodes.push(nodeId);
    });
    
    if (startNodes.length > 0) {
      lines.push(`    class ${startNodes.join(',')} startNode;`);
    }
    if (endNodes.length > 0) {
      lines.push(`    class ${endNodes.join(',')} endNode;`);
    }
    if (disabledNodes.length > 0) {
      lines.push(`    class ${disabledNodes.join(',')} disabledNode;`);
    }
    
    return lines.join('\n');
  }

  private calculateGraphMetrics(graph: Map<string, DependencyNode>): any {
    const nodes = Array.from(graph.values());
    const totalEdges = nodes.reduce((sum, node) => sum + node.dependents.length, 0);
    
    return {
      nodeCount: graph.size,
      edgeCount: totalEdges,
      maxDepth: Math.max(...nodes.map(n => n.level)),
      averageDegree: (totalEdges * 2) / graph.size,
      density: graph.size > 1 ? totalEdges / (graph.size * (graph.size - 1)) : 0,
      startNodes: nodes.filter(n => n.isStartNode).length,
      endNodes: nodes.filter(n => n.isEndNode).length,
      isolatedNodes: nodes.filter(n => n.dependencies.length === 0 && n.dependents.length === 0).length,
    };
  }

  private categorizeNode(nodeType: string): string {
    if (nodeType.includes('trigger') || nodeType === 'n8n-nodes-base.start') return 'trigger';
    if (nodeType.includes('webhook')) return 'webhook';
    if (nodeType.includes('function')) return 'function';
    if (nodeType.includes('http')) return 'http';
    if (nodeType.includes('database')) return 'database';
    if (nodeType.includes('transform')) return 'transform';
    return 'other';
  }

  private inferDataTypes(node: any): any {
    // Simplified data type inference based on node type
    const dataTypes: any = {
      input: [],
      output: [],
    };
    
    if (node.type.includes('http')) {
      dataTypes.input.push('json', 'binary');
      dataTypes.output.push('json', 'binary', 'string');
    } else if (node.type.includes('database') || node.type.includes('postgres') || node.type.includes('mysql') || node.type.includes('mongodb')) {
      dataTypes.input.push('sql-query');
      dataTypes.output.push('array', 'json');
    } else if (node.type.includes('function')) {
      dataTypes.input.push('any');
      dataTypes.output.push('any');
    }
    
    return dataTypes;
  }

  private groupNodesByType(nodes: any[]): any {
    const groups = new Map<string, any[]>();
    
    nodes.forEach(node => {
      if (!groups.has(node.category)) {
        groups.set(node.category, []);
      }
      groups.get(node.category)!.push(node.id);
    });
    
    return Object.fromEntries(groups);
  }

  private findCriticalPath(graph: Map<string, DependencyNode>): string[] {
    // Find the longest path from any start node to any end node
    const startNodes = Array.from(graph.values()).filter(n => n.isStartNode);
    let longestPath: string[] = [];
    
    startNodes.forEach(startNode => {
      const path = this.findLongestPathFrom(startNode.id, graph);
      if (path.length > longestPath.length) {
        longestPath = path;
      }
    });
    
    return longestPath;
  }

  private findLongestPathFrom(startId: string, graph: Map<string, DependencyNode>): string[] {
    const visited = new Set<string>();
    const currentPath: string[] = [];
    let longestPath: string[] = [];
    
    const dfs = (nodeId: string) => {
      visited.add(nodeId);
      currentPath.push(nodeId);
      
      const node = graph.get(nodeId)!;
      if (node.isEndNode || node.dependents.length === 0) {
        if (currentPath.length > longestPath.length) {
          longestPath = [...currentPath];
        }
      } else {
        node.dependents.forEach(dependentId => {
          if (!visited.has(dependentId)) {
            dfs(dependentId);
          }
        });
      }
      
      currentPath.pop();
      visited.delete(nodeId);
    };
    
    dfs(startId);
    return longestPath;
  }

  private findLongestPath(graph: Map<string, DependencyNode>): any {
    const criticalPath = this.findCriticalPath(graph);
    return {
      path: criticalPath,
      length: criticalPath.length,
      nodes: criticalPath.map(id => ({
        id,
        name: graph.get(id)!.name,
      })),
    };
  }

  private findParallelizationOpportunities(graph: Map<string, DependencyNode>): any[] {
    const opportunities: any[] = [];
    const levels = new Map<number, string[]>();
    
    // Group nodes by level
    graph.forEach(node => {
      if (!levels.has(node.level)) {
        levels.set(node.level, []);
      }
      levels.get(node.level)!.push(node.id);
    });
    
    // Find levels with multiple nodes
    levels.forEach((nodes, level) => {
      if (nodes.length > 1) {
        opportunities.push({
          level,
          parallelNodes: nodes.map(id => ({
            id,
            name: graph.get(id)!.name,
          })),
          potentialSpeedup: nodes.length,
        });
      }
    });
    
    return opportunities;
  }

  private identifyBottlenecks(graph: Map<string, DependencyNode>): any[] {
    const bottlenecks: any[] = [];
    
    graph.forEach(node => {
      // A bottleneck has many incoming connections and few outgoing
      if (node.dependencies.length > 2 && node.dependents.length === 1) {
        bottlenecks.push({
          nodeId: node.id,
          nodeName: node.name,
          incomingConnections: node.dependencies.length,
          outgoingConnections: node.dependents.length,
          bottleneckScore: node.dependencies.length / Math.max(1, node.dependents.length),
        });
      }
    });
    
    return bottlenecks.sort((a, b) => b.bottleneckScore - a.bottleneckScore);
  }

  private calculateHierarchicalLayout(nodes: any[], graph: Map<string, DependencyNode>): any {
    const levelGroups = new Map<number, any[]>();
    
    nodes.forEach(node => {
      const depNode = graph.get(node.id)!;
      if (!levelGroups.has(depNode.level)) {
        levelGroups.set(depNode.level, []);
      }
      levelGroups.get(depNode.level)!.push(node);
    });
    
    return {
      type: 'hierarchical',
      levels: Object.fromEntries(levelGroups),
      spacing: {
        horizontal: 200,
        vertical: 100,
      },
    };
  }

  private calculateCircularLayout(nodes: any[]): any {
    const angleStep = (2 * Math.PI) / nodes.length;
    const radius = 300;
    
    return {
      type: 'circular',
      positions: nodes.map((node, index) => ({
        nodeId: node.id,
        angle: index * angleStep,
        x: radius * Math.cos(index * angleStep),
        y: radius * Math.sin(index * angleStep),
      })),
      radius,
    };
  }

  private sanitizeId(id: string): string {
    return id.replace(/[^a-zA-Z0-9_]/g, '_');
  }

  getMetadata(): IToolMetadata {
    return {
      category: 'visualization',
      isMutating: false,
      requirements: ['n8n API access'],
      tags: ['visualization', 'dependency', 'graph', 'analysis', 'workflow'],
    };
  }
}