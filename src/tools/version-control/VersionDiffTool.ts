import { z } from 'zod';
import { BaseTool, IToolContext, IToolResponse, IToolMetadata } from '../base/Tool.js';
import { VersionControlManager } from '../../services/version-control/VersionControlManager.js';
import { WorkflowDiffer } from '../../services/version-control/WorkflowDiffer.js';
import { Logger } from '../../utils/Logger.js';

/**
 * Tool for generating diffs between workflow versions
 * Provides detailed comparison with visualization options
 */
export class VersionDiffTool extends BaseTool {
  name = 'version_diff';
  description = 'Generate detailed diff between two workflow versions with visualization options';
  
  private logger = new Logger('VersionDiffTool');
  private versionManager = new VersionControlManager();
  private differ = new WorkflowDiffer();

  inputSchema = z.object({
    workflowId: z.string().describe('ID of the workflow'),
    fromVersionId: z.string().describe('Source version ID for comparison'),
    toVersionId: z.string().describe('Target version ID for comparison'),
    format: z.enum(['detailed', 'summary', 'visual', 'json']).default('detailed').describe('Output format'),
    includeContext: z.boolean().default(true).describe('Include contextual information about changes'),
    includeMetadata: z.boolean().default(false).describe('Include metadata changes in diff'),
    highlightChanges: z.boolean().default(true).describe('Highlight important changes'),
    maxDepth: z.number().min(1).max(10).default(5).describe('Maximum depth for nested object comparison'),
  });

