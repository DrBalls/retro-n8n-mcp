import { z } from 'zod';
import { BaseTool } from '../base/Tool.js';
import { WorkflowSchema, ExecutionSchema } from '../../types/n8n.types.js';
export class WorkflowMapTool extends BaseTool {
    name = 'visualization_workflow_map';
    description = 'Generate an interactive workflow map with execution flow, node statuses, and performance metrics';
    inputSchema = z.object({
        workflowId: z.string().describe('The ID of the workflow to map'),
        executionId: z.string().optional().describe('Optional execution ID to overlay execution data'),
        format: z.enum(['json', 'html', 'svg']).default('json').describe('Output format for the visualization'),
        includeMetrics: z.boolean().default(true).describe('Include performance metrics for each node'),
        showDataFlow: z.boolean().default(true).describe('Show data flow between nodes'),
        compactView: z.boolean().default(false).describe('Use compact view for large workflows'),
    });
    async execute(params, context) {
        const input = this.validateInput(params);
        if (!context.apiClient) {
            throw new Error('n8n API client not configured');
        }
        try {
            // Fetch the workflow
            const workflow = await context.apiClient.getWorkflow(input.workflowId);
            const validatedWorkflow = WorkflowSchema.parse(workflow);
            // Fetch execution data if provided
            let executionData = null;
            if (input.executionId) {
                try {
                    const execution = await context.apiClient.getExecution(input.executionId);
                    executionData = ExecutionSchema.parse(execution);
                }
                catch (error) {
                    // Continue without execution data if it fails
                    console.warn('Failed to fetch execution data:', error);
                }
            }
            // Generate the workflow map based on format
            let mapData;
            switch (input.format) {
                case 'html':
                    mapData = this.generateHTMLMap(validatedWorkflow, executionData, input);
                    break;
                case 'svg':
                    mapData = this.generateSVGMap(validatedWorkflow, executionData, input);
                    break;
                case 'json':
                default:
                    mapData = this.generateJSONMap(validatedWorkflow, executionData, input);
            }
            return {
                content: [{
                        type: 'text',
                        text: JSON.stringify({
                            workflowId: validatedWorkflow.id,
                            workflowName: validatedWorkflow.name,
                            format: input.format,
                            nodeCount: validatedWorkflow.nodes.length,
                            connectionCount: this.countConnections(validatedWorkflow.connections),
                            hasExecutionData: !!executionData,
                            map: mapData,
                            instructions: {
                                json: 'Use the JSON data to render your own visualization',
                                html: 'Save as .html file and open in browser for interactive view',
                                svg: 'Save as .svg file for scalable vector graphics',
                            },
                        }, null, 2),
                    }],
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            throw new Error(`Failed to generate workflow map: ${errorMessage}`);
        }
    }
    generateJSONMap(workflow, execution, options) {
        const nodeMap = new Map();
        const executionData = execution?.data?.resultData?.runData || {};
        // Process nodes
        const nodes = workflow.nodes.map(node => {
            const nodeExecution = executionData[node.name];
            const nodeData = {
                id: node.id,
                name: node.name,
                type: node.type,
                position: {
                    x: node.position[0],
                    y: node.position[1],
                },
                status: node.disabled ? 'disabled' : 'enabled',
                category: this.categorizeNode(node.type),
            };
            // Add execution data if available
            if (nodeExecution && options.includeMetrics) {
                const execInfo = Array.isArray(nodeExecution) ? nodeExecution[0] : nodeExecution;
                nodeData.execution = {
                    startTime: execInfo.startTime,
                    executionTime: execInfo.executionTime,
                    status: execInfo.error ? 'error' : 'success',
                    error: execInfo.error,
                };
            }
            // Add data flow info
            if (options.showDataFlow && nodeExecution) {
                const execInfo = Array.isArray(nodeExecution) ? nodeExecution[0] : nodeExecution;
                nodeData.dataFlow = {
                    inputData: execInfo.data?.main?.[0]?.[0],
                    outputData: execInfo.data?.main?.[0]?.[0],
                    itemCount: execInfo.data?.main?.[0]?.length || 0,
                };
            }
            nodeMap.set(node.id, nodeData);
            return nodeData;
        });
        // Process connections
        const connections = [];
        Object.entries(workflow.connections).forEach(([sourceNodeId, targets]) => {
            Object.entries(targets).forEach(([outputType, outputConnections]) => {
                outputConnections.forEach((connList, outputIndex) => {
                    connList.forEach(conn => {
                        const targetNodeId = 'node' in conn ? conn.node : conn.target.id;
                        const targetInput = 'index' in conn ? (conn.index || 0) : (conn.target.inputIndex || 0);
                        connections.push({
                            source: sourceNodeId,
                            target: targetNodeId,
                            sourceOutput: outputIndex,
                            targetInput,
                            type: outputType,
                            dataTransferred: this.getDataTransferInfo(sourceNodeId, targetNodeId, executionData),
                        });
                    });
                });
            });
        });
        // Calculate layout metrics
        const bounds = this.calculateBounds(nodes);
        const density = this.calculateDensity(nodes, connections);
        return {
            nodes,
            connections,
            layout: {
                bounds,
                density,
                recommendedView: options.compactView || density > 0.7 ? 'compact' : 'standard',
            },
            metrics: options.includeMetrics ? {
                totalExecutionTime: execution?.data?.executionData?.executionTime,
                nodeExecutionTimes: this.calculateNodeMetrics(nodes),
                criticalPath: this.identifyCriticalPath(nodes, connections),
            } : undefined,
        };
    }
    generateHTMLMap(workflow, execution, options) {
        const jsonMap = this.generateJSONMap(workflow, execution, options);
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Workflow Map: ${workflow.name}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        #workflow-container { 
            background: white; 
            border-radius: 8px; 
            box-shadow: 0 2px 8px rgba(0,0,0,0.1); 
            padding: 20px;
            position: relative;
            overflow: auto;
            min-height: 600px;
        }
        .node {
            position: absolute;
            background: #fff;
            border: 2px solid #ddd;
            border-radius: 8px;
            padding: 10px 15px;
            cursor: pointer;
            transition: all 0.3s;
            font-size: 12px;
            min-width: 120px;
            text-align: center;
        }
        .node:hover { transform: scale(1.05); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
        .node.trigger { border-color: #FF9800; background: #FFF3E0; }
        .node.webhook { border-color: #2196F3; background: #E3F2FD; }
        .node.disabled { opacity: 0.5; border-style: dashed; }
        .node.error { border-color: #F44336; background: #FFEBEE; }
        .node.success { border-color: #4CAF50; background: #E8F5E9; }
        .connection {
            stroke: #999;
            stroke-width: 2;
            fill: none;
            marker-end: url(#arrowhead);
        }
        .metrics {
            position: absolute;
            top: 10px;
            right: 10px;
            background: rgba(255,255,255,0.9);
            padding: 15px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        svg { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; }
        .node { pointer-events: all; }
    </style>
</head>
<body>
    <h1>Workflow Map: ${workflow.name}</h1>
    <div id="workflow-container">
        <svg>
            <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#999" />
                </marker>
            </defs>
            <g id="connections"></g>
        </svg>
        <div id="nodes"></div>
        ${options.includeMetrics ? '<div class="metrics" id="metrics"></div>' : ''}
    </div>
    
    <script>
        const workflowData = ${JSON.stringify(jsonMap)};
        
        // Render nodes
        const nodesContainer = document.getElementById('nodes');
        workflowData.nodes.forEach(node => {
            const nodeEl = document.createElement('div');
            nodeEl.className = 'node ' + node.category;
            if (node.status === 'disabled') nodeEl.classList.add('disabled');
            if (node.execution?.status) nodeEl.classList.add(node.execution.status);
            
            nodeEl.style.left = node.position.x + 'px';
            nodeEl.style.top = node.position.y + 'px';
            
            nodeEl.innerHTML = \`
                <strong>\${node.name}</strong><br>
                <small>\${node.type.split('.').pop()}</small>
                \${node.execution?.executionTime ? '<br><small>' + node.execution.executionTime + 'ms</small>' : ''}
            \`;
            
            nodeEl.onclick = () => {
                alert(JSON.stringify(node, null, 2));
            };
            
            nodesContainer.appendChild(nodeEl);
        });
        
        // Render connections
        const connectionsGroup = document.getElementById('connections');
        workflowData.connections.forEach(conn => {
            const sourceNode = workflowData.nodes.find(n => n.id === conn.source);
            const targetNode = workflowData.nodes.find(n => n.id === conn.target);
            
            if (sourceNode && targetNode) {
                const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                const x1 = sourceNode.position.x + 60;
                const y1 = sourceNode.position.y + 30;
                const x2 = targetNode.position.x + 60;
                const y2 = targetNode.position.y + 30;
                
                const midX = (x1 + x2) / 2;
                path.setAttribute('d', \`M \${x1} \${y1} Q \${midX} \${y1}, \${midX} \${(y1 + y2) / 2} T \${x2} \${y2}\`);
                path.classList.add('connection');
                
                connectionsGroup.appendChild(path);
            }
        });
        
        // Render metrics
        ${options.includeMetrics ? `
        const metricsEl = document.getElementById('metrics');
        if (workflowData.metrics) {
            metricsEl.innerHTML = \`
                <h3>Metrics</h3>
                <p>Total Time: \${workflowData.metrics.totalExecutionTime || 'N/A'}ms</p>
                <p>Nodes: \${workflowData.nodes.length}</p>
                <p>Connections: \${workflowData.connections.length}</p>
            \`;
        }
        ` : ''}
    </script>
</body>
</html>`;
    }
    generateSVGMap(workflow, execution, options) {
        const jsonMap = this.generateJSONMap(workflow, execution, options);
        const bounds = jsonMap.layout.bounds;
        const padding = 50;
        const width = bounds.maxX - bounds.minX + padding * 2;
        const height = bounds.maxY - bounds.minY + padding * 2;
        let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
      <polygon points="0 0, 10 3.5, 0 7" fill="#666" />
    </marker>
  </defs>\n`;
        // Draw connections
        svg += '  <g id="connections">\n';
        jsonMap.connections.forEach((conn) => {
            const sourceNode = jsonMap.nodes.find((n) => n.id === conn.source);
            const targetNode = jsonMap.nodes.find((n) => n.id === conn.target);
            if (sourceNode && targetNode) {
                const x1 = sourceNode.position.x - bounds.minX + padding + 60;
                const y1 = sourceNode.position.y - bounds.minY + padding + 30;
                const x2 = targetNode.position.x - bounds.minX + padding + 60;
                const y2 = targetNode.position.y - bounds.minY + padding + 30;
                svg += `    <path d="M ${x1} ${y1} L ${x2} ${y2}" stroke="#666" stroke-width="2" fill="none" marker-end="url(#arrowhead)" />\n`;
            }
        });
        svg += '  </g>\n';
        // Draw nodes
        svg += '  <g id="nodes">\n';
        jsonMap.nodes.forEach((node) => {
            const x = node.position.x - bounds.minX + padding;
            const y = node.position.y - bounds.minY + padding;
            const fill = this.getNodeColor(node);
            const opacity = node.status === 'disabled' ? 0.5 : 1;
            svg += `    <g transform="translate(${x}, ${y})" opacity="${opacity}">
      <rect x="0" y="0" width="120" height="60" rx="8" fill="${fill}" stroke="#666" stroke-width="2" />
      <text x="60" y="25" text-anchor="middle" font-family="Arial" font-size="12" font-weight="bold">${this.escapeXML(node.name)}</text>
      <text x="60" y="40" text-anchor="middle" font-family="Arial" font-size="10" fill="#666">${node.type.split('.').pop()}</text>
    </g>\n`;
        });
        svg += '  </g>\n';
        svg += '</svg>';
        return svg;
    }
    categorizeNode(nodeType) {
        if (nodeType.includes('trigger') || nodeType === 'n8n-nodes-base.start')
            return 'trigger';
        if (nodeType.includes('webhook'))
            return 'webhook';
        if (nodeType.includes('function'))
            return 'function';
        if (nodeType.includes('http'))
            return 'http';
        return 'default';
    }
    countConnections(connections) {
        let count = 0;
        Object.values(connections).forEach((targets) => {
            Object.values(targets).forEach((outputs) => {
                outputs.forEach((connList) => {
                    count += connList.length;
                });
            });
        });
        return count;
    }
    calculateBounds(nodes) {
        if (nodes.length === 0)
            return { minX: 0, minY: 0, maxX: 100, maxY: 100 };
        const xs = nodes.map(n => n.position.x);
        const ys = nodes.map(n => n.position.y);
        return {
            minX: Math.min(...xs),
            minY: Math.min(...ys),
            maxX: Math.max(...xs) + 120, // Add node width
            maxY: Math.max(...ys) + 60, // Add node height
        };
    }
    calculateDensity(nodes, connections) {
        if (nodes.length <= 1)
            return 0;
        const maxConnections = nodes.length * (nodes.length - 1);
        return connections.length / maxConnections;
    }
    getDataTransferInfo(sourceId, targetId, executionData) {
        // Placeholder for data transfer info calculation
        return {
            itemsTransferred: 0,
            dataSizeBytes: 0,
        };
    }
    calculateNodeMetrics(nodes) {
        return nodes
            .filter(n => n.execution?.executionTime)
            .map(n => ({
            nodeId: n.id,
            nodeName: n.name,
            executionTime: n.execution.executionTime,
        }))
            .sort((a, b) => b.executionTime - a.executionTime);
    }
    identifyCriticalPath(nodes, connections) {
        // Simplified critical path - just return longest execution path
        // In a real implementation, this would use graph algorithms
        return [];
    }
    getNodeColor(node) {
        if (node.execution?.status === 'error')
            return '#FFEBEE';
        if (node.execution?.status === 'success')
            return '#E8F5E9';
        if (node.category === 'trigger')
            return '#FFF3E0';
        if (node.category === 'webhook')
            return '#E3F2FD';
        return '#FFFFFF';
    }
    escapeXML(str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    }
    getMetadata() {
        return {
            category: 'visualization',
            isMutating: false,
            requirements: ['n8n API access'],
            tags: ['visualization', 'map', 'workflow', 'interactive', 'metrics'],
        };
    }
}
//# sourceMappingURL=WorkflowMapTool.js.map