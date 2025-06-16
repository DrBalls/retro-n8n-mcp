import { z } from 'zod';
import { BaseTool } from '../base/Tool.js';
import { WorkflowSchema } from '../../types/n8n.types.js';
export class MermaidDiagramTool extends BaseTool {
    name = 'visualization_mermaid';
    description = 'Generate a Mermaid diagram from a workflow definition to visualize the workflow structure';
    inputSchema = z.object({
        workflowId: z.string().describe('The ID of the workflow to visualize'),
        direction: z.enum(['TB', 'TD', 'BT', 'RL', 'LR']).default('LR').describe('Direction of the diagram (TB=top-bottom, LR=left-right, etc)'),
        theme: z.enum(['default', 'dark', 'forest', 'neutral']).default('default').describe('Mermaid theme to use'),
        includeParameters: z.boolean().default(false).describe('Include node parameters in the diagram'),
        includeCredentials: z.boolean().default(false).describe('Include credential information in the diagram'),
        highlightActive: z.boolean().default(true).describe('Highlight active nodes differently'),
    });
    async execute(params, context) {
        const input = this.validateInput(params);
        if (!context.apiClient) {
            throw new Error('n8n API client not configured');
        }
        try {
            // Fetch the workflow
            const workflow = await context.apiClient.getWorkflow(input.workflowId);
            // Validate workflow structure
            const validatedWorkflow = WorkflowSchema.parse(workflow);
            // Generate Mermaid diagram
            const mermaidDiagram = this.generateMermaidDiagram(validatedWorkflow, input);
            // Generate preview URL
            const encodedDiagram = encodeURIComponent(mermaidDiagram);
            const previewUrl = `https://mermaid.live/edit#pako:${Buffer.from(mermaidDiagram).toString('base64')}`;
            return {
                content: [{
                        type: 'text',
                        text: JSON.stringify({
                            workflowId: validatedWorkflow.id,
                            workflowName: validatedWorkflow.name,
                            nodeCount: validatedWorkflow.nodes.length,
                            diagram: mermaidDiagram,
                            previewUrl,
                            theme: input.theme,
                            direction: input.direction,
                            instructions: {
                                view: 'Copy the diagram code to any Mermaid viewer',
                                preview: 'Visit the previewUrl to see the diagram in Mermaid Live Editor',
                                export: 'Use Mermaid CLI or online tools to export as PNG/SVG',
                            },
                        }, null, 2),
                    }],
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            throw new Error(`Failed to generate Mermaid diagram: ${errorMessage}`);
        }
    }
    generateMermaidDiagram(workflow, options) {
        const lines = [];
        // Start diagram with direction and theme
        lines.push(`%%{init: {'theme':'${options.theme}'}}%%`);
        lines.push(`graph ${options.direction}`);
        lines.push('');
        // Define nodes with styling
        workflow.nodes.forEach(node => {
            const nodeId = this.sanitizeId(node.id);
            const nodeName = this.escapeLabel(node.name);
            const nodeType = node.type;
            // Determine node shape based on type
            let nodeDefinition = '';
            if (nodeType.includes('trigger') || nodeType === 'n8n-nodes-base.start') {
                nodeDefinition = `${nodeId}((${nodeName}))`;
            }
            else if (nodeType.includes('webhook')) {
                nodeDefinition = `${nodeId}{{${nodeName}}}`;
            }
            else if (node.disabled) {
                nodeDefinition = `${nodeId}[/${nodeName}/]`;
            }
            else {
                nodeDefinition = `${nodeId}[${nodeName}]`;
            }
            lines.push(`    ${nodeDefinition}`);
            // Add node details if requested
            if (options.includeParameters && Object.keys(node.parameters).length > 0) {
                const paramCount = Object.keys(node.parameters).length;
                lines.push(`    ${nodeId}:::paramNode`);
                lines.push(`    ${nodeId} -.- params${nodeId}["${paramCount} parameters"]`);
            }
            if (options.includeCredentials && node.credentials) {
                const credCount = Object.keys(node.credentials).length;
                lines.push(`    ${nodeId}:::credNode`);
                lines.push(`    ${nodeId} -.- creds${nodeId}["${credCount} credentials"]`);
            }
        });
        lines.push('');
        // Define connections
        Object.entries(workflow.connections).forEach(([sourceNodeId, targets]) => {
            const sourceId = this.sanitizeId(sourceNodeId);
            Object.entries(targets).forEach(([outputType, outputConnections]) => {
                outputConnections.forEach((connections, outputIndex) => {
                    connections.forEach(connection => {
                        const targetId = this.sanitizeId(connection.node);
                        const label = outputType !== 'main' || outputIndex > 0 ?
                            `|${outputType}[${outputIndex}]|` : '';
                        lines.push(`    ${sourceId} ${label}-->|${outputType}| ${targetId}`);
                    });
                });
            });
        });
        lines.push('');
        // Add styling
        lines.push('    %% Styling');
        if (options.highlightActive && workflow.active) {
            lines.push('    classDef activeWorkflow fill:#4CAF50,stroke:#2E7D32,stroke-width:3px;');
            lines.push('    class ' + workflow.nodes.map(n => this.sanitizeId(n.id)).join(',') + ' activeWorkflow;');
        }
        lines.push('    classDef triggerNode fill:#FF9800,stroke:#F57C00,stroke-width:2px;');
        lines.push('    classDef webhookNode fill:#2196F3,stroke:#1976D2,stroke-width:2px;');
        lines.push('    classDef disabledNode fill:#9E9E9E,stroke:#616161,stroke-width:1px,stroke-dasharray: 5 5;');
        lines.push('    classDef paramNode fill:#E1BEE7,stroke:#BA68C8;');
        lines.push('    classDef credNode fill:#FFECB3,stroke:#FFA726;');
        // Apply node-specific styling
        workflow.nodes.forEach(node => {
            const nodeId = this.sanitizeId(node.id);
            if (node.type.includes('trigger') || node.type === 'n8n-nodes-base.start') {
                lines.push(`    class ${nodeId} triggerNode;`);
            }
            else if (node.type.includes('webhook')) {
                lines.push(`    class ${nodeId} webhookNode;`);
            }
            else if (node.disabled) {
                lines.push(`    class ${nodeId} disabledNode;`);
            }
        });
        return lines.join('\n');
    }
    sanitizeId(id) {
        // Replace special characters that might break Mermaid syntax
        return id.replace(/[^a-zA-Z0-9_]/g, '_');
    }
    escapeLabel(label) {
        // Escape special characters in labels
        return label
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\n/g, '<br/>');
    }
    getMetadata() {
        return {
            category: 'visualization',
            isMutating: false,
            requirements: ['n8n API access'],
            tags: ['visualization', 'diagram', 'mermaid', 'workflow'],
        };
    }
}
//# sourceMappingURL=MermaidDiagramTool.js.map