  async execute(params: unknown, context: IToolContext): Promise<IToolResponse> {
    const input = this.validateInput<z.infer<typeof this.inputSchema>>(params);
    
    try {
      this.logger.info('Generating version diff', {
        workflowId: input.workflowId,
        fromVersionId: input.fromVersionId,
        toVersionId: input.toVersionId,
        format: input.format,
      });

      // Get version information
      const versions = await this.versionManager.getVersionHistory(input.workflowId, {
        limit: 100,
      });

      const fromVersion = versions.find(v => v.id === input.fromVersionId);
      const toVersion = versions.find(v => v.id === input.toVersionId);

      if (!fromVersion || !toVersion) {
        throw new Error('One or both versions not found');
      }

      // Generate diff
      const diff = await this.versionManager.generateVersionDiff(
        input.fromVersionId,
        input.toVersionId
      );

      // Get additional analysis
      const nodeChanges = this.analyzeNodeChanges(fromVersion.workflow, toVersion.workflow);
      const connectionChanges = this.analyzeConnectionChanges(fromVersion.workflow, toVersion.workflow);
      const impactAnalysis = this.analyzeImpact(diff, nodeChanges, connectionChanges);

      let result: any = {
        success: true,
        workflowId: input.workflowId,
        comparison: {
          from: {
            id: fromVersion.id,
            version: fromVersion.versionString,
            message: fromVersion.commitMessage,
            author: fromVersion.author,
            timestamp: fromVersion.createdAt,
            branch: fromVersion.branchName,
          },
          to: {
            id: toVersion.id,
            version: toVersion.versionString,
            message: toVersion.commitMessage,
            author: toVersion.author,
            timestamp: toVersion.createdAt,
            branch: toVersion.branchName,
          },
          timespan: {
            days: Math.floor((new Date(toVersion.createdAt).getTime() - new Date(fromVersion.createdAt).getTime()) / (1000 * 60 * 60 * 24)),
            direction: toVersion.createdAt > fromVersion.createdAt ? 'forward' : 'backward',
          },
        },
        summary: diff.summary,
        impact: impactAnalysis,
      };

      // Format output based on requested format
      switch (input.format) {
        case 'summary':
          result.diff = this.formatSummaryDiff(diff, nodeChanges, connectionChanges);
          break;
        
        case 'visual':
          result.diff = this.formatVisualDiff(diff, fromVersion.workflow, toVersion.workflow);
          break;
        
        case 'json':
          result.diff = {
            operations: diff.operations,
            nodeChanges,
            connectionChanges,
          };
          break;
        
        case 'detailed':
        default:
          result.diff = this.formatDetailedDiff(diff, nodeChanges, connectionChanges, input);
          break;
      }

      if (input.includeContext) {
        result.context = this.generateContextualInformation(diff, fromVersion, toVersion);
      }

      this.logger.info('Version diff generated', {
        fromVersionId: input.fromVersionId,
        toVersionId: input.toVersionId,
        operationsCount: diff.operations.length,
        format: input.format,
      });

      return {
        content: [{
          type: 'text',
          text: JSON.stringify(result, null, 2),
          mimeType: 'application/json'
        }]
      };

    } catch (error) {
      this.logger.error('Failed to generate version diff', { error, input });
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            workflowId: input.workflowId,
            fromVersionId: input.fromVersionId,
            toVersionId: input.toVersionId,
            timestamp: Date.now(),
            suggestions: this.getErrorSuggestions(error),
          }, null, 2),
          mimeType: 'application/json'
        }]
      };
    }
  }

  private analyzeNodeChanges(fromWorkflow: any, toWorkflow: any) {
    const addedNodes = this.differ.getAddedNodes(fromWorkflow, toWorkflow);
    const removedNodes = this.differ.getRemovedNodes(fromWorkflow, toWorkflow);
    const modifiedNodes = this.differ.getModifiedNodes(fromWorkflow, toWorkflow);

    return {
      added: addedNodes.map(node => ({
        id: node.id,
        name: node.name,
        type: node.type,
        position: node.position,
      })),
      removed: removedNodes.map(node => ({
        id: node.id,
        name: node.name,
        type: node.type,
        position: node.position,
      })),
      modified: modifiedNodes.map(change => ({
        nodeId: change.nodeId,
        changes: change.changes,
        node: fromWorkflow.nodes?.find((n: any) => n.id === change.nodeId),
      })),
    };
  }

  private analyzeConnectionChanges(fromWorkflow: any, toWorkflow: any) {
    const connectionChanges = this.differ.getConnectionChanges(fromWorkflow, toWorkflow);
    
    return {
      added: connectionChanges.added.map(conn => ({
        source: conn.source,
        target: conn.target,
        type: conn.targetInput,
        description: `Connected ${conn.source} to ${conn.target}`,
      })),
      removed: connectionChanges.removed.map(conn => ({
        source: conn.source,
        target: conn.target,
        type: conn.targetInput,
        description: `Disconnected ${conn.source} from ${conn.target}`,
      })),
    };
  }

  private analyzeImpact(diff: any, nodeChanges: any, connectionChanges: any) {
    const impact = {
      level: 'low' as 'low' | 'medium' | 'high' | 'critical',
      score: 0,
      factors: [] as string[],
      recommendations: [] as string[],
    };

    // Calculate impact score
    let score = 0;
    
    // Node changes impact
    score += nodeChanges.added.length * 2;
    score += nodeChanges.removed.length * 3;
    score += nodeChanges.modified.length * 1;
    
    // Connection changes impact
    score += connectionChanges.added.length * 2;
    score += connectionChanges.removed.length * 3;
    
    // Determine impact level
    if (score >= 20) {
      impact.level = 'critical';
    } else if (score >= 10) {
      impact.level = 'high';
    } else if (score >= 5) {
      impact.level = 'medium';
    }
    
    impact.score = score;
    
    // Add impact factors
    if (nodeChanges.removed.length > 0) {
      impact.factors.push(`${nodeChanges.removed.length} node(s) removed`);
      impact.recommendations.push('Test workflow execution to ensure removed nodes are not critical');
    }
    
    if (connectionChanges.removed.length > 0) {
      impact.factors.push(`${connectionChanges.removed.length} connection(s) removed`);
      impact.recommendations.push('Verify data flow is still correct after connection changes');
    }
    
    if (nodeChanges.modified.length > 5) {
      impact.factors.push('Multiple nodes modified');
      impact.recommendations.push('Review parameter changes carefully');
    }
    
    if (impact.level === 'low') {
      impact.recommendations.push('Changes appear minimal - safe to deploy after basic testing');
    }
    
    return impact;
  }

  private formatSummaryDiff(diff: any, nodeChanges: any, connectionChanges: any) {
    return {
      overview: this.differ.generateDiffDescription(diff),
      nodes: {
        added: nodeChanges.added.length,
        removed: nodeChanges.removed.length,
        modified: nodeChanges.modified.length,
      },
      connections: {
        added: connectionChanges.added.length,
        removed: connectionChanges.removed.length,
      },
      totalOperations: diff.operations.length,
    };
  }

  private formatVisualDiff(diff: any, fromWorkflow: any, toWorkflow: any) {
    const visual = this.differ.generateVisualDiff(diff);
    
    return {
      type: visual.type,
      content: visual.content,
      legend: {
        '+': 'Added',
        '-': 'Removed',
        '~': 'Modified',
        '→': 'Moved',
      },
      workflowComparison: {
        from: {
          nodeCount: fromWorkflow.nodes?.length || 0,
          connectionCount: this.countConnections(fromWorkflow.connections || {}),
        },
        to: {
          nodeCount: toWorkflow.nodes?.length || 0,
          connectionCount: this.countConnections(toWorkflow.connections || {}),
        },
      },
    };
  }

  private formatDetailedDiff(diff: any, nodeChanges: any, connectionChanges: any, input: any) {
    return {
      operations: diff.operations.map((op: any) => ({
        operation: op.operation,
        path: op.path,
        description: this.generateOperationDescription(op),
        oldValue: this.formatValue(op.oldValue),
        newValue: this.formatValue(op.value),
        important: this.isImportantChange(op.path),
      })),
      nodeChanges: {
        added: nodeChanges.added,
        removed: nodeChanges.removed,
        modified: nodeChanges.modified.map((mod: any) => ({
          ...mod,
          details: this.getNodeModificationDetails(mod),
        })),
      },
      connectionChanges,
      metadata: input.includeMetadata ? this.extractMetadataChanges(diff.operations) : undefined,
    };
  }

  private generateContextualInformation(diff: any, fromVersion: any, toVersion: any) {
    return {
      versionProgression: {
        isUpgrade: this.isVersionUpgrade(fromVersion.version, toVersion.version),
        versionDifference: this.calculateVersionDifference(fromVersion.version, toVersion.version),
      },
      authorDifference: fromVersion.author !== toVersion.author,
      branchDifference: fromVersion.branchName !== toVersion.branchName,
      timeGap: {
        milliseconds: toVersion.createdAt - fromVersion.createdAt,
        humanReadable: this.formatTimeGap(toVersion.createdAt - fromVersion.createdAt),
      },
      complexity: this.calculateDiffComplexity(diff),
    };
  }

  private generateOperationDescription(operation: any): string {
    const path = operation.path;
    const op = operation.operation;
    
    if (path.includes('/nodes/')) {
      const nodeIndex = path.match(/\/nodes\/(\d+)/)?.[1];
      switch (op) {
        case 'add': return `Added node at position ${nodeIndex}`;
        case 'remove': return `Removed node at position ${nodeIndex}`;
        case 'replace': return `Modified node at position ${nodeIndex}`;
      }
    }
    
    if (path.includes('/connections/')) {
      switch (op) {
        case 'add': return 'Added connection';
        case 'remove': return 'Removed connection';
        case 'replace': return 'Modified connection';
      }
    }
    
    return `${op} at ${path}`;
  }

  private isImportantChange(path: string): boolean {
    return path.includes('/parameters/') || 
           path.includes('/type') || 
           path.includes('/disabled') ||
           path.includes('/connections/');
  }

  private getNodeModificationDetails(modification: any) {
    const details: { [key: string]: string } = {};
    
    for (const change of modification.changes) {
      switch (change) {
        case 'parameters':
          details.parameters = 'Node parameters were modified';
          break;
        case 'position':
          details.position = 'Node position was changed';
          break;
        case 'disabled':
          details.disabled = 'Node enabled/disabled state changed';
          break;
        case 'name':
          details.name = 'Node name was changed';
          break;
        case 'type':
          details.type = 'Node type was changed (critical change)';
          break;
      }
    }
    
    return details;
  }

  private extractMetadataChanges(operations: any[]): any[] {
    return operations.filter(op => 
      op.path.includes('/name') || 
      op.path.includes('/active') ||
      op.path.includes('/tags') ||
      op.path.includes('/settings')
    );
  }

  private isVersionUpgrade(fromVersion: any, toVersion: any): boolean {
    if (toVersion.major > fromVersion.major) return true;
    if (toVersion.major === fromVersion.major && toVersion.minor > fromVersion.minor) return true;
    if (toVersion.major === fromVersion.major && toVersion.minor === fromVersion.minor && toVersion.patch > fromVersion.patch) return true;
    return false;
  }

  private calculateVersionDifference(fromVersion: any, toVersion: any) {
    return {
      major: toVersion.major - fromVersion.major,
      minor: toVersion.minor - fromVersion.minor,
      patch: toVersion.patch - fromVersion.patch,
    };
  }

  private formatTimeGap(milliseconds: number): string {
    const days = Math.floor(milliseconds / (1000 * 60 * 60 * 24));
    const hours = Math.floor((milliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days} day(s), ${hours} hour(s)`;
    if (hours > 0) return `${hours} hour(s), ${minutes} minute(s)`;
    return `${minutes} minute(s)`;
  }

  private calculateDiffComplexity(diff: any): 'simple' | 'moderate' | 'complex' | 'very_complex' {
    const operationCount = diff.operations.length;
    
    if (operationCount <= 5) return 'simple';
    if (operationCount <= 15) return 'moderate';
    if (operationCount <= 30) return 'complex';
    return 'very_complex';
  }

  private countConnections(connections: any): number {
    let count = 0;
    for (const outputs of Object.values(connections)) {
      if (outputs && typeof outputs === 'object') {
        for (const targets of Object.values(outputs)) {
          if (Array.isArray(targets)) {
            count += targets.length;
          }
        }
      }
    }
    return count;
  }

  private formatValue(value: any): string {
    if (value === null || value === undefined) return 'null';
    if (typeof value === 'string') return `"${value}"`;
    if (typeof value === 'object') {
      const str = JSON.stringify(value);
      return str.length > 100 ? str.substring(0, 100) + '...' : str;
    }
    return String(value);
  }

  private getErrorSuggestions(error: unknown): string[] {
    const suggestions: string[] = [];
    const errorMessage = error instanceof Error ? error.message.toLowerCase() : '';
    
    if (errorMessage.includes('not found')) {
      suggestions.push('Verify both version IDs exist');
      suggestions.push('Use "version_history" tool to see available versions');
    }
    
    if (errorMessage.includes('same version')) {
      suggestions.push('Cannot compare a version with itself');
      suggestions.push('Choose different source and target versions');
    }
    
    return suggestions;
  }

  getMetadata(): IToolMetadata {
    return {
      category: 'version-control',
      isMutating: false,
      requirements: ['workflow access'],
      tags: ['diff', 'comparison', 'analysis', 'workflow', 'visualization'],
    };
  }
}